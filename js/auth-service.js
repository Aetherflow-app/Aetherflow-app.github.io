// 认证服务
const authService = {
  // 获取当前用户
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        unsubscribe();
        resolve(user ? this.mapUser(user) : null);
      }, reject);
    });
  },

  // 邮箱密码登录
  async loginUser(email, password) {
    try {
      const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
      return this.mapUser(user);
    } catch (error) {
      console.error('登录失败:', error);
      throw this.handleAuthError(error);
    }
  },

  // Google登录
  async loginWithGoogle() {
    try {
      const provider = createGoogleProvider();
      const { user } = await firebase.auth().signInWithPopup(provider);
      return this.mapUser(user);
    } catch (error) {
      console.error('Google登录失败:', error);
      throw this.handleAuthError(error);
    }
  },

  // 注册新用户
  async registerUser(email, password, displayName = '') {
    try {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      // 如果提供了显示名称，则更新用户资料
      if (displayName) {
        await this.updateUserProfile({ displayName });
      }
      
      return this.mapUser(user);
    } catch (error) {
      console.error('注册失败:', error);
      throw this.handleAuthError(error);
    }
  },

  // 用户登出
  async logoutUser() {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error('登出失败:', error);
      throw this.handleAuthError(error);
    }
  },

  // 重置密码
  async resetPassword(email) {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('重置密码失败:', error);
      throw this.handleAuthError(error);
    }
  },

  // 更新用户资料
  async updateUserProfile(profile) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) throw new Error('未登录用户');
      
      await user.updateProfile(profile);
      return this.mapUser(user);
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw this.handleAuthError(error);
    }
  },

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    return firebase.auth().onAuthStateChanged(
      user => callback(user ? this.mapUser(user) : null),
      error => {
        console.error('认证状态监听错误:', error);
        callback(null);
      }
    );
  },

  // 将Firebase用户对象转换为应用用户对象
  mapUser(firebaseUser) {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAnonymous: firebaseUser.isAnonymous,
      emailVerified: firebaseUser.emailVerified,
      providerData: firebaseUser.providerData,
      lastLoginAt: firebaseUser.metadata.lastSignInTime || undefined,
      createdAt: firebaseUser.metadata.creationTime || undefined
    };
  },

  // 处理认证错误
  handleAuthError(error) {
    let message = '出现错误，请重试';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = '无效的邮箱地址';
        break;
      case 'auth/user-disabled':
        message = '该用户已被禁用';
        break;
      case 'auth/user-not-found':
        message = '用户不存在';
        break;
      case 'auth/wrong-password':
        message = '密码错误';
        break;
      case 'auth/email-already-in-use':
        message = '该邮箱已被注册';
        break;
      case 'auth/weak-password':
        message = '密码强度不足';
        break;
      case 'auth/popup-closed-by-user':
        message = '登录窗口被关闭';
        break;
      case 'auth/operation-not-allowed':
        message = '此操作不被允许';
        break;
      case 'auth/requires-recent-login':
        message = '需要重新登录';
        break;
    }
    
    return new Error(message);
  },

  // 检查是否已认证
  isAuthenticated() {
    return !!firebase.auth().currentUser;
  }
}; 