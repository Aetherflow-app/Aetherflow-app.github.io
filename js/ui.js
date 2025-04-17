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
            <p>从扩展同步登录状态...</p>
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
            <p>登录成功！</p>
            <p class="auth-toast-subtitle">账号已同步</p>
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
            <p>登录失败</p>
            <p class="auth-toast-subtitle">${message || '请重试'}</p>
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