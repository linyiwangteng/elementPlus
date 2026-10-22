# elementPlus

element plus design use

# Vue Admin：直播欢迎语管理原型

基于 Vue 3、TypeScript 和 Element Plus 的单页管理后台，包含工作台、系统设置和话术管理。当前核心功能是直播欢迎语的本地编辑，适合作为前端交互原型和后续业务开发的起点。

> 当前项目没有后端接口、登录鉴权或数据持久化。页面数据保存在浏览器内存中，刷新后恢复初始值；欢迎语随机发送和昵称替换目前仅有界面提示，尚未接入直播业务。

## 技术栈

以下为 `package.json` 声明的版本范围，实际安装版本以 `package-lock.json` 为准。

| 技术 | 版本范围 | 用途 |
| --- | --- | --- |
| Vue | ^3.5.12 | 页面组件，使用 Composition API 和 `<script setup>` |
| TypeScript | ^5.6.3 | 静态类型检查 |
| Vite | ^5.4.10 | 开发服务和生产构建 |
| Vue Router | ^4.4.5 | 页面路由，使用 HTML5 History 模式 |
| Pinia | ^2.2.6 | 全局状态管理，目前用于计数器 |
| Element Plus | ^2.8.8 | 表单、布局和交互组件 |
| Element Plus Icons Vue | ^2.3.1 | 图标 |

## 本地运行

### Mock 数据请求

启动 `npm run dev` 后，左侧“数据请求”（`/mock`）页面可搜索、分页及刷新模板列表，包含加载状态和失败提示。

- 接口：`GET /api/templates?page=1&pageSize=10&keyword=`。
- 返回：`{ code: 0, message: 'success', data: { list, total, page, pageSize } }`。
- `page` 为正整数，`pageSize` 为 1–100 的整数，`keyword` 按名称模糊搜索；默认模拟 300ms 延迟。
- 数据源：`mock/datas/list.ts`；接口处理：`mock/index.ts`；业务调用：`src/api/templates.ts`；统一请求：`src/utils/request.ts`（默认超时 10 秒）。
- Mock 由 Vite 中间件提供，支持 `npm run dev` 与 `npm run preview`，浏览器 Network 面板可查看真实 HTTP 请求。静态部署 `dist/` 不包含 API 服务，上线需提供同协议后端接口或配置服务器代理。
- 添加接口时在 `mock/index.ts` 注册路径和处理逻辑，再在 `src/api/` 增加对应调用函数。

准备 Node.js 和 npm。仓库未通过 `engines` 或版本文件固定 Node.js 版本，需使用兼容 Vite 5 的环境。

```bash
# 按锁文件安装依赖
npm ci

# 启动开发服务
npm run dev
```

