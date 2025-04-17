// Authentication related JavaScript functions will go here. 

// Firebase配置和初始化
function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyCulWQxvrzxDOLGOxzi2ngj9n0DwzvqJFw",
        authDomain: "aetherflow-b6459.firebaseapp.com",
        projectId: "aetherflow-b6459",
        storageBucket: "aetherflow-b6459.firebasestorage.app",
        messagingSenderId: "423266303314",
        appId: "1:423266303314:web:9cbf8adb847f043bd34e8b",
        measurementId: "G-ZD5E2WY22N"
    };
    
    // 初始化Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // 处理来自URL的ID令牌 (替换旧的 checkForAuthToken)
    handleIdTokenFromUrl(); 
    
    // 监听认证状态变化
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
}

// 处理认证状态变化
function handleAuthStateChanged(user) {
    const authButton = document.getElementById('auth-button');
    
    if (user) {
        // 用户已登录
        console.log('用户已登录:', user.email);
        // 尝试获取更友好的名称
        let displayName = user.displayName || user.email.split('@')[0];
        // 限制显示长度，避免过长
        if (displayName.length > 15) {
            displayName = displayName.substring(0, 12) + '...';
        }
        authButton.textContent = displayName;
        authButton.classList.add('auth-logged-in');
        
        // 保存用户状态到本地存储
        localStorage.setItem('aetherflow_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName, // 保存完整名称
            photoURL: user.photoURL
        }));
    } else {
        // 用户未登录
        console.log('用户未登录');
        authButton.textContent = 'Sign in';
        authButton.classList.remove('auth-logged-in');
        
        // 清除本地存储中的用户信息
        localStorage.removeItem('aetherflow_user');
    }
}

// 设置认证UI
function setupAuthUI() {
    const authButton = document.getElementById('auth-button');
    
    if (!authButton) return; // 如果页面没有认证按钮，则跳过
    
    authButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (firebase.auth().currentUser) {
            // 如果用户已登录，显示用户菜单
            showUserMenu(this);
        } else {
            // 如果用户未登录，显示登录模态框
            showAuthModal();
        }
    });
}

// 显示用户菜单
function showUserMenu(buttonElement) {
    // 检查是否已有菜单
    let menu = document.getElementById('user-menu');
    
    if (menu) {
        // 如果菜单已存在，切换显示/隐藏
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        positionUserMenu(buttonElement, menu); // 重新定位以防窗口大小变化
        return;
    }
    
    // 创建用户菜单
    menu = document.createElement('div');
    menu.id = 'user-menu';
    menu.className = 'user-menu'; // 可以添加CSS类来控制样式
    
    // 添加菜单项
    menu.innerHTML = `
        <div class="user-menu-item" id="sign-out">Sign out</div>
    `;
    
    // 基础样式 (可以移到CSS)
    menu.style.position = 'absolute';
    menu.style.backgroundColor = '#fff';
    menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    menu.style.borderRadius = '4px';
    menu.style.padding = '8px 0';
    menu.style.zIndex = '1001'; // 比模态框高一点
    menu.style.minWidth = '150px';
    menu.style.display = 'block'; // 创建时显示
    
    // 菜单项样式 (可以移到CSS)
    const menuItems = menu.querySelectorAll('.user-menu-item');
    menuItems.forEach(item => {
        item.style.padding = '10px 15px';
        item.style.cursor = 'pointer';
        item.style.transition = 'background-color 0.2s ease';
        item.style.color = '#333';
        item.style.fontSize = '14px';
        
        // 添加悬停效果
        item.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f9fafb';
        });
        item.addEventListener('mouseout', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // 添加登出点击事件
    menu.querySelector('#sign-out').addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            // 状态变化将由 onAuthStateChanged 处理，这里只需隐藏菜单
            if (menu) menu.style.display = 'none';
        }).catch(error => {
            console.error('登出失败:', error);
        });
    });
    
    // 添加到DOM
    document.body.appendChild(menu);
    
    // 定位菜单
    positionUserMenu(buttonElement, menu);
    
    // 点击文档其他地方关闭菜单
    document.addEventListener('click', function closeMenuOnClickOutside(e) {
        // 确保点击的不是按钮本身或菜单内部
        if (menu && menu.style.display !== 'none' && e.target !== buttonElement && !menu.contains(e.target)) {
            menu.style.display = 'none';
            // 移除监听器以避免内存泄漏
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    }, { once: false }); // 监听器只在菜单打开时有效
}

// 定位用户菜单
function positionUserMenu(buttonElement, menuElement) {
    const rect = buttonElement.getBoundingClientRect();
    // 考虑页面滚动
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    // 简单定位：按钮下方靠右
    menuElement.style.top = (rect.bottom + scrollY + 5) + 'px'; // 加一点间距
    menuElement.style.right = (document.documentElement.clientWidth - rect.right - scrollX) + 'px';
    menuElement.style.left = 'auto'; // 确保right生效
}


