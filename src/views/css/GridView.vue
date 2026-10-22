<script setup lang="ts">
import MarkdownDocument from '@/components/MarkdownDocument.vue'
import gridDocument from '@/docs/grid.md?raw'
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div><p>CSS</p><h1>Grid 布局</h1></div>
    </div>
    <el-card shadow="never">
      <template #header>二维布局：同时控制行与列</template>
      <p>以下容器使用 Grid 创建三列等宽布局，窄屏时调整为单列。</p>
      <div class="grid-demo">
        <div v-for="item in 6" :key="item" class="demo-item">子项 {{ item }}</div>
      </div>
      <pre>display: grid;
grid-template-columns: repeat(3, minmax(0, 1fr));
gap: 16px;

/* 窄屏时 */
grid-template-columns: 1fr;</pre>
    </el-card>
    <el-card shadow="never">
      <template #header>Grid 布局文档</template>
      <MarkdownDocument :content="gridDocument" />
    </el-card>
  </section>
</template>

<style scoped>
.grid-demo { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.demo-item { padding: 24px; border-radius: 8px; text-align: center; color: #2f6fed; background: #ecf5ff; }
p { color: #606266; line-height: 1.6; }
pre { padding: 16px; border-radius: 8px; background: #f5f7fb; overflow: auto; line-height: 1.6; }
@media (max-width: 768px) {
  .grid-demo { grid-template-columns: 1fr; }
}
</style>
