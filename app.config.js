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
    bundleIdentifier: "com.flemingvincent.ExpoSupabaseStarter"
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
    package: "com.razchuivyazhy.app"
  },
  experiments: {
    typedRoutes: true
  },
  plugins: [
    "expo-router",
    "expo-secure-store"
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-eas-project-id" // Замініть на реальний ID, якщо використовуєте EAS
    }
  }
};