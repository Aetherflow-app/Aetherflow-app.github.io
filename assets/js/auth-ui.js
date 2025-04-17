// auth-ui.js - AetherFlow官网认证UI组件
// 处理登录模态框和用户状态显示

// 初始化UI
document.addEventListener('DOMContentLoaded', () => {
  // 等待authService初始化
  initializeAuthUI();
});

// 初始化认证UI
function initializeAuthUI() {
  // 检查authService是否可用
  if (window.authService) {
    startUI();
  } else {
    // 如果authService不可用，等待100ms后重试
    console.log('等待认证服务初始化...');
    setTimeout(initializeAuthUI, 100);
  }
}

// 启动UI
function startUI() {
  console.log('认证UI开始初始化');
  
  // 注册用户登录状态变化监听器
  window.authService.onAuthStateChanged(updateUIForUser);
  
  // 创建认证UI结构
  createAuthUIElements();
  
  // 绑定事件处理
  bindAuthUIEvents();
  
  console.log('认证UI初始化完成');
}

// 创建认证UI元素 (模态框和用户菜单)
function createAuthUIElements() {
  // 添加登录按钮到导航栏
  addAuthButton();
  
  // 创建登录模态框
  createAuthModal();
  
  // 创建用户下拉菜单
  createUserDropdown();
}

