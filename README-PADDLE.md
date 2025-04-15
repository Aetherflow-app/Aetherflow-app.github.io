# AetherFlow Paddle支付集成说明

本文档说明如何将Paddle支付系统集成到AetherFlow应用的官网中。

## 集成目标

1. 在pricing.html页面中集成Paddle Checkout.js脚本
2. 实现支付按钮和Paddle结账流程
3. 添加支付来源跟踪参数处理
4. 设计支付成功/取消后的回调机制
5. 完整地实现Paddle客户端API集成

## 配置信息

### 沙盒环境（测试用）
- **客户端Token**: test_c624a7a4c9993fc8965d9c37db6
- **产品ID**: pro_01jrw0cx348x89jy2y47fmfeyx
- **月度计划ID**: pri_01jrw0em3kydrg4rw523w6s574
- **年度计划ID**: pri_01jrw0f7y1kfw9jc967eswbnrs

### 生产环境
- **客户端Token**: live_74080bad93a7d3b962f98a52c93
- **产品ID**: pro_01jrcqtf7wa1mwr0hy4h31p9v
- **月度计划ID**: pri_01jrfcwajex91zya4346h9ek32
- **年度计划ID**: pri_01jrfcz25f4zdktr7rtt1pnzpw

## 环境检测机制

系统提供了灵活的环境判断机制，按以下优先级确定使用沙盒还是生产环境：

1. **URL参数控制**：使用`?env=sandbox`或`?env=production`明确指定
2. **域名判断**：
   - 沙盒环境：localhost, 127.0.0.1, github.io, github.dev 或包含"test"的域名
   - 生产环境：其他域名（包括自定义域名aetherflow-app.com）

系统会在页面左下角显示"SANDBOX MODE"标识，明确指示当前环境。

### 强制使用沙盒环境测试

即使在生产域名上，您也可以通过添加URL参数强制使用沙盒环境进行测试：

```
https://aetherflow-app.com/pricing.html?env=sandbox
```

## 实现功能

已实现的核心功能包括：

1. **Paddle结账集成**：
   - 引入Paddle.js v2版本
   - 根据环境初始化Paddle客户端
   - 实现月度和年度计划的支付按钮

2. **环境管理**：
   - 提供环境自动检测
   - 支持URL参数覆盖环境设置
   - 通过localStorage持久化环境信息

3. **跟踪和分析**：
   - 支持UTM参数处理
   - 记录来源信息
   - 将自定义数据传递给Paddle

4. **支付后处理**：
   - 实现支付成功回调页面
   - 支持中英文切换
   - 提供清晰的后续步骤引导

## 测试说明

在沙盒环境中，可使用以下测试卡信息：
- **卡号**：4242 4242 4242 4242 或 4000 0566 5566 5556
- **有效期**：任何未来日期（如 12/25）
- **CVV**：任意3位数字（如 123）
- **持卡人姓名**：任意名称
- **其他信息**：可填写任意有效格式的数据

### 特殊测试卡号
- **无3DS验证卡**：4242 4242 4242 4242
- **有3DS验证卡**：4000 0038 0000 0446
- **拒绝支付卡**：4000 0000 0000 0002

## 页面说明

1. **pricing.html**：
   - 包含月度和年度计划选项
   - 实现Paddle结账功能
   - 处理环境检测和UTM参数

2. **success.html**：
   - 显示支付成功信息
   - 提供后续步骤指引
   - 支持中英文切换
   - 尝试与扩展通信更新状态

## Webhook配置

项目使用Google Cloud Run处理Paddle webhook事件：
- Webhook URL: `https://paddle-webhooks-423266303314.us-central1.run.app`
- 已配置接收所有关键事件，包括：
  - subscription.created
  - subscription.activated
  - transaction.completed
  - transaction.updated
  - payment_method.saved

## 下一步工作

完成本任务后，接下来需要实施：
1. B6任务：支付流程连接与成功处理
2. B7任务：会员中心基础实现 