默认访问 `http://localhost:5173`，端口占用时以终端输出为准。开发服务监听 `0.0.0.0`，可以通过本机局域网 IP 访问。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm ci` | 根据锁文件安装依赖，适合首次拉取和 CI |
| `npm install` | 安装依赖，调整依赖后同步更新锁文件 |
| `npm run dev` | 启动 Vite 开发服务 |
| `npm run typecheck` | 执行 `vue-tsc -b` 类型检查 |
| `npm run build` | 先执行类型检查，再生成生产产物到 `dist/` |
| `npm run preview` | 本地预览已有构建产物，默认端口为 4173 |

项目暂未配置自动化测试、ESLint 或 Prettier 脚本。

## 页面与功能

| 路由 | 页面 | 当前实现 |
| --- | --- | --- |
| `/` | 工作台 | 计数递增、双倍计数展示和重置，演示 Pinia 状态管理 |
| `/settings` | 系统设置 | 项目名称、缓存开关和主题选项的表单交互 |
| `/scripts` | 话术入口 | 重定向到 `/scripts/welcome` |
| `/scripts/welcome` | 欢迎语管理 | 欢迎语新增、编辑、删除和用户名变量编辑 |

### 欢迎语管理

- 初始内置一条欢迎语，列表最多保存 10 条，达到上限后禁用添加按钮。
- 编辑器使用 `contenteditable`，以序列化后的字符串长度校验最多 50 个 JavaScript UTF-16 代码单元；“用户名”按 3 个计入，部分 emoji 会占多个。
- 点击“插入用户名”可在光标位置插入不可直接修改的变量标签，支持在相邻光标处用 Backspace / Delete 整体删除。
- 新增保存后插入列表首位；编辑保存后更新原条目；取消关闭编辑器。
- 空内容或超长内容点击保存时会关闭编辑器，不写入列表，目前没有错误提示。
- 保存时会合并连续空白并去除首尾空白；文本中的字面量“用户名”也会按变量显示。

欢迎语列表和启用开关使用页面内的 `ref` 状态，离开页面后重新进入也会重新初始化。开关目前只改变自身状态，不控制编辑、发送或列表显示。页面中的“随机匹配一条输出”和“自动替换为用户昵称”尚未实现。

### 演示与占位交互

- 工作台的“创建模块”按钮和顶部菜单按钮尚未绑定业务操作。
- 系统设置的“保存”“取消”按钮尚未绑定处理逻辑；缓存开关和主题选项只更新表单值，不会实际启用缓存或切换主题。
- 窄屏（宽度不超过 768px）隐藏侧栏并调整部分布局，尚未提供移动端导航入口。

## 目录结构

```text
.
├── index.html                 # HTML 入口
├── package.json               # 依赖和 npm 脚本
├── package-lock.json          # npm 依赖锁文件
├── vite.config.ts             # Vue 插件和 @ 路径别名
├── tsconfig.json              # TypeScript 项目引用配置
├── tsconfig.app.json          # 应用类型检查配置
├── tsconfig.node.json         # Vite 配置文件类型检查配置
└── src/
    ├── main.ts                # 注册 Pinia、Router、Element Plus 和全局样式
    ├── App.vue                # 侧栏、顶栏和路由内容区
    ├── vite-env.d.ts          # Vite 类型声明
    ├── router/
    │   └── index.ts           # 路由表，页面按需加载
    ├── stores/
    │   ├── index.ts           # Pinia 实例
    │   └── useCounterStore.ts # 计数器状态、派生值和操作
    ├── styles/
    │   └── main.css           # 全局布局、欢迎语样式和响应式规则
    └── views/
        ├── DashboardView.vue  # 工作台
        ├── SettingsView.vue   # 设置表单
        └── ScriptsView.vue    # 欢迎语列表与编辑器
```

## 开发说明

- `@` 指向 `src/`，在 Vite 和应用 TypeScript 配置中均已声明。
- 新增页面可放在 `src/views/`，在 `src/router/index.ts` 注册路由，并在 `src/App.vue` 添加菜单入口。
- 跨页面共享状态可放在 `src/stores/`；欢迎语当前未接入 Pinia。
- 欢迎语的数量上限、长度上限和变量标识集中定义在 `ScriptsView.vue` 顶部。
- TypeScript 开启严格检查以及未使用变量、参数检查，构建前必须通过类型检查。
- 当前没有自定义环境变量、API 客户端或开发代理配置，启动不需要额外的 `.env` 文件。

后续接入业务时，需要补充欢迎语与设置的存储接口、实际的用户名替换和随机发送逻辑，以及必要的鉴权、反馈和测试。编辑器涉及 DOM Selection / Range 操作，修改后应重点验证中文输入、粘贴、变量插入与删除、长度边界和取消再新增等场景。

## 构建与部署

```bash
npm run build
npm run preview
```

将 `dist/` 中的产物部署到静态站点服务。`preview` 用于本地检查构建结果。

路由使用 HTML5 History 模式，部署服务器必须将非静态资源的页面请求回退到 `index.html`，否则直接访问或刷新 `/settings`、`/scripts/welcome` 等路径可能返回 404。例如 Nginx 的站点配置可包含：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

以上示例适用于部署在域名根路径。若部署到子目录，需要同时设置 Vite 的 `base` 和对应的服务器回退路径；路由已使用 `import.meta.env.BASE_URL` 作为基础路径。
