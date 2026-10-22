<script setup lang="ts">
import MarkdownDocument from '@/components/MarkdownDocument.vue'
import flexDocument from '@/docs/flex.md?raw'
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div><p>CSS</p><h1>Flex 布局</h1></div>
    </div>
    <el-card shadow="never">
      <template #header>一维布局：沿主轴排列元素</template>
      <p>以下容器使用 Flex 横向排列，空间不足时自动换行，子项平分剩余空间。</p>
      <div class="flex-demo">
        <div v-for="item in 6" :key="item" class="demo-item">子项 {{ item }}</div>
      </div>
      <pre>display: flex;
          flex-wrap: wrap;
          gap: 16px;

          /* 子项 */
          flex: 1 1 160px;</pre>
    </el-card>


    <div class="person-row">
      <img class="avatar" src="" alt="人物头像" />
      <div class="person-copy">
        <strong class="ellipsis">这是一个很长很长的数字人名称</strong>
        <span class="ellipsis">ID：1920437382834925568</span>
      </div>
      <button class="details">查看详情</button>
    </div>

    <el-card shadow="never">
      <template #header>Flex 布局文档</template>
      <MarkdownDocument :content="flexDocument" />
    </el-card>
  </section>
</template>

<style scoped>
.flex-demo { display: flex; flex-wrap: wrap; gap: 16px; }
.demo-item { flex: 1 1 160px; padding: 24px; border-radius: 8px; text-align: center; color: #2f6fed; background: #ecf5ff; }
p { color: #606266; line-height: 1.6; }
pre { padding: 16px; border-radius: 8px; background: #f5f7fb; overflow: auto; line-height: 1.6; }
</style>


<style lang="less" scoped>
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
</style>