// 显示认证模态框
function showAuthModal() {
    // 检查是否已有模态框
    let modal = document.getElementById('auth-modal');
    
    if (modal) {
        modal.style.display = 'flex';
        return;
    }
    
    // 创建模态框 (样式与pricing页面一致)
    modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal';
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // 创建模态框内容 (样式与pricing页面一致)
    const modalContent = document.createElement('div');
    modalContent.className = 'auth-modal-content';
    modalContent.style.width = '100%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px'; // 假设已在CSS中定义 --border-radius-lg
    modalContent.style.padding = '24px';
    modalContent.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; // 假设已在CSS中定义 --box-shadow-lg
    modalContent.style.position = 'relative';
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '15px';
    closeButton.style.right = '15px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#aaa'; // 假设已在CSS中定义 --gray
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // 创建标签页按钮 (样式与pricing页面一致)
    const tabButtons = document.createElement('div');
    tabButtons.className = 'auth-tabs';
    tabButtons.style.display = 'flex';
    tabButtons.style.marginBottom = '20px';
    tabButtons.style.borderBottom = '1px solid #eee';
    
    const loginTab = document.createElement('button');
    loginTab.textContent = 'Sign in';
    loginTab.className = 'auth-tab active';
    loginTab.dataset.tab = 'login';
    loginTab.style.flex = '1';
    loginTab.style.padding = '10px';
    loginTab.style.background = 'none';
    loginTab.style.border = 'none';
    loginTab.style.borderBottom = '2px solid #4F46E5'; // 假设已在CSS中定义 --primary
    loginTab.style.color = '#4F46E5'; // 假设已在CSS中定义 --primary
    loginTab.style.fontWeight = '600';
    loginTab.style.cursor = 'pointer';
    
    const registerTab = document.createElement('button');
    registerTab.textContent = 'Sign up';
    registerTab.className = 'auth-tab';
    registerTab.dataset.tab = 'register';
    registerTab.style.flex = '1';
    registerTab.style.padding = '10px';
    registerTab.style.background = 'none';
    registerTab.style.border = 'none';
    registerTab.style.borderBottom = '2px solid transparent';
    registerTab.style.color = '#6b7280'; // 假设已在CSS中定义 --gray
    registerTab.style.fontWeight = '600';
    registerTab.style.cursor = 'pointer';
    
    // 添加标签页按钮事件
    loginTab.addEventListener('click', function() {
        switchAuthTab(this, registerTab);
    });
    
    registerTab.addEventListener('click', function() {
        switchAuthTab(this, loginTab);
    });
    
    tabButtons.appendChild(loginTab);
    tabButtons.appendChild(registerTab);
    
    // 创建登录表单 (样式与pricing页面一致)
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.style.display = 'block';
    
    loginForm.innerHTML = `
        <div style="margin-bottom: 16px;">
            <label for="login-email" style="display: block; margin-bottom: 8px; font-weight: 500;">Email</label>
            <input type="email" id="login-email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; outline: none;">
        </div>
        <div style="margin-bottom: 16px;">
            <label for="login-password" style="display: block; margin-bottom: 8px; font-weight: 500;">Password</label>
            <input type="password" id="login-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; outline: none;">
        </div>
        <div style="margin-bottom: 16px;">
            <a href="#" id="forgot-password" style="font-size: 14px; color: #4F46E5; text-decoration: none;">Forgot password?</a>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Sign in</button>
        <div style="margin-top: 20px; text-align: center;">
            <p style="margin-bottom: 12px; color: #6b7280;">Or sign in with</p>
            <button type="button" id="google-signin" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width: 18px; margin-right: 8px; vertical-align: middle;">
                Google
            </button>
        </div>
    `;
    
    // 创建注册表单 (样式与pricing页面一致)
    const registerForm = document.createElement('form');
    registerForm.id = 'register-form';
    registerForm.style.display = 'none';
    
    registerForm.innerHTML = `
        <div style="margin-bottom: 16px;">
            <label for="register-email" style="display: block; margin-bottom: 8px; font-weight: 500;">Email</label>
            <input type="email" id="register-email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; outline: none;">
        </div>
        <div style="margin-bottom: 16px;">
            <label for="register-password" style="display: block; margin-bottom: 8px; font-weight: 500;">Password</label>
            <input type="password" id="register-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; outline: none;">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Sign up</button>
        <div style="margin-top: 20px; text-align: center;">
            <p style="margin-bottom: 12px; color: #6b7280;">Or sign up with</p>
            <button type="button" id="google-signup" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width: 18px; margin-right: 8px; vertical-align: middle;">
                Google
            </button>
        </div>
    `;
    
    // 添加表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                modal.style.display = 'none';
            })
            .catch((error) => {
                alert(`Login failed: ${error.message}`);
            });
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                modal.style.display = 'none';
            })
            .catch((error) => {
                alert(`Registration failed: ${error.message}`);
            });
    });
    
    // 组装模态框
    modalContent.appendChild(closeButton);
    modalContent.appendChild(tabButtons);
    modalContent.appendChild(loginForm);
    modalContent.appendChild(registerForm);
    modal.appendChild(modalContent);
    
    // 添加到DOM
    document.body.appendChild(modal);
    
    // 设置Google登录按钮事件
    modal.querySelector('#google-signin').addEventListener('click', signInWithGoogle);
    modal.querySelector('#google-signup').addEventListener('click', signInWithGoogle);
    
    // 设置忘记密码
    modal.querySelector('#forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        if (!email) {
            alert('Please enter your email address to reset password.');
            return;
        }
        
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert(`Password reset email sent to ${email}`);
            })
            .catch((error) => {
                alert(`Error sending password reset email: ${error.message}`);
            });
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 切换认证模态框标签页
function switchAuthTab(activeTab, inactiveTab) {
    inactiveTab.style.borderBottom = '2px solid transparent';
    inactiveTab.style.color = '#6b7280'; // 假设已在CSS中定义 --gray
    activeTab.style.borderBottom = '2px solid #4F46E5'; // 假设已在CSS中定义 --primary
    activeTab.style.color = '#4F46E5'; // 假设已在CSS中定义 --primary
    
    const activeFormId = activeTab.dataset.tab + '-form';
    const inactiveFormId = inactiveTab.dataset.tab + '-form';
    
    document.getElementById(activeFormId).style.display = 'block';
    document.getElementById(inactiveFormId).style.display = 'none';
}


