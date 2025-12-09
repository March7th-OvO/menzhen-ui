<template>
  <div class="login-container">
    <div class="login-box">
      <div class="title">
        <el-icon class="logo-icon"><FirstAidKit /></el-icon>
        <h2>门诊管理系统</h2>
      </div>
      <el-form :model="form" class="login-form">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
          登 录
        </el-button>
        <div class="register-link">
          还没有账号？<el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  if(!form.value.username || !form.value.password) return ElMessage.warning('请输入账号密码')
  loading.value = true
  try {
    const res = await login(form.value)

    // 确保后端返回了 token
    if (!res.token) {
      ElMessage.error('登录失败：未获取到有效凭证')
      return
    }

    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res))
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // 错误已在拦截器处理
    console.error('登录失败:', e)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}
.title {
  margin-bottom: 30px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.logo-icon {
  font-size: 32px;
  color: #409EFF;
}
.login-btn {
  width: 100%;
  padding: 20px 0;
  font-size: 16px;
}
.register-link {
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}
</style>