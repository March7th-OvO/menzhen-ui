<!-- src/views/Welcome.vue -->
<template>
  <div class="welcome-container">
    <div class="header-section">
      <h1 class="greeting-title animate-fade-in" :style="{ animationDelay: '0ms' }">{{ greeting }}</h1>
      <div class="clock-container animate-fade-in" :style="{ animationDelay: '100ms' }">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </div>

    <div class="content-section">
      <div class="card-container">
        <el-card class="feature-card animate-fade-in" :style="{ animationDelay: '200ms' }" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon size="24"><Calendar /></el-icon>
              <span>预约管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>高效管理患者预约信息，支持在线预约和现场挂号</p>
          </div>
        </el-card>

        <el-card class="feature-card animate-fade-in" :style="{ animationDelay: '300ms' }" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon size="24"><Box /></el-icon>
              <span>药品管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>全面管理药品库存，实时监控药品进出情况</p>
          </div>
        </el-card>

        <el-card class="feature-card animate-fade-in" :style="{ animationDelay: '400ms' }" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon size="24"><Document /></el-icon>
              <span>病历记录</span>
            </div>
          </template>
          <div class="card-content">
            <p>电子化病历管理，方便医生查阅和诊断</p>
          </div>
        </el-card>
      </div>

      <div class="quote-section animate-fade-in" :style="{ animationDelay: '500ms' }">
        <el-card class="quote-card" shadow="never">
          <div class="quote-content">
            <h3>每日一句：</h3>
            <p ref="quoteElement" class="typewriter-text"></p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Calendar, Document, Box } from '@element-plus/icons-vue'

// 时间和日期相关数据
const currentTime = ref('')
const currentDate = ref('')
const greeting = ref('')

// 引用打字机元素
const quoteElement = ref<HTMLElement | null>(null)

// 更新时间和问候语
const updateDateTime = () => {
  const now = new Date()
  
  // 格式化时间
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // 格式化日期
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  
  // 设置问候语
  const hour = now.getHours()
  if (hour < 6) {
    greeting.value = '深夜好！(´-ω-`)'
  } else if (hour < 9) {
    greeting.value = '早上好！新的一天开始了 \\(^_^)/'
  } else if (hour < 12) {
    greeting.value = '上午好！工作顺利吗？ (๑•̀ㅂ•́)و✧'
  } else if (hour < 14) {
    greeting.value = '中午好！记得休息一下 (¦3[___]'
  } else if (hour < 18) {
    greeting.value = '下午好！继续加油 (ง •_•)ง'
  } else if (hour < 22) {
    greeting.value = '晚上好！辛苦了 (´∀｀)♡'
  } else {
    greeting.value = '夜深了，注意休息 (¦з[___]"'
  }
}

// 定时器
let timer: ReturnType<typeof setInterval> | null = null

// 名言列表
const quotes = [
  "欢唱，以我之名！",
  "大丘丘病了，二丘丘瞧，三丘丘采药，四丘丘嗷~",
  "千年之羽渡红尘，太虚之握掌乾坤。",
  "总会有地上的生灵，敢于直面雷霆的威光。",
  "水龙水龙别哭了。",
  "我要验牌---------牌没有问题。",
  "当一个故事快要结束的时候，人们总会想起它的开始"
]

// 简单实现打字机效果
let intervalId: ReturnType<typeof setInterval> | null = null
let currentQuoteIndex = 0
let charIndex = 0
let isDeleting = false

// 初始化打字机效果
const initTypewriter = () => {
  if (!quoteElement.value) return
  
  const currentQuote = quotes[currentQuoteIndex]
  
  if (isDeleting) {
    // 删除文字
    if (charIndex > 0) {
      charIndex--
      quoteElement.value.textContent = currentQuote.substring(0, charIndex)
    } else {
      // 切换到下一 quote
      isDeleting = false
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length
      setTimeout(initTypewriter, 500) // 暂停后再开始
      return
    }
  } else {
    // 添加文字
    if (charIndex < currentQuote.length) {
      charIndex++
      quoteElement.value.textContent = currentQuote.substring(0, charIndex)
    } else {
      // 开始删除
      isDeleting = true
      setTimeout(initTypewriter, 2000) // 完整显示后暂停2秒再删除
      return
    }
  }
  
  // 设置下一次更新的时间
  const speed = isDeleting ? 50 : 100
  setTimeout(initTypewriter, speed)
}

onMounted(() => {
  // 初始化时间和问候语
  updateDateTime()
  
  // 每秒更新一次时间
  timer = setInterval(updateDateTime, 1000)
  
  // 初始化打字机效果
  setTimeout(initTypewriter, 1000)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
  }
  
  // 清理打字机定时器
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.welcome-container {
  padding: 24px;
  min-height: calc(100vh - 48px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.greeting-title {
  font-size: 2.5rem;
  color: #409eff;
  margin: 0 0 20px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

.clock-container {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  max-width: 300px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

.time {
  font-size: 2rem;
  font-weight: 700;
  color: #303133;
  font-family: 'Courier New', monospace;
}

.date {
  font-size: 1rem;
  color: #606266;
  margin-top: 8px;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.feature-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
}

.card-content p {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 0;
}

.quote-section {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

.quote-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border: 1px solid #ebeef5;
}

.quote-content h3 {
  margin-top: 0;
  color: #409eff;
  font-size: 1.3rem;
}

.typewriter-text {
  min-height: 24px;
  font-style: italic;
  color: #606266;
  font-size: 1.1rem;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-container {
    padding: 16px;
  }
  
  .greeting-title {
    font-size: 2rem;
  }
  
  .card-container {
    grid-template-columns: 1fr;
  }
  
  .clock-container {
    max-width: 100%;
  }
}
</style>