# AetherFlow Paddle支付集成说明

本文档提供AetherFlow项目中Paddle支付集成的配置和使用说明。

## 配置项

在`pricing.html`文件中已配置以下实际参数：

### 1. Paddle Vendor ID

```javascript
const vendorId = isLocalhost ? '11111' : '74080'; // 实际的Paddle Vendor ID
```

- 开发环境（localhost）使用沙盒环境的Vendor ID `11111`
- 生产环境使用实际的Paddle Vendor ID `74080`

### 2. 产品ID

```javascript
const productIds = {
    monthly: 'pro_01jrcqtf7wa1mwr0hy4h31p9v', // 实际的Paddle产品ID
    annual: 'pro_01jrcqtf7wa1mwr0hy4h31p9v'   // 使用相同的产品ID，在结账时区分计划
};
```

- 产品ID: `pro_01jrcqtf7wa1mwr0hy4h31p9v`
- 月度计划ID: `pri_01jrfcwajex91zya4346h9ek32`
- 年度计划ID: `pri_01jrfcz25f4zdktr7rtt1pnzpw`

### 3. Client-side Token

```javascript
paddleOptions.token = 'live_74080bad93a7d3b962f98a52c93';
```

### 4. 回调URL

```javascript
successUrl: window.location.origin + '/success.html?checkout={checkout}',
cancelUrl: window.location.origin + '/cancel.html'
```

- 这些URL会在支付成功或取消后重定向用户
- `{checkout}`变量会被Paddle自动替换为结账ID

### 5. 扩展ID

Chrome扩展ID: `ldpadjcdbfndeghcklogoppmbnmphbki`

## 文件说明

1. **pricing.html**: 包含支付按钮和Paddle集成代码
2. **success.html**: 支付成功页面
3. **cancel.html**: 支付取消页面

## 测试方法

1. 在本地开发环境：
   - Paddle自动使用沙盒环境
   - 可以使用Paddle提供的测试卡号：`4242 4242 4242 4242`
   - 任意有效的到期日和CVV（例如：`12/25` 和 `123`）

2. 验证集成：
   - 点击"Upgrade Now"按钮，应打开Paddle结账窗口
   - 完成测试支付流程，应重定向到success.html
   - 取消支付，应重定向到cancel.html

## Webhook配置

项目使用Google Cloud Run处理Paddle webhook事件：
- Webhook URL: `https://paddle-webhooks-423266303314.us-central1.run.app`
- Destination ID: `ntfset_01jrfxc0gg6e9n6ejc9s70ptwn`

## 注意事项

- 验证支付后，用户会被重定向到成功页面，并可以直接打开扩展
- 在成功页面中，我们会解析checkout ID，但目前仅记录，不进行验证
- 生产环境已配置正确的Vendor ID、产品ID和计划ID
- 扩展ID已更新在所有相关链接中

## 生产环境部署前的最终检查

1. 确保已更新真实的Paddle Vendor ID
2. 确保已配置正确的产品ID
3. 验证回调URL是否正确
4. 确认Paddle账户已完成验证，可以接受真实支付

## 技术支持

如有问题，请参考以下资源：

- [Paddle开发者文档](https://developer.paddle.com/)
- [Paddle结账API文档](https://developer.paddle.com/guides/checkout-overlay)
- [Paddle测试环境指南](https://developer.paddle.com/getting-started/sandbox)

## 注意事项

- 生产环境使用前，确保已完成Paddle账户验证
- 保护Vendor ID和API密钥，避免泄露
- 定期检查和更新依赖库，确保安全性
- 在成功页面中通过Checkout ID验证订单状态 