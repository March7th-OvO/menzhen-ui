<template>
  <div class="login-page-container fade-in">
    <!-- 动态背景装饰球 -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <div class="glass-auth-box" :class="{ 'right-panel-active': isRegisterMode, 'forgot-panel-active': isForgotPasswordMode }">

      <!-- 登录表单容器 -->
      <div class="form-container sign-in-container">
        <div class="form-content-wrapper">
          <div class="brand-header">
            <div class="logo-glass">
              <el-icon class="logo-icon"><FirstAidKit /></el-icon>
            </div>
            <h1>门诊管理系统</h1>
            <span class="subtitle">智慧医疗 · 贴心服务</span>
          </div>

          <el-form :model="loginForm" class="glass-form" size="large">
            <el-form-item>
              <el-input
                  v-model="loginForm.username"
                  placeholder="请输入账号"
                  prefix-icon="User"
                  class="glass-input"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  show-password
                  class="glass-input"
                  @keyup.enter="handleLogin"
              />
            </el-form-item>
            <div class="form-footer">
              <el-checkbox v-model="rememberMe" label="记住我" class="glass-checkbox" />
              <el-button link class="forgot-link" @click="switchToForgotPassword">忘记密码？</el-button>
            </div>

            <!-- 登录按钮 -->
            <el-button type="primary" class="glass-btn-primary full-width" @click="handleLogin" :loading="loginLoading">
              立即登录
            </el-button>

            <!-- 移动端切换入口 -->
            <div class="mobile-toggle visible-xs">
              还没有账号？<span @click="switchToRegister">去注册</span>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 注册表单容器 -->
      <div class="form-container sign-up-container">
        <div class="form-content-wrapper scroll-wrapper">
          <div class="brand-header mini">
            <h2>创建新账户</h2>
            <span class="subtitle">加入我们的医疗团队</span>
          </div>

          <el-form :model="registerForm" class="glass-form" size="large" label-position="top">
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="registerForm.username" placeholder="设置用户名" prefix-icon="User" class="glass-input"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="真实姓名">
                  <el-input v-model="registerForm.realName" placeholder="您的姓名" prefix-icon="Postcard" class="glass-input"/>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="密码">
                  <el-input v-model="registerForm.password" type="password" placeholder="设置密码" prefix-icon="Lock" show-password class="glass-input"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码">
                  <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" show-password class="glass-input"/>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="联系电话">
              <el-input v-model="registerForm.phone" placeholder="手机号码" prefix-icon="Iphone" class="glass-input"/>
            </el-form-item>

            <el-form-item label="身份证号">
              <el-input v-model="registerForm.idCard" placeholder="身份证号码" prefix-icon="CreditCard" class="glass-input"/>
            </el-form-item>

            <el-form-item label="角色选择">
              <el-radio-group v-model="registerForm.role" @change="handleRoleChange" class="glass-radio-group">
                <el-radio-button label="doctor">医生</el-radio-button>
                <el-radio-button label="registrar">挂号员</el-radio-button>
                <el-radio-button label="cashier">收银员</el-radio-button>
                <el-radio-button label="pharmacy">药剂师</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- 医生特有字段 -->
            <transition name="el-zoom-in-top">
              <div v-if="registerForm.role === 'doctor'" class="doctor-fields">
                <el-form-item label="所属科室">
                  <el-select v-model="registerForm.deptId" placeholder="选择科室" class="glass-select" popper-class="glass-popper" filterable style="width: 100%">
                    <el-option
                        v-for="dept in deptList"
                        :key="dept.id"
                        :label="`${dept.code} - ${dept.name}`"
                        :value="dept.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="职称">
                  <el-input v-model="registerForm.title" placeholder="如：主治医师" prefix-icon="Medal" class="glass-input"/>
                </el-form-item>
              </div>
            </transition>

            <el-button type="success" class="glass-btn-success full-width" @click="handleRegister" :loading="registerLoading">
              立即注册
            </el-button>

            <div class="mobile-toggle visible-xs">
              已有账户？<span @click="switchToLogin">去登录</span>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 忘记密码表单容器 -->
      <div class="form-container forgot-container">
        <div class="form-content-wrapper">
          <div class="brand-header mini">
            <h2>找回密码</h2>
            <span class="subtitle">通过身份验证重置密码</span>
          </div>

          <!-- 第一步：输入用户名 -->
          <el-form v-if="forgotPasswordStep === 1" :model="forgotPasswordForm" class="glass-form" size="large">
            <el-form-item>
              <el-input
                  v-model="forgotPasswordForm.username"
                  placeholder="请输入您的账号"
                  prefix-icon="User"
                  class="glass-input"
              />
            </el-form-item>

            <el-button type="primary" class="glass-btn-primary full-width" @click="checkUsername" :loading="forgotPasswordLoading">
              下一步
            </el-button>

            <!-- 修复：添加 style="margin-left: 0" 消除 Element Plus 默认的左边距 -->
            <el-button class="glass-btn-outline full-width mt-3" @click="switchToLogin" style="margin-left: 0;">
              返回登录
            </el-button>
          </el-form>

          <!-- 第二步：身份验证 -->
          <el-form v-else-if="forgotPasswordStep === 2" :model="forgotPasswordForm" class="glass-form" size="large" label-position="top">
            <el-form-item label="账号">
              <el-input v-model="forgotPasswordForm.username" disabled prefix-icon="User" class="glass-input" />
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input v-model="forgotPasswordForm.idCard" placeholder="请输入身份证号" prefix-icon="CreditCard" class="glass-input" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="forgotPasswordForm.phone" placeholder="请输入手机号" prefix-icon="Iphone" class="glass-input" />
            </el-form-item>

            <div class="btn-group">
              <el-button class="glass-btn-outline flex-1" @click="forgotPasswordStep = 1">上一步</el-button>
              <el-button type="primary" class="glass-btn-primary flex-1" @click="verifyIdentity" :loading="forgotPasswordLoading">
                验证身份
              </el-button>
            </div>

            <!-- 这里的返回登录因为上面是 div 隔开了，所以不需要 margin-left: 0，但为了保险也加上 -->
            <el-button class="glass-btn-outline full-width mt-3" @click="switchToLogin">返回登录</el-button>
          </el-form>

          <!-- 第三步：重置密码 -->
          <el-form v-else-if="forgotPasswordStep === 3" :model="forgotPasswordForm" class="glass-form" size="large" label-position="top">
            <el-form-item label="账号">
              <el-input v-model="forgotPasswordForm.username" disabled prefix-icon="User" class="glass-input" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="forgotPasswordForm.newPassword" type="password" placeholder="请输入新密码" prefix-icon="Lock" show-password class="glass-input" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="forgotPasswordForm.confirmPassword" type="password" placeholder="请再次输入新密码" prefix-icon="Lock" show-password class="glass-input" />
            </el-form-item>

            <el-button type="success" class="glass-btn-success full-width" @click="handleResetPassword" :loading="forgotPasswordLoading">
              重置密码
            </el-button>

            <!-- 修复：同样添加 margin-left: 0 -->
            <el-button class="glass-btn-outline full-width mt-3" @click="switchToLogin" style="margin-left: 0;">
              返回登录
            </el-button>
          </el-form>
        </div>
      </div>

      <!-- 滑动覆盖层 (Overlay) -->
      <div class="overlay-container">
        <div class="overlay">
          <!-- 覆盖层背景装饰 -->
          <div class="overlay-bg-decoration"></div>

          <div class="overlay-panel overlay-left">
            <h2>欢迎回来！</h2>
            <p>请登录您的个人账户以继续管理门诊业务。</p>
            <button class="ghost-btn" @click="switchToLogin">
              <el-icon><Back /></el-icon> 返回登录
            </button>
          </div>

          <div class="overlay-panel overlay-right">
            <h2>你好，朋友！</h2>
            <p>输入您的个人详细信息，开始您的智慧医疗之旅。</p>
            <button class="ghost-btn" @click="switchToRegister">
              去注册 <el-icon><Right /></el-icon>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FirstAidKit, Right, Back } from "@element-plus/icons-vue"
