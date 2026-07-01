# DevPro — Developer Utilities SaaS

**生产就绪的开发者工具平台，已部署到公网。**

## 当前状态 ✅

- **前端:** 10 个开发者工具，全部浏览器本地运行，无服务器开销
- **后端:** Express + JWT 认证 + 速率限制 + 线索捕获
- **支付:** Stripe 代码已就绪，配置密钥即可启用
- **部署:** Docker 就绪，一键部署到任何 VPS/云平台
- **公网地址:** https://e4dd8428d652a810-222-185-125-194.serveousercontent.com

## 工具清单 (10个)

| 工具 | 免费 | 说明 |
|------|------|------|
| JSON Formatter | ✅ | 格式化、验证、压缩 JSON |
| JWT Decoder | ✅ | 解码 JWT 令牌 |
| Base64 | ✅ | 编解码 Base64 |
| UUID Generator | ✅ | 生成 UUID v4 |
| Timestamp | ✅ | 时间戳 ↔ 日期互转 |
| Regex Tester | ✅ | 正则表达式测试 |
| URL Encode | ✅ | URL 编解码 |
| Color Converter | ✅ | Hex ↔ RGB ↔ HSL 转换 |
| Number Base | ✅ | 进制转换 (2/8/10/16/32/36) |
| Text Diff | 💎 PRO | 行级差异对比 |

## 定价模型（代码就绪，激活即可）

| 套餐 | 价格 | 功能 |
|------|------|------|
| Free | $0 | 所有基础工具，每天 100 次 |
| Pro | $9/月 | 无限使用 + Text Diff + API 访问 + 暗色主题 |
| Enterprise | $49/月 | 自部署许可 + 白标 + 团队账户 + SSO |

## 启动方式

```bash
cd ~/Desktop/DevPro

# 开发模式
pnpm dev:client   # 前端热重载 :5173
pnpm dev:server   # 后端 API :3000

# 生产模式
pnpm build
pnpm start        # 访问 http://localhost:3000

# Docker
pnpm docker:build
pnpm docker:run
```

## 如何开始赚钱

### 1. 配置 Stripe (30 分钟)
1. 注册 https://stripe.com
2. 创建产品 "DevPro Pro" ($9/月)
3. 获取密钥: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
4. 设置 webhook 到 `/api/stripe/webhook`
5. 部署到生产服务器

### 2. 部署到生产 (1 小时)
选项 A — Railway.app (最快):
1. Fork 项目到 GitHub
2. 在 Railway 连接仓库
3. 设置环境变量和域名
4. 搞定

选项 B — VPS (最灵活):
1. `pnpm docker:build && pnpm docker:run`
2. 设置 Nginx 反代
3. 配置 SSL (Let's Encrypt)
4. 绑定域名

### 3. 获取用户
- 在 Product Hunt / Hacker News 发布
- 在 Reddit r/webdev, r/javascript 分享
- 在 Twitter/X 展示
- 在 Dev.to 写文章
- 开源基础版，Pro 版收费

## 技术栈
- **前端:** Vanilla JS + Vite (无框架依赖)
- **后端:** Node.js + Express
- **数据库:** JSON 文件 (零依赖)
- **认证:** JWT (自实现)
- **支付:** Stripe
- **部署:** Docker

## 项目结构
```
DevPro/
├── package.json       # 项目配置
├── vite.config.js     # 构建配置
├── Dockerfile         # 容器化部署
├── start.sh           # 自愈启动脚本
├── index.html         # 入口
├── src/
│   ├── main.js        # 主逻辑 (路由/状态/主题)
│   ├── styles/main.css # UI (亮/暗主题)
│   └── tools/         # 10个工具模块
└── server/
    ├── index.js       # Express 服务
    ├── db.js          # JSON 数据库
    ├── auth.js        # JWT 认证
    └── stripe.js      # Stripe 支付
```