// Google登录
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // 关闭模态框
            const modal = document.getElementById('auth-modal');
            if(modal) modal.style.display = 'none';
        })
        .catch((error) => {
            alert(`Google sign in failed: ${error.message}`);
        });
}

// 检查URL中的ID令牌并尝试使用后端进行认证
function handleIdTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get('idToken');
    
    if (idToken) {
        // 显示加载状态提示 (依赖 ui.js)
        if (typeof showAuthLoadingToast === 'function') {
            showAuthLoadingToast("正在从扩展同步登录...");
        } else {
            console.log("正在同步登录...");
        }

        // 定义后端端点URL (已更新为实际URL)
        const customTokenEndpoint = 'https://create-custom-token-423266303314.us-west4.run.app/api/create-custom-token'; 
        
        // 调用后端函数获取 Custom Token
        fetch(customTokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: idToken })
        })
        .then(response => {
            if (!response.ok) {
                // 如果HTTP状态码不是2xx，抛出错误，包含状态文本
                return response.text().then(text => { 
                    throw new Error(`后端错误 ${response.status}: ${text || response.statusText}`); 
                });
            }
            return response.json(); // 解析JSON响应体
        })
        .then(data => {
            if (data && data.customToken) {
                // 使用获取到的 Custom Token 登录 Firebase
                firebase.auth().signInWithCustomToken(data.customToken)
                    .then(() => {
                        // 登录成功
                         if (typeof showAuthSuccessToast === 'function') {
                            showAuthSuccessToast();
                         } else {
                            console.log("登录成功!");
                         }
                        
                        // 清除URL中的idToken参数，保留其他参数
                        const newParams = new URLSearchParams(window.location.search);
                        newParams.delete('idToken');
                        const newUrl = newParams.toString() 
                          ? `${window.location.pathname}?${newParams.toString()}`
                          : window.location.pathname;
                        window.history.replaceState({}, document.title, newUrl);
                    })
                    .catch((error) => {
                        // Custom Token 登录失败
                        console.error('Firebase Custom Token 登录失败:', error);
                         if (typeof showAuthErrorToast === 'function') {
                            showAuthErrorToast(`登录失败: ${error.code}`);
                         } else {
                            alert(`登录失败: ${error.message}`);
                         }
                    });
            } else {
                // 后端返回的数据格式不正确
                throw new Error('从后端接收到的令牌格式不正确');
            }
        })
        .catch((error) => {
            // 网络错误或后端处理错误
            console.error('调用后端获取 Custom Token 失败:', error);
             if (typeof showAuthErrorToast === 'function') {
                showAuthErrorToast(`同步登录失败: ${error.message}`);
             } else {
                alert(`同步登录失败: ${error.message}`);
             }
            // 可选：也清除URL中的idToken，避免重复尝试
             const newParams = new URLSearchParams(window.location.search);
             newParams.delete('idToken');
             const newUrl = newParams.toString() 
               ? `${window.location.pathname}?${newParams.toString()}`
               : window.location.pathname;
             window.history.replaceState({}, document.title, newUrl);
        });
    }
}

// 全局初始化调用（将在页面特定的JS中调用）
function initializeAuth() {
    initFirebase();
    setupAuthUI();
} 