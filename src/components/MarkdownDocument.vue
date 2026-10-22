<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()
const html = computed(() => DOMPurify.sanitize(marked.parse(props.content, { async: false, gfm: true })))
</script>

<template>
  <article class="markdown-document" v-html="html" />
</template>

<style scoped>
.markdown-document { color: #303133; line-height: 1.8; overflow-wrap: anywhere; }
.markdown-document :deep(h1), .markdown-document :deep(h2), .markdown-document :deep(h3) { margin: 24px 0 12px; line-height: 1.4; color: #172033; }
.markdown-document :deep(> :first-child) { margin-top: 0; }
.markdown-document :deep(p), .markdown-document :deep(ul), .markdown-document :deep(ol) { margin: 12px 0; }
.markdown-document :deep(pre) { padding: 16px; overflow: auto; border-radius: 8px; background: #f5f7fb; line-height: 1.6; }
.markdown-document :deep(code) { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; }
.markdown-document :deep(:not(pre) > code) { padding: 2px 5px; border-radius: 4px; color: #c45656; background: #f5f7fb; }
.markdown-document :deep(blockquote) { margin: 16px 0; padding: 4px 16px; border-left: 4px solid #409eff; color: #606266; background: #ecf5ff; }
.markdown-document :deep(table) { display: block; max-width: 100%; overflow: auto; border-collapse: collapse; }
.markdown-document :deep(th), .markdown-document :deep(td) { padding: 8px 12px; border: 1px solid #e5e9f2; text-align: left; }
.markdown-document :deep(th) { background: #f5f7fb; }
.markdown-document :deep(a) { color: #2f6fed; }
.markdown-document :deep(img) { max-width: 100%; height: auto; }
.markdown-document :deep(hr) { margin: 24px 0; border: 0; border-top: 1px solid #e5e9f2; }
</style>
