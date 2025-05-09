// Paddle payment integration functions will go here. 

// 初始化Paddle支付系统
function initializePaddle() {
    // 1. 检查URL参数是否有明确的环境指定
    // const urlParams = new URLSearchParams(window.location.search);
    // const envParam = urlParams.get('env');
    
    // 2. 判断环境
    // 明确参数指定的环境 > 域名判断环境
    let useSandbox = false;
    const hostname = window.location.hostname;
    console.log('[Paddle Env Debug] 当前网页域名:', hostname); // For debugging

    // 如果URL参数明确指定了环境
    // if (envParam) {
    //     useSandbox = envParam === 'sandbox' || envParam === 'test';
    // } else {
        // 判断开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'dev.aetherflow-app.com') {
        useSandbox = true;
        console.log('[Paddle Env Debug] 检测到开发环境/本地环境，使用 Paddle SANDBOX.');
    } else if (hostname === 'aetherflow-app.com') {
        useSandbox = false;
        console.log('[Paddle Env Debug] 检测到生产环境，使用 Paddle PRODUCTION.');
    } else {
        // Fallback for any other unknown hostnames
        console.warn(`[Paddle Env Debug] 未识别的网页域名: '${hostname}'。为安全起见，默认使用 Paddle SANDBOX。`);
        useSandbox = true; // Default to sandbox for unrecognized hostnames
    }
    // }
    
    // 3. 设置环境和初始化Paddle
    if (useSandbox) {
        Paddle.Environment.set('sandbox');
        console.log('Using Paddle SANDBOX environment');
    } else {
        console.log('Using Paddle PRODUCTION environment');
    }
    
    // 初始化Paddle
    Paddle.Initialize({
        token: useSandbox ? 'test_c624a7a4c9993fc8965d9c37db6' : 'live_74080bad93a7d3b962f98a52c93',
        eventCallback: function(eventData) {
            console.log('Paddle event:', eventData);
            
            // 处理结账事件
            if (eventData.name === 'checkout.completed') {
                // 支付成功，处理跳转
                handleCheckoutCompleted(eventData.data);
            }
        }
    });
    
    // 4. 记录当前环境，用于调试和测试
    localStorage.setItem('aetherflow_env', useSandbox ? 'sandbox' : 'production');
    
    // 如果需要在UI上显示当前环境（仅在非生产环境）
    if (useSandbox) {
        const envIndicator = document.createElement('div');
        envIndicator.id = 'sandbox-indicator'; // 添加ID以便可以移除
        envIndicator.style.position = 'fixed';
        envIndicator.style.bottom = '10px';
        envIndicator.style.left = '10px';
        envIndicator.style.padding = '5px 10px';
        envIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        envIndicator.style.color = '#900';
        envIndicator.style.borderRadius = '4px';
        envIndicator.style.fontSize = '12px';
        envIndicator.style.zIndex = '9999';
        envIndicator.textContent = 'SANDBOX MODE';
        // 避免重复添加
        if (!document.getElementById('sandbox-indicator')) {
            document.body.appendChild(envIndicator);
        }
    }
}

// 打开结账窗口
function openCheckout(planType) {
    // 获取当前已验证的用户
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
        console.error('尝试支付时用户未登录或认证状态丢失');
        // 理论上 handleCheckoutButtonClick 已经处理了未登录情况，这里是最后防线
        showAuthModal(); // 再次提示登录
        return;
    }
    
    // 获取来源信息
    const source = getUtmSource();
    
    // 确定使用哪个价格ID
    const priceId = getPriceIdForPlan(planType);
    
    // 准备自定义数据，确保包含已验证的 userId
    const customData = {
        userId: currentUser.uid, // **关键：传递已验证的用户ID**
        plan: planType,
        source: source || 'website',
        referrer: document.referrer || 'direct'
    };
    
    // 获取URL参数并传递
    // const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('utm_campaign')) {
        customData.utm_campaign = urlParams.get('utm_campaign');
    }
    if (urlParams.has('utm_content')) {
        customData.utm_content = urlParams.get('utm_content');
    }
    
    console.log('Opening Paddle Checkout with data:', { priceId, customData });
    
    // 打开Paddle结账
    Paddle.Checkout.open({
        items: [
            {
                priceId: priceId,
                quantity: 1
            }
        ],
        customer: {
             email: currentUser.email || '' // 预填邮箱
        },
        customData: customData,
        settings: {
            displayMode: 'overlay',
            theme: 'light',
            locale: 'en',
            successUrl: getSuccessUrl(planType, source)
        }
    });
}

