// 认证UI组件
// 提供登录/注册表单、用户菜单等UI元素

// 创建登录/注册模态框
function createAuthModal() {
  // 检查是否已存在
  if (document.getElementById('auth-modal')) {
    return document.getElementById('auth-modal');
  }

  const modalHtml = `
    <div id="auth-modal" class="auth-modal">
      <div class="auth-modal-content">
        <span class="auth-close">&times;</span>
        
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">登录</button>
          <button class="auth-tab" data-tab="register">注册</button>
        </div>
        
        <div class="auth-tab-content active" id="login-tab">
          <h2>登录您的账户</h2>
          <div class="auth-error" id="login-error"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">邮箱</label>
              <input type="email" id="login-email" required>
            </div>
            <div class="form-group">
              <label for="login-password">密码</label>
              <input type="password" id="login-password" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">登录</button>
              <a href="#" id="forgot-password">忘记密码？</a>
            </div>
          </form>
          <div class="auth-separator">
            <span>或</span>
          </div>
          <button class="google-signin-btn" id="google-signin">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
            <span>使用Google账号登录</span>
          </button>
        </div>
        
        <div class="auth-tab-content" id="register-tab">
          <h2>创建新账户</h2>
          <div class="auth-error" id="register-error"></div>
          <form id="register-form">
            <div class="form-group">
              <label for="register-name">名称 (可选)</label>
              <input type="text" id="register-name">
            </div>
            <div class="form-group">
              <label for="register-email">邮箱</label>
              <input type="email" id="register-email" required>
            </div>
            <div class="form-group">
              <label for="register-password">密码</label>
              <input type="password" id="register-password" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">注册</button>
            </div>
          </form>
          <div class="auth-separator">
            <span>或</span>
          </div>
          <button class="google-signin-btn" id="google-signup">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
            <span>使用Google账号注册</span>
          </button>
        </div>
        
        <div class="auth-tab-content" id="forgot-tab">
          <h2>重置密码</h2>
          <p>请输入您的邮箱，我们将发送重置密码的链接。</p>
          <div class="auth-error" id="forgot-error"></div>
          <div class="auth-success" id="forgot-success"></div>
          <form id="forgot-form">
            <div class="form-group">
              <label for="forgot-email">邮箱</label>
              <input type="email" id="forgot-email" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">发送重置链接</button>
              <button type="button" class="btn btn-outline" id="back-to-login">返回登录</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // 添加到页面
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer.firstElementChild);
  
  const modal = document.getElementById('auth-modal');
  
  // 添加样式
  if (!document.getElementById('auth-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'auth-styles';
    styleSheet.textContent = `
      .auth-modal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.4);
        align-items: center;
        justify-content: center;
      }
      
      .auth-modal-content {
        background-color: #fff;
        max-width: 400px;
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        position: relative;
        padding: 20px;
        animation: authModalFadeIn 0.3s;
      }
      
      @keyframes authModalFadeIn {
        from {opacity: 0; transform: translateY(-20px);}
        to {opacity: 1; transform: translateY(0);}
      }
      
      .auth-close {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        color: #666;
      }
      
      .auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .auth-tab {
        background: none;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        outline: none;
      }
      
      .auth-tab.active {
        color: #4285f4;
        border-bottom: 2px solid #4285f4;
      }
      
      .auth-tab-content {
        display: none;
      }
      
      .auth-tab-content.active {
        display: block;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
      }
      
      .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
      }
      
      .auth-error {
        color: #d93025;
        font-size: 14px;
        margin-bottom: 15px;
        display: none;
      }
      
      .auth-success {
        color: #0f9d58;
        font-size: 14px;
        margin-bottom: 15px;
        display: none;
      }
      
      .auth-separator {
        text-align: center;
        margin: 20px 0;
        position: relative;
      }
      
      .auth-separator:before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background: #eee;
      }
      
      .auth-separator span {
        background: #fff;
        padding: 0 10px;
        position: relative;
        color: #666;
      }
      
      .google-signin-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        transition: background-color 0.2s;
      }
      
      .google-signin-btn:hover {
        background-color: #f5f5f5;
      }
      
      .google-signin-btn img {
        width: 18px;
        height: 18px;
        margin-right: 10px;
      }
      
      /* 用户菜单样式 */
      .user-menu {
        position: relative;
        display: inline-block;
      }
      
      .user-button {
        display: flex;
        align-items: center;
        padding: 5px 10px;
        border: none;
        background: none;
        cursor: pointer;
        color: #333;
        font-size: 14px;
        border-radius: 4px;
      }
      
      .user-button:hover {
        background-color: rgba(0,0,0,0.05);
      }
      
      .user-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 8px;
        background-color: #ddd;
        overflow: hidden;
      }
      
      .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: #fff;
        min-width: 180px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-radius: 4px;
        z-index: 100;
        display: none;
        overflow: hidden;
      }
      
      .user-dropdown.active {
        display: block;
      }
      
      .user-dropdown-item {
        padding: 10px 15px;
        color: #333;
        text-decoration: none;
        display: block;
        font-size: 14px;
        cursor: pointer;
      }
      
      .user-dropdown-item:hover {
        background-color: #f5f5f5;
      }
      
      .user-dropdown-item.logout {
        color: #d93025;
        border-top: 1px solid #eee;
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  return modal;
}