import { login, register, getDepts, resetPassword, verifyUserInfo } from '../api'

const router = useRouter()
const isRegisterMode = ref(false)
const isForgotPasswordMode = ref(false)
const rememberMe = ref(false)

// 登录表单
const loginForm = ref({ username: '', password: '' })
const loginLoading = ref(false)

// 注册表单
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  role: 'doctor', // 默认选中一个看起来更丰满
  deptId: null,
  title: '',
  phone: ''
})
const registerLoading = ref(false)
const deptList = ref([])

// 忘记密码表单
const forgotPasswordForm = ref({
  username: '',
  idCard: '',
  phone: '',
  newPassword: '',
  confirmPassword: ''
})
const forgotPasswordLoading = ref(false)
const forgotPasswordStep = ref(1) // 1: 输入用户名, 2: 身份验证, 3: 重置密码

// 切换逻辑
const switchToRegister = () => {
  isRegisterMode.value = true
  isForgotPasswordMode.value = false
}
const switchToLogin = () => {
  isRegisterMode.value = false
  isForgotPasswordMode.value = false
  forgotPasswordStep.value = 1
  // 清空忘记密码表单
  forgotPasswordForm.value = {
    username: '',
    idCard: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  }
}
const switchToForgotPassword = () => {
  isForgotPasswordMode.value = true
  isRegisterMode.value = false
  forgotPasswordStep.value = 1
}

