<script setup lang="ts">
import { Aim, Refresh, TrendCharts } from '@element-plus/icons-vue'

import { useCounterStore } from '@/stores/useCounterStore'

const counter = useCounterStore()
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p>Dashboard</p>
        <h1>工作台</h1>
      </div>
      <el-button type="primary" :icon="Aim" @click="counter.increment">增加计数</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>当前计数</template>
          <div class="metric">{{ counter.count }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>双倍计数</template>
          <div class="metric">{{ counter.doubleCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>技术栈</template>
          <el-space wrap>
            <el-tag>Vue 3</el-tag>
            <el-tag type="success">TypeScript</el-tag>
            <el-tag type="warning">Pinia</el-tag>
            <el-tag type="danger">Element Plus</el-tag>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="content-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>项目状态</span>
          <el-button :icon="Refresh" @click="counter.reset">重置</el-button>
        </div>
      </template>

      <el-empty description="可以从这里继续添加业务模块">
        <el-button type="primary" :icon="TrendCharts">创建模块</el-button>
      </el-empty>
    </el-card>
  </section>
</template>
