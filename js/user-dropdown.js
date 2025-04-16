// 用户下拉菜单组件
class UserDropdown {
  constructor() {
    // 创建DOM元素
    this.createElements();
    
    // 绑定事件处理程序
    this.bindEvents();
    
    // 初始化状态
    this.isOpen = false;
    
    // 监听认证状态
    this.updateUserState(null);
    authService.onAuthStateChanged(user => {
      this.updateUserState(user);
    });
  }
  
  // 创建下拉菜单和确认对话框元素
  createElements() {
    // 创建用户资料容器
    this.profileElement = document.createElement('div');
    this.profileElement.className = 'user-profile';
    this.profileElement.style.display = 'none';
    
    // 用户资料内容
    this.profileElement.innerHTML = `
      <div class="user-avatar">U</div>
      <span class="user-name">User</span>
      <span class="dropdown-arrow">▼</span>
      <div class="user-dropdown">
        <div class="dropdown-header">
          <div class="user-info">
            <span class="full-name">User Name</span>
            <span class="email">user@example.com</span>
          </div>
        </div>
        <ul class="dropdown-menu">
          <div class="dropdown-divider"></div>
          <li>
            <a href="#" class="logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              退出登录
            </a>
          </li>
        </ul>
      </div>
    `;
    
    // 创建确认对话框
    this.confirmDialog = document.createElement('div');
    this.confirmDialog.className = 'confirm-dialog';
    this.confirmDialog.innerHTML = `
      <div class="confirm-dialog-content">
        <h3 class="confirm-dialog-title">确认退出</h3>
        <p class="confirm-dialog-message">确定要退出登录吗？</p>
        <div class="confirm-dialog-actions">
          <button class="confirm-dialog-button confirm-dialog-cancel">取消</button>
          <button class="confirm-dialog-button confirm-dialog-confirm">确认退出</button>
        </div>
      </div>
    `;
    
    // 获取关键元素引用
    this.avatarElement = this.profileElement.querySelector('.user-avatar');
    this.nameElement = this.profileElement.querySelector('.user-name');
    this.fullNameElement = this.profileElement.querySelector('.full-name');
    this.emailElement = this.profileElement.querySelector('.email');
    this.logoutButton = this.profileElement.querySelector('.logout');
    this.confirmButton = this.confirmDialog.querySelector('.confirm-dialog-confirm');
    this.cancelButton = this.confirmDialog.querySelector('.confirm-dialog-cancel');
    
    // 添加到DOM
    document.body.appendChild(this.confirmDialog);
  }
  
  // 绑定事件处理程序
  bindEvents() {
    // 点击用户头像切换下拉菜单
    this.profileElement.addEventListener('click', (e) => {
      // 防止点击下拉菜单内部元素时关闭菜单
      if (e.target.closest('.user-dropdown') && !e.target.closest('.logout')) {
        return;
      }
      
      this.toggleDropdown();
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (this.isOpen && !e.target.closest('.user-profile')) {
        this.closeDropdown();
      }
    });
    
    // 点击登出按钮
    this.logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showLogoutConfirm();
    });
    
    // 确认登出
    this.confirmButton.addEventListener('click', () => {
      this.logout();
      this.hideLogoutConfirm();
    });
    
    // 取消登出
    this.cancelButton.addEventListener('click', () => {
      this.hideLogoutConfirm();
    });
    
    // 按ESC键关闭确认对话框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.confirmDialog.classList.contains('active')) {
        this.hideLogoutConfirm();
      }
    });
  }
  
  // 切换下拉菜单显示状态
  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }
  
  // 打开下拉菜单
  openDropdown() {
    this.profileElement.classList.add('active');
    this.isOpen = true;
  }
  
  // 关闭下拉菜单
  closeDropdown() {
    this.profileElement.classList.remove('active');
    this.isOpen = false;
  }
  
  // 显示登出确认对话框
  showLogoutConfirm() {
    this.confirmDialog.classList.add('active');
    this.closeDropdown();
  }
  
  // 隐藏登出确认对话框
  hideLogoutConfirm() {
    this.confirmDialog.classList.remove('active');
  }
  
  // 执行登出操作
  async logout() {
    try {
      await authService.logoutUser();
      // 登出后处理，如重定向或显示提示
      console.log('用户已成功登出');
    } catch (error) {
      console.error('登出失败:', error);
      alert('登出失败，请重试');
    }
  }
  
  // 更新用户状态和界面
  updateUserState(user) {
    const loginButton = document.getElementById('login-button');
    const headerActions = document.querySelector('.header-actions');
    
    if (user) {
      // 用户已登录
      console.log('用户已登录:', user);
      
      // 更新头像
      if (user.photoURL) {
        this.avatarElement.textContent = '';
        this.avatarElement.style.backgroundImage = `url(${user.photoURL})`;
      } else {
        const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        this.avatarElement.textContent = initial;
        this.avatarElement.style.backgroundImage = '';
      }
      
      // 更新名称
      this.nameElement.textContent = user.displayName || '用户';
      this.fullNameElement.textContent = user.displayName || '用户';
      this.emailElement.textContent = user.email || '';
      
      // 显示用户资料，隐藏登录按钮
      this.profileElement.style.display = 'flex';
      if (loginButton) loginButton.style.display = 'none';
      
      // 如果用户资料不在DOM中，添加到DOM
      if (!this.profileElement.parentNode) {
        headerActions.appendChild(this.profileElement);
      }
    } else {
      // 用户未登录
      console.log('用户未登录');
      
      // 隐藏用户资料，显示登录按钮
      this.profileElement.style.display = 'none';
      if (loginButton) loginButton.style.display = 'block';
      
      // 关闭下拉菜单
      this.closeDropdown();
    }
  }
}

// 当文档加载完成时创建用户下拉菜单
document.addEventListener('DOMContentLoaded', () => {
  window.userDropdown = new UserDropdown();
}); 