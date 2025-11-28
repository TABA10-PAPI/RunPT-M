// plugins/withKakao.js
const {
    withAndroidManifest,
    withProjectBuildGradle,
    withDangerousMod,
  } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");
  
  function addKakaoActivityToManifest(androidManifest) {
    const app = androidManifest.application?.[0];
    if (!app) return androidManifest;
  
    if (!app.activity) {
      app.activity = [];
    }
  
    const activities = app.activity;
  
    const kakaoActivityName = "com.kakao.sdk.auth.AuthCodeHandlerActivity";
  
    // 이미 있으면 중복 추가 안 함
    const alreadyExists = activities.some(
      (activity) => activity.$?.["android:name"] === kakaoActivityName
    );
  
    if (alreadyExists) {
      return androidManifest;
    }
  
    const kakaoScheme = `kakao${process.env.EXPO_PUBLIC_KAKAO_API_KEY_MOBILE || ""}`;
  
    const newActivity = {
      $: {
        "android:name": kakaoActivityName,
        "android:exported": "true",
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": "android.intent.action.VIEW",
              },
            },
          ],
          category: [
            {
              $: {
                "android:name": "android.intent.category.DEFAULT",
              },
            },
            {
              $: {
                "android:name": "android.intent.category.BROWSABLE",
              },
            },
          ],
          data: [
            {
              $: {
                "android:host": "oauth",
                "android:scheme": kakaoScheme,
              },
            },
          ],
        },
      ],
    };
  
    activities.push(newActivity);
  
    return androidManifest;
  }
  
  const KAKAO_MAVEN = 'maven { url "https://devrepo.kakao.com/nexus/content/groups/public/" }';
  
  function addKakaoRepoToGradle(gradle) {
    let contents = gradle.contents;
  
    if (contents.includes("devrepo.kakao.com/nexus/content/groups/public")) {
      gradle.contents = contents;
      return gradle;
    }
  
    // allprojects.repositories에 카카오 Maven 저장소 추가
    if (contents.includes("allprojects")) {
      contents = contents.replace(
        /(allprojects\s*\{[^}]*repositories\s*\{)/,
        (match) => {
          if (match.includes("devrepo.kakao.com")) {
            return match;
          }
          return `${match}\n    ${KAKAO_MAVEN}`;
        }
      );
    }
  
    // buildscript.repositories에도 추가 (이미 있으면 스킵)
    if (contents.includes("buildscript")) {
      contents = contents.replace(
        /(buildscript\s*\{[^}]*repositories\s*\{)/,
        (match) => {
          if (match.includes("devrepo.kakao.com")) {
            return match;
          }
          return `${match}\n        ${KAKAO_MAVEN}`;
        }
      );
    }
  
    gradle.contents = contents;
    return gradle;
  }
  
  function addKakaoAppKeyToStringsXml(config) {
    const stringsXmlPath = path.join(
      config.modRequest.platformProjectRoot,
      "app/src/main/res/values/strings.xml"
    );
  
    if (!fs.existsSync(stringsXmlPath)) {
      console.warn(`strings.xml not found at ${stringsXmlPath}`);
      return config;
    }
  
    let stringsXml = fs.readFileSync(stringsXmlPath, "utf-8");
    const kakaoAppKey = process.env.EXPO_PUBLIC_KAKAO_API_KEY_MOBILE || "";
  
    // kakao_app_key가 이미 있는지 확인
    if (stringsXml.includes('name="kakao_app_key"')) {
      // 기존 값 업데이트
      stringsXml = stringsXml.replace(
        /<string name="kakao_app_key">.*?<\/string>/,
        `<string name="kakao_app_key">${kakaoAppKey}</string>`
      );
    } else {
      // 새로 추가 (app_name 다음에 추가)
      stringsXml = stringsXml.replace(
        /(<string name="app_name">.*?<\/string>)/,
        `$1\n  <string name="kakao_app_key">${kakaoAppKey}</string>`
      );
    }
  
    fs.writeFileSync(stringsXmlPath, stringsXml, "utf-8");
    return config;
  }
  
  const withKakao = (config) => {
    // AndroidManifest 수정
    config = withAndroidManifest(config, (config) => {
      const androidManifest = config.modResults.manifest;
      config.modResults.manifest = addKakaoActivityToManifest(androidManifest);
      return config;
    });
  
    // android/build.gradle 수정 (루트 gradle)
    config = withProjectBuildGradle(config, (config) => {
      config.modResults = addKakaoRepoToGradle(config.modResults);
      return config;
    });
  
    // strings.xml에 카카오 앱 키 추가
    config = withDangerousMod(config, [
      "android",
      (config) => addKakaoAppKeyToStringsXml(config),
    ]);
  
    return config;
  };
  
  module.exports = withKakao;
  