package com.anonymous.RunPTMobile

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper
import com.anonymous.RunPTMobile.health.HealthConnectPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
      this,
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Health Connect Package 추가
              android.util.Log.d("MainApplication", "[HealthConnect] HealthConnectPackage 추가 시작")
              val healthConnectPackage = HealthConnectPackage()
              add(healthConnectPackage)
              android.util.Log.d("MainApplication", "[HealthConnect] HealthConnectPackage 추가 완료")
              android.util.Log.d("MainApplication", "[HealthConnect] 총 패키지 수: ${this.size}")
            }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    android.util.Log.d("MainApplication", "[HealthConnect] onCreate() 시작")
    android.util.Log.d("MainApplication", "[HealthConnect] New Architecture 활성화: ${BuildConfig.IS_NEW_ARCHITECTURE_ENABLED}")
    
    // 카카오 SDK 초기화
    try {
      android.util.Log.d("MainApplication", "[Kakao] 카카오 SDK 초기화 시작")
      // @react-native-seoul/kakao-login은 자동으로 초기화되므로 명시적 초기화 불필요
      android.util.Log.d("MainApplication", "[Kakao] 카카오 SDK 초기화 완료 (자동 초기화)")
    } catch (e: Exception) {
      android.util.Log.e("MainApplication", "[Kakao] 카카오 SDK 초기화 실패: ${e.message}", e)
    }
    
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    android.util.Log.d("MainApplication", "[HealthConnect] loadReactNative 호출 전")
    loadReactNative(this)
    android.util.Log.d("MainApplication", "[HealthConnect] loadReactNative 호출 후")
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
    android.util.Log.d("MainApplication", "[HealthConnect] onCreate() 완료")
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }

  // HealthConnectPackage는 getPackages()에서 추가해야 함
  // 현재는 autolinking이 안 되므로 수동으로 추가 필요
}
