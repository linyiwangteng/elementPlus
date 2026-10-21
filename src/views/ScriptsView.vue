<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Delete, EditPen, Plus, Promotion } from '@element-plus/icons-vue'

const USER_TOKEN = '用户名'
const MAX_LENGTH = 50
const MAX_SCRIPT_COUNT = 10
const TOKEN_SELECTOR = '[data-fixed-token="username"]'

const enabled = ref(true)
const editorRef = ref<HTMLDivElement | null>(null)
const editorVisible = ref(false)
const editingIndex = ref<number | null>(null)
const scripts = ref<string[]>([
  '欢迎 用户名 宝宝进入直播间，咱们最后一天优惠活动了，有需要抓紧下单啦～',
])
const editorText = ref('')

const currentLength = computed(() => editorText.value.length)
const isScriptLimitReached = computed(() => scripts.value.length >= MAX_SCRIPT_COUNT)
const listTip = computed(() => `${scripts.value.length}/${MAX_SCRIPT_COUNT}随机匹配一条输出`)

const splitScriptByToken = (content: string) =>
  content.split(USER_TOKEN).flatMap((text, index, list) => {
    const parts: Array<{ type: 'text' | 'token'; value: string }> = []

    if (text) {
      parts.push({ type: 'text', value: text })
    }

    if (index < list.length - 1) {
      parts.push({ type: 'token', value: USER_TOKEN })
    }

    return parts
  })

const createTokenNode = () => {
  const token = document.createElement('span')

  token.className = 'welcome-token'
  token.dataset.fixedToken = 'username'
  token.contentEditable = 'false'
  token.textContent = USER_TOKEN

  return token
}

const syncEditorText = () => {
  editorText.value = serializeEditor()
}

const trimEditorToMaxLength = () => {
  const editor = editorRef.value

  if (!editor || serializeEditor().length <= MAX_LENGTH) {
    return
  }

  let remaining = MAX_LENGTH

  Array.from(editor.childNodes).forEach((node) => {
    if (remaining <= 0) {
      node.remove()
      return
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''

      if (text.length > remaining) {
        node.textContent = text.slice(0, remaining)
      }

      remaining -= node.textContent?.length ?? 0
      return
    }

    remaining -= USER_TOKEN.length
  })

  placeCaretAtEnd(editor)
}

