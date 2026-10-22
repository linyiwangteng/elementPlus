import type { Component } from 'vue'
import { ChatLineRound, DataBoard, Setting,Memo } from '@element-plus/icons-vue'

export interface MenuItemConfig {
  /** 菜单唯一标识；叶子菜单使用对应的路由路径。 */
  path: string
  label: string
  icon?: Component
  children?: MenuItemConfig[]
}

/** 左侧菜单配置，按数组顺序显示，支持多级子菜单。 */
export const sidebarMenu: MenuItemConfig[] = [
  { path: '/mock', label: '数据请求', icon: DataBoard },
  { path: '/', label: '工作台', icon: DataBoard },
  { path: '/settings', label: '系统设置', icon: Setting },
  {
    path: '/css',
    label: 'CSS',
    icon: Memo,
    children: [
      { path: '/css/flex', label: 'Flex 布局' },
      { path: '/css/grid', label: 'Grid 布局' },
    ],
  },
  {
    path: '/scripts',
    label: '话术管理',
    icon: ChatLineRound,
    children: [{ path: '/scripts/welcome', label: '欢迎语' }],
  },
  {
    path: '/scroll',
    label: '数字人列表',
    icon: Memo
  }
]
