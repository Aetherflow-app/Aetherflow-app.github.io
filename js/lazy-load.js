// 使用 Intersection Observer 实现视频懒加载
document.addEventListener('DOMContentLoaded', function() {
    // 创建 Intersection Observer
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当视频进入视口时
            if (entry.isIntersecting) {
                const video = entry.target;
                const source = video.querySelector('source');
                
                // 如果视频还没有加载
                if (source && source.dataset.src && !source.src) {
                    // 设置视频源
                    source.src = source.dataset.src;
                    // 加载视频
                    video.load();
                    // 开始播放
                    video.play().catch(function(error) {
                        console.log("Video autoplay failed:", error);
                    });
                    
                    // 停止观察这个视频
                    videoObserver.unobserve(video);
                }
            }
        });
    }, {
        // 设置视口交叉阈值
        threshold: 0.1,
        // 设置根边距，提前加载
        rootMargin: '50px'
    });

    // 观察所有带有lazy-video类的视频元素
    document.querySelectorAll('.lazy-video').forEach(video => {
        videoObserver.observe(video);
    });
}); 