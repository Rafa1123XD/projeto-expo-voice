// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCl0CScQATDAbDBZCChtiu3cCC3SjQ124U",
  authDomain: "projeto-expo-voice.firebaseapp.com",
  projectId: "projeto-expo-voice",
  storageBucket: "projeto-expo-voice.firebasestorage.app",
  messagingSenderId: "763808499575",
  appId: "1:763808499575:web:c775617851a31d7a730372",
  measurementId: "G-NH7832V0HJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const storage = getStorage(app);
const analytics = getAnalytics(app);