// 创建认证模态框组件
class AuthModal {
  constructor() {
    this.isOpen = false;
    this.activeTab = 'login'; // 'login', 'register', 'reset'
    this.error = null;
    this.successMessage = null;
    this.loading = false;
    
    // 初始化模态框DOM
    this.initModalDOM();
    
    // 当认证状态变化时自动关闭模态框
    AuthService.addObserver(user => {
      if (user && this.isOpen) {
        this.close();
      }
    });
  }
  
  // 初始化模态框DOM
  initModalDOM() {
    // 创建模态框容器
    this.modalContainer = document.createElement('div');
    this.modalContainer.className = 'auth-modal-container';
    this.modalContainer.style.display = 'none';
    
    // 添加到body
    document.body.appendChild(this.modalContainer);
    
    // 渲染模态框内容
    this.render();
  }
  
  // 打开模态框
  open(tab = 'login') {
    this.isOpen = true;
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
    this.render();
    this.modalContainer.style.display = 'block';
    
    // 绑定ESC键关闭
    document.addEventListener('keydown', this.handleEscKey);
  }
  
  // 关闭模态框
  close() {
    this.isOpen = false;
    this.modalContainer.style.display = 'none';
    
    // 解绑ESC键
    document.removeEventListener('keydown', this.handleEscKey);
  }
  
  // 处理ESC键
  handleEscKey = (event) => {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }
  
  // 切换标签
  switchTab(tab) {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
    this.render();
  }
  
  // 处理登录
  async handleLogin(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // 表单验证
    if (!email || !password) {
      this.error = '请填写所有必填字段';
      this.render();
      return;
    }
    
    // 执行登录
    try {
      this.loading = true;
      this.render();
      
      await AuthService.loginWithEmail(email, password);
      this.close();
    } catch (error) {
      this.error = error.message || '登录失败，请检查您的凭据';
      console.error('Login error:', error);
    } finally {
      this.loading = false;
      this.render();
    }
  }
  
  // 处理Google登录
  async handleGoogleLogin() {
    try {
      this.loading = true;
      this.render();
      
      await AuthService.loginWithGoogle();
      this.close();
    } catch (error) {
      this.error = error.message || 'Google登录失败，请重试';
      console.error('Google login error:', error);
    } finally {
      this.loading = false;
      this.render();
    }
  }
  
