// Index page specific JavaScript functions

// 处理头像加载错误 - 设为全局函数
window.handleAvatarError = function(img) {
    // 创建一个简单的头像字母
    const name = img.alt;
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
    
    // 创建一个canvas来生成备用头像
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 48, 48);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#3b82f6');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 48, 48);
    
    // 添加文字
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 24, 24);
    
    // 替换失败的图片
    img.src = canvas.toDataURL();
}

// 动态加载用户评论
async function loadTestimonials() {
    console.log('Loading testimonials...');
    const slider = document.getElementById('testimonial-slider');
    
    if (!slider) {
        console.error('Testimonial slider element not found');
        return;
    }

    try {
        console.log('Fetching testimonials from:', 'data/testimonials.json');
        const response = await fetch('data/testimonials.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Testimonials data loaded:', data);
        
        if (data.testimonials && data.testimonials.length > 0) {
            renderTestimonials(data.testimonials, slider);
        } else {
            throw new Error('No testimonials found in data');
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        // 显示默认的硬编码内容
        showFallbackTestimonials(slider);
    }
}

// 渲染评论和轮播控制
function renderTestimonials(testimonials, container) {
    // 渲染评论
    container.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial">
            <div class="testimonial-content">
                <p>${testimonial.content}</p>
            </div>
            <div class="testimonial-author">
                <img src="${testimonial.author.avatar}" 
                     alt="${testimonial.author.name}" 
                     class="author-avatar" 
                     loading="lazy"
                     onerror="handleAvatarError(this)">
                <div class="author-info">
                    <div class="author-name">${testimonial.author.name}</div>
                    <div class="author-title">${testimonial.author.title}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    // 确保容器有 loaded 类，避免加载动画一直显示
    setTimeout(() => {
        const gifContainers = document.querySelectorAll('.demo-gif-large');
        gifContainers.forEach(container => {
            container.classList.add('loaded');
        });
    }, 1000);
    
    // 添加一个小延迟，确保DOM已更新
    setTimeout(() => {
        updateCarouselDots(testimonials.length);
        setupCarouselControls();
    }, 200);
    
    // 添加触摸支持
    setupTouchNavigation(container);
    
    // 启动自动播放
    startAutoPlay();
    
    console.log('Testimonials rendered successfully with', testimonials.length, 'items');
}

// 更新轮播导航点
function updateCarouselDots(totalTestimonials) {
    const container = document.getElementById('testimonial-slider');
    if (!container) return;
    
    const dotsContainer = document.querySelector('.carousel-dots');
    if (!dotsContainer) return;
    
    // 清空现有导航点
    dotsContainer.innerHTML = '';
    
    // 为每个评论创建一个导航点
    for (let i = 0; i < totalTestimonials; i++) {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
            scrollToTestimonial(i);
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    }
    
    console.log(`Created ${totalTestimonials} navigation dots`);
}

// 设置轮播控制
function setupCarouselControls() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!prevBtn || !nextBtn) return;
    
    // 移除可能的重复事件监听器
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    
    // 获取新的按钮引用
    const newPrevBtn = document.querySelector('.prev-btn');
    const newNextBtn = document.querySelector('.next-btn');
    
    // 添加事件监听器
    newPrevBtn.addEventListener('click', () => {
        navigateTestimonial('prev');
        resetAutoPlay();
    });
    
    newNextBtn.addEventListener('click', () => {
        navigateTestimonial('next');
        resetAutoPlay();
    });
    
    console.log('Carousel controls setup complete');
}

// 导航到上一个或下一个评论
function navigateTestimonial(direction) {
    const container = document.getElementById('testimonial-slider');
    const testimonials = container.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.carousel-dot');
    const totalSlides = testimonials.length;
    
    if (totalSlides === 0) return;
    
    // 获取当前活动的导航点索引
    let currentIndex = 0;
    dots.forEach((dot, index) => {
        if (dot.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    let targetIndex;
    if (direction === 'next') {
        targetIndex = (currentIndex + 1) % totalSlides;
    } else {
        targetIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    }
    
    scrollToTestimonial(targetIndex);
}

// 滚动到特定评论
function scrollToTestimonial(index) {
    const container = document.getElementById('testimonial-slider');
    const testimonials = container.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (testimonials.length === 0 || index >= testimonials.length) {
        console.error('Invalid testimonial index or no testimonials found');
        return;
    }
    
    // 更新活动状态
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // 计算目标滚动位置 - 使用getBoundingClientRect获取更精确的位置
    const targetTestimonial = testimonials[index];
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetTestimonial.getBoundingClientRect();
    const scrollOffset = targetRect.left - containerRect.left + container.scrollLeft;
    
    // 平滑滚动到目标位置
    container.scrollTo({
        left: scrollOffset,
        behavior: 'smooth'
    });
    
    console.log(`Scrolling to testimonial ${index} at position ${scrollOffset}px`);
}

// 设置触摸导航
function setupTouchNavigation(container) {
    let startX;
    let scrollLeft;
    let isDragging = false;
    
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        isDragging = true;
        
        // 暂停自动播放
        pauseAutoPlay();
    });
    
    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });
    
    container.addEventListener('touchend', () => {
        isDragging = false;
        
        // 对齐到最近的评论
        const currentIndex = getCurrentTestimonialIndex();
        scrollToTestimonial(currentIndex);
        
        // 恢复自动播放
        resetAutoPlay();
    });
}

