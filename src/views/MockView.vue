<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getTemplates, type TemplateItem } from '@/api/templates'

const items = ref<TemplateItem[]>([])
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const error = ref('')
let requestId = 0

async function load() {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const result = await getTemplates({ page: page.value, pageSize: 10, keyword: keyword.value })
    if (id !== requestId) return
    items.value = result.list
    total.value = result.total
  } catch (reason) {
    if (id !== requestId) return
    items.value = []
    total.value = 0
    error.value = reason instanceof Error ? reason.message : '请求失败，请重试'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function search() {
  page.value = 1
  void load()
}

onMounted(load)
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div><p>Templates</p><h1>数据请求</h1></div>
      <el-button :loading="loading" @click="load">刷新</el-button>
    </div>
    <el-card shadow="never">
      <el-form inline @submit.prevent="search">
        <el-form-item label="模板名称">
          <el-input v-model="keyword" placeholder="请输入模板名称" clearable />
        </el-form-item>
        <el-form-item><el-button type="primary" native-type="submit">搜索</el-button></el-form-item>
      </el-form>
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
      <el-table v-loading="loading" :data="items" empty-text="暂无数据">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="id" label="ID" min-width="190" />
        <el-table-column prop="canvasType" label="画布类型" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
      </el-table>
      <el-pagination v-model:current-page="page" :page-size="10" :total="total"
        layout="total, prev, pager, next" :disabled="loading" @current-change="load" />
    </el-card>
  </section>
</template>
