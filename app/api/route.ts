import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const register = (email: string, password: string, full_name?: string) =>
  API.post('/api/v1/auth/register', { email, password, full_name })

export const login = async (email: string, password: string) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const res = await API.post('/api/v1/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data
}

export const sendChat = (query: string, portfolio_id?: number) =>
  API.post('/api/v1/chat', { query, portfolio_id }).then((r) => r.data)

export const getStock = (ticker: string) =>
  API.get(`/api/v1/stocks/${ticker}`).then((r) => r.data)

export const getFundamentals = (ticker: string) =>
  API.get(`/api/v1/stocks/${ticker}/fundamentals`).then((r) => r.data)

export const createPortfolio = (name: string, holdings: any[]) =>
  API.post('/api/v1/portfolio', { name, holdings }).then((r) => r.data)

export const getPortfolios = () =>
  API.get('/api/v1/portfolio').then((r) => r.data)

export const analyzePortfolio = (id: number) =>
  API.get(`/api/v1/portfolio/${id}/analyze`).then((r) => r.data)

export const addTransaction = (portfolio_id: number, data: any) =>
  API.post(`/api/v1/portfolio/${portfolio_id}/transaction`, data).then((r) => r.data)

export const getNews = (ticker: string) =>
  API.get(`/api/v1/news/${ticker}`).then((r) => r.data)

export default API
