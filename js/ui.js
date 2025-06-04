// UI helper functions (like Toasts) will go here. 

// 显示认证中提示
function showAuthLoadingToast() {
    const toast = document.createElement('div');
    toast.className = 'auth-toast loading';
    toast.innerHTML = `
        <div class="auth-toast-icon">
            <div class="spinner"></div>
        </div>
        <div class="auth-toast-content">
            <p>Syncing login status from extension...</p>
        </div>
    `;
    
    // 添加样式
    applyToastStyles(toast);
    toast.style.backgroundColor = '#f0f9ff';
    toast.style.borderColor = '#bae6fd';
    
    // 添加到页面并一定时间后自动移除
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 显示认证成功提示
function showAuthSuccessToast() {
    const toast = document.createElement('div');
    toast.className = 'auth-toast success';
    toast.innerHTML = `
        <div class="auth-toast-icon">✓</div>
        <div class="auth-toast-content">
            <p>Login Successful!</p>
            <p class="auth-toast-subtitle">Account synced</p>
        </div>
    `;
    
    // 添加样式
    applyToastStyles(toast);
    toast.style.backgroundColor = '#f0fdf4';
    toast.style.borderColor = '#86efac';
    
    // 添加到页面并一定时间后自动移除
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 显示认证错误提示
function showAuthErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'auth-toast error';
    toast.innerHTML = `
        <div class="auth-toast-icon">!</div>
        <div class="auth-toast-content">
            <p>Login Failed</p>
            <p class="auth-toast-subtitle">${message || 'Please try again'}</p>
        </div>
    `;
    
    // 添加样式
    applyToastStyles(toast);
    toast.style.backgroundColor = '#fef2f2';
    toast.style.borderColor = '#fecaca';
    
    // 添加到页面并一定时间后自动移除
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// 应用通用Toast样式
function applyToastStyles(toastElement) {
    // 基础样式
    toastElement.style.position = 'fixed';
    toastElement.style.bottom = '20px';
    toastElement.style.right = '20px';
    toastElement.style.display = 'flex';
    toastElement.style.alignItems = 'center';
    toastElement.style.padding = '12px 16px';
    toastElement.style.backgroundColor = '#ffffff';
    toastElement.style.border = '1px solid #e2e8f0';
    toastElement.style.borderRadius = '8px';
    toastElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    toastElement.style.zIndex = '9999';
    toastElement.style.maxWidth = '300px';
    toastElement.style.transition = 'all 0.5s ease-in-out';
    
    // 图标样式
    const icon = toastElement.querySelector('.auth-toast-icon');
    if (icon) {
        icon.style.marginRight = '12px';
        icon.style.fontSize = '18px';
        icon.style.height = '24px';
        icon.style.width = '24px';
        icon.style.borderRadius = '50%';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        
        // 如果有加载动画
        const spinner = icon.querySelector('.spinner');
        if (spinner) {
            spinner.style.border = '2px solid rgba(0, 0, 0, 0.1)';
            spinner.style.borderTopColor = '#3B82F6'; // 假设是蓝色
            spinner.style.borderRadius = '50%';
            spinner.style.width = '16px';
            spinner.style.height = '16px';
            spinner.style.animation = 'spin 1s linear infinite';
            
            // 确保动画只添加一次
            if (!document.getElementById('auth-toast-spin-style')) {
                const style = document.createElement('style');
                style.id = 'auth-toast-spin-style';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .auth-toast.hiding {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    // 内容样式
    const content = toastElement.querySelector('.auth-toast-content');
    if (content) {
        content.style.flex = '1';
        // 防止文字过长溢出
        content.style.overflow = 'hidden';
        content.style.textOverflow = 'ellipsis';
    }
    
    // 主文本样式
    const mainText = toastElement.querySelector('.auth-toast-content > p:first-child');
    if (mainText) {
        mainText.style.margin = '0';
        mainText.style.fontWeight = '500';
    }
    
    // 副标题样式
    const subtitle = toastElement.querySelector('.auth-toast-subtitle');
    if (subtitle) {
        subtitle.style.fontSize = '12px';
        subtitle.style.opacity = '0.7';
        subtitle.style.marginTop = '2px';
        subtitle.style.margin = '2px 0 0 0'; // 重置可能的默认边距
    }
} 

// 卡片悬停增强效果
function enhanceCardInteractions() {
    // 增强价值卡片交互效果
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // 增强定价卡片交互效果
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (this.classList.contains('premium')) {
                this.style.transform = 'scale(1.07) translateY(-5px)';
            } else {
                this.style.transform = 'translateY(-10px)';
            }
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('premium') ? 'scale(1.05)' : '';
            this.style.boxShadow = '';
        });
    });
}

// 平滑滚动导航
function enhanceSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 滚动时增强导航栏视觉效果
function enhanceNavbarOnScroll() {
    const header = document.querySelector('header');
    const logo = document.querySelector('.logo h1');
    const logoIcon = document.querySelector('.logo-icon');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            header.style.padding = '0.5rem 0';
            logo.style.fontSize = '1.5rem';
            if (logoIcon) logoIcon.style.width = '28px';
        } else {
            header.style.boxShadow = '';
            header.style.padding = '';
            logo.style.fontSize = '';
            if (logoIcon) logoIcon.style.width = '';
        }
    });
}

// 初始化所有UI增强功能
document.addEventListener('DOMContentLoaded', function() {
    enhanceCardInteractions();
    enhanceSmoothScrolling();
    enhanceNavbarOnScroll();
    
    // GIF加载优化
    const gifImages = document.querySelectorAll('.demo-gif-large img');
    gifImages.forEach(img => {
        img.addEventListener('load', function() {
            this.parentElement.classList.add('loaded');
        });
    });
}); 