// 创建用户菜单
function createUserMenu(container, user) {
  // 如果已存在则移除
  const existingMenu = document.querySelector('.user-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  if (!user) return;
  
  // 创建用户菜单
  const menuHtml = `
    <div class="user-menu">
      <button class="user-button">
        <div class="user-avatar">
          ${user.photoURL ? `<img src="${user.photoURL}" alt="avatar">` : ''}
        </div>
        <span>${user.displayName || user.email?.split('@')[0] || '用户'}</span>
      </button>
      <div class="user-dropdown">
        <div class="user-dropdown-item user-email">${user.email}</div>
        <div class="user-dropdown-item account-settings">账户设置</div>
        <div class="user-dropdown-item subscription-management">订阅管理</div>
        <div class="user-dropdown-item logout">退出登录</div>
      </div>
    </div>
  `;
  
  // 添加到页面
  container.innerHTML = menuHtml;
  
  // 添加事件监听
  const userButton = container.querySelector('.user-button');
  const userDropdown = container.querySelector('.user-dropdown');
  
  userButton.addEventListener('click', () => {
    userDropdown.classList.toggle('active');
  });
  
  // 点击其他区域关闭下拉菜单
  document.addEventListener('click', (event) => {
    if (!userButton.contains(event.target) && !userDropdown.contains(event.target)) {
      userDropdown.classList.remove('active');
    }
  });
  
  // 退出登录
  const logoutButton = container.querySelector('.logout');
  logoutButton.addEventListener('click', () => {
    window.AetherFlowAuth.logoutUser().then(() => {
      window.location.reload();
    });
  });
}

// 显示登录对话框
function showLoginModal(successCallback) {
  const modal = createAuthModal();
  modal.style.display = 'flex';
  
  // 获取元素
  const tabs = modal.querySelectorAll('.auth-tab');
  const tabContents = modal.querySelectorAll('.auth-tab-content');
  const closeBtn = modal.querySelector('.auth-close');
  
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotForm = document.getElementById('forgot-form');
  
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const forgotError = document.getElementById('forgot-error');
  const forgotSuccess = document.getElementById('forgot-success');
  
  const googleSignin = document.getElementById('google-signin');
  const googleSignup = document.getElementById('google-signup');
  const forgotPassword = document.getElementById('forgot-password');
  const backToLogin = document.getElementById('back-to-login');
  
  // 切换标签
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 移除所有active类
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // 添加active类到点击的标签
      tab.classList.add('active');
      
      // 显示对应内容
      const tabName = tab.getAttribute('data-tab');
      const activeContent = document.getElementById(`${tabName}-tab`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
      
      // 清除错误消息
      loginError.style.display = 'none';
      registerError.style.display = 'none';
      forgotError.style.display = 'none';
      forgotSuccess.style.display = 'none';
    });
  });
  
  // 关闭模态框
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // 点击模态框外部关闭
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // 忘记密码链接
  forgotPassword.addEventListener('click', (event) => {
    event.preventDefault();
    tabContents.forEach(c => c.classList.remove('active'));
    document.getElementById('forgot-tab').classList.add('active');
    
    // 更新标签状态
    tabs.forEach(t => t.classList.remove('active'));
  });
  
  // 返回登录
  backToLogin.addEventListener('click', () => {
    tabContents.forEach(c => c.classList.remove('active'));
    document.getElementById('login-tab').classList.add('active');
    
    // 更新标签状态
    tabs.forEach(t => t.classList.remove('active'));
    tabs[0].classList.add('active');
  });
  
  // 登录表单提交
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    loginError.style.display = 'none';
    
    window.AetherFlowAuth.loginUser(email, password)
      .then(user => {
        modal.style.display = 'none';
        if (successCallback) successCallback(user);
      })
      .catch(error => {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
      });
  });
  
  // 注册表单提交
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    registerError.style.display = 'none';
    
    window.AetherFlowAuth.registerUser(email, password, name)
      .then(user => {
        modal.style.display = 'none';
        if (successCallback) successCallback(user);
      })
      .catch(error => {
        registerError.textContent = error.message;
        registerError.style.display = 'block';
      });
  });
  
  // 忘记密码表单提交
  forgotForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    forgotError.style.display = 'none';
    forgotSuccess.style.display = 'none';
    
    window.AetherFlowAuth.resetPassword(email)
      .then(() => {
        forgotSuccess.textContent = `重置链接已发送到 ${email}`;
        forgotSuccess.style.display = 'block';
      })
      .catch(error => {
        forgotError.textContent = error.message;
        forgotError.style.display = 'block';
      });
  });
  
  // Google登录
  googleSignin.addEventListener('click', () => {
    window.AetherFlowAuth.loginWithGoogle()
      .then(user => {
        modal.style.display = 'none';
        if (successCallback) successCallback(user);
      })
      .catch(error => {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
      });
  });
  
  // Google注册
  googleSignup.addEventListener('click', () => {
    window.AetherFlowAuth.loginWithGoogle()
      .then(user => {
        modal.style.display = 'none';
        if (successCallback) successCallback(user);
      })
      .catch(error => {
        registerError.textContent = error.message;
        registerError.style.display = 'block';
      });
  });
}

