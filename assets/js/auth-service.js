// 认证服务
const AuthService = {
  // 当前用户
  currentUser: null,
  
  // 观察者集合
  observers: [],
  
  // 初始化
  init() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    
    // 监听认证状态变化
    auth.onAuthStateChanged(firebaseUser => {
      this.currentUser = mapFirebaseUser(firebaseUser);
      
      // 保存到localStorage
      if (this.currentUser) {
        localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('auth_user');
      }
      
      // 通知所有观察者
      this.notifyObservers();
    });
    
    // 尝试从localStorage恢复用户
    this.tryRestoreUserFromStorage();
  },
  
  // 从存储恢复用户
  tryRestoreUserFromStorage() {
    if (this.currentUser) return; // 已有用户，不需要恢复
    
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.notifyObservers();
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('auth_user');
      }
    }
  },
  
  // 邮箱密码登录
  async loginWithEmail(email, password) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
      return this.currentUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // Google登录
  async loginWithGoogle() {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      return this.currentUser;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  },
  
  // 用户注册
  async register(email, password, displayName) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      // 创建账户
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // 更新用户资料
      if (displayName && userCredential.user) {
        await userCredential.user.updateProfile({ displayName });
      }
      
      return this.currentUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  // 重置密码
  async resetPassword(email) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  },
  
  // 登出
  async logout() {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  
  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  },
  
  // 是否已认证
  isAuthenticated() {
    return !!this.currentUser;
  },
  
  // 添加观察者
  addObserver(callback) {
    this.observers.push(callback);
    
    // 立即通知新观察者当前状态
    if (callback && typeof callback === 'function') {
      callback(this.currentUser);
    }
    
    // 返回取消订阅函数
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  },
  
  // 通知所有观察者
  notifyObservers() {
    this.observers.forEach(callback => {
      if (callback && typeof callback === 'function') {
        callback(this.currentUser);
      }
    });
  }
};

// 在页面加载时初始化认证服务
document.addEventListener('DOMContentLoaded', () => {
  // 确保Firebase已加载
  if (typeof window.firebase !== 'undefined') {
    AuthService.init();
  } else {
    console.error('Firebase SDK not loaded. Auth service initialization failed.');
  }
}); 