<!-- 启用 Vue 单文件组件的 TypeScript setup 语法。 -->
<script setup lang="ts">
// 导入计算属性、挂载与卸载生命周期以及响应式引用。
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
// 导入列表请求函数和列表项类型。
import { getTemplates, type TemplateItem } from '@/api/templates'
// 固定每行高度为 88 像素，供虚拟列表计算位置。
const ROW_HEIGHT = 88
// 在可视区域前后各额外渲染 4 行，减少滚动时出现空白。
const OVERSCAN = 4
// 保存左侧滚动容器的 DOM 引用。
const viewport = ref<HTMLElement>()
// 保存滚动容器高度，挂载后通过尺寸观察器更新。
const viewportHeight = ref(480)
// 保存当前滚动距离。
const scrollTop = ref(0)
// 保存接口返回的完整列表。
const items = ref<TemplateItem[]>([])
// 保存当前点击的列表项，未选择时为 null。
const selected = ref<TemplateItem | null>(null)
// 标记请求是否进行中，用于加载提示和防止重复请求。
const loading = ref(false)
// 保存请求失败时展示的错误信息。
const error = ref('')
// 保存尺寸观察器，方便卸载时清理。
let observer: ResizeObserver | undefined
// 标记组件是否已卸载，避免异步请求完成后继续更新状态。
let disposed = false

// 计算渲染起始下标，向上预留缓冲行并保证下标不小于零。
const start = computed(() => Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN))
// 计算渲染结束下标，限制其不超过列表长度。
const end = computed(() => Math.min(items.value.length,
  // 根据滚动距离和容器高度计算可视末行，再追加缓冲行。
  Math.ceil((scrollTop.value + viewportHeight.value) / ROW_HEIGHT) + OVERSCAN))
// 截取当前需要渲染的条目，避免为完整列表创建 DOM。
const visibleItems = computed(() => items.value.slice(start.value, end.value))

// 处理列表容器的滚动事件。
function onScroll(event: Event) {
  // 读取实际触发监听的滚动容器位置，更新可视范围。
  scrollTop.value = (event.currentTarget as HTMLElement).scrollTop
// 结束滚动事件处理函数。
}
// 异步加载全部列表数据。
async function load() {
  // 已有请求执行时直接退出，避免重复刷新。
  if (loading.value) return
  // 开启加载状态。
  loading.value = true
  // 清空上一次请求的错误提示。
  error.value = ''
  // 捕获接口请求及结果处理过程中的异常。
  try {
    // 请求第一页，每页 100 条，不设置搜索关键词。
    const first = await getTemplates({ page: 1, pageSize: 100, keyword: '' })
    // 复制第一页数据，作为后续分页追加的结果数组。
    const result = [...first.list]
    // 根据总条数逐页获取剩余数据。
    for (let page = 2; page <= Math.ceil(first.total / 100); page++) {
      // 组件已卸载时停止发起后续分页请求。
      if (disposed) return
      // 请求当前页的数据。
      const next = await getTemplates({ page, pageSize: 100, keyword: '' })
      // 将当前页条目追加到结果数组。
      result.push(...next.list)
    // 结束分页获取循环。
    }
    // 请求期间组件若已卸载，停止更新页面状态。
    if (disposed) return
    // 将完整结果写入响应式列表。
    items.value = result
    // 刷新后按 ID 保留选中项；原条目不存在时清空选择。
    selected.value = result.find(item => item.id === selected.value?.id) ?? null
    // 将用于虚拟计算的滚动距离重置为零。
    scrollTop.value = 0
    // 同步将真实滚动容器返回顶部。
    if (viewport.value) viewport.value.scrollTop = 0
  // 处理加载过程中抛出的异常。
  } catch (reason) {
    // 组件仍存在时展示错误信息，未知异常使用默认提示。
    if (!disposed) error.value = reason instanceof Error ? reason.message : '加载失败，请重试'
  // 无论请求成功或失败，都执行收尾处理。
  } finally {
    // 组件仍存在时结束加载状态。
    if (!disposed) loading.value = false
  // 结束请求收尾处理。
  }
// 结束列表加载函数。
}
// 组件挂载后初始化尺寸监听和数据请求。
onMounted(() => {
  // 创建尺寸观察器，使虚拟列表适应容器高度变化。
  observer = new ResizeObserver(entries => {
    // 读取本次尺寸变化通知中的第一个观察目标。
    const entry = entries[0]
    // 用容器内容区域的实际高度更新虚拟列表计算参数。
    if (entry) viewportHeight.value = entry.contentRect.height
  // 结束尺寸变化回调。
  })
  // 开始观察已挂载的左侧滚动容器。
  if (viewport.value) observer.observe(viewport.value)

  // 发起首次加载，异常在 load 内部处理。
  void load()
// 结束挂载生命周期回调。
})
// 组件卸载前执行资源清理。
onBeforeUnmount(() => {
  // 标记组件已卸载，阻止异步任务继续更新页面。
  disposed = true
  // 断开尺寸观察器，释放 DOM 监听资源。
  observer?.disconnect()
// 结束卸载生命周期回调。
})
// 结束 TypeScript 脚本区域。
</script>

