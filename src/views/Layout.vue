
<template>
  <div class="app-layout">
    <el-container>
      <el-aside width="220px" class="aside">
        <div class="brand">
          <el-icon><Monitor /></el-icon> OMS System
        </div>
        <el-menu :default-active="$route.path" class="el-menu-vertical">
          <el-menu-item v-if="user.role === 'registrar' || user.role === 'admin'" index="/registration" @click="navTo('/registration')">
            <el-icon><Ticket /></el-icon>
            <span>门诊挂号</span>
          </el-menu-item>
          <el-menu-item v-if="user.role === 'doctor' || user.role === 'admin'" index="/workbench" @click="navTo('/workbench')">
            <el-icon><Operation /></el-icon>
            <span>医生工作台</span>
          </el-menu-item>
          <el-menu-item v-if="user.role === 'pharmacy' || user.role === 'admin'" index="/medicine" @click="navTo('/medicine')">
            <el-icon><Box /></el-icon>
            <span>药房管理</span>
          </el-menu-item>
        </el-menu>
        <div class="user-info">
          <el-avatar size="small" icon="UserFilled" />
          <span>{{ user.realName || user.name }}</span>
          <el-button link size="small" @click="logout" style="margin-left: auto; color: #fff;">退出</el-button>
        </div>
      </el-aside>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {Box, Monitor, Operation, Ticket} from "@element-plus/icons-vue";
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const logout = () => {
  // 清理所有本地存储的用户数据
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const navTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.app-layout { height: 100vh; }

/* 让 el-container 和 el-main 撑满高度 */
:deep(.el-container) {
  height: 100%;
}

:deep(.el-main) {
  height: 100%;
  padding: 0; /* 移除默认 padding，让子页面控制间距 */
  overflow: auto; /* 允许内容滚动 */
}

.aside {
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 确保侧边栏占满高度 */
}
.brand {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  gap: 10px;
  border-bottom: 1px solid #34495e;
}
.el-menu-vertical {
  border-right: none;
  background: transparent;
}
:deep(.el-menu-item) {
  color: #bdc3c7;
}
:deep(.el-menu-item.is-active) {
  color: #409EFF;
  background-color: #34495e;
}
.user-info {
  margin-top: auto;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #253342;
}
.main-content {
  background-color: #f5f7fa;
}
/* 路由过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
