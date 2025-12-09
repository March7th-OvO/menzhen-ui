import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Layout from '../views/Layout.vue'
import { jwtDecode } from 'jwt-decode'

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    {
        path: '/',
        component: Layout,
        redirect: '/registration',
        children: [
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

    // 如果是登录或注册页面，直接放行
    if (to.path === '/login' || to.path === '/register') {
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