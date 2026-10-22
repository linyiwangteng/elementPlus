interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(path, { ...options, signal: options.signal ?? controller.signal })
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('接口未返回 JSON，请检查 API 服务是否启动')
    }
    const result = await response.json() as ApiResponse<T>
    if (!response.ok || result.code !== 0) throw new Error(result.message || `请求失败：${response.status}`)
    return result.data
  } finally {
    clearTimeout(timeout)
  }
}
