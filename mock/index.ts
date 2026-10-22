import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import list from './datas/list'

// 新接口在此注册；仅在 Vite 开发服务与本地预览中提供。
export function mockApi(): Plugin {
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/')) return next()

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    const send = (status: number, data: unknown, message: string) => {
      res.statusCode = status
      res.end(JSON.stringify({ code: status === 200 ? 0 : status, message, data }))
    }
    if (url.pathname !== '/api/templates') return send(404, null, '接口不存在')
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return send(405, null, '请求方法不支持')
    }

    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      return send(400, null, 'page 必须为正整数，pageSize 必须为 1–100 的整数')
    }
    const keyword = (url.searchParams.get('keyword') ?? '').trim().toLowerCase()
    const items = list.detailList.filter(item => item.name.toLowerCase().includes(keyword))
    setTimeout(() => send(200, {
      list: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize,
    }, 'success'), 300)
  }

  return {
    name: 'local-mock-api',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}
