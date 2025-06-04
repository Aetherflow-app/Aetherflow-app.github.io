document.addEventListener('DOMContentLoaded', function() {
    // 定义平台数据，按优先级排序
    const platforms = [
        { id: 'openai', name: 'OpenAI' },
        { id: 'claude', name: 'Claude', color: true },
        { id: 'gemini', name: 'Gemini', color: true },
        { id: 'copilot', name: 'Copilot', color: true },
        { id: 'ollama', name: 'Ollama' },
        { id: 'midjourney', name: 'Midjourney' },
        { id: 'stability', name: 'Stability', color: true },
        { id: 'zhipu', name: 'ZhiPu', color: true },
        { id: 'qwen', name: 'Qwen', color: true },
        { id: 'deepseek', name: 'DeepSeek', color: true },
        { id: 'kimi', name: 'Kimi', color: true },
        { id: 'doubao', name: 'Doubao', color: true },
        { id: 'coze', name: 'Coze' },
        { id: 'grok', name: 'Grok' }
    ];

    // 获取平台容器
    const platformContainer = document.querySelector('.platform-logos');
    if (!platformContainer) return;

    // 创建并添加平台图标
    platforms.forEach(platform => {
        // 创建平台容器
        const platformDiv = document.createElement('div');
        platformDiv.className = 'platform-logo';

        // 创建图标
        const iconImg = document.createElement('img');
        const iconPath = platform.color 
            ? `assets/platforms/${platform.id}-color.svg` 
            : `assets/platforms/${platform.id}.svg`;
        iconImg.src = iconPath;
        iconImg.alt = `${platform.name} Icon`;
        iconImg.loading = 'lazy';

        // 创建文本
        const textImg = document.createElement('img');
        textImg.className = 'logo-text';
        textImg.src = `assets/platforms/${platform.id}-text.svg`;
        textImg.alt = platform.name;
        textImg.loading = 'lazy';

        // 添加到容器
        platformDiv.appendChild(iconImg);
        platformDiv.appendChild(textImg);
        platformContainer.appendChild(platformDiv);
    });

    // 响应式调整 - 在小屏幕上只显示前几个平台
    function adjustPlatformsDisplay() {
        const platformLogos = document.querySelectorAll('.platform-logo');
        const screenWidth = window.innerWidth;
        
        if (screenWidth < 768) {
            // 小屏幕上只显示前6个平台
            platformLogos.forEach((logo, index) => {
                if (index >= 6) {
                    logo.style.display = 'none';
                } else {
                    logo.style.display = 'flex';
                }
            });
        } else if (screenWidth < 1024) {
            // 中等屏幕上显示前9个平台
            platformLogos.forEach((logo, index) => {
                if (index >= 9) {
                    logo.style.display = 'none';
                } else {
                    logo.style.display = 'flex';
                }
            });
        } else {
            // 大屏幕上显示所有平台
            platformLogos.forEach(logo => {
                logo.style.display = 'flex';
            });
        }
    }

    // 初始调整和窗口大小变化时调整
    adjustPlatformsDisplay();
    window.addEventListener('resize', adjustPlatformsDisplay);
}); 