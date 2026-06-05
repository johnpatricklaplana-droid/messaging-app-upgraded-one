import 'dotenv/config';

export default {
  expo: {
    name: "messaging-app-last-one",
    slug: "messaging-app-last-one",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "messagingapplastone",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      "animateByDefault": false,
      "predictiveBackGestureEnabled": false,
      "package": "com.anonymous.messagingapplastone",
      "googleServicesFile": "./google-services.json",
      "softwareKeyboardLayoutMode": "pan"
    },
    web: {
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-image",
      [
        "expo-video",
        {
          "supportsBackgroundPlayback": true,
          "supportsPictureInPicture": true
        }
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/react-logo@3x.png",
            imageWidth: 76
          }
        }
      ],
      "expo-web-browser",
      "@react-native-google-signin/google-signin"
    ],
    experiments: {
      reactCompiler: true
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "4ee20f35-d11f-4c29-a2b5-eb54d29a2c6f"
      }
    }
  }
}
