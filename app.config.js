/// app.config.js
export default { 
    expo: {
        "name": "projeto-expo-voice",
        "slug": "projeto-expo-voice",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "projetoexpovoice",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "ios": {
          "supportsTablet": true,
          "infoPlist": {
            "NSMicrophoneUsageDescription": "Este aplicativo precisa acessar o microfone para gravar áudio e medir níveis de som"
          }
        },
        "android": {
          "adaptiveIcon": {
            "foregroundImage": "./assets/images/adaptive-icon.png",
            "backgroundColor": "#ffffff"
          },
          "edgeToEdgeEnabled": true,
          "permissions": [
            "android.permission.RECORD_AUDIO",
            "android.permission.MODIFY_AUDIO_SETTINGS"
          ],
          "package": "com.anonymous.projetoexpovoice",
          googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
        },
        "web": {
          "bundler": "metro",
          "output": "static",
          "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
          "expo-router",
          [
            "expo-splash-screen",
            {
              "image": "./assets/images/splash-icon.png",
              "imageWidth": 200,
              "resizeMode": "contain",
              "backgroundColor": "#ffffff"
            }
          ]
        ],
        "experiments": {
          "typedRoutes": true
        },
        "extra": {
          "router": {},
          "eas": {
            "projectId": "32f44554-6059-412b-b91d-bc30f3ea00ed"
          }
        },
        "owner": "projetos_unifecaf"

    }
    
 }