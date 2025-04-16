// 公共头部认证组件
function initializeHeader() {
  // 初始化Firebase
  initializeFirebase();
  
  // 创建认证模态窗口
  const authModal = new AuthModal();
  
  // 登录按钮点击事件
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', function() {
      authModal.open();
    });
  }
  
  // 点击任何地方关闭下拉菜单
  document.addEventListener('click', function(e) {
    const userProfile = document.querySelector('.user-profile');
    if (userProfile && !userProfile.contains(e.target)) {
      const dropdown = userProfile.querySelector('.user-dropdown');
      if (dropdown && getComputedStyle(dropdown).display === 'block') {
        dropdown.style.display = 'none';
      }
    }
  });
  
  // 防止下拉菜单点击关闭父菜单
  document.addEventListener('click', function(e) {
    if (e.target.closest('.user-dropdown')) {
      e.stopPropagation();
    }
  });
}

// 页面加载时初始化头部
document.addEventListener('DOMContentLoaded', initializeHeader); 