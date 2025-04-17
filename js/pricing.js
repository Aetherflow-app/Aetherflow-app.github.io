// Pricing page specific JavaScript functions will go here. 

// 切换到月度价格视图
function showMonthly() {
    const monthlyTab = document.querySelectorAll('.pricing-tab')[0];
    const annualTab = document.querySelectorAll('.pricing-tab')[1];
    const monthlyPlan = document.querySelector('.monthly-plan');
    const annualPlan = document.querySelector('.annual-plan');

    if (monthlyTab && annualTab && monthlyPlan && annualPlan) {
        annualTab.classList.remove('active');
        monthlyTab.classList.add('active');
        monthlyPlan.style.display = 'block';
        annualPlan.style.display = 'none';
    }
}

// 切换到年度价格视图
function showAnnual() {
    const monthlyTab = document.querySelectorAll('.pricing-tab')[0];
    const annualTab = document.querySelectorAll('.pricing-tab')[1];
    const monthlyPlan = document.querySelector('.monthly-plan');
    const annualPlan = document.querySelector('.annual-plan');

    if (monthlyTab && annualTab && monthlyPlan && annualPlan) {
        monthlyTab.classList.remove('active');
        annualTab.classList.add('active');
        monthlyPlan.style.display = 'none';
        annualPlan.style.display = 'block';
    }
}

// 滚动到价格计划部分
function scrollToPlans() {
    const pricingDetailsSection = document.querySelector('.pricing-details');
    if (pricingDetailsSection) {
        pricingDetailsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 初始化FAQ切换功能
function initializeFaqToggles() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(item => {
        item.addEventListener('click', function() {
            const faqItem = this.parentNode;
            const answer = faqItem.querySelector('.faq-answer');
            const toggle = this.querySelector('.faq-toggle');
            
            if (!faqItem || !answer || !toggle) return;

            // 切换class
            const isOpen = faqItem.classList.toggle('open');
            
            // 更新切换图标和内容显示
            if (isOpen) {
                toggle.textContent = '-';
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                toggle.textContent = '+';
                answer.style.maxHeight = '0';
            }
        });
    });
}

// 初始化价格页面特定的事件监听器和功能
document.addEventListener('DOMContentLoaded', function() {
    // 确保其他必要的JS文件已加载并执行了初始化
    // 调用共享的初始化函数 (auth.js, paddle.js)
    if (typeof initializeAuth === 'function') {
        initializeAuth();
    } else {
        console.error('Auth initialization function not found.');
    }
    
    if (typeof initializePaddleRelatedFeatures === 'function') {
        initializePaddleRelatedFeatures();
    } else {
        console.error('Paddle initialization function not found.');
    }

    // 初始化FAQ
    initializeFaqToggles();

    // 绑定价格切换按钮事件 (使用事件委托可能更优，但暂时保持简单)
    const monthlyTabButton = document.querySelectorAll('.pricing-tab')[0];
    const annualTabButton = document.querySelectorAll('.pricing-tab')[1];
    if (monthlyTabButton) monthlyTabButton.addEventListener('click', showMonthly);
    if (annualTabButton) annualTabButton.addEventListener('click', showAnnual);
    
    // 绑定结账按钮点击事件
    const monthlyCheckoutButton = document.querySelector('.monthly-checkout');
    const annualCheckoutButton = document.querySelector('.annual-checkout');
    if (monthlyCheckoutButton) {
        monthlyCheckoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof handleCheckoutButtonClick === 'function') {
                handleCheckoutButtonClick('monthly');
            } else {
                 console.error('handleCheckoutButtonClick function not found.');
            }
        });
    }
    if (annualCheckoutButton) {
        annualCheckoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof handleCheckoutButtonClick === 'function') {
                handleCheckoutButtonClick('annual');
            } else {
                 console.error('handleCheckoutButtonClick function not found.');
            }
        });
    }

    // 绑定CTA按钮滚动事件
    const ctaScrollButton = document.querySelector('.cta .btn-large');
    if (ctaScrollButton) {
        // 检查onclick属性是否存在，如果存在则移除，用JS事件监听替代
        if (ctaScrollButton.getAttribute('onclick')) {
             ctaScrollButton.removeAttribute('onclick');
        }
        ctaScrollButton.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToPlans();
        });
    }
}); 