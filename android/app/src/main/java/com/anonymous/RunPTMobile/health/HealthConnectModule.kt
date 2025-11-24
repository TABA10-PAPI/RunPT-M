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
import com.facebook.react.bridge.BaseActivityEventListener
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant
import android.app.Activity
import android.content.Intent
import android.util.Log

@ReactModule(name = HealthConnectModule.NAME)
class HealthConnectModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "HealthConnectModule"
        private const val TAG = "HealthConnectModule"
        private const val PERMISSION_REQUEST_CODE = 1001
    }

    private val scope = CoroutineScope(Dispatchers.IO)
    private var pendingPermissionPromise: Promise? = null

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            handleActivityResult(activity, requestCode, resultCode, data)
        }
    }

    init {
        Log.d(TAG, "[HealthConnect] HealthConnectModule 초기화 시작")
        reactApplicationContext.addActivityEventListener(activityEventListener)
        Log.d(TAG, "[HealthConnect] HealthConnectModule 초기화 완료 - 이름: $NAME")
    }

    override fun getName(): String {
        Log.d(TAG, "[HealthConnect] getName() 호출됨: $NAME")
        return NAME
    }

    private val healthConnectClient: HealthConnectClient? by lazy {
        Log.d(TAG, "[HealthConnect] HealthConnectClient 초기화 시작")
        Log.d(TAG, "[HealthConnect] Android SDK 버전: ${Build.VERSION.SDK_INT}")
        Log.d(TAG, "[HealthConnect] 필요한 최소 버전: ${Build.VERSION_CODES.UPSIDE_DOWN_CAKE} (API 34)")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            try {
                Log.d(TAG, "[HealthConnect] HealthConnectClient 생성 시도...")
                val client = HealthConnectClient.getOrCreate(reactApplicationContext)
                Log.d(TAG, "[HealthConnect] ✅ HealthConnectClient 생성 성공")
                client
            } catch (e: Exception) {
                Log.e(TAG, "[HealthConnect] ❌ HealthConnectClient 생성 실패: ${e.message}", e)
                Log.e(TAG, "[HealthConnect] Health Connect 앱이 설치되어 있는지 확인하세요!")
                null
            }
        } else {
            Log.e(TAG, "[HealthConnect] ❌ Android 버전이 너무 낮습니다.")
            Log.e(TAG, "[HealthConnect] Health Connect는 Android 14 (API 34) 이상이 필요합니다.")
            null
        }
    }

    // 테스트 메서드
    @ReactMethod
    fun testMethod(promise: Promise) {
        Log.d(TAG, "[HealthConnect] testMethod() 호출됨!")
        promise.resolve("HealthConnectModule is working!")
    }

    // 권한 요청
    @ReactMethod
    fun requestPermissions(promise: Promise) {
        Log.d(TAG, "[HealthConnect] requestPermissions() 호출됨!")
        Log.d(TAG, "[HealthConnect] 권한 요청 시작")
        
        // Health Connect 클라이언트 확인
        val client = healthConnectClient
        if (client == null) {
            Log.e(TAG, "[HealthConnect] ❌ Health Connect 클라이언트를 사용할 수 없습니다.")
            Log.e(TAG, "[HealthConnect] 가능한 원인:")
            Log.e(TAG, "  1. Android 버전이 14 (API 34) 미만")
            Log.e(TAG, "  2. Health Connect 앱이 설치되지 않음")
            Log.e(TAG, "  3. Health Connect 서비스가 비활성화됨")
            
            val errorMessage = when {
                Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> {
                    "Health Connect는 Android 14 (API 34) 이상이 필요합니다. 현재 버전: ${Build.VERSION.SDK_INT}"
                }
                else -> {
                    "Health Connect 앱이 설치되어 있지 않거나 사용할 수 없습니다. Google Play에서 Health Connect 앱을 설치하세요."
                }
            }
            
            promise.reject("NO_CLIENT", errorMessage)
            return
        }
        
        Log.d(TAG, "[HealthConnect] ✅ Health Connect 클라이언트 사용 가능")

        val permissions = setOf(
            HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(DistanceRecord::class)
        )

        scope.launch {
            try {
                val permissionController = client.permissionController
                val granted = permissionController.getGrantedPermissions()
                Log.d(TAG, "[HealthConnect] 현재 허용된 권한: ${granted.size}개")
                Log.d(TAG, "[HealthConnect] 필요한 권한: ${permissions.size}개")
                Log.d(TAG, "[HealthConnect] 허용된 권한 목록: $granted")
                Log.d(TAG, "[HealthConnect] 필요한 권한 목록: $permissions")
                
                val allGranted = granted.containsAll(permissions)
                Log.d(TAG, "[HealthConnect] 모든 권한 허용 여부: $allGranted")
                
                if (allGranted) {
                    Log.d(TAG, "[HealthConnect] ✅ 모든 권한이 이미 허용되어 있습니다.")
                    promise.resolve(true)
                    return@launch
                }
                
                Log.d(TAG, "[HealthConnect] ⚠️ 권한이 부족합니다. 권한 요청 다이얼로그를 표시합니다.")

                // 권한이 없으면 Activity에서 권한 요청 Intent 실행
                Log.d(TAG, "[HealthConnect] Activity 찾기 시도...")
                val activity = try {
                    javaClass.superclass?.getDeclaredMethod("getCurrentActivity")?.invoke(this) as? Activity
                } catch (e: Exception) {
                    Log.d(TAG, "[HealthConnect] superclass에서 Activity 찾기 실패: ${e.message}")
                    null
                } ?: try {
                    reactApplicationContext.javaClass.getMethod("getCurrentActivity").invoke(reactApplicationContext) as? Activity
                } catch (e: Exception) {
                    Log.d(TAG, "[HealthConnect] reactApplicationContext에서 Activity 찾기 실패: ${e.message}")
                    null
                }
                
                if (activity == null) {
                    Log.e(TAG, "[HealthConnect] ❌ Activity를 찾을 수 없습니다.")
                    Log.e(TAG, "[HealthConnect] reactApplicationContext: $reactApplicationContext")
                    promise.reject("NO_ACTIVITY", "Activity를 찾을 수 없습니다.")
                    return@launch
                }
                
                Log.d(TAG, "[HealthConnect] ✅ Activity 찾음: ${activity.javaClass.simpleName}")

                Log.d(TAG, "[HealthConnect] 권한 요청 Intent 생성 시작...")
                // Health Connect API: createRequestPermissionsIntent 사용
                // 만약 메서드가 없다면 리플렉션으로 시도
                val requestPermissionIntent = try {
                    Log.d(TAG, "[HealthConnect] createRequestPermissionsIntent 시도...")
                    permissionController.javaClass.getDeclaredMethod("createRequestPermissionsIntent", Set::class.java)
                        .invoke(permissionController, permissions) as Intent
                } catch (e: Exception) {
                    Log.d(TAG, "[HealthConnect] createRequestPermissionsIntent 실패, createIntentForRequestPermissions 시도: ${e.message}")
                    // 대체 메서드 시도
                    try {
                        permissionController.javaClass.getDeclaredMethod("createIntentForRequestPermissions", Set::class.java)
                            .invoke(permissionController, permissions) as Intent
                    } catch (e2: Exception) {
                        Log.e(TAG, "[HealthConnect] ❌ 권한 요청 Intent 생성 실패: ${e2.message}", e2)
                        throw RuntimeException("권한 요청 Intent를 생성할 수 없습니다: ${e2.message}", e2)
                    }
                }
                
                Log.d(TAG, "[HealthConnect] ✅ 권한 요청 Intent 생성 완료: $requestPermissionIntent")
                Log.d(TAG, "[HealthConnect] Intent 액션: ${requestPermissionIntent.action}")
                Log.d(TAG, "[HealthConnect] Intent 패키지: ${requestPermissionIntent.`package`}")
                
                // Promise를 저장하여 나중에 결과 처리
                pendingPermissionPromise = promise
                
                // UI 스레드에서 Intent 실행
                withContext(Dispatchers.Main) {
                    try {
                        Log.d(TAG, "[HealthConnect] UI 스레드에서 Intent 실행 시도...")
                        activity.startActivityForResult(requestPermissionIntent, PERMISSION_REQUEST_CODE)
                        Log.d(TAG, "[HealthConnect] ✅ 권한 요청 Intent 실행 완료! 사용자가 권한 다이얼로그를 볼 수 있습니다.")
                        Log.d(TAG, "[HealthConnect] 사용자 응답 대기 중...")
                    } catch (e: Exception) {
                        Log.e(TAG, "[HealthConnect] ❌ 권한 요청 Intent 실행 실패: ${e.message}", e)
                        Log.e(TAG, "[HealthConnect] 에러 타입: ${e.javaClass.simpleName}")
                        e.printStackTrace()
                        pendingPermissionPromise?.reject("INTENT_ERROR", "권한 요청 Intent 실행 실패: ${e.message}")
                        pendingPermissionPromise = null
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "[HealthConnect] 권한 요청 중 오류 발생: ${e.message}", e)
                promise.reject("PERMISSION_ERROR", e.message ?: "권한 요청 실패")
            }
        }
    }

    // Activity 결과 처리
    private fun handleActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            Log.d(TAG, "[HealthConnect] 권한 요청 결과 수신 - resultCode: $resultCode")
            
            scope.launch {
                try {
                    val client = healthConnectClient
                    if (client == null) {
                        Log.e(TAG, "[HealthConnect] Health Connect 클라이언트를 사용할 수 없습니다.")
                        pendingPermissionPromise?.reject("NO_CLIENT", "Health Connect is not available on this device.")
                        pendingPermissionPromise = null
                        return@launch
                    }

                    val permissions = setOf(
                        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
                        HealthPermission.getReadPermission(HeartRateRecord::class),
                        HealthPermission.getReadPermission(DistanceRecord::class)
                    )

                    // 권한 상태 다시 확인
                    val permissionController = client.permissionController
                    val granted = permissionController.getGrantedPermissions()
                    val allGranted = granted.containsAll(permissions)
                    
                    Log.d(TAG, "[HealthConnect] 권한 확인 결과 - 모든 권한 허용: $allGranted")
                    Log.d(TAG, "[HealthConnect] 허용된 권한 수: ${granted.size}/${permissions.size}")
                    
                    if (allGranted) {
                        Log.d(TAG, "[HealthConnect] ✅ 권한이 성공적으로 허용되었습니다!")
                        pendingPermissionPromise?.resolve(true)
                    } else {
                        Log.w(TAG, "[HealthConnect] ⚠️ 일부 권한이 거부되었습니다.")
                        pendingPermissionPromise?.resolve(false)
                    }
                    
                    pendingPermissionPromise = null
                } catch (e: Exception) {
                    Log.e(TAG, "[HealthConnect] 권한 확인 중 오류 발생: ${e.message}", e)
                    pendingPermissionPromise?.reject("PERMISSION_CHECK_ERROR", e.message ?: "권한 확인 실패")
                    pendingPermissionPromise = null
                }
            }
        }
    }

    // 달리기 세션 가져오기 (페이스, 평균 심박, 총거리, 시간)
    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun getRunningSessions(days: Int, promise: Promise) {
        Log.d(TAG, "[HealthConnect] getRunningSessions() 호출됨! days: $days")
        Log.d(TAG, "[HealthConnect] 달리기 세션 조회 시작 - 최근 ${days}일")
        val client = healthConnectClient
        if (client == null) {
            Log.e(TAG, "[HealthConnect] Health Connect 클라이언트를 사용할 수 없습니다.")
            promise.reject("NO_CLIENT", "Health Connect is not available on this device.")
            return
        }

        scope.launch {
            try {
                val now = Instant.now()
                val startTime = now.minusSeconds(days * 24 * 60 * 60L)
                Log.d(TAG, "[HealthConnect] 조회 기간: $startTime ~ $now")

                val request = ReadRecordsRequest(
                    recordType = ExerciseSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, now)
                )

                val response = client.readRecords(request)
                Log.d(TAG, "[HealthConnect] 운동 세션 총 ${response.records.size}개 발견")
                val array = Arguments.createArray()

                val runningSessions = response.records
                    .filter { 
                        it.exerciseType.toString().contains("RUNNING", ignoreCase = true)
                    }
                
                Log.d(TAG, "[HealthConnect] 달리기 세션 ${runningSessions.size}개 발견")
                
                runningSessions.forEachIndexed { index, record ->
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
                    
                    Log.d(TAG, "[HealthConnect] 세션 ${index + 1}: 거리=${sessionDistance}m, 시간=${duration.toMinutes()}분, 페이스=${paceMinutesPerKm}분/km, 심박=${avgHeartRate.toInt()}bpm")
                }

                Log.d(TAG, "[HealthConnect] ✅ 달리기 세션 조회 완료 - 총 ${array.size()}개")
                promise.resolve(array)
            } catch (e: Exception) {
                Log.e(TAG, "[HealthConnect] 달리기 세션 조회 실패: ${e.message}", e)
                promise.reject("RUNNING_SESSIONS_ERROR", e)
            }
        }
    }
}