// 自动播放相关变量和函数
let autoPlayInterval;
const AUTO_PLAY_INTERVAL = 5000; // 5秒切换一次

function startAutoPlay() {
    if (autoPlayInterval) return;
    
    autoPlayInterval = setInterval(() => {
        navigateTestimonial('next');
    }, AUTO_PLAY_INTERVAL);
}

function pauseAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

function resetAutoPlay() {
    pauseAutoPlay();
    startAutoPlay();
}

// 当页面不可见时暂停自动播放
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pauseAutoPlay();
    } else {
        startAutoPlay();
    }
});

// 备用评论内容
function showFallbackTestimonials(slider) {
    console.log('Showing fallback testimonials');
    const fallbackTestimonials = [
        {
            content: "The one-click save feature is a game changer. I never lose great prompts I find online anymore.",
            author: { name: "David Chen", title: "Product Manager", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=d8b4fe&clothingColor=059669" }
        },
        {
            content: "As a writer, Aetherflow helps me maintain consistency in my AI-assisted creative process. Highly recommended!",
            author: { name: "Emma Rodriguez", title: "Freelance Writer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=fed7aa&clothingColor=7c2d12" }
        },
        {
            content: "The Pro optimization feature has dramatically improved my prompt quality. Worth every penny!",
            author: { name: "Alex Thompson", title: "AI Researcher", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=bae6fd&clothingColor=dc2626" }
        },
        {
            content: "Aetherflow has made my interactions with AI platforms much more efficient. My prompts work better and I save hours every week.",
            author: { name: "Sarah J.", title: "Content Creator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4&clothingColor=65a30d" }
        },
        {
            content: "The prompt optimization feature is incredibly useful! I can get better AI responses with less effort.",
            author: { name: "Michael T.", title: "Software Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=c7d2fe&clothingColor=1e40af" }
        },
        {
            content: "Cross-device sync has completely transformed my workflow - I can access my prompt library anywhere, anytime.",
            author: { name: "Jessica L.", title: "Digital Marketer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=fde68a&clothingColor=dc2626" }
        },
        {
            content: "The organization features are brilliant. Finding the right prompt when I need it is now super easy.",
            author: { name: "Thomas K.", title: "Project Manager", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas&backgroundColor=a7f3d0&clothingColor=4338ca" }
        }
    ];

    renderTestimonials(fallbackTestimonials, slider);
}

// 增强GIF悬停效果
function enhanceGifInteraction() {
    const gifs = document.querySelectorAll('.demo-gif-large img');
    gifs.forEach(gif => {
        gif.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        gif.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// 视频自动播放优化
function optimizeVideoPlayback() {
    const iframe = document.querySelector('#hero-video-container iframe');
    if (iframe) {
        // 检查是否支持自动播放
        iframe.addEventListener('load', function() {
            console.log('Hero video loaded successfully');
        });
        
        iframe.addEventListener('error', function() {
            console.error('Hero video failed to load');
        });
    }
}

// 滚动到功能演示区域的平滑滚动
function smoothScrollToFeatures() {
    const featuresLink = document.querySelector('a[href="#demo-features"]');
    if (featuresLink) {
        featuresLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('demo-features');
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Feature navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Feature navigation
    const featureNavItems = document.querySelectorAll('.feature-nav-item');
    if (featureNavItems.length > 0) {
        featureNavItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                featureNavItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Scroll to the target section
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Offset for header height
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Highlight current section based on scroll position
    window.addEventListener('scroll', function() {
        if (featureNavItems.length > 0) {
            const currentPosition = window.scrollY + 200; // Offset to trigger earlier
            
            // Get all demo items
            const demoSections = document.querySelectorAll('.demo-item[id]');
            
            demoSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (currentPosition >= sectionTop && currentPosition <= sectionBottom) {
                    const id = section.getAttribute('id');
                    
                    // Remove active class from all nav items
                    featureNavItems.forEach(item => item.classList.remove('active'));
                    
                    // Add active class to corresponding nav item
                    const activeNavItem = document.querySelector(`.feature-nav-item[href="#${id}"]`);
                    if (activeNavItem) {
                        activeNavItem.classList.add('active');
                    }
                }
            });
        }
    });

    // Load testimonials
    loadTestimonials();
});

// 初始化首页特定的事件监听器和功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // 调用共享的认证初始化函数 (auth.js)
    if (typeof initializeAuth === 'function') {
        initializeAuth();
    } else {
        console.error('Auth initialization function not found.');
    }
    
    // 加载评论数据
    loadTestimonials();
    
    // 增强GIF交互效果
    enhanceGifInteraction();
    
    // 优化视频播放
    optimizeVideoPlayback();
    
    // 设置平滑滚动
    smoothScrollToFeatures();
    
    console.log('Index page initialized successfully');
}); 