// plugins/withNaver.js
const { withAndroidManifest } = require("@expo/config-plugins");

function addNaverIntentFilterToManifest(config, androidManifest) {
  const app = androidManifest.application?.[0];
  if (!app) return androidManifest;

  if (!app.activity) {
    app.activity = [];
  }

  const activities = app.activity;

  // MainActivity 찾기
  const mainActivity = activities.find(
    (activity) =>
      activity.$?.["android:name"] === ".MainActivity" ||
      activity.$?.["android:name"]?.includes("MainActivity")
  );

  if (!mainActivity) {
    return androidManifest;
  }

  // intent-filter가 없으면 생성
  if (!mainActivity["intent-filter"]) {
    mainActivity["intent-filter"] = [];
  }

  const intentFilters = mainActivity["intent-filter"];

  // 패키지 이름 가져오기 (config에서 동적으로 가져오기)
  const packageName = config.android?.package || "com.anonymous.RunPTMobile";
  const appScheme = config.scheme || "runptmobile";

  // 기본 intent-filter 찾기 (VIEW 액션과 BROWSABLE 카테고리가 있는 필터)
  const defaultIntentFilter = intentFilters.find((filter) => {
    const hasViewAction = filter.action?.some(
      (a) => a.$?.["android:name"] === "android.intent.action.VIEW"
    );
    const hasBrowsableCategory = filter.category?.some(
      (c) => c.$?.["android:name"] === "android.intent.category.BROWSABLE"
    );
    return hasViewAction && hasBrowsableCategory;
  });

  // 기본 intent-filter에 필요한 스킴들이 있는지 확인하고 추가
  if (defaultIntentFilter) {
    if (!defaultIntentFilter.data) {
      defaultIntentFilter.data = [];
    }

    const data = defaultIntentFilter.data;
    const schemes = data.map((d) => ({
      scheme: d.$?.["android:scheme"],
      host: d.$?.["android:host"],
    }));

    // exp+runptmobile 스킴 추가 (없는 경우)
    if (!schemes.some((s) => s.scheme === `exp+${appScheme}` && !s.host)) {
      data.push({
        $: {
          "android:scheme": `exp+${appScheme}`,
        },
      });
    }

    // exp+runptmobile://expo-development-client 스킴 추가 (없는 경우)
    if (
      !schemes.some(
        (s) =>
          s.scheme === `exp+${appScheme}` && s.host === "expo-development-client"
      )
    ) {
      data.push({
        $: {
          "android:scheme": `exp+${appScheme}`,
          "android:host": "expo-development-client",
        },
      });
    }

    // com.anonymous.RunPTMobile://expo-development-client 스킴 추가 (없는 경우)
    if (
      !schemes.some(
        (s) =>
          s.scheme === packageName && s.host === "expo-development-client"
      )
    ) {
      data.push({
        $: {
          "android:scheme": packageName,
          "android:host": "expo-development-client",
        },
      });
    }
  }

  // 네이버 로그인 intent-filter가 이미 있는지 확인
  const naverIntentFilterExists = intentFilters.some((filter) => {
    const data = filter.data;
    if (!data || !Array.isArray(data)) return false;
    return data.some(
      (d) =>
        d.$?.["android:scheme"] === packageName &&
        d.$?.["android:host"] === "naverlogin"
    );
  });

  if (naverIntentFilterExists) {
    return androidManifest;
  }

  // 네이버 로그인 intent-filter 추가
  const naverIntentFilter = {
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
          "android:scheme": packageName,
          "android:host": "naverlogin",
        },
      },
    ],
  };

  intentFilters.push(naverIntentFilter);

  return androidManifest;
}

const withNaver = (config) => {
  // AndroidManifest 수정
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    config.modResults.manifest = addNaverIntentFilterToManifest(config, androidManifest);
    return config;
  });

  return config;
};

module.exports = withNaver;