// 登录处理
const handleLogin = async () => {
  if(!loginForm.value.username || !loginForm.value.password) {
    return ElMessage.warning('请输入完整账号密码')
  }
  loginLoading.value = true
  try {
    const res = await login(loginForm.value)
    if (!res.token) throw new Error('无Token')

    // 根据"记住我"选项决定是否保存登录信息
    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedUsername', loginForm.value.username);
      localStorage.setItem('savedPassword', loginForm.value.password);
    } else {
      // 如果未选择记住我，则清除之前保存的信息
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedUsername');
      localStorage.removeItem('savedPassword');
    }

    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res))
    ElMessage.success('欢迎回来，登录成功')
    await router.push('/')
  } catch (e) {
    ElMessage.error('登录失败：' + (e.message || '网络错误'))
  } finally {
    loginLoading.value = false
  }
}

// 忘记密码 - 检查用户名
const checkUsername = async () => {
  if (!forgotPasswordForm.value.username) {
    return ElMessage.warning('请输入账号')
  }

  forgotPasswordLoading.value = true
  try {
    // 这里应该调用 API 检查用户名是否存在
    // 暂时模拟处理
    setTimeout(() => {
      forgotPasswordStep.value = 2
      ElMessage.info('请输入身份信息进行验证')
    }, 500)
  } catch (e) {
    ElMessage.error('检查账号失败：' + (e.message || '网络错误'))
  } finally {
    forgotPasswordLoading.value = false
  }
}

// 忘记密码 - 身份验证
const verifyIdentity = async () => {
  if (!forgotPasswordForm.value.idCard || !forgotPasswordForm.value.phone) {
    return ElMessage.warning('请输入完整的身份信息')
  }

  forgotPasswordLoading.value = true
  try {
    // 调用 API 验证身份信息
    const data = {
      username: forgotPasswordForm.value.username,
      id_number: forgotPasswordForm.value.idCard,  // 修复：将idCard改为id_number以匹配后端API
      phone: forgotPasswordForm.value.phone
    }

    await verifyUserInfo(data)

    forgotPasswordStep.value = 3
    ElMessage.success('身份验证通过，请设置新密码')
  } catch (e) {
    ElMessage.error('身份验证失败：' + (e.message || '网络错误'))
  } finally {
    forgotPasswordLoading.value = false
  }
}