  // 处理注册
  async handleRegister(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const confirmPasswordInput = document.getElementById('auth-confirm-password');
    const displayNameInput = document.getElementById('auth-display-name');
    
    if (!emailInput || !passwordInput || !confirmPasswordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const displayName = displayNameInput ? displayNameInput.value.trim() : '';
    
    // 表单验证
    if (!email || !password || !confirmPassword) {
      this.error = '请填写所有必填字段';
      this.render();
      return;
    }
    
    if (password !== confirmPassword) {
      this.error = '密码不匹配';
      this.render();
      return;
    }
    
    if (password.length < 6) {
      this.error = '密码长度必须至少为6个字符';
      this.render();
      return;
    }
    
    // 执行注册
    try {
      this.loading = true;
      this.render();
      
      await AuthService.register(email, password, displayName);
      this.close();
    } catch (error) {
      this.error = error.message || '注册失败，请重试';
      console.error('Registration error:', error);
    } finally {
      this.loading = false;
      this.render();
    }
  }
  
  // 处理密码重置
  async handleResetPassword(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('auth-email');
    
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    
    // 表单验证
    if (!email) {
      this.error = '请输入您的电子邮件地址';
      this.render();
      return;
    }
    
    // 执行密码重置
    try {
      this.loading = true;
      this.render();
      
      await AuthService.resetPassword(email);
      this.successMessage = '密码重置链接已发送到您的电子邮件';
    } catch (error) {
      this.error = error.message || '密码重置失败，请重试';
      console.error('Password reset error:', error);
    } finally {
      this.loading = false;
      this.render();
    }
  }
  
  // 渲染模态框
  render() {
    // 模态框HTML
    let html = `
      <div class="auth-modal-backdrop"></div>
      <div class="auth-modal">
        <div class="auth-modal-header">
          <h3>${this.activeTab === 'login' ? '登录' : this.activeTab === 'register' ? '注册' : '重置密码'}</h3>
          <button class="auth-close-button">&times;</button>
        </div>
        
        ${this.activeTab !== 'reset' ? `
        <div class="auth-tabs">
          <button class="auth-tab ${this.activeTab === 'login' ? 'active' : ''}" data-tab="login">登录</button>
          <button class="auth-tab ${this.activeTab === 'register' ? 'active' : ''}" data-tab="register">注册</button>
        </div>
        ` : ''}
        
        ${this.error ? `<div class="auth-error">${this.error}</div>` : ''}
        ${this.successMessage ? `<div class="auth-success">${this.successMessage}</div>` : ''}
        
        <div class="auth-modal-content">
          ${this.getTabContent()}
        </div>
      </div>
    `;
    
    this.modalContainer.innerHTML = html;
    
    // 绑定事件
    this.bindEvents();
  }
  
  // 获取标签内容
  getTabContent() {
    switch (this.activeTab) {
      case 'login':
        return `
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="auth-email">邮箱</label>
              <input type="email" id="auth-email" placeholder="your@email.com" required ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label for="auth-password">密码</label>
              <input type="password" id="auth-password" placeholder="密码" required ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <button type="submit" class="auth-button primary" ${this.loading ? 'disabled' : ''}>
                ${this.loading ? '登录中...' : '登录'}
              </button>
            </div>
            <div class="form-group text-center">
              <button type="button" class="auth-text-button" data-action="reset-password">忘记密码?</button>
            </div>
            <div class="auth-separator">
              <span>或</span>
            </div>
            <div class="form-group">
              <button type="button" class="auth-button google" ${this.loading ? 'disabled' : ''}>
                使用Google账号登录
              </button>
            </div>
          </form>
        `;
        
      case 'register':
        return `
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="auth-display-name">名称 (可选)</label>
              <input type="text" id="auth-display-name" placeholder="您的名字" ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label for="auth-email">邮箱</label>
              <input type="email" id="auth-email" placeholder="your@email.com" required ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label for="auth-password">密码</label>
              <input type="password" id="auth-password" placeholder="密码 (至少6个字符)" required ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label for="auth-confirm-password">确认密码</label>
              <input type="password" id="auth-confirm-password" placeholder="再次输入密码" required ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <button type="submit" class="auth-button primary" ${this.loading ? 'disabled' : ''}>
                ${this.loading ? '注册中...' : '注册'}
              </button>
            </div>
          </form>
        `;
        
      case 'reset':
        return `
          <form id="reset-form" class="auth-form">
            <div class="form-group">
              <label for="auth-email">邮箱</label>
              <input type="email" id="auth-email" placeholder="your@email.com" required ${this.loading ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <button type="submit" class="auth-button primary" ${this.loading ? 'disabled' : ''}>
                ${this.loading ? '发送中...' : '发送重置链接'}
              </button>
            </div>
            <div class="form-group text-center">
              <button type="button" class="auth-text-button" data-action="back-to-login">返回登录</button>
            </div>
          </form>
        `;
        
      default:
        return '';
    }
  }
  
  // 绑定事件
  bindEvents() {
    // 关闭按钮
    const closeButton = this.modalContainer.querySelector('.auth-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }
    
    // 点击背景关闭
    const backdrop = this.modalContainer.querySelector('.auth-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }
    
    // 标签切换
    const tabs = this.modalContainer.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });
    
    // 登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', e => this.handleLogin(e));
    }
    
    // 注册表单
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', e => this.handleRegister(e));
    }
    
    // 重置密码表单
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
      resetForm.addEventListener('submit', e => this.handleResetPassword(e));
    }
    
    // Google登录按钮
    const googleButton = this.modalContainer.querySelector('.auth-button.google');
    if (googleButton) {
      googleButton.addEventListener('click', () => this.handleGoogleLogin());
    }
    
    // 忘记密码按钮
    const resetPasswordButton = this.modalContainer.querySelector('[data-action="reset-password"]');
    if (resetPasswordButton) {
      resetPasswordButton.addEventListener('click', () => this.switchTab('reset'));
    }
    
    // 返回登录按钮
    const backToLoginButton = this.modalContainer.querySelector('[data-action="back-to-login"]');
    if (backToLoginButton) {
      backToLoginButton.addEventListener('click', () => this.switchTab('login'));
    }
  }
}

// 创建全局认证模态框实例
window.authModal = new AuthModal(); 