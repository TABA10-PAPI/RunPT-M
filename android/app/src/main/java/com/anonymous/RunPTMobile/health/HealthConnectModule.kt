package com.anonymous.RunPTMobile.health

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.permission.HealthPermission

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant
import android.app.Activity
import android.content.Intent

@ReactModule(name = HealthConnectModule.NAME)
class HealthConnectModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "HealthConnectModule"
    }

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun getName(): String = NAME

    private val healthConnectClient: HealthConnectClient? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            HealthConnectClient.getOrCreate(reactApplicationContext)
        } else {
            null
        }
    }

    // 권한 요청
    @ReactMethod
    fun requestPermissions(promise: Promise) {
        val client = healthConnectClient
        if (client == null) {
            promise.reject("NO_CLIENT", "Health Connect is not available on this device.")
            return
        }

        val permissions = setOf(
            HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(DistanceRecord::class)
        )

        scope.launch {
            try {
                val permissionController = client.permissionController
                val granted = permissionController.getGrantedPermissions()
                if (granted.containsAll(permissions)) {
                    promise.resolve(true)
                    return@launch
                }

                // 권한이 없으면 Activity에서 권한 요청 Intent 실행
                val activity = currentActivity
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "Activity를 찾을 수 없습니다.")
                    return@launch
                }

                val requestPermissionIntent = permissionController.createIntentForRequestPermissions(permissions)
                activity.runOnUiThread {
                    try {
                        activity.startActivityForResult(requestPermissionIntent, 1001)
                        // Intent 실행 후 Promise는 나중에 onActivityResult에서 처리
                        // 여기서는 일단 성공으로 처리 (실제 권한 결과는 별도로 확인 필요)
                        promise.resolve(false) // 권한 요청 Intent 실행됨
                    } catch (e: Exception) {
                        promise.reject("INTENT_ERROR", "권한 요청 Intent 실행 실패: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                promise.reject("PERMISSION_ERROR", e.message ?: "권한 요청 실패")
            }
        }
    }

    // 달리기 세션 가져오기 (페이스, 평균 심박, 총거리, 시간)
    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun getRunningSessions(days: Int, promise: Promise) {
        val client = healthConnectClient
        if (client == null) {
            promise.reject("NO_CLIENT", "Health Connect is not available on this device.")
            return
        }

        scope.launch {
            try {
                val now = Instant.now()
                val startTime = now.minusSeconds(days * 24 * 60 * 60L)

                val request = ReadRecordsRequest(
                    recordType = ExerciseSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, now)
                )

                val response = client.readRecords(request)
                val array = Arguments.createArray()

                response.records
                    .filter { 
                        it.exerciseType.toString().contains("RUNNING", ignoreCase = true)
                    }
                    .forEach { record ->
                        val map = Arguments.createMap()
                        
                        // 시간 (분)
                        val duration = java.time.Duration.between(record.startTime, record.endTime)
                        map.putInt("durationMinutes", duration.toMinutes().toInt())
                        
                        // 총거리 (미터)
                        val sessionDistanceReq = ReadRecordsRequest(
                            recordType = DistanceRecord::class,
                            timeRangeFilter = TimeRangeFilter.between(record.startTime, record.endTime)
                        )
                        val sessionDistanceRes = client.readRecords(sessionDistanceReq)
                        val sessionDistance = sessionDistanceRes.records.sumOf { it.distance.inMeters.toLong() }
                        map.putDouble("distanceMeters", sessionDistance.toDouble())
                        
                        // 평균 심박수
                        val sessionHeartRateReq = ReadRecordsRequest(
                            recordType = HeartRateRecord::class,
                            timeRangeFilter = TimeRangeFilter.between(record.startTime, record.endTime)
                        )
                        val sessionHeartRateRes = client.readRecords(sessionHeartRateReq)
                        var hrSum = 0L
                        var hrCount = 0
                        sessionHeartRateRes.records.forEach { hrRecord ->
                            hrRecord.samples.forEach { sample ->
                                val bpm = sample.beatsPerMinute
                                hrSum += bpm
                                hrCount += 1
                            }
                        }
                        val avgHeartRate = if (hrCount > 0) hrSum.toDouble() / hrCount else 0.0
                        map.putDouble("avgHeartRate", avgHeartRate)
                        
                        // 평균 페이스 (분/km)
                        val paceMinutesPerKm = if (sessionDistance > 0 && duration.toMinutes() > 0) {
                            (duration.toMinutes().toDouble() / (sessionDistance / 1000.0))
                        } else {
                            0.0
                        }
                        map.putDouble("avgPaceMinutesPerKm", paceMinutesPerKm)

                        array.pushMap(map)
                    }

                promise.resolve(array)
            } catch (e: Exception) {
                promise.reject("RUNNING_SESSIONS_ERROR", e)
            }
        }
    }
}