// 忘记密码 - 重置密码
const handleResetPassword = async () => {
  if (!forgotPasswordForm.value.newPassword || !forgotPasswordForm.value.confirmPassword) {
    return ElMessage.warning('请输入完整密码信息')
  }

  if (forgotPasswordForm.value.newPassword !== forgotPasswordForm.value.confirmPassword) {
    return ElMessage.warning('两次输入的密码不一致')
  }

  if (forgotPasswordForm.value.newPassword.length < 6) {
    return ElMessage.warning('密码长度不能少于6位')
  }

  forgotPasswordLoading.value = true
  try {
    // 调用 API 重置密码
    const data = {
      username: forgotPasswordForm.value.username,
      idCard: forgotPasswordForm.value.idCard,
      phone: forgotPasswordForm.value.phone,
      newPassword: forgotPasswordForm.value.newPassword
    }

    await resetPassword(data)

    ElMessage.success('密码重置成功，请重新登录')
    switchToLogin()
  } catch (e) {
    ElMessage.error('重置密码失败：' + (e.message || '网络错误'))
  } finally {
    forgotPasswordLoading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  // 简单的校验逻辑保持不变
  if (!registerForm.value.username || !registerForm.value.password) return ElMessage.warning('请输入必要信息')
  if (registerForm.value.password !== registerForm.value.confirmPassword) return ElMessage.warning('密码不一致')
  if (registerForm.value.role === 'doctor' && !registerForm.value.deptId) return ElMessage.warning('医生请选择科室')

  registerLoading.value = true
  try {
    // 构造提交数据
    const submitData = { ...registerForm.value }
    delete submitData.confirmPassword
    if (submitData.role !== 'doctor') {
      delete submitData.deptId
      delete submitData.title
      delete submitData.phone
    }

    await register(submitData)
    ElMessage.success({
      message: '注册成功！请登录',
      duration: 2000
    })
    switchToLogin()
  } catch (e) {
    ElMessage.error('注册失败')
  } finally {
    registerLoading.value = false
  }
}

// 角色切换清空医生字段
const handleRoleChange = (val) => {
  if (val !== 'doctor') {
    registerForm.value.deptId = null
    registerForm.value.title = ''
    registerForm.value.phone = ''
  }
}

onMounted(async () => {
  try {
    // 1. 恢复记住我状态和保存的登录信息
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    rememberMe.value = savedRememberMe;

    if (savedRememberMe) {
      const savedUsername = localStorage.getItem('savedUsername') || '';
      const savedPassword = localStorage.getItem('savedPassword') || '';
      loginForm.value.username = savedUsername;
      loginForm.value.password = savedPassword;
    }

    // 2. 获取科室列表 (只需要执行这一次)
    const res = await getDepts()
    deptList.value = res || []
  } catch(e) {
    console.error('初始化失败:', e)
  }
})
</script>

<style scoped>
/* ================= 全局布局与背景 ================= */
.login-page-container {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', sans-serif;
}

/* 动态背景球 */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  animation: float 20s infinite ease-in-out alternate;
}
.shape-1 {
  width: 500px;
  height: 500px;
  background: #a18cd1;
  top: -150px;
  left: -100px;
}
.shape-2 {
  width: 400px;
  height: 400px;
  background: #fbc2eb;
  bottom: -100px;
  right: -50px;
  animation-delay: -5s;
}
.shape-3 {
  width: 300px;
  height: 300px;
  background: #8fd3f4;
  top: 40%;
  left: 40%;
  animation-delay: -10s;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(30px, 30px) rotate(10deg); }
}

/* ================= 玻璃认证框主体 (Glass Box) ================= */
.glass-auth-box {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  width: 1000px;
  max-width: 90%;
  min-height: 600px;
  z-index: 1;
}

/* ================= 表单容器布局 ================= */
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录容器 */
.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

/* 注册容器 */
.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

/* 忘记密码容器 */
.forgot-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  transform: translateX(0); /* 默认不移动，通过 opacity 显隐 */
}

/* === 状态切换逻辑 (保持原有逻辑，适配新样式) === */

/* 1. 注册模式激活 */
.glass-auth-box.right-panel-active .sign-in-container {
  transform: translateX(100%);
  opacity: 0; /* 关键：隐藏登录表单 */
}

.glass-auth-box.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

/* 2. 忘记密码模式激活 */
.glass-auth-box.forgot-panel-active .sign-in-container {
  opacity: 0;
  z-index: 0;
}

.glass-auth-box.forgot-panel-active .forgot-container {
  opacity: 1;
  z-index: 5;
  animation: fadeIn 0.5s;
}

/* ================= 覆盖层 (Overlay) - 滑动玻璃板 ================= */
.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  border-radius: 0 24px 24px 0; /* 默认右侧圆角 */
}

.glass-auth-box.right-panel-active .overlay-container {
  transform: translateX(-100%);
  border-radius: 24px 0 0 24px; /* 切换到左侧时圆角变左边 */
}

.overlay {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe); /* 新主题色 */
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #FFFFFF;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.glass-auth-box.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  /* 简单的波浪纹路装饰 */
  background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 20%),
  radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 20%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.glass-auth-box.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.glass-auth-box.right-panel-active .overlay-right {
  transform: translateX(20%);
}

/* 覆盖层文字样式 */
.overlay-panel h2 {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 15px;
}
.overlay-panel p {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 30px;
  opacity: 0.9;
}