// 添加认证按钮到导航栏
function addAuthButton() {
  const nav = document.querySelector('header nav ul');
  if (!nav) return;
  
  // 创建认证按钮容器
  const authItem = document.createElement('li');
  authItem.className = 'auth-nav-item';
  
  // 创建登录按钮 (未登录状态显示)
  const signInButton = document.createElement('a');
  signInButton.href = '#';
  signInButton.className = 'sign-in-button';
  signInButton.textContent = 'Sign in';
  signInButton.onclick = (e) => {
    e.preventDefault();
    openAuthModal();
  };
  
  // 创建用户信息按钮 (登录状态显示)
  const userButton = document.createElement('a');
  userButton.href = '#';
  userButton.className = 'user-button';
  userButton.style.display = 'none';
  userButton.innerHTML = '<span class="user-name">User</span> <span class="user-icon">▾</span>';
  userButton.onclick = (e) => {
    e.preventDefault();
    toggleUserDropdown();
  };
  
  // 添加到导航条
  authItem.appendChild(signInButton);
  authItem.appendChild(userButton);
  nav.appendChild(authItem);
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .auth-nav-item {
      margin-left: 15px;
    }
    .sign-in-button, .user-button {
      border: 1px solid #0B2447;
      padding: 6px 15px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    .sign-in-button:hover, .user-button:hover {
      background-color: #0B2447;
      color: white;
    }
    .user-button {
      display: flex;
      align-items: center;
    }
    .user-icon {
      margin-left: 5px;
      font-size: 10px;
    }
    .user-dropdown {
      position: absolute;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: none;
      z-index: 1000;
      min-width: 150px;
      right: 20px;
    }
    .user-dropdown.active {
      display: block;
    }
    .user-dropdown ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .user-dropdown ul li {
      padding: 0;
      margin: 0;
    }
    .user-dropdown ul li a {
      padding: 10px 15px;
      display: block;
      color: #333;
      text-decoration: none;
      transition: background 0.3s ease;
    }
    .user-dropdown ul li a:hover {
      background: #f5f5f5;
    }
    .auth-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      z-index: 1001;
      justify-content: center;
      align-items: center;
    }
    .auth-modal {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .auth-modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .auth-modal-header h3 {
      margin: 0;
      color: #333;
    }
    .auth-modal-close {
      background: none;
      border: none;
      font-size: 22px;
      cursor: pointer;
      color: #999;
    }
    .auth-modal-body {
      padding: 20px;
    }
    @media (max-width: 768px) {
      .auth-nav-item {
        margin-left: 0;
      }
      .auth-modal {
        width: 90%;
      }
    }
  `;
  document.head.appendChild(style);
}

// 创建认证模态框
function createAuthModal() {
  // 创建模态背景
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'auth-modal-backdrop';
  modalBackdrop.id = 'auth-modal-backdrop';
  
  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  
  // 创建模态框头部
  const modalHeader = document.createElement('div');
  modalHeader.className = 'auth-modal-header';
  
  const modalTitle = document.createElement('h3');
  modalTitle.textContent = 'Sign in';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'auth-modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = closeAuthModal;
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  // 创建模态框内容
  const modalBody = document.createElement('div');
  modalBody.className = 'auth-modal-body';
  
  // 创建FirebaseUI容器
  const firebaseUI = document.createElement('div');
  firebaseUI.id = 'firebaseui-auth-container';
  
  modalBody.appendChild(firebaseUI);
  
  // 组装模态框
  modal.appendChild(modalHeader);
  modal.appendChild(modalBody);
  modalBackdrop.appendChild(modal);
  
  // 添加到文档
  document.body.appendChild(modalBackdrop);
  
  // 点击背景关闭模态框
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeAuthModal();
    }
  });
}

// 创建用户下拉菜单
function createUserDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'user-dropdown';
  dropdown.id = 'user-dropdown';
  
  const ul = document.createElement('ul');
  
  // 账户信息
  const profileItem = document.createElement('li');
  const profileLink = document.createElement('a');
  profileLink.href = '#';
  profileLink.textContent = 'Account';
  profileLink.onclick = (e) => {
    e.preventDefault();
    // 账户操作 (未实现)
    console.log('Account management not implemented');
  };
  profileItem.appendChild(profileLink);
  
  // 登出
  const logoutItem = document.createElement('li');
  const logoutLink = document.createElement('a');
  logoutLink.href = '#';
  logoutLink.textContent = 'Sign out';
  logoutLink.onclick = (e) => {
    e.preventDefault();
    logoutUser();
  };
  logoutItem.appendChild(logoutLink);
  
  // 组装下拉菜单
  ul.appendChild(profileItem);
  ul.appendChild(logoutItem);
  dropdown.appendChild(ul);
  
  // 添加到文档
  document.body.appendChild(dropdown);
  
  // 点击页面其他地方关闭下拉菜单
  document.addEventListener('click', (e) => {
    const userButton = document.querySelector('.user-button');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userButton && dropdown && !userButton.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

// 绑定认证UI事件
function bindAuthUIEvents() {
  // 监听认证成功事件
  window.addEventListener('authSignInSuccess', (e) => {
    closeAuthModal();
    updateUIForUser(e.detail.user);
  });
}

// 根据用户状态更新UI
function updateUIForUser(user) {
  const signInButton = document.querySelector('.sign-in-button');
  const userButton = document.querySelector('.user-button');
  const userNameEl = document.querySelector('.user-name');
  
  if (!signInButton || !userButton) return;
  
  if (user) {
    // 用户已登录
    signInButton.style.display = 'none';
    userButton.style.display = 'flex';
    
    // 更新用户名显示
    if (userNameEl) {
      userNameEl.textContent = getUserDisplayName(user);
    }
    
    // 处理支付按钮，确保支付关联到用户账户
    updatePaymentButtons(user);
  } else {
    // 用户未登录
    signInButton.style.display = 'block';
    userButton.style.display = 'none';
  }
}

// 获取用户显示名
function getUserDisplayName(user) {
  if (user.displayName) {
    return user.displayName;
  } else if (user.email) {
    // 只显示邮箱名称部分，不显示域名
    return user.email.split('@')[0];
  } else {
    return 'User';
  }
}

// 更新支付按钮，确保支付关联到用户账户
function updatePaymentButtons(user) {
  // 找到所有支付按钮
  const checkoutButtons = document.querySelectorAll('.monthly-checkout, .annual-checkout');
  
  checkoutButtons.forEach(button => {
    // 移除旧的点击事件
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // 添加新的点击事件，确保用户已登录
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // 获取计划类型
      const planType = newButton.getAttribute('data-plan');
      
      // 如果已登录，直接处理支付
      if (window.authService && window.authService.isAuthenticated()) {
        // 调用原有的openCheckout函数，但传入用户ID
        if (typeof openCheckout === 'function') {
          // 确保自定义数据中包含用户ID
          openCheckoutWithUser(planType, user);
        } else {
          console.error('openCheckout函数未找到');
        }
      } else {
        // 未登录时，打开登录模态框
        openAuthModal(() => {
          // 登录成功后再次尝试打开支付
          if (typeof openCheckout === 'function') {
            const currentUser = window.authService.getCurrentUser();
            openCheckoutWithUser(planType, currentUser);
          }
        });
      }
    });
  });
}

// 添加用户信息到结账流程
function openCheckoutWithUser(planType, user) {
  // 检查原始openCheckout函数是否存在
  if (typeof openCheckout !== 'function') {
    console.error('原始openCheckout函数未找到');
    return;
  }
  
  // 保存用户ID到localStorage，用于支付成功页面关联用户
  if (user && user.uid) {
    localStorage.setItem('aetherflow_checkout_user', user.uid);
    localStorage.setItem('aetherflow_checkout_email', user.email || '');
    
    // 调用原始支付函数
    openCheckout(planType);
  } else {
    // 回退到原始支付函数
    openCheckout(planType);
  }
}

// 打开认证模态框
function openAuthModal(successCallback) {
  const modalBackdrop = document.getElementById('auth-modal-backdrop');
  
  if (modalBackdrop) {
    // 显示模态框
    modalBackdrop.style.display = 'flex';
    
    // 初始化FirebaseUI
    if (window.authService) {
      // 如果有成功回调，注册一次性事件监听器
      if (successCallback) {
        const onceListener = (e) => {
          successCallback(e.detail.user);
          window.removeEventListener('authSignInSuccess', onceListener);
        };
        window.addEventListener('authSignInSuccess', onceListener);
      }
      
      // 显示登录UI
      window.authService.showLoginUI('firebaseui-auth-container');
    }
  }
}

// 关闭认证模态框
function closeAuthModal() {
  const modalBackdrop = document.getElementById('auth-modal-backdrop');
  
  if (modalBackdrop) {
    modalBackdrop.style.display = 'none';
  }
}

// 切换用户下拉菜单
function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  
  if (dropdown) {
    dropdown.classList.toggle('active');
    
    // 调整下拉菜单位置
    if (dropdown.classList.contains('active')) {
      const userButton = document.querySelector('.user-button');
      
      if (userButton) {
        const rect = userButton.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.right = `${window.innerWidth - rect.right}px`;
      }
    }
  }
}

// 退出登录
function logoutUser() {
  if (window.authService) {
    window.authService.logout()
      .then(() => {
        // 关闭用户下拉菜单
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
          dropdown.classList.remove('active');
        }
        
        // 更新UI
        updateUIForUser(null);
      })
      .catch(error => {
        console.error('登出失败:', error);
      });
  }
} 