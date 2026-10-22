import { request } from '@/utils/request'

export interface TemplateItem {
  id: string
  name: string
  canvasType: string
  createTime: string
  thumbUrl?: string
  showPicUrl?: string
  posterPicUrl?: string
  updateTime?: string
  status?: string
  source?: string
  templateType?: string
  extendedDetail?: { useCount: string }
}

export interface TemplatePage {
  list: TemplateItem[]
  total: number
  page: number
  pageSize: number
}

export function getTemplates(params: { page: number; pageSize: number; keyword: string }) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    keyword: params.keyword,
  })
  return request<TemplatePage>(`/api/templates?${query}`)
}
