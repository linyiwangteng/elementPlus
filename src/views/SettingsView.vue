<script setup lang="ts">
import { reactive } from 'vue'

interface SettingsForm {
  projectName: string
  enableCache: boolean
  theme: string
}

const form = reactive<SettingsForm>({
  projectName: 'Vue3 TS Element Plus',
  enableCache: true,
  theme: 'light',
})
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p>Settings</p>
        <h1>系统设置</h1>
      </div>
    </div>

    <el-card shadow="never">
      <el-form :model="form" label-width="96px">
        <el-form-item label="项目名称">
          <el-input v-model="form.projectName" />
        </el-form-item>
        <el-form-item label="启用缓存">
          <el-switch v-model="form.enableCache" />
        </el-form-item>
        <el-form-item label="主题模式">
          <el-segmented v-model="form.theme" :options="['light', 'dark', 'system']" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>
