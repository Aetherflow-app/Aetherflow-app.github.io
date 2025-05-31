// 邀请页面专用逻辑
console.log('[Invite] 邀请页面脚本已加载');

// 全局变量
let inviteCode = null;
let inviterUserId = null;
let isValidInvite = false;

/**
 * 初始化邀请页面
 */
function initInvitePage() {
    console.log('[Invite] 初始化邀请页面');
    
    // 解析URL参数
    parseInviteParams();
    
    // 验证邀请码
    if (inviteCode) {
        validateInviteCode(inviteCode);
    } else {
        showInvalidInviteState();
    }
    
    // 设置按钮事件
    setupInviteButtons();
    
    // 监听认证状态变化
    firebase.auth().onAuthStateChanged(handleInviteAuthStateChanged);
}

/**
 * 解析URL中的邀请参数
 */
function parseInviteParams() {
    const urlParams = new URLSearchParams(window.location.search);
    inviteCode = urlParams.get('ref');
    
    console.log('[Invite] 解析到的邀请码:', inviteCode);
    
    if (!inviteCode) {
        console.log('[Invite] 未找到邀请码参数，显示普通注册页面');
    }
}

/**
 * 验证邀请码有效性
 */
async function validateInviteCode(code) {
    console.log('[Invite] 开始验证邀请码:', code);
    
    try {
        const db = firebase.firestore();
        
        // 查询所有用户文档，寻找匹配的邀请码
        const usersQuery = await db.collection('users')
            .where('inviteCode', '==', code)
            .limit(1)
            .get();
        
        if (!usersQuery.empty) {
            // 找到匹配的邀请人
            const inviterDoc = usersQuery.docs[0];
            inviterUserId = inviterDoc.id;
            isValidInvite = true;
            
            console.log('[Invite] 邀请码验证成功，邀请人ID:', inviterUserId);
            showValidInviteState();
        } else {
            console.log('[Invite] 邀请码无效');
            showInvalidInviteState();
        }
    } catch (error) {
        console.error('[Invite] 验证邀请码时出错:', error);
        showInvalidInviteState();
    }
}

/**
 * 显示有效邀请状态
 */
function showValidInviteState() {
    document.getElementById('invite-valid').style.display = 'block';
    document.getElementById('invite-invalid').style.display = 'none';
    document.getElementById('success-state').style.display = 'none';
}

/**
 * 显示无效邀请状态
 */
function showInvalidInviteState() {
    document.getElementById('invite-valid').style.display = 'none';
    document.getElementById('invite-invalid').style.display = 'block';
    document.getElementById('success-state').style.display = 'none';
    isValidInvite = false;
    inviterUserId = null;
}

/**
 * 显示成功状态
 */
function showSuccessState(hasRewards = false) {
    console.log('[Invite] 显示成功状态, 有奖励:', hasRewards);
    
    const container = document.getElementById('invite-container');
    if (hasRewards) {
        container.innerHTML = `
            <div class="success-state">
                <h1>🎉 Welcome to AetherFlow!</h1>
                <p>Your account has been created successfully!</p>
                <div class="reward-info">
                    <h3>🎁 Welcome Bonus</h3>
                    <p>You've received <strong>3 days of Pro membership</strong> as a welcome gift!</p>
                    <p>Your rewards are being processed and will be available shortly.</p>
                </div>
                <a href="index.html" class="btn btn-primary">Get Started</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="success-state">
                <h1>✅ Welcome to AetherFlow!</h1>
                <p>Your account has been created successfully!</p>
                <a href="index.html" class="btn btn-primary">Get Started</a>
            </div>
        `;
    }
}

/**
 * 设置按钮事件
 */
function setupInviteButtons() {
    // Google登录按钮 - 有效邀请
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignup);
    }
    
    // 邮箱注册按钮 - 有效邀请
    const emailSignupBtn = document.getElementById('email-signup-btn');
    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', handleEmailSignup);
    }
    
    // Google登录按钮 - 无效邀请
    const googleSignupBtnFallback = document.getElementById('google-signup-btn-fallback');
    if (googleSignupBtnFallback) {
        googleSignupBtnFallback.addEventListener('click', handleGoogleSignup);
    }
    
    // 邮箱注册按钮 - 无效邀请
    const emailSignupBtnFallback = document.getElementById('email-signup-btn-fallback');
    if (emailSignupBtnFallback) {
        emailSignupBtnFallback.addEventListener('click', handleEmailSignup);
    }
}

/**
 * 处理Google注册
 */
