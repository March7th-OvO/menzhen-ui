<template>
  <div class="fancy-container">
    <!-- 动态背景装饰球 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>
    <div class="decoration-circle circle-3"></div>

    <div class="auth-box" :class="{ 'register-mode': isRegisterMode, 'forgot-password-mode': isForgotPasswordMode }">
      <!-- 登录表单区域 -->
      <div class="form-container login-form-container">
        <div class="form-content">
          <div class="brand-area">
            <div class="logo-bg">
              <el-icon class="logo-icon"><FirstAidKit /></el-icon>
            </div>
            <h2>门诊管理系统</h2>
            <p class="subtitle">智慧医疗 · 贴心服务</p>
          </div>

          <el-form :model="loginForm" class="auth-form" size="large">
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
              />
            </el-form-item>
            <div class="actions">
              <el-checkbox v-model="rememberMe" label="记住我" class="glass-checkbox" />
              <el-link type="primary" :underline="false" @click="switchToForgotPassword">忘记密码？</el-link>
            </div>
            <el-button type="primary" class="auth-btn pulse-effect" @click="handleLogin" :loading="loginLoading" round>
              立即登录
            </el-button>

            <div class="mobile-switch visible-xs">
              还没有账号？<span @click="switchToRegister">去注册</span>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 注册表单区域 -->
      <div class="form-container register-form-container">
        <div class="form-content scrollable-content">
          <div class="brand-area mini">
            <h2>创建新账户</h2>
            <p class="subtitle">加入我们的医疗团队</p>
          </div>

          <el-form :model="registerForm" class="auth-form" size="large" label-position="top">
            <el-row :gutter="20">
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

            <el-row :gutter="20">
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

            <!-- 医生特有字段 - 带淡入动画 -->
            <transition name="fade-slide">
              <div v-if="registerForm.role === 'doctor'" class="doctor-fields">
                <el-form-item label="所属科室">
                  <el-select v-model="registerForm.deptId" placeholder="选择科室" class="glass-select" filterable style="width: 100%">
                    <el-option
                        v-for="dept in deptList"
                        :key="dept.id"
                        :label="`${dept.code} - ${dept.name}`"
                        :value="dept.id"
                    />
                  </el-select>
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="职称">
                      <el-input v-model="registerForm.title" placeholder="如：主治医师" prefix-icon="Medal" class="glass-input"/>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </transition>

            <el-button type="success" class="auth-btn pulse-effect" @click="handleRegister" :loading="registerLoading" round>
              立即注册
            </el-button>

            <div class="mobile-switch visible-xs">
              已有账户？<span @click="switchToLogin">去登录</span>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 忘记密码表单区域 -->
      <div class="form-container forgot-password-form-container">
        <div class="form-content">
          <div class="brand-area mini">
            <h2>找回密码</h2>
            <p class="subtitle">通过身份验证重置密码</p>
          </div>

          <!-- 第一步：输入用户名 -->
          <el-form v-if="forgotPasswordStep === 1" :model="forgotPasswordForm" class="auth-form" size="large" label-position="top">
            <el-form-item label="账号">
              <el-input 
                v-model="forgotPasswordForm.username" 
                placeholder="请输入您的账号" 
                prefix-icon="User" 
                class="glass-input"
              />
            </el-form-item>
            
            <el-button type="primary" class="auth-btn pulse-effect" @click="checkUsername" :loading="forgotPasswordLoading" round>
              下一步
            </el-button>
            
            <div class="mobile-switch visible-xs">
              <span @click="switchToLogin">返回登录</span>
            </div>
          </el-form>

          <!-- 第二步：身份验证 -->
          <el-form v-else-if="forgotPasswordStep === 2" :model="forgotPasswordForm" class="auth-form" size="large" label-position="top">
            <el-form-item label="账号">
              <el-input 
                v-model="forgotPasswordForm.username" 
                disabled
                prefix-icon="User" 
                class="glass-input"
              />
            </el-form-item>
            
            <el-form-item label="身份证号">
              <el-input 
                v-model="forgotPasswordForm.idCard" 
                placeholder="请输入身份证号" 
                prefix-icon="CreditCard" 
                class="glass-input"
              />
            </el-form-item>
            
            <el-form-item label="手机号">
              <el-input 
                v-model="forgotPasswordForm.phone" 
                placeholder="请输入手机号" 
                prefix-icon="Iphone" 
                class="glass-input"
              />
            </el-form-item>
            
            <el-button type="primary" class="auth-btn pulse-effect" @click="verifyIdentity" :loading="forgotPasswordLoading" round>
              验证身份
            </el-button>
            
            <div class="mobile-switch visible-xs">
              <span @click="forgotPasswordStep = 1">上一步</span> | <span @click="switchToLogin">返回登录</span>
            </div>
          </el-form>

          <!-- 第三步：重置密码 -->
          <el-form v-else-if="forgotPasswordStep === 3" :model="forgotPasswordForm" class="auth-form" size="large" label-position="top">
            <el-form-item label="账号">
              <el-input 
                v-model="forgotPasswordForm.username" 
                disabled
                prefix-icon="User" 
                class="glass-input"
              />
            </el-form-item>
            
            <el-form-item label="新密码">
              <el-input 
                v-model="forgotPasswordForm.newPassword" 
                type="password"
                placeholder="请输入新密码" 
                prefix-icon="Lock" 
                show-password
                class="glass-input"
              />
            </el-form-item>
            
            <el-form-item label="确认新密码">
              <el-input 
                v-model="forgotPasswordForm.confirmPassword" 
                type="password"
                placeholder="请再次输入新密码" 
                prefix-icon="Lock" 
                show-password
                class="glass-input"
              />
            </el-form-item>
            
            <el-button type="success" class="auth-btn pulse-effect" @click="handleResetPassword" :loading="forgotPasswordLoading" round>
              重置密码
            </el-button>
            
            <div class="mobile-switch visible-xs">
              <span @click="switchToLogin">返回登录</span>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 滑动覆盖层 (遮罩) -->
      <div class="overlay-container">
        <div class="overlay">
          <!-- 动态波浪背景 -->
          <div class="overlay-bg-shape"></div>

          <div class="overlay-panel overlay-left">
            <div class="panel-content">
              <h2>欢迎回来！</h2>
              <p>请登录您的个人账户以继续管理门诊业务。</p>
              <button class="ghost-btn" @click="switchToLogin">
                返 回 登 录
                <el-icon class="icon-arrow"><Back /></el-icon>
              </button>
            </div>
          </div>
          <div class="overlay-panel overlay-right">
            <div class="panel-content">
              <h2>你好，朋友！</h2>
              <p>输入您的个人详细信息，开始您的智慧医疗之旅。</p>
              <button class="ghost-btn" @click="switchToRegister">
                去 注 册
                <el-icon class="icon-arrow"><Right /></el-icon>
              </button>
            </div>
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
/* ---------------------------
  核心配色与变量
  ---------------------------
*/
:root {
  --primary-color: #00c6ff;
  --secondary-color: #0072ff;
  --text-dark: #2d3436;
  --text-light: #636e72;
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-border: 1px solid rgba(255, 255, 255, 0.8);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.fancy-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

/* ---------------------------
  动态背景装饰 (Blobs)
  ---------------------------
*/
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.8;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(to right, #43e97b, #38f9d7);
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(to right, #fa709a, #fee140);
  top: 40%;
  left: 40%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* ---------------------------
  主卡片 (Auth Box)
  ---------------------------
*/
.auth-box {
  position: relative;
  width: 1000px;
  max-width: 90%;
  min-height: 650px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  z-index: 1;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 更有弹性的动画 */
}

/* ---------------------------
  表单通用样式
  ---------------------------
*/
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-container {
  left: 0;
  z-index: 2;
}

.register-form-container {
  left: 0;
  opacity: 0;
  z-index: 1;
  pointer-events: none;
}

.forgot-password-form-container {
  left: 0;
  opacity: 0;
  z-index: 1;
  pointer-events: none;
}

/* 核心修复：注册模式下登录表单必须透明 */
.auth-box.register-mode .login-form-container {
  transform: translateX(100%);
  opacity: 0; /* 关键点 */
  pointer-events: none;
}

.auth-box.register-mode .register-form-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  pointer-events: all;
}

/* ---------------------------
   修复后的忘记密码模式样式
   ---------------------------
*/

/* 1. 让登录框原地消失，不要滑走 */
.auth-box.forgot-password-mode .login-form-container {
  transform: translateX(0); /* 修改：原来是 100%，改为 0 */
  opacity: 0;
  pointer-events: none;
}

/* 2. 让找回密码框在左侧原地显示 */
.auth-box.forgot-password-mode .forgot-password-form-container {
  transform: translateX(0); /* 修改：原来是 100%，改为 0 */
  opacity: 1;
  z-index: 5;
  pointer-events: all;
}

.form-content {
  width: 100%;
  max-width: 420px;
  padding: 0 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

/* 注册页内容较多，需要滚动 */
.scrollable-content {
  overflow-y: auto;
  justify-content: flex-start;
  padding-top: 40px;
  padding-bottom: 20px;
}
/* 隐藏滚动条但保留功能 */
.scrollable-content::-webkit-scrollbar { width: 4px; }
.scrollable-content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

/* ---------------------------
  品牌与排版
  ---------------------------
*/
.brand-area {
  text-align: center;
  margin-bottom: 30px;
}

.brand-area.mini {
  margin-bottom: 20px;
  text-align: left;
}

.logo-bg {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #0061ff, #60efff);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 10px 20px rgba(0, 97, 255, 0.3);
  transform: rotate(-10deg);
  transition: transform 0.3s ease;
}

.logo-bg:hover {
  transform: rotate(0deg) scale(1.1);
}

.logo-icon {
  font-size: 36px;
  color: white;
}

h2 {
  color: var(--text-dark);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.subtitle {
  color: var(--text-light);
  font-size: 14px;
}

/* ---------------------------
  Element Plus 深度定制 (Glass Style)
  ---------------------------
*/
.auth-form {
  margin-top: 10px;
}

/* 输入框 */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 8px 15px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 3px rgba(0, 198, 255, 0.1) !important;
  transform: translateY(-2px);
}

/* 选择框 */
:deep(.el-select__wrapper) {
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* 按钮 */
.auth-btn {
  width: 100%;
  padding: 22px 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  border: none;
  background: linear-gradient(to right, #00c6ff, #0072ff);
  box-shadow: 0 10px 20px rgba(0, 114, 255, 0.3);
  margin-top: 20px;
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px rgba(0, 114, 255, 0.4);
  background: linear-gradient(to right, #0072ff, #00c6ff);
}

/* 角色单选组 */
:deep(.el-radio-button__inner) {
  background: transparent;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px !important;
  margin-right: 5px;
  box-shadow: none !important;
  color: #666;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--secondary-color);
  border-color: var(--secondary-color);
  color: white;
  box-shadow: 0 5px 15px rgba(0, 114, 255, 0.3) !important;
}

/* 其他小控件 */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* ---------------------------
  覆盖层动画 (Overlay)
  ---------------------------
*/
.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
}

.auth-box.register-mode .overlay-container {
  transform: translateX(-100%);
  border-radius: 24px 0 0 24px; /* 动态改变圆角 */
}

.overlay {
  background: linear-gradient(to right, #00c6ff, #0072ff);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #fff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

/* 覆盖层里的波浪纹路 */
.overlay-bg-shape {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(255,255,255,0.1)' fill-opacity='1' d='M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,133.3C960,160,1056,192,1152,186.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  opacity: 0.3;
}

.auth-box.register-mode .overlay {
  transform: translateX(50%);
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

.panel-content {
  position: relative;
  z-index: 2;
}

.overlay-left {
  transform: translateX(-20%);
}

.auth-box.register-mode .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.auth-box.register-mode .overlay-right {
  transform: translateX(20%);
}

.overlay-panel h2 {
  color: #fff;
  font-size: 32px;
  margin-bottom: 20px;
}

.overlay-panel p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
}

/* 幽灵按钮 (覆盖层上的按钮) */
.ghost-btn {
  background-color: transparent;
  border: 2px solid #fff;
  color: #fff;
  padding: 12px 35px;
  font-size: 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  position: relative;
}

.ghost-btn:hover {
  background-color: #fff;
  color: var(--secondary-color);
  transform: scale(1.05);
}

.icon-arrow {
  transition: transform 0.3s;
}

.ghost-btn:hover .icon-arrow {
  transform: translateX(5px);
}

/* ---------------------------
  过渡与动画
  ---------------------------
*/
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
  max-height: 200px;
  opacity: 1;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.visible-xs {
  display: none;
}

/* ---------------------------
  响应式适配 (Mobile)
  ---------------------------
*/
@media (max-width: 768px) {
  .auth-box {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    max-width: 100%;
    border: none;
  }

  .overlay-container {
    display: none; /* 移动端隐藏滑动层 */
  }

  .form-container {
    width: 100%;
    height: auto;
    min-height: 100vh;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.85); /* 移动端背景加深 */
  }

  /* 移动端直接控制显隐，不需要滑动动画 */
  .auth-box.register-mode .login-form-container {
    display: none;
  }

  .register-form-container {
    display: none;
    opacity: 1;
    pointer-events: all;
    transform: none;
  }

  .auth-box.register-mode .register-form-container {
    display: flex;
    transform: none;
  }

  .forgot-password-form-container {
    display: none;
    opacity: 1;
    pointer-events: all;
    transform: none;
  }

  .auth-box.forgot-password-mode .forgot-password-form-container {
    display: flex;
    transform: none;
  }
  
  .visible-xs {
    display: block;
    margin-top: 20px;
    text-align: center;
    color: #666;
  }

  .visible-xs span {
    color: var(--secondary-color);
    font-weight: bold;
    cursor: pointer;
  }

  .decoration-circle {
    opacity: 0.5; /* 移动端减弱背景干扰 */
  }
}
</style>