<!-- 定义页面模板结构。 -->
<template>
  <!-- 页面主体，限制整体高度并按纵向排列标题与内容。 -->
  <section class="scroll-page">
    <!-- 页面标题与刷新操作区域。 -->
    <div class="page-heading">
      <!-- 显示英文说明和数字人列表标题。 -->
      <div><p>Digital Humans</p><h1>虚拟列表-数字人列表</h1></div>
      <!-- 点击刷新重新请求数据，请求期间显示加载状态。 -->
      <el-button :loading="loading" @click="load">刷新列表</el-button>
    <!-- 结束当前div容器。 -->
    </div>
    <!-- 请求失败时展示错误提示。 -->
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
    <!-- 左右分栏布局，分别承载列表与详情。 -->
    <div class="split-panels">
      <!-- 左侧列表面板，提供可访问区域名称。 -->
      <section class="list-panel" aria-label="数字人列表">
        <!-- 展示列表标题与当前数据总条数。 -->
        <div class="panel-heading"><strong>数字人</strong><span>共 {{ items.length }} 条</span></div>
        <!-- 绑定独立滚动容器、加载遮罩、键盘焦点及滚动事件。 -->
        <div ref="viewport" v-loading="loading" class="list-viewport" tabindex="0" aria-label="可滚动的数字人列表" @scroll="onScroll">
          <!-- 加载结束且列表为空时展示空数据或失败提示。 -->
          <el-empty v-if="!loading && !items.length" :description="error ? '加载失败，请点击刷新重试' : '暂无数据'" />
          <!-- 以总条数乘行高撑起完整滚动高度。 -->
          <div class="virtual-spacer" :style="{ height: `${items.length * ROW_HEIGHT}px` }">
            <!-- 将实际渲染的窗口平移到起始条目对应位置。 -->
            <div class="virtual-window" :style="{ transform: `translateY(${start * ROW_HEIGHT}px)` }">
              <!-- 只遍历可视条目，绑定唯一 ID、选中高亮和固定行高。 -->
              <article v-for="item in visibleItems" :key="item.id" class="list-row" :class="{ selected: selected?.id === item.id }" :style="{ height: `${ROW_HEIGHT}px` }">
                <!-- 显示缩略图，优先使用 thumbUrl，其次使用人物图或海报。 -->
                <el-image class="row-thumbnail" :src="item.thumbUrl || item.showPicUrl || item.posterPicUrl" :alt="item.name" fit="cover">
                  <!-- 图片加载期间显示占位内容。 -->
                  <template #placeholder><span class="thumbnail-placeholder">加载中</span></template>
                  <!-- 图片缺失或加载失败时显示占位内容。 -->
                  <template #error><span class="thumbnail-placeholder">暂无图片</span></template>
                <!-- 结束当前el-image容器。 -->
                </el-image>
                <!-- 行内文字区域，允许收缩以保留图片与按钮空间。 -->
                <div class="row-copy">
                  <!-- 展示名称，悬停可查看完整文本。 -->
                  <strong :title="item.name">{{ item.name }}</strong>
                  <!-- 展示条目 ID，悬停可查看完整 ID。 -->
                  <span :title="item.id">ID：{{ item.id }}</span>
                <!-- 结束当前div容器。 -->
                </div>
                <!-- 点击后更新选中条目，并为当前选中按钮应用主色。 -->
                <el-button size="small" :type="selected?.id === item.id ? 'primary' : 'default'" :aria-label="`查看${item.name}的详情`" @click="selected = item">查看详情</el-button>
              <!-- 结束当前article容器。 -->
              </article>
            <!-- 结束当前div容器。 -->
            </div>
          <!-- 结束当前div容器。 -->
          </div>
        <!-- 结束当前div容器。 -->
        </div>
      <!-- 结束当前section容器。 -->
      </section>
      <!-- 右侧详情面板，展示当前点击项的信息。 -->
      <section class="detail-panel" aria-label="当前数字人详情">
        <!-- 显示详情标题，选中条目后显示状态标签。 -->
        <div class="panel-heading"><strong>详情</strong><el-tag v-if="selected" size="small">已选择</el-tag></div>
        <!-- 详情内容容器，超出高度时独立滚动。 -->
        <div class="detail-body">
          <!-- 只有选中条目时才渲染详情字段。 -->
          <template v-if="selected">
            <!-- 将选中条目的名称显示为详情标题。 -->
            <h2>{{ selected.name }}</h2>
            <!-- 使用单列带边框的描述表展示字段。 -->
            <el-descriptions :column="1" border>
              <!-- 展示选中条目的ID。 -->
              <el-descriptions-item label="ID">{{ selected.id }}</el-descriptions-item>
              <!-- 展示选中条目的名称。 -->
              <el-descriptions-item label="名称">{{ selected.name }}</el-descriptions-item>
              <!-- 展示选中条目的画布类型。将竖屏和横屏枚举转换为中文，其他值原样显示。 -->
              <el-descriptions-item label="画布类型">{{ selected.canvasType === 'PORTRAIT' ? '竖屏' : selected.canvasType === 'LANDSCAPE' ? '横屏' : selected.canvasType }}</el-descriptions-item>
              <!-- 展示选中条目的状态。字段缺失时显示破折号。 -->
              <el-descriptions-item label="状态">{{ selected.status ?? '—' }}</el-descriptions-item>
              <!-- 展示选中条目的来源。字段缺失时显示破折号。 -->
              <el-descriptions-item label="来源">{{ selected.source ?? '—' }}</el-descriptions-item>
              <!-- 展示选中条目的适用平台。字段缺失时显示破折号。 -->
              <el-descriptions-item label="适用平台">{{ selected.templateType ?? '—' }}</el-descriptions-item>
              <!-- 展示选中条目的创建时间。 -->
              <el-descriptions-item label="创建时间">{{ selected.createTime }}</el-descriptions-item>
              <!-- 展示选中条目的更新时间。字段缺失时显示破折号。 -->
              <el-descriptions-item label="更新时间">{{ selected.updateTime ?? '—' }}</el-descriptions-item>
              <!-- 展示选中条目的使用次数。字段缺失时显示破折号。 -->
              <el-descriptions-item label="使用次数">{{ selected.extendedDetail?.useCount ?? '—' }}</el-descriptions-item>
            <!-- 结束当前el-descriptions容器。 -->
            </el-descriptions>
          <!-- 结束当前template容器。 -->
          </template>
          <!-- 未选择条目时提示用户点击左侧详情按钮。 -->
          <el-empty v-else description="点击左侧的「查看详情」查看当前项" />
        <!-- 结束当前div容器。 -->
        </div>
      <!-- 结束当前section容器。 -->
      </section>
    <!-- 结束当前div容器。 -->
    </div>
  <!-- 结束当前section容器。 -->
  </section>
