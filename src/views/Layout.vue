<template>
  <div class="app-layout">
    <!-- 背景装饰圆，用于增强毛玻璃效果 -->
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>

    <el-container>
      <!-- 修改宽度为 280px (240px * 1.2) -->
      <el-aside width="280px" class="aside glass-panel">
        <div class="brand">
          <div class="logo-box">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="brand-text">OMS System</span>
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

        <div class="user-info glass-card">
          <el-avatar size="small" icon="UserFilled" class="user-avatar" />
          <span class="user-name">{{ user.name }}</span>
          <el-button link size="small" @click="logout" class="logout-btn">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </el-aside>

      <el-main class="main-content">
        <!-- 顶部装饰条，可选 -->
        <div class="content-glass-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="slide-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Box, Monitor, Operation, Ticket, SwitchButton } from "@element-plus/icons-vue";
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const navTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* ================= 全局布局与背景 ================= */
.app-layout {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%); /* 柔和蓝灰渐变 */
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'microsoft yahei', arial, sans-serif;
}

/* 装饰背景圆，让毛玻璃更明显 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  animation: float 10s infinite ease-in-out alternate;
}
.circle-1 {
  width: 400px;
  height: 400px;
  background: #a18cd1;
  top: -100px;
  left: -100px;
}
.circle-2 {
  width: 300px;
  height: 300px;
  background: #fbc2eb;
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 30px); }
}

:deep(.el-container) {
  height: 100%;
  position: relative;
  z-index: 1; /* 确保内容在背景圆之上 */
}

/* ================= 侧边栏 (Glassmorphism Sidebar) ================= */
.aside {
  background: rgba(255, 255, 255, 0.25); /* 极低透明度白色 */
  backdrop-filter: blur(16px); /* 核心：毛玻璃模糊 */
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px 0;
  box-sizing: border-box;
  transition: all 0.3s ease;
  position: relative; /* 增加相对定位，作为绝对定位子元素的参考 */
}

/* ================= Logo 区域 (Neumorphism) ================= */
.brand {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.logo-box {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6c5ce7;
  /* 拟态浮起投影 */
  box-shadow:  5px 5px 10px #bebebe,
  -5px -5px 10px #ffffff;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: #2d3436;
  letter-spacing: 1px;
}

/* ================= 菜单样式 (Sliding & Glass) ================= */
.el-menu-vertical {
  border-right: none !important;
  background: transparent !important;
  padding: 0 16px;
  flex: 1;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 12px 0;
  border-radius: 16px; /* 胶囊圆角 */
  color: #636e72;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* 平滑过渡 */
  background: transparent;
  border: 1px solid transparent;
  transform-origin: left center; /* 设定缩放原点在左侧，这样放大时会显得更自然 */
}

/* 悬停态：轻微浮起 */
:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.4);
  transform: translateX(10px) ; /* 右滑 */
  color: #2d3436;
  z-index: 10; /* 确保悬浮时层级变高，不会被遮挡 */
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); /* 增加一点悬浮投影 */
}

/* 激活态：拟态凹陷 或 发光玻璃 */
:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.6);
  color: #6c5ce7;
  font-weight: bold;
  /* 混合投影：内部发光 + 外部投影 */
  box-shadow:
      inset 2px 2px 5px rgba(255, 255, 255, 0.7),
      inset -2px -2px 5px rgba(0, 0, 0, 0.05),
      5px 5px 15px rgba(161, 140, 209, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 10px;
  transition: transform 0.3s ease;
}

:deep(.el-menu-item.is-active .el-icon) {
  transform: scale(1.1);
  color: #6c5ce7;
}

/* ================= 用户信息区 (Floating Card) ================= */
.user-info {
  /* 修改为绝对定位 */
  position: absolute;
  bottom: 20px; /* 距离底部 20px */
  left: 16px;
  right: 16px; /* 左右各 16px，自适应宽度 */

  padding: 12px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  /* 玻璃卡片样式 */
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  backdrop-filter: blur(4px);
  z-index: 10; /* 确保在菜单上方 */
}

.user-name {
  font-size: 14px;
  color: #2d3436;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  color: #ff7675 !important;
  font-size: 16px;
  transition: transform 0.2s;
}
.logout-btn:hover {
  transform: rotate(90deg);
  background: transparent;
}

/* ================= 主内容区 ================= */
:deep(.el-main) {
  padding: 20px;
  height: 100%;
  overflow: hidden; /* 防止双滚动条 */
}

.content-glass-wrapper {
  background: rgba(255, 255, 255, 0.5); /* 内容区底板 */
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
  height: 100%;
  width: 100%;
  overflow: auto; /* 内部滚动 */
  padding: 20px;
  box-sizing: border-box;
}

/* ================= 页面切换动画 (Slide Fade) ================= */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.5, 0, 0.1, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>