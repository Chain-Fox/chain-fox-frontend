# Chain Fox 官网前端项目

[English](README.md) | [中文](README.zh.md)

这是 Chain Fox 区块链安全平台的官方网站前端开源项目。本项目使用 React、Tailwind CSS 和 Framer Motion 构建，提供现代化的用户界面和流畅的动画效果，展示 Chain Fox 平台的功能和服务。

![项目标志](/public/logo.png)

## 关于项目

Chain Fox 致力于通过先进的自动化分析工具，普及并民主化区块链安全。我们利用 AI 和深度学习技术，为区块链项目和智能合约提供全面、高效的安全检测服务。项目采用 React、Tailwind CSS 和 Framer Motion 构建，呈现出现代化的用户界面和流畅的动画效果。

### 设计理念

贯穿整个首页的动态粒子网络背景 (`NetworkParticles`) 不仅仅是一个视觉装饰，它承载了 Chain Fox 的核心使命隐喻：

*   **守护区块数据**：每一个闪烁的光点代表着广阔区块链宇宙中的一个区块节点，交织的线条则象征着复杂的数据流与交互。
*   **照亮黑暗森林**：Chain Fox 如同守护者，细致地扫描并点亮这些区块，确保其安全与完整。从节点散发出的光芒穿透了潜在威胁丛生的“黑暗森林”，寓意着 Chain Fox 如何为复杂且时常晦涩的区块链世界带来清晰的安全视野。

*作者：[@1379hash](https://twitter.com/1379hash)*

## 特性

- 🎨 带有渐变效果和动画的现代化 UI
- 🌊 使用 Framer Motion 的动画背景球体
- 📱 完全响应式设计
- ✨ 流畅的内容过渡和动画
- 🎭 带有背景模糊效果的浮动卡片组件
- 🎯 清晰直观的导航
- 🌐 多语言支持（英语和中文）
- 🔄 使用 React Router 实现无缝导航

## 技术栈

- **React** - 前端框架
- **React Router** - 导航和路由
- **React-i18next** - 国际化框架
- **Vite** - 构建工具和开发服务器
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Framer Motion** - 动画库
- **PostCSS** - CSS 处理
- **Autoprefixer** - CSS 兼容性

## 开始使用

有关详细的安装、开发和部署说明，请参阅我们的[部署指南](./deploy.zh.md)，其中包括：

- 设置开发环境
- 安装依赖
- 运行开发服务器
- 生产构建
- 设置 Supabase 身份验证（GitHub、Google 和 Discord）
- 部署到 Cloudflare Pages
- 实现真实的检测 API

> **文档**: [中文部署指南](./deploy.zh.md) | [English Deployment Guide](./deploy.md)

## 项目结构

```
chain-fox/
├── src/
│   ├── components/            # 可复用 UI 组件
│   │   ├── ChainFoxLogo.jsx   # 主标志组件
│   │   ├── ChainFoxLogoSmall.jsx # 小标志组件
│   │   └── LanguageSwitcher.jsx # 语言选择组件
│   ├── pages/                 # 页面组件
│   │   └── HomePage.jsx       # 首页组件
│   ├── App.jsx                # 带路由的主应用组件
│   ├── i18n.js                # 国际化配置
│   ├── main.jsx               # 应用入口点
│   └── index.css              # 全局样式
├── public/
│   ├── locales/               # 翻译文件
│   │   ├── en/                # 英语翻译
│   │   │   ├── common.json    # 通用翻译
│   │   │   └── home.json      # 首页翻译
│   │   └── zh/                # 中文翻译
│   │       ├── common.json    # 通用翻译
│   │       └── home.json      # 首页翻译
│   └── logo.png               # 应用标志
├── index.html                 # HTML 模板
├── package.json               # 项目依赖和脚本
├── vite.config.js             # Vite 配置
├── postcss.config.js          # PostCSS 配置
└── tailwind.config.js         # Tailwind CSS 配置
```

## 多语言支持

应用程序使用 react-i18next 支持多种语言：

- 英语 (en) - 默认语言
- 中文 (zh)

翻译文件位于 `public/locales` 目录中，按语言代码和命名空间组织：

- `common.json` - 包含共享翻译（导航、按钮等）
- `home.json` - 包含首页特定翻译

添加新语言的步骤：

1. 在 `public/locales` 中创建一个带有语言代码的新文件夹（例如，`fr` 表示法语）
2. 从现有语言文件夹复制 JSON 文件并翻译值
3. 在 `LanguageSwitcher.jsx` 组件中添加语言按钮

## 贡献

1. Fork 仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加一些惊人的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

该项目根据 MIT 许可证授权 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。
