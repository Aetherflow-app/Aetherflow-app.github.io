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
            slider.innerHTML = data.testimonials.map(testimonial => `
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p>"${testimonial.content}"</p>
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
            console.log('Testimonials rendered successfully');
        } else {
            throw new Error('No testimonials found in data');
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        // 显示默认的硬编码内容
        showFallbackTestimonials(slider);
    }
}

// 备用评论内容
function showFallbackTestimonials(slider) {
    console.log('Showing fallback testimonials');
    const fallbackTestimonials = [
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
            content: "The one-click save feature is a game changer. I never lose great prompts I find online anymore.",
            author: { name: "David Chen", title: "Product Manager", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=d8b4fe&clothingColor=059669" }
        },
        {
            content: "As a writer, Aetherflow helps me maintain consistency in my AI-assisted creative process. Highly recommended!",
            author: { name: "Emma Rodriguez", title: "Freelance Writer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=fed7aa&clothingColor=7c2d12" }
        },
        {
            content: "The Pro optimization feature has dramatically improved my prompt quality. Worth every penny!",
            author: { name: "Alex Thompson", title: "AI Researcher", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=bbf7d0&clothingColor=4338ca" }
        }
    ];

    slider.innerHTML = fallbackTestimonials.map(testimonial => `
        <div class="testimonial">
            <div class="testimonial-content">
                <p>"${testimonial.content}"</p>
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