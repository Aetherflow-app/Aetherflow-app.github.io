// auth-service.js - AetherFlow官网认证服务
// 实现Firebase认证功能与扩展交互

// Firebase配置信息 (与扩展中使用的相同配置)
const firebaseConfig = {
  apiKey: "AIzaSyCulWQxvrzxDOLGOxzi2ngj9n0DwzvqJFw",
  authDomain: "aetherflow-b6459.firebaseapp.com",
  projectId: "aetherflow-b6459",
  storageBucket: "aetherflow-b6459.firebasestorage.app",
  messagingSenderId: "423266303314",
  appId: "1:423266303314:web:9cbf8adb847f043bd34e8b",
  measurementId: "G-ZD5E2WY22N"
};

// 认证服务类
class AuthService {
  constructor() {
    this.initialized = false;
    this.auth = null;
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // 初始化Firebase
  async initialize() {
    if (this.initialized) return;

    try {
      // 动态加载Firebase所需的脚本
      await this.loadFirebaseScripts();
      
      // 初始化Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      this.auth = firebase.auth();
      this.initialized = true;
      
      // 监听认证状态变化
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        
        // 保存状态到localStorage (不含敏感信息)
        if (user) {
          localStorage.setItem('auth_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isAnonymous: user.isAnonymous,
            emailVerified: user.emailVerified
          }));
        } else {
          localStorage.removeItem('auth_user');
        }
        
        // 通知所有监听者
        this.notifyAuthStateChanged();
      });
      
      // 处理来自URL的认证令牌
      await this.handleAuthTokenFromUrl();
      
      console.log('Firebase 认证服务初始化完成');
      return true;
    } catch (error) {
      console.error('初始化Firebase认证服务失败:', error);
      return false;
    }
  }
  
  // 动态加载Firebase SDK脚本
  async loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
      // 检查是否已加载
      if (window.firebase) {
        return resolve();
      }
      
      // 加载Firebase核心
      const appScript = document.createElement('script');
      appScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
      appScript.onload = () => {
        // 加载Firebase认证
        const authScript = document.createElement('script');
        authScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
        authScript.onload = () => {
          // 加载Firebase UI
          const uiScript = document.createElement('script');
          uiScript.src = 'https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth.js';
          
          uiScript.onload = () => {
            // 加载FirebaseUI CSS
            if (!document.querySelector('link[href*="firebaseui"]')) {
              const uiStyles = document.createElement('link');
              uiStyles.rel = 'stylesheet';
              uiStyles.type = 'text/css';
              uiStyles.href = 'https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth.css';
              document.head.appendChild(uiStyles);
            }
            resolve();
          };
          
          uiScript.onerror = reject;
          document.head.appendChild(uiScript);
        };
        
        authScript.onerror = reject;
        document.head.appendChild(authScript);
      };
      
      appScript.onerror = reject;
      document.head.appendChild(appScript);
    });
  }
  
  // 处理URL中的认证令牌
  async handleAuthTokenFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        console.log('从URL检测到认证令牌');
        
        // 使用令牌签名
        await this.auth.signInWithCustomToken(token);
        
        // 移除URL中的token参数
        const newUrl = window.location.pathname + 
                      window.location.search.replace(/[?&]token=[^&]+/, '') + 
                      window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
        
        console.log('使用令牌登录成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('处理URL认证令牌失败:', error);
      return false;
    }
  }
  
  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }
  
  // 检查是否已登录
  isAuthenticated() {
    return !!this.currentUser;
  }
  
  // 使用邮箱密码登录
  async loginWithEmail(email, password) {
    if (!this.initialized) await this.initialize();
    
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      console.error('邮箱登录失败:', error);
      throw error;
    }
  }
  
  // 使用Google登录
  async loginWithGoogle() {
    if (!this.initialized) await this.initialize();
    
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const userCredential = await this.auth.signInWithPopup(provider);
      return userCredential.user;
    } catch (error) {
      console.error('Google登录失败:', error);
      throw error;
    }
  }
  
  // 注册新用户
  async registerUser(email, password, displayName) {
    if (!this.initialized) await this.initialize();
    
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // 设置显示名称
      if (displayName) {
        await user.updateProfile({ displayName });
      }
      
      return user;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }
  
  // 重置密码
  async resetPassword(email) {
    if (!this.initialized) await this.initialize();
    
    try {
      await this.auth.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      console.error('密码重置失败:', error);
      throw error;
    }
  }
  
  // 登出
  async logout() {
    if (!this.initialized) await this.initialize();
    
    try {
      await this.auth.signOut();
      return true;
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }
  
  // 注册认证状态变化监听器
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    // 立即触发一次当前状态
    if (this.initialized) {
      callback(this.currentUser);
    }
    
    // 返回取消订阅函数
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index !== -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }
  
  // 通知所有认证状态监听器
  notifyAuthStateChanged() {
    for (const listener of this.authStateListeners) {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('认证状态监听器错误:', error);
      }
    }
  }
  
  // 获取或创建Firebase UI实例
  getFirebaseUI() {
    if (!window.firebaseui) {
      console.error('FirebaseUI 尚未加载，请确保已调用initialize()');
      return null;
    }
    
    if (!this.ui) {
      this.ui = new firebaseui.auth.AuthUI(this.auth);
    }
    
    return this.ui;
  }
  
  // 在指定容器中显示登录UI
  showLoginUI(containerId, redirectUrl = window.location.href) {
    if (!this.initialized) {
      this.initialize().then(() => this.showLoginUI(containerId, redirectUrl));
      return;
    }
    
    const ui = this.getFirebaseUI();
    if (!ui) return;
    
    // FirebaseUI配置
    const uiConfig = {
      signInFlow: 'popup',
      signInSuccessUrl: redirectUrl,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      tosUrl: '/terms-of-service.html',
      privacyPolicyUrl: '/privacy-policy.html',
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          // 登录成功后触发自定义事件
          const event = new CustomEvent('authSignInSuccess', { 
            detail: { user: authResult.user }
          });
          window.dispatchEvent(event);
          
          // 返回false避免FirebaseUI自动重定向
          return false;
        }
      }
    };
    
    ui.start(`#${containerId}`, uiConfig);
  }
}

// 创建并导出认证服务单例
const authService = new AuthService();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  authService.initialize();
});

// 生成包含认证令牌的URL (用于从扩展跳转到官网)
async function generateTokenUrl(targetUrl) {
  try {
    if (!authService.isAuthenticated()) {
      return targetUrl;
    }
    
    const user = authService.getCurrentUser();
    const token = await user.getIdToken();
    
    // 构建包含令牌的URL
    const url = new URL(targetUrl);
    url.searchParams.append('token', token);
    
    return url.toString();
  } catch (error) {
    console.error('生成令牌URL失败:', error);
    return targetUrl;
  }
} 