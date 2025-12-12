import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const service = axios.create({
    baseURL: 'http://localhost:8080/api', // 你的后端地址
    timeout: 5000
})

// 请求拦截器:自动带上 Token
service.interceptors.request.use(config => {
    // 公开访问的接口列表，不需要添加 token
    const publicUrls = ['/user/register', '/user/login', '/dept/list', '/user/verify-user-info', '/user/reset-password']
    const url = config.url.replace(config.baseURL || '', '') // 移除baseURL获取相对路径
    
    const isPublicUrl = publicUrls.some(publicUrl => url === publicUrl)

    if (!isPublicUrl) {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
    }
    return config
}, error => Promise.reject(error))

// 响应拦截器
service.interceptors.response.use(response => {
    const res = response.data
    // 假设你的 Result.java 中 code 200 表示成功
    if (res.code !== 200) {
        ElMessage.error(res.message || 'Error')
        return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
}, error => {
    // 处理 Token 过期或无效的情况
    if (error.response) {
        const { status, data } = error.response

        // 401 未授权 - Token 过期或无效
        if (status === 401) {
            // 如果当前在登录或注册页面，不弹出提示并重定向
            const currentPath = router.currentRoute.value.path
            if (currentPath !== '/login' && currentPath !== '/register') {
                ElMessage.error('登录已过期，请重新登录')
                localStorage.clear()
                router.push('/login')
            }
            return Promise.reject(error)
        }

        // 403 禁止访问 - 权限不足
        if (status === 403) {
            ElMessage.error('权限不足')
            return Promise.reject(error)
        }

        ElMessage.error(data?.message || '请求失败')
    } else {
        ElMessage.error(error.message || '网络异常')
    }
    return Promise.reject(error)
})

export default service