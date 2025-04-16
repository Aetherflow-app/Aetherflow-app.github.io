// 用户头像和菜单组件
class UserAvatar {
  constructor(element, options = {}) {
    this.container = element;
    this.options = Object.assign({
      menuOffset: 8,
      formatEmail: true
    }, options);
    
    this.user = null;
    this.isMenuOpen = false;
    
    // 初始化DOM
    this.initDOM();
    
    // 订阅认证状态变化
    this.unsubscribe = AuthService.addObserver(user => {
      this.user = user;
      this.updateUI();
    });
    
    // 绑定点击外部关闭菜单
    document.addEventListener('click', this.handleOutsideClick);
  }
  
  // 初始化DOM
  initDOM() {
    this.container.innerHTML = `
      <div class="user-avatar-container">
        <div class="loading-placeholder"></div>
      </div>
    `;
    
    this.updateUI();
  }
  
  // 更新UI
  updateUI() {
    // 用户已登录
    if (this.user) {
      this.renderLoggedInState();
    } 
    // 用户未登录
    else {
      this.renderLoggedOutState();
    }
  }
  
  // 渲染已登录状态
  renderLoggedInState() {
    const userInitial = this.user.displayName?.[0] || this.user.email?.[0] || '?';
    const isPremium = this.user.providerData?.[0]?.providerId === 'google.com'; // 假设Google登录用户为高级用户
    
    this.container.innerHTML = `
      <div class="user-avatar-container">
        <div class="user-avatar" title="账户菜单">
          ${this.user.photoURL 
            ? `<img src="${this.user.photoURL}" alt="${this.user.displayName || 'User'}" />`
            : `<div class="user-initial">${userInitial.toUpperCase()}</div>`
          }
          ${isPremium ? `<div class="premium-badge">PRO</div>` : ''}
        </div>
        <div class="user-menu" style="display: none;">
          <div class="user-menu-header">
            <p class="user-email" title="${this.user.email || ''}">${this.formatEmail(this.user.email)}</p>
          </div>
          <div class="user-menu-items">
            <a href="#" class="user-menu-item logout-button">
              <span>退出登录</span>
            </a>
          </div>
        </div>
      </div>
    `;
    
    // 绑定事件
    const avatarElement = this.container.querySelector('.user-avatar');
    if (avatarElement) {
      avatarElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }
    
    const logoutButton = this.container.querySelector('.logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }
  
  // 渲染未登录状态
  renderLoggedOutState() {
    this.container.innerHTML = `
      <button class="login-button">登录</button>
    `;
    
    // 绑定登录按钮点击事件
    const loginButton = this.container.querySelector('.login-button');
    if (loginButton) {
      loginButton.addEventListener('click', () => {
        if (window.authModal) {
          window.authModal.open('login');
        }
      });
    }
  }
  
  // 处理登出
  async handleLogout() {
    try {
      this.closeMenu();
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  
  // 切换菜单显示/隐藏
  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  // 打开菜单
  openMenu() {
    const menu = this.container.querySelector('.user-menu');
    if (menu) {
      menu.style.display = 'block';
      this.isMenuOpen = true;
    }
  }
  
  // 关闭菜单
  closeMenu() {
    const menu = this.container.querySelector('.user-menu');
    if (menu) {
      menu.style.display = 'none';
      this.isMenuOpen = false;
    }
  }
  
  // 处理点击外部
  handleOutsideClick = (event) => {
    if (this.isMenuOpen && !this.container.contains(event.target)) {
      this.closeMenu();
    }
  };
  
  // 格式化邮箱地址（如果过长则截断）
  formatEmail(email) {
    if (!email || !this.options.formatEmail) return email || '';
    
    if (email.length > 20) {
      const [username, domain] = email.split('@');
      if (username && domain) {
        const truncatedUsername = username.length > 10 
          ? `${username.substring(0, 8)}...` 
          : username;
        return `${truncatedUsername}@${domain}`;
      }
    }
    return email;
  }
  
  // 销毁组件，清理事件监听
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    document.removeEventListener('click', this.handleOutsideClick);
  }
}

// 页面加载后初始化头部用户头像
document.addEventListener('DOMContentLoaded', () => {
  // 查找头部容器
  const headerUserContainer = document.querySelector('.header-user-container');
  
  // 如果找到容器，初始化用户头像组件
  if (headerUserContainer) {
    window.userAvatar = new UserAvatar(headerUserContainer);
  }
}); 