/* ================= 内部内容排版 ================= */
.form-content-wrapper {
  width: 100%;
  padding: 0 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.scroll-wrapper {
  overflow-y: auto;
  justify-content: flex-start;
  padding-top: 40px;
  padding-bottom: 20px;
}
/* 隐藏滚动条 */
.scroll-wrapper::-webkit-scrollbar { width: 4px; }
.scroll-wrapper::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

/* 品牌头部 */
.brand-header {
  text-align: center;
  margin-bottom: 30px;
}
.brand-header.mini {
  text-align: left;
  margin-bottom: 20px;
}

.logo-glass {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ffffff, #dfe6e9);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 5px 5px 15px rgba(0,0,0,0.05), -5px -5px 15px rgba(255,255,255,0.8);
}
.logo-icon {
  font-size: 32px;
  color: #6c5ce7;
}

.brand-header h1, .brand-header h2 {
  font-size: 24px;
  color: #2d3436;
  font-weight: 700;
  margin: 0 0 5px;
}
.subtitle {
  color: #636e72;
  font-size: 14px;
}

/* ================= 拟态表单控件 (Glass/Neumorphism Inputs) ================= */
.glass-form {
  width: 100%;
}

/* 输入框 */
:deep(.glass-input .el-input__wrapper) {
  background: rgba(240, 245, 255, 0.6);
  box-shadow: inset 2px 2px 6px rgba(163, 177, 198, 0.3),
  inset -2px -2px 6px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: none;
  padding: 10px 15px;
  transition: all 0.3s;
}

:deep(.glass-input .el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.3),
  inset 2px 2px 6px rgba(163, 177, 198, 0.1);
}

/* 下拉框 */
:deep(.glass-select .el-select__wrapper) {
  background: rgba(240, 245, 255, 0.6);
  box-shadow: inset 2px 2px 6px rgba(163, 177, 198, 0.3),
  inset -2px -2px 6px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: none;
}

/* 单选组 */
:deep(.glass-radio-group .el-radio-button__inner) {
  background: transparent;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px !important;
  margin-right: 5px;
  box-shadow: none !important;
  color: #636e72;
}

:deep(.glass-radio-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #6c5ce7;
  border-color: #6c5ce7;
  color: white;
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3) !important;
}

/* 按钮 */
.glass-btn-primary {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border: none;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 15px rgba(108, 92, 231, 0.3);
  transition: transform 0.2s;
  letter-spacing: 1px;
}
.glass-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.4);
  background: linear-gradient(135deg, #7b6bed, #b0aafc);
}

.glass-btn-success {
  background: linear-gradient(135deg, #00b894, #55efc4);
  border: none;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 15px rgba(0, 184, 148, 0.3);
  color: white;
}
.glass-btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 184, 148, 0.4);
}

.glass-btn-outline {
  background: transparent;
  border: 1px solid #6c5ce7;
  color: #6c5ce7;
  border-radius: 12px;
  font-weight: 600;
  height: 44px; /* 强制对齐高度 */
}
.glass-btn-outline:hover {
  background: rgba(108, 92, 231, 0.1);
}

.full-width {
  width: 100%;
}
.mt-3 { margin-top: 15px; }
.flex-1 { flex: 1; }
.btn-group { display: flex; gap: 15px; }

/* 辅助文字链接 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.forgot-link {
  color: #6c5ce7;
  font-weight: 500;
}
.forgot-link:hover { text-decoration: underline; }

/* 覆盖层上的幽灵按钮 */
.ghost-btn {
  background-color: transparent;
  border: 2px solid #FFFFFF;
  color: #FFFFFF;
  padding: 10px 30px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ghost-btn:hover {
  background-color: #FFFFFF;
  color: #6c5ce7;
}

/* 动画关键帧 */
@keyframes show {
  0%, 49.99% { opacity: 0; z-index: 1; }
  50%, 100% { opacity: 1; z-index: 5; }
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ================= 移动端适配 ================= */
.visible-xs { display: none; }

@media (max-width: 768px) {
  .glass-auth-box {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    max-width: 100%;
    border: none;
    overflow-y: auto; /* 允许纵向滚动 */
  }

  .overlay-container {
    display: none; /* 移动端隐藏滑动遮罩 */
  }

  .form-container {
    width: 100%;
    position: relative; /* 相对定位，不重叠 */
    padding: 20px;
    height: auto;
    min-height: 100vh;
  }

  /* 移动端直接控制显隐，不用 transform */
  .sign-in-container, .sign-up-container, .forgot-container {
    display: none;
    opacity: 1;
    transform: none !important;
    left: 0 !important;
  }

  /* 默认显示登录 */
  .glass-auth-box:not(.right-panel-active):not(.forgot-panel-active) .sign-in-container {
    display: flex;
  }

  /* 注册激活 */
  .glass-auth-box.right-panel-active .sign-up-container {
    display: flex;
  }

  /* 忘密激活 */
  .glass-auth-box.forgot-panel-active .forgot-container {
    display: flex;
  }

  .visible-xs {
    display: block;
    text-align: center;
    margin-top: 20px;
    color: #636e72;
  }
  .visible-xs span {
    color: #6c5ce7;
    font-weight: bold;
    cursor: pointer;
  }
}
</style>