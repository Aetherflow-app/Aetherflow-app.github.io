// 1. 使用你的 Firebase 项目配置初始化
// 这个配置是公开的，可以安全地放在前端代码中。
const firebaseConfig = {
    apiKey: "AIzaSyCulWQxvrzxDOLGOxzi2ngj9n0DwzvqJFw",
    authDomain: "aetherflow-b6459.firebaseapp.com",
    projectId: "aetherflow-b6459",
    storageBucket: "aetherflow-b6459.firebasestorage.app",
    messagingSenderId: "423266303314",
    appId: "1:423266303314:web:9cbf8adb847f043bd34e8b",
    measurementId: "G-ZD5E2WY22N"
};

// 初始化 Firebase
// 注意：在新版 Firebase (v9+) 中，API 有所不同。
// 目前代码基于 v8 写法，与 HTML 中引入的 SDK 版本一致。
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 2. 监听来自 Offscreen Document 的消息
window.addEventListener('message', (event) => {
    // 安全性检查：首先确认消息来源是否是我们的扩展
    // 这是为了防止其他网站恶意向我们的认证页面发送消息
    if (!event.origin.startsWith(`chrome-extension://`)) {
        console.warn("Message rejected: non-extension origin.", event.origin);
        return;
    }

    // 在实际实现时，我们还需要从后台脚本获取确切的扩展ID进行更严格的校验
    // const extensionId = event.data.extensionId;
    // if (event.origin !== `chrome-extension://${extensionId}`) {
    //     return;
    // }
    
    console.log("Message received from extension:", event.data);

    // 处理登录请求
    if (event.data && event.data.type === 'login-request') {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // 推荐为您的目标用户指定语言，以获得更好的体验
        // auth.useDeviceLanguage();

        auth.signInWithPopup(provider)
            .then(result => {
                // 3. 成功后，将完整的用户信息（或一个简化版本）发送回扩展
                console.log("Sign-in successful, sending user data back.");
                const payload = { 
                    type: 'login-success',
                    // 注意：为了安全，通常只传递需要的信息，而不是整个 user 对象
                    user: {
                        uid: result.user.uid,
                        displayName: result.user.displayName,
                        email: result.user.email,
                        photoURL: result.user.photoURL,
                    } 
                };
                event.source.postMessage(payload, event.origin);
            })
            .catch(error => {
                // 4. 失败后，将错误信息发送回扩展
                console.error("Sign-in failed:", error);
                const payload = { 
                    type: 'login-failure', 
                    error: {
                        code: error.code,
                        message: error.message
                    }
                };
                event.source.postMessage(payload, event.origin);
            });
    }
});

// 页面加载完成后，向扩展发送一个 "ready" 信号
// 这可以帮助后台脚本知道 iframe 已准备好接收消息
window.onload = () => {
    // 使用 postMessage 向父窗口（即 offscreen document）发送消息
    // 这里使用 '*' 作为目标源，因为在 iframe 初始化时，我们可能还不知道确切的扩展ID
    // 在更安全的实现中，扩展应该先向 iframe 发送其 ID
    console.log("Auth page loaded, sending ready message.");
    window.parent.postMessage({ type: 'auth-page-ready' }, '*');
}; 