<!-- 结束页面模板。 -->
</template>
<!-- 启用仅作用于当前组件的样式。 -->
<style scoped>
/* 页面高度扣除顶栏与外边距，设置最小高度并纵向排列内容。 */
.scroll-page { height: calc(100dvh - 112px); min-height: 320px; display: flex; flex-direction: column; gap: 16px; }
/* 内容区占满剩余高度，左右两列按 2:3 分配空间并限制最小宽度。 */
.split-panels { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(300px, 2fr) minmax(280px, 3fr); gap: 16px; }
/* 统一面板边框、圆角、白色背景和纵向布局，防止内容撑开面板。 */
.list-panel, .detail-panel { min-height: 0; min-width: 0; display: flex; flex-direction: column; border: 1px solid #e5e9f2; border-radius: 10px; background: white; overflow: hidden; }
/* 面板标题栏禁止收缩，设置内边距、对齐方式和底部分隔线。 */
.panel-heading { flex-shrink: 0; min-height: 54px; padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #edf0f6; }
/* 标题栏的辅助文字采用小字号和灰色。 */
.panel-heading span { font-size: 12px; color: #7a8499; }
/* 列表区域占满面板剩余高度并独立滚动，阻止滚动传递到外层。 */
.list-viewport { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; }
/* 为虚拟窗口提供相对定位的参照，同时由内联高度撑开滚动范围。 */
.virtual-spacer { position: relative; }
/* 虚拟窗口绝对定位并横向铺满，实际纵向位置由 transform 控制。 */
.virtual-window { position: absolute; top: 0; left: 0; right: 0; }
/* 每行使用边框盒计算尺寸，横向排列图片、文字和按钮并垂直居中。 */
.list-row { box-sizing: border-box; padding: 16px; display: flex; gap: 12px; align-items: center; justify-content: space-between; border-bottom: 1px solid #edf0f6; }
/* 鼠标悬停时使用浅灰背景。 */
.list-row:hover { background: #f5f7fb; }
/* 选中行使用浅蓝背景和左侧蓝色标记。 */
.list-row.selected { background: #ecf5ff; box-shadow: inset 3px 0 #409eff; }
/* 固定缩略图尺寸并禁止收缩，设置圆角和加载背景。 */
.row-thumbnail { width: 48px; height: 56px; flex-shrink: 0; border-radius: 6px; background: #f2f4f8; }
/* 图片占位内容居中显示，使用灰色小字号。 */
.thumbnail-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #909399; font-size: 10px; }
/* 文字区域占满剩余宽度，允许收缩并纵向排列名称与 ID。 */
.row-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
/* 名称与 ID 超出可用宽度时单行省略显示。 */
.row-copy strong, .row-copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* ID 使用灰色小字号，降低次要信息的视觉权重。 */
.row-copy span { font-size: 12px; color: #7a8499; }
/* 详情内容独立滚动，长文本允许换行并阻止滚动传递。 */
.detail-body { flex: 1; min-height: 0; padding: 20px; overflow: auto; overflow-wrap: anywhere; overscroll-behavior: contain; }
/* 详情标题设置字号与下方间距。 */
.detail-body h2 { margin: 0 0 20px; font-size: 20px; }
/* 以下规则适用于宽度不超过 768 像素的窄屏。 */
@media (max-width: 768px) {
  /* 窄屏页面按较小的主区域内边距重新计算可用高度。 */
  .scroll-page { height: calc(100dvh - 96px); }
  /* 窄屏时将左右分栏改为上下两行，各占一半高度。 */
  .split-panels { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
  /* 窄屏列表行缩小内边距。 */
  .list-row { padding: 12px; }
/* 结束窄屏媒体查询。 */
}
/* 结束组件样式区域。 */
</style>
