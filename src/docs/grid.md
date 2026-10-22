# Grid 布局指南

Grid 是 CSS 的二维布局系统，可以同时定义行和列，适合后台页面、卡片列表、表单和仪表盘等场景。

## 1. 从一个三列布局开始

```html
<div class="grid">
  <div>卡片 1</div>
  <div>卡片 2</div>
  <div>卡片 3</div>
  <div>卡片 4</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
```

容器生成三列，直接子元素默认按行依次放入网格。第四张卡片进入第二行。没有显式定义的后续行由自动布局创建。

> Grid 控制的是直接子元素的位置。卡片内部仍可使用 Flex 排列图标、文字和按钮。

## 2. 基本概念

| 概念 | 含义 | 示例 |
| --- | --- | --- |
| 网格容器 | 设置了 `display: grid` 的元素 | 外层 `.grid` |
| 网格项 | 参与网格布局的直接子元素 | 卡片 |
| 轨道 | 两条相邻网格线之间的一行或一列 | 第一列 |
| 网格线 | 轨道的边界线 | 三列有四条列线 |
| 单元格 | 一行与一列交叉的区域 | 第一行第二列 |
| 网格区域 | 一个或多个单元格组成的矩形区域 | 横跨两列的图表 |

## 3. 如何定义行与列

```css
.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: 64px auto;
  gap: 16px;
}
```

列方向：左侧固定 `240px`，右侧占剩余空间。行方向：第一行固定 `64px`，第二行尺寸由布局和内容共同决定。

### 3.1 fr：分配剩余空间

```css
grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
```

在没有其他约束干扰时，扣除列间距后的可用宽度按 `2:3` 分配。`fr` 不是百分比：固定轨道和间距会先占用空间，再分配剩余部分。

例如容器内容宽度 `1016px`，两列间距 `16px`，剩余 `1000px`，两列分别为 `400px` 和 `600px`。

### 3.2 repeat：避免重复书写

```css
/* 三列等宽 */
grid-template-columns: repeat(3, minmax(0, 1fr));

/* 与上面相同 */
grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
```

### 3.3 minmax：设置轨道尺寸范围

```css
grid-template-columns: minmax(300px, 2fr) minmax(280px, 3fr);
```

这正是项目中 `split-panels` 的思路：左列至少 `300px`，右列至少 `280px`；空间充足时按约 `2:3` 分配。如果容器放不下两个最小宽度与间距，就需要媒体查询切换布局，否则会发生溢出。

### 3.4 为什么经常写 minmax(0, 1fr)？

单独的 `1fr` 轨道带有自动最小尺寸约束，长链接、不可换行文本等内容可能把列撑宽。

`minmax(0, 1fr)` 明确允许轨道从零开始分配空间。若网格项内部还有 Flex、长文本或图片，仍应按实际情况设置子项的 `min-width: 0`、文本截断或图片最大宽度。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.card {
  min-width: 0;
}
.card-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.card img {
  max-width: 100%;
  height: auto;
}
```

允许轨道缩小与处理内容溢出是两个环节，前者不会自动给文字添加省略号。

## 4. 间距和对齐

| 属性 | 控制对象 | 常见用法 |
| --- | --- | --- |
| `gap` | 行、列之间的间距 | `gap: 16px` |
| `row-gap` / `column-gap` | 单独控制行距、列距 | `row-gap: 24px` |
| `justify-items` | 每个网格项在其区域内的行内方向对齐 | `start`、`center`、`stretch` |
| `align-items` | 每个网格项在其区域内的块方向对齐 | `start`、`center`、`stretch` |
| `place-items` | `align-items` 与 `justify-items` 的简写 | `place-items: center` |
| `justify-content` | 整个网格在容器内行内方向的分布 | `center`、`space-between` |
| `align-content` | 整个网格在容器内块方向的分布 | `start`、`center` |
| `justify-self` / `align-self` | 单个网格项的对齐 | 覆盖容器的 items 设置 |

默认横排文字中，行内方向通常为水平方向，块方向为垂直方向。整个网格的对齐效果需要容器内存在可分配的剩余空间。

```css
.center-box {
  display: grid;
  min-height: 240px;
  place-items: center;
}
```

## 5. 指定位置与跨行跨列

```css
.featured {
  grid-column: 1 / 3; /* 从第 1 条列线到第 3 条列线，占两列 */
  grid-row: span 2; /* 跨两行 */
}
.full-width {
  grid-column: 1 / -1; /* 从显式网格第一条列线延伸到最后一条 */
}
```

跨列数量要匹配当前布局：三列时跨两列没有问题，切到单列时通常要重置跨列规则，避免产生额外的隐式列。

未显式定义的行列称为隐式轨道，可通过 `grid-auto-rows`、`grid-auto-columns` 设置其尺寸。默认自动放置通常按行推进，`grid-auto-flow: column` 可改为按列推进。

## 6. 实战案例

### 案例一：自动适应宽度的卡片列表

适用于商品、数字人和模板列表：无需逐个写断点，容器变宽时自动增加列数。

```html
<div class="cards">
  <article class="card">卡片 1</article>
  <article class="card">卡片 2</article>
  <article class="card">卡片 3</article>
