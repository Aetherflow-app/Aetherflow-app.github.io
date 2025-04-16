// Firebase配置信息
const firebaseConfig = {
  apiKey: "AIzaSyCulWQxvrzxDOLGOxzi2ngj9n0DwzvqJFw",
  authDomain: "aetherflow-b6459.firebaseapp.com",
  projectId: "aetherflow-b6459",
  storageBucket: "aetherflow-b6459.firebasestorage.app",
  messagingSenderId: "423266303314",
  appId: "1:423266303314:web:9cbf8adb847f043bd34e8b",
  measurementId: "G-ZD5E2WY22N"
};

// 判断是否已初始化Firebase
function initializeFirebase() {
  if (!window.firebase) {
    console.error('Firebase SDK not loaded');
    return null;
  }
  
  try {
    // 检查是否已经初始化
    const apps = window.firebase.apps;
    if (apps.length === 0) {
      const app = window.firebase.initializeApp(firebaseConfig);
      console.log('Firebase 初始化成功');
      return app;
    } else {
      const app = window.firebase.app();
      console.log('Firebase 已初始化，返回现有实例');
      return app;
    }
  } catch (error) {
    console.error('Firebase 初始化错误:', error);
    return null;
  }
}

// 获取Firebase Auth实例
function getFirebaseAuth() {
  const app = initializeFirebase();
  if (!app) return null;
  return app.auth();
}

// 将Firebase User转换为应用User对象
function mapFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAnonymous: firebaseUser.isAnonymous,
    emailVerified: firebaseUser.emailVerified,
    providerData: firebaseUser.providerData.map(provider => ({
      providerId: provider.providerId,
      uid: provider.uid,
      displayName: provider.displayName,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      photoURL: provider.photoURL
    })),
    lastLoginAt: firebaseUser.metadata.lastSignInTime,
    createdAt: firebaseUser.metadata.creationTime
  };
} 