async function handleGoogleSignup() {
    console.log('[Invite] 开始Google注册流程');
    
    try {
        showLoading(true);
        hideError();
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        
        console.log('[Invite] Google注册成功:', result.user.email);
        
        // 注册成功后的处理将在 handleInviteAuthStateChanged 中进行
        
    } catch (error) {
        console.error('[Invite] Google注册失败:', error);
        showError('Google signup failed. Please try again.');
        showLoading(false);
    }
}

/**
 * 处理邮箱注册
 */
function handleEmailSignup() {
    console.log('[Invite] 显示邮箱注册模态框');
    
    // 复用现有的认证模态框，但切换到注册标签
    showAuthModal();
    
    // 等待模态框创建完成后切换到注册标签
    setTimeout(() => {
        const registerTab = document.querySelector('[data-tab="register"]');
        const loginTab = document.querySelector('[data-tab="login"]');
        if (registerTab && loginTab) {
            switchAuthTab(registerTab, loginTab);
        }
    }, 100);
}

/**
 * 处理认证状态变化（邀请页面专用）
 */
async function handleInviteAuthStateChanged(user) {
    if (user) {
        console.log('[Invite] 用户已认证:', user.email);
        
        // 检查是否是新注册的用户
        const isNewUser = await checkIfNewUser(user);
        
        if (isNewUser) {
            console.log('[Invite] 检测到新用户注册');
            await handleNewUserRegistration(user);
        } else {
            console.log('[Invite] 现有用户登录');
            showSuccessState(false);
        }
    }
}

/**
 * 检查是否是新用户
 */
async function checkIfNewUser(user) {
    try {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        // 如果用户文档不存在，说明是新用户
        return !userDoc.exists;
    } catch (error) {
        console.error('[Invite] 检查用户状态时出错:', error);
        return false;
    }
}

/**
 * 处理新用户注册
 */
async function handleNewUserRegistration(user) {
    console.log('[Invite] 处理新用户注册:', user.email);
    
    try {
        const db = firebase.firestore();
        const batch = db.batch();
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // 1. 创建用户基础文档
        const userDocRef = db.collection('users').doc(user.uid);
        batch.set(userDocRef, {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            createdAt: timestamp,
            lastLoginAt: timestamp,
            invitedBy: inviterUserId || null,
            registrationSource: isValidInvite ? 'invite' : 'direct'
        });
        
        // 2. 只有有效邀请的用户才处理奖励逻辑
        if (isValidInvite && inviterUserId) {
            await handleInviteRewards(user, batch, timestamp);
            
            // 提交所有操作
            await batch.commit();
            console.log('[Invite] 新用户注册处理完成');
            
            // 3. 调用Cloud Run API实际发放奖励（仅限有效邀请）
            await processWelcomeRewards(user.uid);
            
            // 显示成功状态（有奖励）
            showSuccessState(true);
        } else {
            // 无邀请的新用户，只创建基础文档，无奖励
            await batch.commit();
            console.log('[Invite] 新用户注册处理完成（无邀请奖励）');
            
            // 显示成功状态（无奖励）
            showSuccessState(false);
        }
        
    } catch (error) {
        console.error('[Invite] 处理新用户注册时出错:', error);
        if (isValidInvite) {
            showError('Registration completed, but there was an issue processing your rewards. Please contact support.');
        } else {
            showError('Registration completed successfully.');
        }
        showSuccessState(false);
    }
}

/**
 * 处理邀请奖励逻辑
 */
async function handleInviteRewards(user, batch, timestamp) {
    console.log('[Invite] 处理邀请奖励逻辑');
    
    const db = firebase.firestore();
    
    try {
        // 1. 创建邀请关系记录
        const inviteId = db.collection('invites').doc().id;
        const inviteDocRef = db.collection('invites').doc(inviteId);
        batch.set(inviteDocRef, {
            inviterUserId: inviterUserId,
            invitedUserId: user.uid,
            inviteCode: inviteCode,
            invitedEmail: user.email,
            createdAt: timestamp,
            status: 'completed',
            ipAddress: await getClientIP()
        });
        
        // 2. 检查邀请人任务状态和限制
        const shouldUpdateInviterTask = await checkInviterEligibility(inviterUserId);
        
        if (shouldUpdateInviterTask) {
            // 3. 更新邀请人的任务状态
            const inviterTaskRef = db.collection('users').doc(inviterUserId)
                .collection('rewards_tasks').doc('friendInvite');
            
            // 获取当前进度
            const currentTaskDoc = await inviterTaskRef.get();
            let currentProgress = 0;
            
            if (currentTaskDoc.exists) {
                currentProgress = currentTaskDoc.data().progress || 0;
            }
            
            // 更新任务状态
            batch.set(inviterTaskRef, {
                completed: true,
                progress: currentProgress + 1,
                maxProgress: 5,
                completedAt: timestamp,
                claimed: false
            }, { merge: true });
            
            console.log('[Invite] 已更新邀请人任务状态，进度:', currentProgress + 1);
        }
        
        // 4. 给被邀请人发放欢迎奖励
        await addWelcomeBonusToQueue(user.uid, batch, timestamp);
        
    } catch (error) {
        console.error('[Invite] 处理邀请奖励时出错:', error);
        // 即使邀请奖励处理失败，也要给被邀请人发放基础奖励
        await addWelcomeBonusToQueue(user.uid, batch, timestamp);
    }
}

