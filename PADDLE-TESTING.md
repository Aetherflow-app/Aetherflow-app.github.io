# AetherFlow Paddle支付测试指南

本文档提供了如何测试AetherFlow Paddle支付集成的详细指南。

## 1. 实现概述

我们已经完成了以下功能：

1. 在pricing.html页面集成了Paddle Checkout.js
2. 实现了月度和年度支付按钮的功能
3. 添加了支付来源跟踪和UTM参数处理
4. 设计了支付成功后的回调和处理机制
5. 增强了success.html页面，支持中英文切换

## 2. 环境控制机制

系统提供了灵活的环境判断机制，按以下优先级确定使用沙盒还是生产环境：

1. **URL参数控制**：使用`?env=sandbox`或`?env=production`明确指定
2. **域名判断**：
   - 沙盒环境：localhost, 127.0.0.1, github.io, github.dev 或包含"test"的域名
   - 生产环境：其他域名（包括自定义域名aetherflow-app.com）

系统会在页面左下角显示"SANDBOX MODE"标识，清晰指示当前正在使用的环境。

### 强制使用沙盒环境测试

即使在生产域名(aetherflow-app.com)上，您也可以通过添加URL参数强制使用沙盒环境进行测试：

```
https://aetherflow-app.com/pricing.html?env=sandbox
```

## 3. 测试步骤

### 3.1 沙盒环境测试

1. 访问测试URL:
   - GitHub Pages: https://aetherflow-app.github.io/pricing.html
   - 或强制沙盒: https://aetherflow-app.com/pricing.html?env=sandbox

2. 确认页面左下角显示"SANDBOX MODE"标识
3. 点击"Upgrade Now"按钮
4. 在弹出的Paddle结账界面中使用测试卡信息：

   **测试卡信息：**
   - **卡号**：4242 4242 4242 4242 或 4000 0566 5566 5556
   - **有效期**：未来任何日期（如 12/25）
   - **CVV**：任意3位数字（如 123）
   - **持卡人姓名**：任意名称
   - **其他信息**：可填写任意有效格式的数据

5. 完成支付流程
6. 系统将自动跳转到success.html页面，显示交易ID和计划类型
7. 成功页面也应显示"SANDBOX PAYMENT"标识，表明这是一笔沙盒支付

### 3.2 测试不同支付场景

1. **月度计划**：点击月度选项卡下的"Upgrade Now"按钮
2. **年度计划**：点击年度选项卡下的"Upgrade Now"按钮
3. **不同来源**：通过添加UTM参数测试来源跟踪，例如：
   ```
   pricing.html?env=sandbox&utm_source=test&utm_campaign=testing
   ```

### 3.3 特殊情况测试

- **支付取消**：在Paddle结账页面点击关闭按钮
- **卡片拒绝**：使用测试卡号 4000 0000 0000 0002
- **3DS验证**：使用测试卡号 4000 0038 0000 0446

## 4. 验证支付成功

成功完成支付后，以下几点可以验证系统正常工作：

1. 成功跳转到success.html页面
2. 页面上显示交易ID和计划类型
3. localStorage中存储了支付成功的信息
   - `aetherflow_payment_success`
   - `aetherflow_checkout_id`
   - `aetherflow_plan_type`
   - `aetherflow_env` (显示当前环境: sandbox或production)
4. "Open AetherFlow"按钮正确链接到浏览器扩展

## 5. 生产环境测试

只有在确定沙盒环境测试完全成功后，才应进行生产环境测试：

1. 访问生产页面（确保没有env参数）：https://aetherflow-app.com/pricing.html
2. 确认页面左下角**没有**"SANDBOX MODE"标识
3. 按照正常流程进行支付（**此时会产生真实的财务交易**）

## 6. 问题排查

如果测试过程中遇到问题，请检查：

1. 浏览器控制台是否有错误信息
2. 使用localStorage.getItem('aetherflow_env')检查当前环境设置
3. Paddle的事件回调是否被正确触发
4. URL参数是否正确传递

## 7. 备注

- 沙盒环境的支付不会产生真实的财务交易
- 沙盒环境的webhook也会发送到配置的endpoint
- 此集成完全符合Paddle Billing v2的规范
- 支持中英文双语界面，可在success页面切换语言

## 8. 下一步工作

完成B3任务后，应继续实施B6任务（支付流程连接与成功处理）和B7任务（会员中心基础实现）。 