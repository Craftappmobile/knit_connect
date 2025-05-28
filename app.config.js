import 'dotenv/config';

export default {
  name: "ExpoSupabaseStarter",
  slug: "ExpoSupabaseStarter",
  scheme: "expo-supabase-starter",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: [
    "**/*"
  ],
  newArchEnabled: true,
  // Додаємо налаштування EAS Update
  updates: {
    url: "https://u.expo.dev/199595a8-9ca5-48a4-ad80-b6bbd9a8ee03"
  },
  ios: {
    supportsTablet: true,
    config: {
      usesNonExemptEncryption: false
    },
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
      dark: {
        backgroundColor: "#000000",
        resizeMode: "cover",
        image: "./assets/splash-dark.png"
      }
    },
    icon: {
      dark: "./assets/icon-dark.png",
      light: "./assets/icon.png"
    },
    bundleIdentifier: "com.flemingvincent.ExpoSupabaseStarter",
    // Додаємо runtimeVersion для iOS
    runtimeVersion: {
      policy: "appVersion"
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png"
    },
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
      dark: {
        backgroundColor: "#000000",
        resizeMode: "cover",
        image: "./assets/splash-dark.png"
      }
    },
    package: "com.razchuivyazhy.app",
    googleServicesFile: "./android/app/google-services.json",
    permissions: [
      "android.permission.INTERNET",
      "android.permission.POST_NOTIFICATIONS"
    ],
    // Додаємо runtimeVersion для Android
    runtimeVersion: "1.0.0"
  },
  experiments: {
    typedRoutes: true
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-notifications",
    "expo-updates",
    [
      "onesignal-expo-plugin",
      {
        mode: "development",
        devTeam: null, // Якщо є iOS Team ID, можна додати сюди
        iPhoneDeploymentTarget: "13.0"
      }
    ]
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    oneSignalAppId: "064a7314-cd39-49f2-acb8-391e8446bc38",
    eas: {
      projectId: "199595a8-9ca5-48a4-ad80-b6bbd9a8ee03"
    }
  }
};