/**
 * 检查邀请人是否符合奖励条件
 */
async function checkInviterEligibility(inviterUserId) {
    console.log('[Invite] 检查邀请人奖励资格');
    
    try {
        const db = firebase.firestore();
        
        // 检查邀请人任务完成次数
        const taskDoc = await db.collection('users').doc(inviterUserId)
            .collection('rewards_tasks').doc('friendInvite').get();
        
        let currentProgress = 0;
        if (taskDoc.exists) {
            currentProgress = taskDoc.data().progress || 0;
        }
        
        // 检查是否超过5次限制
        if (currentProgress >= 5) {
            console.log('[Invite] 邀请人已达到最大邀请次数限制');
            return false;
        }
        
        // TODO: 可以在这里添加IP限制检查等其他防刷机制
        
        return true;
        
    } catch (error) {
        console.error('[Invite] 检查邀请人资格时出错:', error);
        return false;
    }
}

/**
 * 获取客户端IP地址
 */
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('[Invite] 获取IP地址失败:', error);
        return 'unknown';
    }
}

/**
 * 处理欢迎奖励 - 调用Cloud Run API实际发放奖励
 */
async function processWelcomeRewards(userId) {
    console.log('[Invite] 开始处理欢迎奖励，用户ID:', userId);
    
    try {
        // 获取用户的Firebase ID Token
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            throw new Error('用户未认证');
        }
        
        const idToken = await currentUser.getIdToken();
        
        // 确定Cloud Run服务URL
        const hostname = window.location.hostname;
        let cloudRunBaseUrl;
        
        if (hostname === 'dev.aetherflow-app.com') {
            // 开发环境
            cloudRunBaseUrl = 'https://process-rewards-test-423266303314.us-central1.run.app';
        } else {
            // 生产环境
            cloudRunBaseUrl = 'https://process-rewards-423266303314.us-central1.run.app';
        }
        
        // 调用Cloud Run API处理奖励
        const response = await fetch(`${cloudRunBaseUrl}/process-rewards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                userId: userId,
                rewardType: 'welcomeBonus',
                rewardDays: 3,
                queueItemId: 'welcomeBonus'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Cloud Run API调用失败: ${response.status} - ${errorData}`);
        }
        
        const result = await response.json();
        console.log('[Invite] 欢迎奖励处理成功:', result);
        
    } catch (error) {
        console.error('[Invite] 处理欢迎奖励时出错:', error);
        // 不抛出错误，因为注册已经成功，只是奖励发放失败
        // 用户可以联系客服处理
    }
}

/**
 * 添加欢迎奖励到队列（仅限有效邀请的用户）
 */
async function addWelcomeBonusToQueue(userId, batch, timestamp) {
    console.log('[Invite] 添加欢迎奖励到队列');
    
    const db = firebase.firestore();
    const queueRef = db.collection('users').doc(userId)
        .collection('rewards_queue').doc('welcomeBonus');
    
    batch.set(queueRef, {
        taskType: 'welcomeBonus',
        completedAt: timestamp,
        claimed: false,
        rewardDays: 3,
        status: 'pending',
        metadata: {
            source: 'invite',
            inviterUserId: inviterUserId || null
        }
    });
    
    // 注意：实际的奖励处理（调用Cloud Run API）将在batch.commit()之后进行
    // 这里先写入队列，后续通过Cloud Run处理实际的会员状态更新
}

/**
 * 显示加载状态
 */
function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    const errorState = document.getElementById('error-state');
    if (errorState) {
        errorState.textContent = message;
        errorState.style.display = 'block';
    }
}

/**
 * 隐藏错误信息
 */
function hideError() {
    const errorState = document.getElementById('error-state');
    if (errorState) {
        errorState.style.display = 'none';
    }
}

// 导出函数供全局使用
window.initInvitePage = initInvitePage; 