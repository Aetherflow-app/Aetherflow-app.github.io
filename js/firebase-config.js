// Firebase 配置信息
const firebaseConfig = {
  apiKey: "AIzaSyCulWQxvrzxDOLGOxzi2ngj9n0DwzvqJFw",
  authDomain: "aetherflow-b6459.firebaseapp.com",
  projectId: "aetherflow-b6459",
  storageBucket: "aetherflow-b6459.firebasestorage.app",
  messagingSenderId: "423266303314",
  appId: "1:423266303314:web:9cbf8adb847f043bd34e8b",
  measurementId: "G-ZD5E2WY22N"
};

// 初始化 Firebase
function initializeFirebase() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    // 设置认证持久化，使官网和扩展共享状态
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    console.log('Firebase 初始化成功');
  } else {
    console.log('Firebase 已初始化');
  }
}

// 获取 Auth 实例
function getAuth() {
  return firebase.auth();
}

// 创建 Google 登录提供者
function createGoogleProvider() {
  return new firebase.auth.GoogleAuthProvider();
} 