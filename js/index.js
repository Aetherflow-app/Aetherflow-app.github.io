// Index page specific JavaScript functions will go here. 

// 处理视频占位符点击事件，播放视频
function playDemo() {
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        // 替换视频容器内容为YouTube嵌入式播放器
        // 使用rel=0减少相关视频推荐
        videoContainer.innerHTML = '<div class="embed-responsive"><iframe width="100%" height="450" src="https://www.youtube.com/embed/vSwZ517-0Wg?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    }
}

// 初始化首页特定的事件监听器和功能
document.addEventListener('DOMContentLoaded', function() {
    // 调用共享的认证初始化函数 (auth.js)
    if (typeof initializeAuth === 'function') {
        initializeAuth();
    } else {
        console.error('Auth initialization function not found.');
    }
    
    // 绑定视频播放按钮事件
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (videoPlaceholder) {
        // 移除可能存在的内联 onclick
        if (videoPlaceholder.getAttribute('onclick')) {
             videoPlaceholder.removeAttribute('onclick');
        }
        videoPlaceholder.addEventListener('click', playDemo);
    }
}); 