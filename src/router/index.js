import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import { jwtDecode } from 'jwt-decode'

const routes = [
    { path: '/login', component: Login },
    // 移除 /register 路由,因为注册功能已整合到 Login.vue 中
    {
        path: '/',
        component: Layout,
        redirect: '/welcome',
        children: [
            { path: 'welcome', component: () => import('../views/Welcome.vue'), meta: { title: '欢迎' } },
            { path: 'registration', component: () => import('../views/Registration.vue'), meta: { title: '门诊挂号' } },
            { path: 'workbench', component: () => import('../views/Workbench.vue'), meta: { title: '医生工作台' } },
            { path: 'medicine', component: () => import('../views/MedicineMgr.vue'), meta: { title: '药房管理' } },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 检查 Token 是否过期
function isTokenExpired(token) {
    try {
        const decoded = jwtDecode(token)
        // JWT 的 exp 字段是秒级时间戳
        return decoded.exp * 1000 < Date.now()
    } catch (e) {
        return true
    }
}

// 路由守卫 - 验证 Token
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // 如果是登录页面,直接放行
    if (to.path === '/login') {
        next()
        return
    }

    // 检查 Token 是否存在
    if (!token) {
        next('/login')
        return
    }

    // 检查 Token 是否过期
    if (isTokenExpired(token)) {
        localStorage.clear()
        next('/login')
        return
    }

    next()
})

export default router