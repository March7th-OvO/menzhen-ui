

<template>
  <div class="register-container">
    <div class="register-box">
      <div class="title">
        <el-icon class="logo-icon"><FirstAidKit /></el-icon>
        <h2>门诊管理系统</h2>
      </div>
      <el-form :model="form" class="register-form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" prefix-icon="User" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色" @change="handleRoleChange">
            <el-option label="患者" value="patient" />
            <el-option label="医生" value="doctor" />
            <el-option label="收银员" value="cashier" />
            <el-option label="药剂师" value="pharmacy" />
          </el-select>
        </el-form-item>


        <!-- 医生角色的额外字段 -->
        <template v-if="form.role === 'doctor'">
          <el-form-item label="所属科室">
            <el-select v-model="form.deptId" placeholder="请选择科室" filterable>
              <el-option
                  v-for="dept in deptList"
                  :key="dept.id"
                  :label="`${dept.code} - ${dept.name}`"
                  :value="dept.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="职称">
            <el-input v-model="form.title" placeholder="请输入职称，如：主治医师" prefix-icon="User" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="Phone" />
          </el-form-item>
        </template>

        <el-button type="primary" class="register-btn" @click="handleRegister" :loading="loading">
          注 册
        </el-button>
        <div class="login-link">
          已有账户？<el-button type="text" @click="goToLogin">立即登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { register, getDepts } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  role: '',
  // 医生额外字段
  deptId: null,
  title: '',
  phone: ''
})
const loading = ref(false)
const deptList = ref([])

// 加载科室列表
const loadDepts = async () => {
  try {
    console.log('开始加载科室列表...')
    const res = await getDepts()
    console.log('从API获取到的数据:', res)
    deptList.value = Array.isArray(res) ? res : []
    console.log('最终设置的deptList值:', deptList.value)
    console.log('deptList长度:', deptList.value.length)
  } catch (e) {
    console.error('加载科室列表失败:', e)
    deptList.value = []
  }
}

// 角色切换时清空医生相关字段
const handleRoleChange = (value) => {
  if (value !== 'doctor') {
    form.value.deptId = null
    form.value.title = ''
    form.value.phone = ''
  } else if (value === 'doctor' && deptList.value.length === 0) {
    // 如果选择医生但科室列表为空，尝试重新加载
    loadDepts()
  }
}

const handleRegister = async () => {
  if (!form.value.username || !form.value.password) {
    return ElMessage.warning('请输入用户名和密码')
  }

  if (form.value.password !== form.value.confirmPassword) {
    return ElMessage.warning('两次输入的密码不一致')
  }

  if (!form.value.realName) {
    return ElMessage.warning('请输入真实姓名')
  }

  if (!form.value.role) {
    return ElMessage.warning('请选择角色')
  }

  // 医生角色的额外验证
  if (form.value.role === 'doctor') {
    if (deptList.value.length === 0) {
      return ElMessage.error('无法获取科室列表，请稍后重试或联系管理员')
    }
    if (!form.value.deptId) {
      return ElMessage.warning('请选择所属科室')
    }
    if (!form.value.title) {
      return ElMessage.warning('请输入职称')
    }
    if (!form.value.phone) {
      return ElMessage.warning('请输入联系电话')
    }
    // 简单的手机号验证
    if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
      return ElMessage.warning('请输入有效的手机号')
    }
  }

  loading.value = true
  try {
    // 构造符合后端要求的注册数据
    const registerData = {
      username: form.value.username,
      password: form.value.password,
      realName: form.value.realName,
      role: form.value.role
    }

    // 如果是医生角色，添加额外字段
    if (form.value.role === 'doctor') {
      registerData.deptId = form.value.deptId
      registerData.title = form.value.title
      registerData.phone = form.value.phone
    }

    await register(registerData)
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (e) {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

// 页面加载时获取科室列表
onMounted(() => {
  loadDepts()
})
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
}
.register-box {
  width: 450px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
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
.register-btn {
  width: 100%;
  padding: 20px 0;
  font-size: 16px;
  margin-top: 10px;
}
.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>