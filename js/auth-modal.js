// 认证模态窗口组件
class AuthModal {
  constructor() {
    this.isOpen = false;
    this.activeTab = 'login'; // login, register, reset
    this.loading = false;
    this.error = null;
    this.successMessage = null;
    
    // 创建模态窗口元素
    this.createModal();
    
    // 绑定事件
    this.bindEvents();
    
    // 监听认证状态变化
    this.authListener = authService.onAuthStateChanged(user => {
      if (user) {
        console.log('用户已登录:', user);
        this.updateUI(true, user);
        if (this.isOpen) {
          this.close();
        }
      } else {
        console.log('用户未登录');
        this.updateUI(false);
      }
    });
  }
  
  // 创建模态窗口元素
  createModal() {
    // 创建模态窗口容器
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'auth-modal';
    this.modalElement.style.display = 'none';
    
    // 模态窗口内容
    this.modalElement.innerHTML = `
      <div class="auth-modal-backdrop"></div>
      <div class="auth-modal-container">
        <div class="auth-modal-content">
          <div class="auth-modal-header">
            <h2 class="auth-modal-title">登录</h2>
            <button class="auth-modal-close">&times;</button>
          </div>
          
          <div class="auth-modal-tabs">
            <button class="auth-tab active" data-tab="login">登录</button>
            <button class="auth-tab" data-tab="register">注册</button>
          </div>
          
          <div class="auth-modal-error" style="display: none;"></div>
          <div class="auth-modal-success" style="display: none;"></div>
          
          <!-- 登录表单 -->
          <form class="auth-form login-form">
            <div class="form-group">
              <label for="login-email">邮箱</label>
              <input type="email" id="login-email" required>
            </div>
            <div class="form-group">
              <label for="login-password">密码</label>
              <input type="password" id="login-password" required>
            </div>
            <button type="submit" class="btn btn-primary login-btn">登录</button>
            <div class="form-footer">
              <a href="#" class="forgot-password">忘记密码?</a>
            </div>
            <div class="social-login">
              <button type="button" class="btn btn-google">
                <img src="assets/google-icon.svg" alt="Google">
                使用Google登录
              </button>
            </div>
          </form>
          
          <!-- 注册表单 -->
          <form class="auth-form register-form" style="display: none;">
            <div class="form-group">
              <label for="register-email">邮箱</label>
              <input type="email" id="register-email" required>
            </div>
            <div class="form-group">
              <label for="register-password">密码</label>
              <input type="password" id="register-password" required minlength="6">
            </div>
            <div class="form-group">
              <label for="register-confirm-password">确认密码</label>
              <input type="password" id="register-confirm-password" required>
            </div>
            <div class="form-group">
              <label for="register-name">显示名称 (可选)</label>
              <input type="text" id="register-name">
            </div>
            <button type="submit" class="btn btn-primary register-btn">注册</button>
          </form>
          
          <!-- 重置密码表单 -->
          <form class="auth-form reset-form" style="display: none;">
            <div class="form-group">
              <label for="reset-email">邮箱</label>
              <input type="email" id="reset-email" required>
            </div>
            <button type="submit" class="btn btn-primary reset-btn">发送重置链接</button>
            <div class="form-footer">
              <a href="#" class="back-to-login">返回登录</a>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // 添加到body
    document.body.appendChild(this.modalElement);
    
    // 获取常用元素引用
    this.modalTitle = this.modalElement.querySelector('.auth-modal-title');
    this.errorElement = this.modalElement.querySelector('.auth-modal-error');
    this.successElement = this.modalElement.querySelector('.auth-modal-success');
    this.tabButtons = this.modalElement.querySelectorAll('.auth-tab');
    this.forms = {
      login: this.modalElement.querySelector('.login-form'),
      register: this.modalElement.querySelector('.register-form'),
      reset: this.modalElement.querySelector('.reset-form')
    };
  }
  
  // 绑定事件
  bindEvents() {
    // 关闭按钮
    const closeButton = this.modalElement.querySelector('.auth-modal-close');
    closeButton.addEventListener('click', () => this.close());
    
    // 点击背景关闭
    const backdrop = this.modalElement.querySelector('.auth-modal-backdrop');
    backdrop.addEventListener('click', () => this.close());
    
    // 标签切换
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        this.switchTab(tab);
      });
    });
    
    // 忘记密码链接
    const forgotPasswordLink = this.modalElement.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('reset');
    });
    
    // 返回登录链接
    const backToLoginLink = this.modalElement.querySelector('.back-to-login');
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('login');
    });
    
    // 登录表单提交
    const loginForm = this.forms.login;
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    
    // 注册表单提交
    const registerForm = this.forms.register;
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
    
    // 重置密码表单提交
    const resetForm = this.forms.reset;
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleResetPassword();
    });
    
    // Google登录按钮
    const googleButton = this.modalElement.querySelector('.btn-google');
    googleButton.addEventListener('click', () => {
      this.handleGoogleLogin();
    });
    
    // 键盘ESC关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  // 打开模态窗口
  open() {
    this.modalElement.style.display = 'block';
    document.body.classList.add('auth-modal-open');
    this.isOpen = true;
    
    // 重置表单
    this.resetForms();
    
    // 切换到登录标签
    this.switchTab('login');
  }
  
  // 关闭模态窗口
  close() {
    this.modalElement.style.display = 'none';
    document.body.classList.remove('auth-modal-open');
    this.isOpen = false;
  }
  
  // 重置所有表单
  resetForms() {
    // 清空表单
    this.forms.login.reset();
    this.forms.register.reset();
    this.forms.reset.reset();
    
    // 清空错误和成功消息
    this.setError(null);
    this.setSuccessMessage(null);
  }
  
  // 切换标签
  switchTab(tab) {
    // 更新活动标签
    this.activeTab = tab;
    
    // 更新标题
    if (tab === 'login') {
      this.modalTitle.textContent = '登录';
    } else if (tab === 'register') {
      this.modalTitle.textContent = '注册';
    } else if (tab === 'reset') {
      this.modalTitle.textContent = '重置密码';
    }
    
    // 更新标签样式
    this.tabButtons.forEach(button => {
      if (button.dataset.tab === tab) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // 显示当前表单，隐藏其他表单
    Object.keys(this.forms).forEach(formKey => {
      if (formKey === tab) {
        this.forms[formKey].style.display = 'block';
      } else {
        this.forms[formKey].style.display = 'none';
      }
    });
    
    // 清空错误和成功消息
    this.setError(null);
    this.setSuccessMessage(null);
  }
  
  // 设置错误消息
  setError(error) {
    this.error = error;
    
    if (error) {
      this.errorElement.textContent = error;
      this.errorElement.style.display = 'block';
    } else {
      this.errorElement.style.display = 'none';
    }
  }
  
  // 设置成功消息
  setSuccessMessage(message) {
    this.successMessage = message;
    
    if (message) {
      this.successElement.textContent = message;
      this.successElement.style.display = 'block';
    } else {
      this.successElement.style.display = 'none';
    }
  }
  
  // 设置加载状态
  setLoading(loading) {
    this.loading = loading;
    
    const loginButton = this.modalElement.querySelector('.login-btn');
    const registerButton = this.modalElement.querySelector('.register-btn');
    const resetButton = this.modalElement.querySelector('.reset-btn');
    const googleButton = this.modalElement.querySelector('.btn-google');
    
    if (loading) {
      loginButton.disabled = true;
      registerButton.disabled = true;
      resetButton.disabled = true;
      googleButton.disabled = true;
      
      // 根据当前活动标签更新按钮文本
      if (this.activeTab === 'login') {
        loginButton.textContent = '登录中...';
      } else if (this.activeTab === 'register') {
        registerButton.textContent = '注册中...';
      } else if (this.activeTab === 'reset') {
        resetButton.textContent = '发送中...';
      }
    } else {
      loginButton.disabled = false;
      registerButton.disabled = false;
      resetButton.disabled = false;
      googleButton.disabled = false;
      
      // 恢复按钮文本
      loginButton.textContent = '登录';
      registerButton.textContent = '注册';
      resetButton.textContent = '发送重置链接';
    }
  }
  
  // 处理登录表单提交
  async handleLogin() {
    this.setError(null);
    this.setLoading(true);
    
    const emailInput = this.modalElement.querySelector('#login-email');
    const passwordInput = this.modalElement.querySelector('#login-password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // 表单验证
    if (!email || !password) {
      this.setError('请填写所有必填字段');
      this.setLoading(false);
      return;
    }
    
    try {
      await authService.loginUser(email, password);
      this.setLoading(false);
      // 登录成功后，onAuthStateChanged会处理关闭模态窗口
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
    }
  }
  
  // 处理注册表单提交
  async handleRegister() {
    this.setError(null);
    this.setLoading(true);
    
    const emailInput = this.modalElement.querySelector('#register-email');
    const passwordInput = this.modalElement.querySelector('#register-password');
    const confirmPasswordInput = this.modalElement.querySelector('#register-confirm-password');
    const nameInput = this.modalElement.querySelector('#register-name');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const displayName = nameInput.value.trim();
    
    // 表单验证
    if (!email || !password || !confirmPassword) {
      this.setError('请填写所有必填字段');
      this.setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      this.setError('两次输入的密码不一致');
      this.setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      this.setError('密码长度至少为6个字符');
      this.setLoading(false);
      return;
    }
    
    try {
      await authService.registerUser(email, password, displayName);
      this.setLoading(false);
      // 注册成功后，onAuthStateChanged会处理关闭模态窗口
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
    }
  }
  
  // 处理重置密码表单提交
  async handleResetPassword() {
    this.setError(null);
    this.setSuccessMessage(null);
    this.setLoading(true);
    
    const emailInput = this.modalElement.querySelector('#reset-email');
    const email = emailInput.value.trim();
    
    // 表单验证
    if (!email) {
      this.setError('请输入邮箱地址');
      this.setLoading(false);
      return;
    }
    
    try {
      await authService.resetPassword(email);
      this.setSuccessMessage('密码重置链接已发送到您的邮箱');
      this.setLoading(false);
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
    }
  }
  
  // 处理Google登录
  async handleGoogleLogin() {
    this.setError(null);
    this.setLoading(true);
    
    try {
      await authService.loginWithGoogle();
      this.setLoading(false);
      // 登录成功后，onAuthStateChanged会处理关闭模态窗口
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
    }
  }
  
  // 更新UI
  updateUI(isLoggedIn, user = null) {
    const authButton = document.getElementById('login-button');
    const userProfile = document.querySelector('.user-profile');
    
    if (isLoggedIn && user) {
      // 隐藏登录按钮，显示用户资料
      if (authButton) authButton.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'flex';
        
        // 更新用户显示信息
        const userAvatar = userProfile.querySelector('.user-avatar');
        const userName = userProfile.querySelector('.user-name');
        
        if (userName) {
          userName.textContent = user.displayName || user.email.split('@')[0];
        }
        
        if (userAvatar) {
          if (user.photoURL) {
            userAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName || 'User'}">`;
          } else {
            userAvatar.textContent = (user.displayName || user.email)[0].toUpperCase();
          }
        }
        
        // 创建下拉菜单（如果不存在）
        this.createUserDropdown(userProfile, user);
      }
    } else {
      // 显示登录按钮，隐藏用户资料
      if (authButton) authButton.style.display = 'block';
      if (userProfile) userProfile.style.display = 'none';
      
      // 移除可能存在的下拉菜单
      const existingDropdown = document.querySelector('.user-dropdown');
      if (existingDropdown) {
        existingDropdown.remove();
      }
    }
  }
  
  // 创建用户下拉菜单
  createUserDropdown(userProfile, user) {
    // 检查是否已存在下拉菜单
    let dropdown = document.querySelector('.user-dropdown');
    
    if (!dropdown) {
      // 创建下拉菜单
      dropdown = document.createElement('div');
      dropdown.className = 'user-dropdown';
      dropdown.style.display = 'none';
      
      // 添加下拉菜单内容
      dropdown.innerHTML = `
        <div class="user-info">
          <p class="user-full-name">${user.displayName || user.email.split('@')[0]}</p>
          <p class="user-email">${user.email}</p>
        </div>
        <div class="dropdown-divider"></div>
        <a href="account.html" class="dropdown-item">
          <span class="item-icon">⚙️</span>
          <span class="item-text">账号设置</span>
        </a>
        <a href="subscription.html" class="dropdown-item">
          <span class="item-icon">💳</span>
          <span class="item-text">管理订阅</span>
        </a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item logout-btn">
          <span class="item-icon">🚪</span>
          <span class="item-text">退出登录</span>
        </button>
      `;
      
      // 添加到文档
      document.body.appendChild(dropdown);
      
      // 绑定退出登录事件
      const logoutBtn = dropdown.querySelector('.logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            await authService.logoutUser();
            console.log('用户已登出');
          } catch (error) {
            console.error('登出失败:', error);
          }
        });
      }
      
      // 绑定用户头像点击事件
      userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';
        
        // 切换下拉菜单显示状态
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        // 计算下拉菜单位置
        if (!isVisible) {
          const rect = userProfile.getBoundingClientRect();
          dropdown.style.top = rect.bottom + 'px';
          dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        }
      });
      
      // 点击其他区域关闭下拉菜单
      document.addEventListener('click', (e) => {
        if (dropdown.style.display === 'block' && !userProfile.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });
    }
  }
  
  // 销毁组件
  destroy() {
    // 移除认证状态监听器
    if (this.authListener) {
      this.authListener();
    }
    
    // 移除模态窗口元素
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
  }
} 