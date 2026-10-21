<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'
import { sidebarMenu } from '@/config/menu'
</script>

<template>
  <el-config-provider>
    <el-container class="app-shell">
      <el-aside class="app-sidebar" width="240px">
        <div class="brand">
          <div class="brand-mark">V</div>
          <div>
            <strong>Vue Admin</strong>
            <span>Vue3 全家桶</span>
          </div>
        </div>

        <el-menu router :default-active="$route.path" class="nav-menu">
          <SidebarMenuItem v-for="item in sidebarMenu" :key="item.path" :item="item" />
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="app-header">
          <el-button :icon="Menu" circle />
          <div class="header-actions">
            <el-tag type="success" effect="dark">Element Plus</el-tag>
            <el-avatar :size="34">TS</el-avatar>
          </div>
        </el-header>

        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>