// 根据计划类型获取价格ID
function getPriceIdForPlan(planType) {
    // 获取当前环境
    const useSandbox = localStorage.getItem('aetherflow_env') === 'sandbox';
    
    // 根据环境和计划类型返回对应的价格ID
    if (useSandbox) {
        // 沙盒环境的价格ID
        return planType === 'annual' ? 'pri_01jrw0f7y1kfw9jc967eswbnrs' : 'pri_01jrw0em3kydrg4rw523w6s574';
    } else {
        // 生产环境的价格ID
        return planType === 'annual' ? 'pri_01jrfcz25f4zdktr7rtt1pnzpw' : 'pri_01jrfcwajex91zya4346h9ek32';
    }
}

// 获取UTM来源
function getUtmSource() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('utm_source') || localStorage.getItem('aetherflow_utm_source') || null;
}

// 构建成功URL
function getSuccessUrl(planType, source) {
    // 获取基础URL
    let baseUrl;
    
    // 检查环境
    // const useSandbox = localStorage.getItem('aetherflow_env') === 'sandbox';
    
    // 如果是localhost或GitHub Pages，使用相对路径
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname.includes('github.io')) {
        baseUrl = '/success.html';
    } else {
        // 使用完整URL
        baseUrl = window.location.origin + '/success.html';
    }
    
    // 构建URL参数
    const params = new URLSearchParams();
    params.set('plan', planType);
    if (source) {
        params.set('source', source);
    }
    
    // 添加环境参数（仅在沙盒环境）
    // if (useSandbox) {
    //     params.set('env', 'sandbox');
    // }
    
    return baseUrl + '?' + params.toString();
}

// 处理结账完成事件
function handleCheckoutCompleted(data) {
    console.log('Checkout completed:', data);
    
    // 从事件数据中获取信息
    const checkoutId = data.checkout?.id;
    // Paddle 返回的 productType 可能是 'standard' 或 'recurring'，这里用 planType 更合适
    const planType = data.custom_data?.plan || (data.items?.[0]?.price?.type === 'recurring' ? 'monthly' : 'annual');
    
    // 构建跳转URL
    let redirectUrl = 'success.html?checkout=' + encodeURIComponent(checkoutId) + '&plan=' + planType;
    
    // 添加环境参数（如果需要）
    // const useSandbox = localStorage.getItem('aetherflow_env') === 'sandbox';
    // if (useSandbox) {
    //     redirectUrl += '&env=sandbox';
    // }
    
    // 跳转到成功页面
    window.location.href = redirectUrl;
}

// 保存UTM来源到localStorage（如果存在）
function saveUtmParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('utm_source')) {
        localStorage.setItem('aetherflow_utm_source', urlParams.get('utm_source'));
    }
    if (urlParams.has('utm_campaign')) {
        localStorage.setItem('aetherflow_utm_campaign', urlParams.get('utm_campaign'));
    }
}

// 处理支付按钮点击
function handleCheckoutButtonClick(planType) {
    // 检查用户是否已登录 (依赖 auth.js)
    if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
        // 用户未登录，显示登录模态框 (依赖 auth.js)
        showAuthModal();
        // 存储计划类型，以便登录后继续
        localStorage.setItem('aetherflow_pending_plan', planType);
        return;
    }
    
    // 用户已登录，继续支付流程
    openCheckout(planType);
}

// 全局初始化调用（将在页面特定的JS中调用）
function initializePaddleRelatedFeatures() {
    initializePaddle();
    saveUtmParameters();
} 