// 初始化认证UI
async function initAuthUI() {
  // 尝试处理扩展传递的令牌
  await window.AetherFlowAuth.handleExtensionAuthToken();
  
  // 获取当前用户
  const user = await window.AetherFlowAuth.getCurrentUser();
  
  // 创建登录和注册按钮容器
  const authButtonsContainer = document.querySelector('.auth-buttons-container');
  if (!authButtonsContainer) return;
  
  if (user) {
    // 已登录，显示用户菜单
    createUserMenu(authButtonsContainer, user);
  } else {
    // 未登录，显示登录和注册按钮
    authButtonsContainer.innerHTML = `
      <button class="login-button btn btn-outline">登录</button>
      <button class="register-button btn btn-primary">注册</button>
    `;
    
    // 添加事件监听
    const loginButton = authButtonsContainer.querySelector('.login-button');
    const registerButton = authButtonsContainer.querySelector('.register-button');
    
    loginButton.addEventListener('click', () => {
      showLoginModal();
    });
    
    registerButton.addEventListener('click', () => {
      const modal = createAuthModal();
      modal.style.display = 'flex';
      
      // 切换到注册标签
      modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
      
      modal.querySelector('[data-tab="register"]').classList.add('active');
      document.getElementById('register-tab').classList.add('active');
    });
  }
}

// 确保在支付前用户已登录
async function ensureAuthBeforePayment(callback) {
  const user = await window.AetherFlowAuth.getCurrentUser();
  
  if (user) {
    // 用户已登录，继续支付流程
    callback(user);
  } else {
    // 显示登录对话框，登录成功后继续支付
    showLoginModal(callback);
  }
}

// 导出API
window.AetherFlowAuthUI = {
  showLoginModal,
  initAuthUI,
  ensureAuthBeforePayment
}; 