/// <reference types="vite/client" />

// 为普通 TypeScript 语言服务提供 Vue 单文件组件的模块类型。
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}