const placeCaret = (node: Node, offset: number) => {
  const selection = window.getSelection()
  const range = document.createRange()

  range.setStart(node, offset)
  range.collapse(true)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const placeCaretAtEnd = (element: HTMLElement) => {
  const lastNode = element.lastChild

  if (lastNode?.nodeType === Node.TEXT_NODE) {
    placeCaret(lastNode, lastNode.textContent?.length ?? 0)
    return
  }

  const range = document.createRange()
  const selection = window.getSelection()

  range.selectNodeContents(element)
  range.collapse(false)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const setEditorContent = (content: string) => {
  const editor = editorRef.value

  if (!editor) {
    return
  }

  editor.textContent = ''

  splitScriptByToken(content).forEach((part) => {
    if (part.type === 'token') {
      editor.append(createTokenNode())
      return
    }

    editor.append(document.createTextNode(part.value))
  })

  placeCaretAtEnd(editor)
  syncEditorText()
}

const addWelcome = async () => {
  if (isScriptLimitReached.value) {
    return
  }

  editingIndex.value = null
  editorVisible.value = true
  await nextTick()
  // setEditorContent('欢迎 用户名 宝宝进入直播间，')
  editorRef.value?.focus()
}

const handleInput = () => {
  trimEditorToMaxLength()
  syncEditorText()
}

const serializeEditor = () => {
  const editor = editorRef.value

  if (!editor) {
    return ''
  }

  return Array.from(editor.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').replace(/\u00a0/g, '')
      }

      if (node instanceof HTMLElement && node.matches(TOKEN_SELECTOR)) {
        return USER_TOKEN
      }

      return node.textContent ?? ''
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

const saveWelcome = () => {
  const content = serializeEditor()

  if (!content || content.length > MAX_LENGTH) {
    editorVisible.value = false
    editingIndex.value = null
    return
  }

  if (editingIndex.value !== null) {
    scripts.value[editingIndex.value] = content
  } else if (!isScriptLimitReached.value) {
    scripts.value.unshift(content)
  }

  editorVisible.value = false
  editingIndex.value = null
}

const cancelEdit = () => {
  editorVisible.value = false
  editingIndex.value = null
}

const findTokenNearCaret = (event: KeyboardEvent) => {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return null
  }

  const range = selection.getRangeAt(0)
  const container = range.startContainer
  const offset = range.startOffset

  if (event.key === 'Backspace') {
    if (
      container.nodeType === Node.TEXT_NODE &&
      (container.textContent ?? '').slice(0, offset).trim() === ''
    ) {
      return container.previousSibling
    }

    if (container === editorRef.value && offset > 0) {
      return editorRef.value.childNodes[offset - 1]
    }
  }

  if (event.key === 'Delete') {
    if (
      container.nodeType === Node.TEXT_NODE &&
      (container.textContent ?? '').slice(offset).trim() === ''
    ) {
      return container.nextSibling
    }

    if (container === editorRef.value) {
      return editorRef.value.childNodes[offset]
    }
  }

  return null
}

const removeTokenNearCaret = (event: KeyboardEvent) => {
  if (event.key !== 'Backspace' && event.key !== 'Delete') {
    return
  }

  const target = findTokenNearCaret(event)

  if (target instanceof HTMLElement && target.matches(TOKEN_SELECTOR)) {
    event.preventDefault()
    const caretNode = event.key === 'Backspace' ? target.nextSibling : target.previousSibling
    target.remove()

    if (caretNode?.nodeType === Node.TEXT_NODE) {
      placeCaret(caretNode, event.key === 'Backspace' ? 0 : caretNode.textContent?.length ?? 0)
    }

    syncEditorText()
  }
}

const insertUsername = () => {
  const editor = editorRef.value
  const selection = window.getSelection()

  if (!editor || !selection || selection.rangeCount === 0) {
    return
  }

  if (serializeEditor().length + USER_TOKEN.length > MAX_LENGTH) {
    return
  }

  const range = selection.getRangeAt(0)

  if (!editor.contains(range.commonAncestorContainer)) {
    placeCaretAtEnd(editor)
  }

  const currentRange = selection.getRangeAt(0)
  const afterToken = document.createTextNode(' ')
  currentRange.deleteContents()
  currentRange.insertNode(afterToken)
  currentRange.insertNode(createTokenNode())
  placeCaret(afterToken, 1)
  syncEditorText()
}

const editWelcome = async (index: number) => {
  editingIndex.value = index
  editorVisible.value = true
  await nextTick()
  setEditorContent(scripts.value[index])
  editorRef.value?.focus()
}

const deleteWelcome = (index: number) => {
  scripts.value.splice(index, 1)

  if (editingIndex.value === index) {
    cancelEdit()
    return
  }

  if (editingIndex.value !== null && index < editingIndex.value) {
    editingIndex.value -= 1
  }
}
</script>

<template>
  <section class="welcome-page">
    <div class="welcome-setting">
      <div class="welcome-top">
        <div class="welcome-title-wrap">
          <el-icon class="welcome-title-icon"><Promotion /></el-icon>
          <div>
            <h1>欢迎语</h1>
            <p>主动欢迎用户进入直播间，用专属问候激活参与感，提高互动率</p>
          </div>
        </div>
        <el-switch v-model="enabled" />
      </div>

      <div class="welcome-card">
        <div class="welcome-card-top">
          <div class="welcome-list-heading">
            <span>欢迎语列表</span>
            <em>{{ listTip }}</em>
          </div>
          <el-button
            class="outline-action"
            :disabled="isScriptLimitReached"
            :icon="Plus"
            @click="addWelcome"
          >
            添加欢迎语
          </el-button>
        </div>

        <p class="welcome-tip">点击「插入用户名」添加变量；它是一个整体，删除时整体删除，直播时自动替换为用户昵称</p>

        <div v-if="editorVisible" class="welcome-editor-panel">
          <div
            ref="editorRef"
            class="welcome-editor"
            contenteditable="true"
            role="textbox"
            aria-label="欢迎语内容"
            @input="handleInput"
            @keydown="removeTokenNearCaret"
          />

          <div class="welcome-editor-footer">
            <el-button class="insert-token-btn" :icon="Plus" @mousedown.prevent @click="insertUsername">
              插入用户名
            </el-button>
            <span class="count-text">{{ currentLength }}/{{ MAX_LENGTH }}</span>
            <el-button class="compact-btn" @mousedown.prevent @click="cancelEdit">取消</el-button>
            <el-button class="compact-btn primary" type="primary" @mousedown.prevent @click="saveWelcome">保存</el-button>
          </div>
        </div>

        <div class="welcome-list">
          <div v-for="(item, index) in scripts" :key="`${item}-${index}`" class="welcome-list-item">
            <p class="welcome-list-content">
              <template
                v-for="(part, partIndex) in splitScriptByToken(item)"
                :key="`${part.type}-${part.value}-${partIndex}`"
              >
                <span v-if="part.type === 'token'" class="welcome-list-token">{{ part.value }}</span>
                <template v-else>{{ part.value }}</template>
              </template>
            </p>
            <div class="welcome-list-actions">
              <el-button class="welcome-icon-btn" :icon="EditPen" aria-label="编辑欢迎语" @click="editWelcome(index)" />
              <el-button class="welcome-icon-btn" :icon="Delete" aria-label="删除欢迎语" @click="deleteWelcome(index)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
