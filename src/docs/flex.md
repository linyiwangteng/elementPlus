# Flex 布局指南

Flex 适合沿一个主要方向排列元素，例如导航栏、工具栏和卡片列表。

## 1. 创建 Flex 容器

给父元素设置 `display: flex`，它的直接子元素就会参与 Flex 布局。

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
```

## 2. 容器常用属性

| 属性 | 作用 | 常见取值 |
| --- | --- | --- |
| `flex-direction` | 设置主轴方向 | `row`、`column` |
| `justify-content` | 控制主轴上的对齐和空白分配 | `flex-start`、`center`、`space-between` |
| `align-items` | 控制交叉轴上的对齐 | `stretch`、`center`、`flex-start` |
| `flex-wrap` | 控制空间不足时是否换行 | `nowrap`、`wrap` |
| `gap` | 设置子项之间的间距 | `16px` |

> 默认主轴是水平方向。设置 `flex-direction: column` 后，主轴变为垂直方向，对齐属性对应的方向也会随之变化。

## 3. 理解子项的 flex

当前页面的子项使用：

```css
.item {
  flex: 1 1 160px;
}
```

- `flex-grow: 1`：允许子项按比例分配剩余空间。
- `flex-shrink: 1`：空间不足时允许子项收缩。
- `flex-basis: 160px`：以 `160px` 作为分配空间前的基础尺寸。

## 4. 实现内容区内部滚动

父容器需要有确定的高度约束，滚动子项设置 `min-height: 0` 和 `overflow: auto`。

```css
.panel {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
```

## 使用建议

1. 沿一个方向排列内容时，可以优先考虑 Flex。
2. 需要同时控制行列轨道时，可以使用 Grid。
3. 文本需要在弹性子项中省略时，通常要给该子项设置 `min-width: 0`。

## 5. 为什么文本省略经常需要 min-width: 0？

**`min-width: 0` 允许弹性子项缩小；省略号则由文字元素上的截断样式负责。两者解决的是布局和文字展示两个环节。**

### 5.1 已经设置 flex: 1，为什么还会撑开？

Flex 子项的 `min-width` 初始值是 `auto`。在常见的横向布局、默认 overflow 条件下，其主轴自动最小尺寸会受内容影响，而不是简单等于零。长链接、连续英文，以及设置了 `white-space: nowrap` 的文字，都可能让这个下限很大。

因此，子项即使允许收缩，也可能在达到这个内容下限后停止收缩，最终把相邻按钮挤出容器。

`flex: 1` 通常展开为 `flex: 1 1 0%`：它控制增长、收缩和基础尺寸，**没有重置 `min-width`**。基础尺寸为零也不代表最终尺寸可以无视最小宽度约束。

> 这里描述的是常见的非替换元素情况。自动最小尺寸还会受到指定尺寸、宽高比和 overflow 等因素影响，并非所有 Flex 子项都必须额外设置 `min-width: 0`。

### 5.2 用具体数字理解

假设一行内容区宽度为 `400px`，包含以下三部分：

| 部分 | 占用宽度 |
| --- | --- |
| 左侧图片 | 48px |
| 右侧按钮 | 80px |
| 两处间距 | 12px × 2 = 24px |
| 中间文本可用空间 | 400 − 48 − 80 − 24 = 248px |

如果中间文本的内容最小宽度是 `600px`，默认自动最小尺寸可能阻止它缩到 `248px`。布局会溢出，文本也就没有在预期的宽度内被截断。

设置 `min-width: 0` 后，文本区域允许缩到分配的 `248px`。随后截断样式才有机会在这个范围内显示省略号。

**0 是允许收缩的下限，不是最终宽度。** 最终宽度仍由 Flex 空间分配决定，内边距和边框等仍然占用空间。

### 5.3 省略号需要哪些条件？

```css
/* 参与外层 Flex 分配的子项 */
.text-area {
  flex: 1;
  min-width: 0;
}

/* 实际显示文字的元素 */
.title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

| 属性 | 解决的问题 |
| --- | --- |
| `flex: 1` | 让文字区域使用可分配的空间 |
| `min-width: 0` | 允许文字区域收缩到内容固有宽度以下 |
| `white-space: nowrap` | 让文字保持单行 |
| `overflow: hidden` | 隐藏超出文字盒子的内容 |
| `text-overflow: ellipsis` | 用省略号表示被截断的文本 |

需要有实际的宽度限制：例如父容器受页面宽度约束，文字区域占用剩余空间。无需总是给文字写死像素宽度。若 `.title` 是普通行内 `span`，通常还要设置 `display: block`；如果它本身是 Flex 子项，则会被块化。

### 5.4 应该加在哪个元素上？

加在**需要收缩的 Flex 子项**上，不一定是最终承载文字的标签。

```html
<div class="row">
  <div class="text-area">
    <h3 class="title">一段非常长的标题……</h3>
  </div>
  <button class="action">查看详情</button>
</div>
```

这里 `.row` 是 Flex 容器，它的直接子项是 `.text-area` 和 `.action`。应首先给 `.text-area` 设置 `min-width: 0`，再给 `.title` 设置截断样式。只在内层标题上设置最小宽度，不能解除外层子项的尺寸下限。

### 5.5 常见疑问

- **为什么直接设置 overflow: hidden 有时也能修复？** 它会影响 Flex 子项的自动最小尺寸计算，同时裁剪溢出内容。但它也可能裁掉阴影、角标等。单纯允许收缩时，用 `min-width: 0` 表达意图更明确，在文字元素上单独处理截断。
- **width: 0 和 min-width: 0 一样吗？** 不一样。`width` 参与首选尺寸和布局计算，`min-width` 定义尺寸下限。已有 `flex: 1` 的场景通常只需明确最小宽度，无需额外把宽度设为零。
- **为什么按钮也变窄了？** Flex 子项默认允许收缩。如果按钮必须保持完整，给它设置 `flex-shrink: 0`，并确保容器至少能容纳所有固定部分。
- **竖向布局对应什么？** 在默认横排文字、`flex-direction: column` 的布局中，内部滚动经常对应使用 `min-height: 0`，允许内容区在高度方向收缩。

## 6. 实战案例

### 案例一：图片 + 两行信息 + 详情按钮

这与项目中的数字人列表结构一致：左侧图片和右侧按钮保持尺寸，中间名称与 ID 分别省略。

```html
<div class="person-row">
  <img class="avatar" src="/avatar.png" alt="人物头像" />
  <div class="person-copy">
    <strong class="ellipsis">这是一个很长很长的数字人名称</strong>
    <span class="ellipsis">ID：1920437382834925568</span>
  </div>
  <button class="details">查看详情</button>
</div>
```

```css
.person-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 48px;
  height: 56px;
  object-fit: cover;
  flex-shrink: 0;
}
.person-copy {
  flex: 1;
  min-width: 0; /* 关键：让中间信息区域可以收缩 */
}
.ellipsis {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.details {
  flex-shrink: 0; /* 保留完整按钮 */
}
```

验证方法：给名称换成很长的连续英文，然后缩小窗口。名称与 ID 应出现省略号，按钮仍然可见。

### 案例二：工具栏标题省略，右侧操作固定

```html
<header class="toolbar">
  <h2 class="toolbar-title">项目名称 / 当前工作区 / 很长的页面标题</h2>
  <div class="toolbar-actions">
    <button>保存</button>
    <button>发布</button>
  </div>
</header>
```

```css
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
}
.toolbar-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
```

这里标题本身就是外层的直接 Flex 子项，所以空间分配、最小宽度和截断样式可以写在同一个元素上。屏幕极窄、连操作按钮都放不下时，需要另外设计换行或折叠菜单。

### 案例三：多层嵌套，内层加了仍然无效

```html
<div class="message-row">
  <div class="message-content">
    <div class="message-summary">
      <span class="badge">消息</span>
      <span class="message-title">VeryLongUnbrokenMessageTitleWithoutSpaces</span>
    </div>
  </div>
  <button class="message-action">打开</button>
</div>
```

```css
.message-row,
.message-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-content {
  flex: 1;
  min-width: 0; /* 外层 Flex 子项也必须允许收缩 */
}
.message-title {
  flex: 1;
  min-width: 0; /* 内层 Flex 子项允许收缩 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.badge,
.message-action {
  flex-shrink: 0;
}
```

排查重点：从文字开始向外检查，哪些祖先是 Flex 子项、哪些仍受内容最小尺寸限制。按实际层级解除限制，无需给页面所有元素统一设置 `min-width: 0`。

### 案例四：文件名保留扩展名，中间名称省略

```html
<div class="file-row">
  <span class="file-name">2026年度项目交付资料与验收记录最终修订版本</span>
  <span class="file-extension">.pdf</span>
</div>
```

```css
.file-row {
  display: flex;
  max-width: 280px;
}
.file-name {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.file-extension {
  flex-shrink: 0;
}
```

文件名可以收缩，扩展名保持完整，效果类似 `2026年度项目交付资料… .pdf`，实际没有额外空格。这里文件名使用默认的 `flex-shrink: 1` 即可，并不一定要设置 `flex: 1`。

### 遇到省略号不生效时的检查顺序

1. 容器是否有可确定的可用宽度，还是会跟着内容无限变宽？
2. 找到需要收缩的直接 Flex 子项，检查它及相关祖先的最小尺寸。
3. 给需要解除宽度下限的子项设置 `min-width: 0`。
4. 在真正显示文字的盒子上设置单行截断三件套。
5. 检查固定按钮、图片是否需要 `flex-shrink: 0`，以及固定部分是否已经超出容器宽度。

参考：[W3C Flexbox 自动最小尺寸规则](https://www.w3.org/TR/css-flexbox-1/#min-size-auto)、[MDN text-overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow)。
