package com.anonymous.RunPTMobile.health

import android.util.Log
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HealthConnectPackage : ReactPackage {
    companion object {
        private const val TAG = "HealthConnectPackage"
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        Log.d(TAG, "[HealthConnect] HealthConnectPackage.createNativeModules() 호출됨")
        val module = HealthConnectModule(reactContext)
        Log.d(TAG, "[HealthConnect] HealthConnectModule 생성 완료: ${module.getName()}")
        return listOf(module)
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
