// 扩展与官网认证状态同步服务
const extensionSync = {
  // Chrome消息通信的扩展ID
  extensionId: 'ldpadjcdbfndeghcklogoppmbnmphbki',
  
  // 初始化同步服务
  init() {
    // 先检测用户登录状态
    this.checkAuthState();
    
    // 监听认证状态变化，同步到扩展
    firebase.auth().onAuthStateChanged(user => {
      this.syncAuthStateToExtension(user);
    });
    
    // 监听来自扩展的消息
    this.listenToExtensionMessages();
    
    console.log('扩展同步服务已初始化');
  },
  
  // 检查当前认证状态
  async checkAuthState() {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        console.log('已登录用户:', user.email);
        this.syncAuthStateToExtension(user);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
    }
  },
  
  // 将认证状态同步到扩展
  syncAuthStateToExtension(user) {
    if (!this.isExtensionInstalled()) {
      console.log('扩展未安装，跳过同步');
      return;
    }
    
    try {
      if (user) {
        // 用户已登录，同步登录状态到扩展
        user.getIdToken().then(token => {
          const message = {
            type: 'AUTH_STATE_CHANGE',
            data: {
              isLoggedIn: true,
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
              },
              token: token
            }
          };
          
          this.sendMessageToExtension(message);
        });
      } else {
        // 用户已登出，同步登出状态到扩展
        const message = {
          type: 'AUTH_STATE_CHANGE',
          data: {
            isLoggedIn: false
          }
        };
        
        this.sendMessageToExtension(message);
      }
    } catch (error) {
      console.error('同步认证状态到扩展失败:', error);
    }
  },
  
  // 监听来自扩展的消息
  listenToExtensionMessages() {
    window.addEventListener('message', event => {
      // 检查消息来源是否为我们的扩展
      if (event.source !== window) return;
      
      const message = event.data;
      
      // 检查消息是否来自扩展
      if (message && message.source === 'aetherflow_extension') {
        console.log('收到扩展消息:', message);
        
        // 处理不同类型的消息
        switch (message.type) {
          case 'REQUEST_AUTH_STATE':
            // 扩展请求当前认证状态
            this.handleAuthStateRequest();
            break;
            
          case 'AUTH_STATE_CHANGE':
            // 扩展通知认证状态变化
            this.handleExtensionAuthChange(message.data);
            break;
        }
      }
    });
  },
  
  // 处理扩展请求认证状态
  async handleAuthStateRequest() {
    const user = firebase.auth().currentUser;
    
    if (user) {
      // 用户已登录，发送登录状态
      const token = await user.getIdToken();
      const message = {
        type: 'AUTH_STATE_RESPONSE',
        data: {
          isLoggedIn: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          token: token
        }
      };
      
      this.sendMessageToExtension(message);
    } else {
      // 用户未登录，发送未登录状态
      const message = {
        type: 'AUTH_STATE_RESPONSE',
        data: {
          isLoggedIn: false
        }
      };
      
      this.sendMessageToExtension(message);
    }
  },
  
  // 处理扩展通知的认证状态变化
  async handleExtensionAuthChange(data) {
    console.log('扩展认证状态变化:', data);
    
    if (data.isLoggedIn) {
      // 扩展已登录，检查网站是否已登录
      const currentUser = firebase.auth().currentUser;
      
      if (!currentUser) {
        // 网站未登录，尝试使用令牌登录
        try {
          await firebase.auth().signInWithCustomToken(data.token);
          console.log('已使用扩展认证状态登录网站');
        } catch (error) {
          console.error('使用扩展认证状态登录失败:', error);
        }
      }
    } else {
      // 扩展已登出，判断是否需要登出网站
      const currentUser = firebase.auth().currentUser;
      
      if (currentUser) {
        // 由于登出是敏感操作，这里不自动登出网站
        // 仅记录日志提示登录状态不一致
        console.log('警告: 扩展已登出但网站仍保持登录状态');
      }
    }
  },
  
  // 向扩展发送消息
  sendMessageToExtension(message) {
    try {
      // 添加消息源标识
      message.source = 'aetherflow_website';
      
      // 使用Chrome消息API
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(this.extensionId, message, response => {
          if (chrome.runtime.lastError) {
            console.log('向扩展发送消息失败:', chrome.runtime.lastError);
          } else {
            console.log('消息已发送到扩展，响应:', response);
          }
        });
      } else {
        // 使用window.postMessage作为备选方案
        message.target = 'aetherflow_extension';
        window.postMessage(message, '*');
      }
    } catch (error) {
      console.error('发送消息到扩展失败:', error);
      
      // 尝试使用备选方案
      try {
        message.target = 'aetherflow_extension';
        window.postMessage(message, '*');
      } catch (e) {
        console.error('备选方案也失败:', e);
      }
    }
  },
  
  // 检查扩展是否已安装
  isExtensionInstalled() {
    // 尝试通过检测扩展特定对象判断是否安装
    if (window.aetherflowExtension) {
      return true;
    }
    
    // 如果在开发环境，总是返回true方便测试
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    
    // 通过特性检测判断扩展是否安装
    try {
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        return true;
      }
    } catch (e) {
      // Chrome API不可用
    }
    
    return false;
  }
};

// 当文档加载完成时初始化扩展同步服务
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化，确保Firebase和其他服务已加载
  setTimeout(() => {
    extensionSync.init();
  }, 1000);
}); 