</div>
```

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 16px;
}
.card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
}
```

- `auto-fit`：尽可能创建能放下的列，折叠未被占用的重复轨道，让已有卡片扩展。
- `220px`：卡片通常希望保留的最小宽度。
- `min(100%, 220px)`：容器比 `220px` 更窄时，最小宽度以容器为限，避免固定下限导致溢出。
- `1fr`：分配剩余空间。

`auto-fill` 会保留空轨道，适合希望少量卡片仍保持列位置的情况；两者在没有空轨道时看起来可能一样。

### 案例二：左侧列表 + 右侧详情，内部各自滚动

这与项目的数字人页面布局类似。

```html
<div class="workspace">
  <aside class="list">列表内容</aside>
  <main class="detail">详情内容</main>
</div>
```

```css
.workspace {
  display: grid;
  height: 600px;
  grid-template-columns: minmax(280px, 2fr) minmax(0, 3fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
}
.list,
.detail {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
@media (max-width: 768px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }
}
```

容器有确定高度，行轨道允许收缩，内容区再设置 `overflow: auto`，滚动才能限制在面板内部。窄屏变为上下两行，各分配一半高度。

### 案例三：带顶栏与侧栏的后台框架

命名区域能直观表达页面结构，减少网格线数字的记忆负担。

```html
<div class="admin-layout">
  <header class="header">顶栏</header>
  <aside class="sidebar">菜单</aside>
  <main class="main">页面内容</main>
</div>
```

```css
.admin-layout {
  display: grid;
  height: 100dvh;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: 64px minmax(0, 1fr);
  grid-template-areas:
    "header header"
    "sidebar main";
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; overflow: auto; min-height: 0; }
.main { grid-area: main; overflow: auto; min-height: 0; min-width: 0; }
@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "header"
      "main";
  }
  .sidebar { display: none; }
}
```

同名区域必须组成一个完整矩形。该示例窄屏隐藏侧栏；实际产品若仍需菜单，应另提供抽屉或顶部导航入口。

### 案例四：两列表单，备注与按钮占整行

```html
<form class="settings-form">
  <label>姓名<input name="name" /></label>
  <label>邮箱<input name="email" type="email" /></label>
  <label class="wide">备注<textarea name="notes"></textarea></label>
  <div class="wide actions"><button type="submit">保存</button></div>
</form>
```

```css
.settings-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.settings-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.settings-form input,
.settings-form textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}
.wide { grid-column: 1 / -1; }
.actions { display: flex; justify-content: flex-end; }
@media (max-width: 640px) {
  .settings-form { grid-template-columns: minmax(0, 1fr); }
}
```

`1 / -1` 随显式列数变化，在两列和单列模式下都能保持占满整行。外层 Grid 负责字段排布，内层 Flex 负责标签和输入框的纵向排列。

### 案例五：仪表盘重点卡片跨列

```html
<div class="dashboard">
  <section class="chart">趋势图</section>
  <section>总访问量</section>
  <section>今日新增</section>
  <section class="report">完整报告</section>
</div>
```

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(120px, auto);
  gap: 16px;
}
.chart { grid-column: span 2; grid-row: span 2; }
.report { grid-column: 1 / -1; }
@media (max-width: 768px) {
  .dashboard { grid-template-columns: minmax(0, 1fr); }
  .chart { grid-column: auto; grid-row: auto; }
}
```

趋势图占两列两行，两张指标卡依次放在右侧，完整报告占据后续整行。窄屏时解除趋势图的跨行跨列，让内容恢复自然顺序。

## 7. 常见问题与排查

1. **列被长文本撑开**：检查 `1fr` 的最小尺寸，尝试 `minmax(0, 1fr)`，并处理网格项内部的文字、图片溢出。
2. **设置 overflow 却仍然撑高页面**：检查祖先高度是否受限、行轨道是否允许收缩，以及滚动项是否需要 `min-height: 0`。
3. **布局切换到单列后出现额外列**：检查旧的 `span 2` 或固定列线定位是否需要在断点内重置。
4. **items 和 content 对齐看不出区别**：前者控制子项在各自区域内的对齐，后者控制整个轨道集合在容器剩余空间中的分布。
5. **改变视觉顺序后键盘顺序不一致**：网格定位通常不改变 DOM 阅读和焦点顺序，应先保证 HTML 顺序合理。

可以在浏览器开发者工具中开启 Grid 网格线叠层，查看轨道尺寸、列线编号和间距，再缩小窗口检查断点行为。

## 8. Grid 与 Flex 如何选择

| 需求 | 可优先考虑 |
| --- | --- |
| 工具栏、图标加文字、单行操作按钮 | Flex |
| 统一控制多行多列、跨列卡片、页面区域划分 | Grid |
| 卡片外部按行列排列，内部标题与按钮对齐 | 外层 Grid + 内层 Flex |

二者可以组合使用。需要稳定的行列轨道时使用 Grid，需要沿主轴分配和对齐内容时使用 Flex。
