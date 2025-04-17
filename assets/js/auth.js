// Firebase认证模块
// 提供登录、注册、检查认证状态等功能

// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyCulWQxvrzxDOLGOxzi2ngj9n0DwzvqJFw",
  authDomain: "aetherflow-b6459.firebaseapp.com",
  projectId: "aetherflow-b6459",
  storageBucket: "aetherflow-b6459.firebasestorage.app",
  messagingSenderId: "423266303314",
  appId: "1:423266303314:web:9cbf8adb847f043bd34e8b",
  measurementId: "G-ZD5E2WY22N"
};

// 存储身份验证状态的键名
const AUTH_STATE_KEY = 'aetherflow_auth_state';

// 初始化Firebase
function initializeFirebase() {
  // 检查是否已初始化
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase;
}

// 获取Auth实例
function getAuth() {
  initializeFirebase();
  return firebase.auth();
}

// 将Firebase用户对象转换为应用用户对象
function mapFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '用户',
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    lastLoginAt: firebaseUser.metadata?.lastSignInTime,
    createdAt: firebaseUser.metadata?.creationTime
  };
}

// 保存用户认证状态到localStorage
function saveAuthState(user) {
  if (user) {
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STATE_KEY);
  }
}

// 从localStorage读取用户认证状态
function loadAuthState() {
  const state = localStorage.getItem(AUTH_STATE_KEY);
  return state ? JSON.parse(state) : null;
}

// 用户登录
async function loginUser(email, password) {
  try {
    const auth = getAuth();
    const { user } = await auth.signInWithEmailAndPassword(email, password);
    const appUser = mapFirebaseUser(user);
    saveAuthState(appUser);
    return appUser;
  } catch (error) {
    console.error("登录失败:", error);
    throw new Error(error.message || "登录失败，请检查邮箱和密码");
  }
}

// 用户注册
async function registerUser(email, password, displayName) {
  try {
    const auth = getAuth();
    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    
    // 如果提供了显示名称，则更新用户资料
    if (displayName) {
      await user.updateProfile({ displayName });
    }
    
    const appUser = mapFirebaseUser(user);
    saveAuthState(appUser);
    return appUser;
  } catch (error) {
    console.error("注册失败:", error);
    throw new Error(error.message || "注册失败，请重试");
  }
}

// Google登录
async function loginWithGoogle() {
  try {
    const auth = getAuth();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const { user } = await auth.signInWithPopup(provider);
    const appUser = mapFirebaseUser(user);
    saveAuthState(appUser);
    return appUser;
  } catch (error) {
    console.error("Google登录失败:", error);
    throw new Error(error.message || "Google登录失败，请重试");
  }
}

// 登出
async function logoutUser() {
  try {
    const auth = getAuth();
    await auth.signOut();
    saveAuthState(null);
  } catch (error) {
    console.error("登出失败:", error);
    throw new Error(error.message || "登出失败，请重试");
  }
}

// 获取当前用户
async function getCurrentUser() {
  return new Promise((resolve) => {
    const auth = getAuth();
    
    // 先检查Firebase当前用户
    const currentUser = auth.currentUser;
    if (currentUser) {
      resolve(mapFirebaseUser(currentUser));
      return;
    }
    
    // 设置一个超时，避免长时间等待
    const timeout = setTimeout(() => {
      const storedUser = loadAuthState();
      resolve(storedUser);
    }, 1000);
    
    // 同时监听认证状态变化
    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timeout);
      unsubscribe();
      if (user) {
        const appUser = mapFirebaseUser(user);
        saveAuthState(appUser);
        resolve(appUser);
      } else {
        const storedUser = loadAuthState();
        resolve(storedUser);
      }
    });
  });
}

// 重置密码
async function resetPassword(email) {
  try {
    const auth = getAuth();
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    console.error("重置密码失败:", error);
    throw new Error(error.message || "重置密码失败，请重试");
  }
}

// 处理来自扩展的认证令牌
async function handleExtensionAuthToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('auth_token');
  
  if (!token) return null;
  
  try {
    // 清除URL参数
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // 使用令牌登录
    const auth = getAuth();
    const { user } = await auth.signInWithCustomToken(token);
    const appUser = mapFirebaseUser(user);
    saveAuthState(appUser);
    return appUser;
  } catch (error) {
    console.error("使用扩展令牌登录失败:", error);
    return null;
  }
}

// 更新支付请求数据，添加用户ID
function updatePaymentData(paymentData) {
  const currentUser = getAuth().currentUser;
  if (currentUser) {
    // 确保customData存在
    paymentData.customData = paymentData.customData || {};
    // 添加用户ID
    paymentData.customData.userId = currentUser.uid;
  }
  return paymentData;
}

// 观察认证状态变化
function onAuthStateChanged(callback) {
  const auth = getAuth();
  
  return auth.onAuthStateChanged((firebaseUser) => {
    const user = mapFirebaseUser(firebaseUser);
    saveAuthState(user);
    callback(user);
  });
}

// 导出API
window.AetherFlowAuth = {
  loginUser,
  registerUser,
  loginWithGoogle,
  logoutUser,
  getCurrentUser,
  resetPassword,
  handleExtensionAuthToken,
  updatePaymentData,
  onAuthStateChanged
}; 