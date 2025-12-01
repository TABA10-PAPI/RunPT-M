/**
 * 네이버 로그인 플러그인
 * - AndroidManifest의 MainActivity에 네이버 로그인 intent-filter 추가
 */
const { withAndroidManifest } = require("@expo/config-plugins");

// MainActivity에 네이버 로그인 intent-filter 추가
function addNaverIntentFilterToManifest(config, androidManifest) {
  const app = androidManifest.application?.[0];
  if (!app) return androidManifest;

  if (!app.activity) {
    app.activity = [];
  }

  const activities = app.activity;
  const mainActivity = activities.find(
    (activity) =>
      activity.$?.["android:name"] === ".MainActivity" ||
      activity.$?.["android:name"]?.includes("MainActivity")
  );

  if (!mainActivity) {
    return androidManifest;
  }

  if (!mainActivity["intent-filter"]) {
    mainActivity["intent-filter"] = [];
  }

  const intentFilters = mainActivity["intent-filter"];
  const packageName = config.android?.package || "com.anonymous.RunPTMobile";
  const appScheme = config.scheme || "runptmobile";
  const defaultIntentFilter = intentFilters.find((filter) => {
    const hasViewAction = filter.action?.some(
      (a) => a.$?.["android:name"] === "android.intent.action.VIEW"
    );
    const hasBrowsableCategory = filter.category?.some(
      (c) => c.$?.["android:name"] === "android.intent.category.BROWSABLE"
    );
    return hasViewAction && hasBrowsableCategory;
  });

  if (defaultIntentFilter) {
    if (!defaultIntentFilter.data) {
      defaultIntentFilter.data = [];
    }

    const data = defaultIntentFilter.data;
    const schemes = data.map((d) => ({
      scheme: d.$?.["android:scheme"],
      host: d.$?.["android:host"],
    }));

    if (!schemes.some((s) => s.scheme === `exp+${appScheme}` && !s.host)) {
      data.push({
        $: {
          "android:scheme": `exp+${appScheme}`,
        },
      });
    }

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
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    config.modResults.manifest = addNaverIntentFilterToManifest(config, androidManifest);
    return config;
  });

  return config;
};

module.exports = withNaver;

