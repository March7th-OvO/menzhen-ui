<template>
  <div class="page-container fade-in">
    <el-row :gutter="24">
      <!-- 左侧：挂号列表 -->
      <el-col :span="8">
        <el-card class="glass-card list-card" :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }">
          <template #header>
            <div class="card-header glass-header">
              <span class="header-title">
                <el-icon class="header-icon"><List /></el-icon> 挂号列表
              </span>
              <span class="header-badge">{{ registrations.length }}</span>
            </div>
          </template>

          <div class="registrations-scroll-area">
            <div class="registrations-inner-padding">
              <div class="registration-item"
                   v-for="reg in registrations"
                   :key="reg.regId"
                   @click="selectRegistration(reg)"
                   :class="{ active: currentRegistration && currentRegistration.regId === reg.regId }">

                <div class="reg-glass-content">
                  <div class="reg-header">
                    <div class="reg-patient">
                      <div class="status-dot" :class="getStatusClass(reg.status)"></div>
                      <span class="patient-name">{{ getPatientName(reg.patientId) }}</span>
                      <span class="patient-age">{{ getPatientGender(reg.patientId) }} · {{ getPatientAge(reg.patientId) }}岁</span>
                    </div>
                    <div class="reg-id">#{{ reg.regId }}</div>
                  </div>

                  <div class="reg-body">
                    <div class="reg-info-row">
                      <span class="info-label">科室</span>
                      <span class="info-value">{{ getDeptName(reg.deptId) }}</span>
                    </div>
                    <div class="reg-info-row">
                      <span class="info-label">医生</span>
                      <span class="info-value">{{ getDoctorName(reg.doctorId) }}</span>
                    </div>
                    <div class="reg-divider"></div>
                    <div class="reg-footer">
                      <span class="reg-tag">{{ getLevelName(reg.levelId) }}</span>
                      <span class="reg-fee">￥{{ reg.fee }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <el-empty v-if="registrations.length === 0" description="暂无挂号记录" :image-size="100" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：挂号操作台 -->
      <el-col :span="16">
        <el-card class="glass-card action-card" :body-style="{ padding: '20px', height: '100%', overflowY: 'auto' }">
          <template #header>
            <div class="card-header glass-header">
              <span class="header-title">
                <el-icon class="header-icon"><Calendar /></el-icon> 门诊挂号
              </span>
            </div>
          </template>

          <div class="action-card-content">
            <div class="step-box">
              <div class="search-wrapper">
                <el-input
                    v-model="idCardSearch"
                    placeholder="请输入身份证号查询..."
                    class="glass-input search-input"
                    @keyup.enter="searchPatient"
                    prefix-icon="Search"
                    clearable
                >
                  <template #append>
                    <el-button icon="Search" @click="searchPatient" class="glass-append-btn" />
                  </template>
                </el-input>
              </div>
            </div>

            <transition name="el-fade-in-linear">
              <div v-if="patient.patientId" class="patient-details-glass">
                <div class="details-title">患者档案</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <label>姓名</label>
                    <span>{{ patient.name }}</span>
                  </div>
                  <div class="detail-item">
                    <label>性别</label>
                    <span>{{ patient.gender }}</span>
                  </div>
                  <div class="detail-item">
                    <label>年龄</label>
                    <span>{{ patient.age }}</span>
                  </div>
                  <div class="detail-item">
                    <label>电话</label>
                    <span>{{ patient.phone }}</span>
                  </div>
                </div>
              </div>
            </transition>

            <transition name="el-zoom-in-top">
              <el-form v-if="patient.patientId" :model="regForm" label-position="top" class="glass-form" style="margin-top: 25px;">
                <el-row :gutter="24">
                  <el-col :span="8" style="height: auto;"> <!-- 内部表单的col不需要强制100%高度 -->
                    <el-form-item label="选择科室">
                      <el-select v-model="regForm.deptId" placeholder="请选择科室" @change="handleDeptChange" class="glass-select" popper-class="glass-popper">
                        <el-option
                            v-for="d in depts"
                            :key="d.id"
                            :label="`${d.code} - ${d.name}`"
                            :value="d.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8" style="height: auto;">
                    <el-form-item label="选择医生">
                      <el-select v-model="regForm.doctorId" placeholder="请选择医生" class="glass-select" popper-class="glass-popper">
                        <el-option v-for="doc in doctors" :key="doc.doctorId" :label="doc.name" :value="doc.doctorId" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8" style="height: auto;">
                    <el-form-item label="挂号级别">
                      <el-select v-model="regForm.levelId" placeholder="选择级别" class="glass-select" popper-class="glass-popper">
                        <el-option v-for="l in levels" :key="l.levelId" :label="l.levelName + ' (￥' + l.fee + ')'" :value="l.levelId" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="form-actions">
                  <el-button type="primary" size="large" @click="submitReg" class="glass-btn-primary">
                    确认挂号
                  </el-button>
                </div>
              </el-form>
            </transition>

            <div v-if="!patient.patientId" class="empty-placeholder">
              <el-empty description="请先查询或建档患者信息" :image-size="140">
                <el-button class="glass-btn-outline" @click="dialogVisible = true">
                  <el-icon style="margin-right: 5px"><Plus /></el-icon> 新建患者档案
                </el-button>
              </el-empty>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗也需要拟态化，通过 CSS 覆盖 -->
    <el-dialog v-model="dialogVisible" title="新建患者档案" width="500px" class="glass-dialog" center destroy-on-close>
      <el-form :model="newPatient" label-width="80px" class="dialog-form">
        <el-form-item label="姓名"><el-input v-model="newPatient.name" class="glass-input-sm" /></el-form-item>
        <el-form-item label="身份证"><el-input v-model="newPatient.idCard" class="glass-input-sm" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="newPatient.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄"><el-input-number v-model="newPatient.age" class="glass-input-sm" /></el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker v-model="newPatient.birthDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" class="glass-input-sm"/>
        </el-form-item>
        <el-form-item label="电话"><el-input v-model="newPatient.phone" class="glass-input-sm" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="newPatient.address" class="glass-input-sm" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" class="glass-btn-default">取消</el-button>
        <el-button type="primary" @click="handleCreatePatient" class="glass-btn-primary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { getPatientInfo, getPatientInfoById, addPatient, getDepts, getDoctors, getLevels, createRegistration, getAllRegistrations, getRegistrationNames } from '../api'
import { ElMessage, ElNotification } from 'element-plus'
import { List, Calendar, Search, Plus } from '@element-plus/icons-vue'

const idCardSearch = ref('')
const patient = ref({})
const depts = ref([])
const doctors = ref([])
const levels = ref([])
const dialogVisible = ref(false)
const registrations = ref([])
const currentRegistration = ref(null)
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

// 存储相关数据的映射
const patientMap = ref({})
const doctorMap = ref({})
const deptMap = ref({})
const levelMap = ref({})

const regForm = reactive({
  deptId: null,
  doctorId: null,
  levelId: null,
  settlementId: 1, // 默认自费
  regDate: new Date().toISOString().split('T')[0],
  regTimeSlot: '上午'
})

const newPatient = reactive({
  name: '', idCard: '', gender: '男', age: 18, phone: '', address: '', birthDate: ''
})

onMounted(async () => {
  depts.value = await getDepts()
  levels.value = await getLevels()

  // 构建科室映射
  deptMap.value = {}
  depts.value.forEach(dept => {
    deptMap.value[dept.id] = dept
  })

  // 构建级别映射
  levelMap.value = {}
  levels.value.forEach(level => {
    levelMap.value[level.levelId] = level
  })

  loadRegistrations()
})

const loadRegistrations = async () => {
  try {
    let allRegistrations = await getAllRegistrations()

    // 只显示状态为1（已挂号）的挂号记录
    registrations.value = allRegistrations.filter(reg => reg.status === 1)

    // 收集所有唯一的患者ID和医生ID
    const uniquePatientIds = [...new Set(registrations.value.map(r => r.patientId))]
    const uniqueDoctorIds = [...new Set(registrations.value.map(r => r.doctorId))]

    // 批量获取患者详细信息
    await Promise.all(uniquePatientIds.map(async (patientId) => {
      try {
        const patientDetails = await getPatientInfoById(patientId)
        patientMap.value[patientId] = {
          name: patientDetails.name,
          gender: patientDetails.gender,
          age: patientDetails.age
        }
      } catch (error) {
        console.error(`获取患者${patientId}信息失败:`, error)
        patientMap.value[patientId] = {
          name: `患者${patientId}`,
          gender: '未知',
          age: '未知'
        }
      }
    }))

    // 批量获取患者和医生姓名
    await Promise.all(uniqueDoctorIds.map(async (doctorId) => {
      try {
        const regWithDoctor = registrations.value.find(r => r.doctorId === doctorId)
        if (regWithDoctor) {
          const names = await getRegistrationNames(regWithDoctor.patientId, doctorId)
          if (names.doctorName && !doctorMap.value[doctorId]) {
            doctorMap.value[doctorId] = {
              name: names.doctorName,
              deptId: regWithDoctor.deptId
            }
          }
        }
      } catch (error) {
        console.error(`获取医生${doctorId}信息失败:`, error)
        doctorMap.value[doctorId] = {
          name: `医生${doctorId}`,
          deptId: ''
        }
      }
    }))

  } catch (error) {
    ElMessage.error('获取挂号列表失败: ' + error.message)
  }
}

const searchPatient = async () => {
  if(!idCardSearch.value) return
  const res = await getPatientInfo(idCardSearch.value)
  if(res) {
    patient.value = res
  } else {
    patient.value = {}
    ElMessage.info('未找到患者，请先建档')
  }
}

const handleCreatePatient = async () => {
  try {
    const res = await addPatient(newPatient)
    if (res && res.patientId) {
      const verifiedPatient = await getPatientInfo(res.idCard)
      if (verifiedPatient) {
        patient.value = verifiedPatient
        idCardSearch.value = verifiedPatient.idCard
        dialogVisible.value = false
        ElMessage.success('建档成功')
      } else {
        ElMessage.error('患者档案创建失败，请稍后重试')
      }
    } else {
      ElMessage.error('患者档案创建失败')
    }
  } catch (error) {
    ElMessage.error('患者档案创建失败: ' + error.message)
  }
}


const handleDeptChange = async (val) => {
  regForm.doctorId = null
  doctors.value = await getDoctors(val)
  doctors.value.forEach(doctor => {
    doctorMap.value[doctor.doctorId] = doctor
  })
}

const submitReg = async () => {
  if(!regForm.doctorId || !regForm.levelId) return ElMessage.warning('请完整填写挂号信息')

  const payload = {
    ...regForm,
    patientId: patient.value.patientId,
    userId: currentUser.userId // 操作员ID
  }

  await createRegistration(payload)
  ElNotification.success({ title: '挂号成功', message: `患者 ${patient.value.name} 已挂号` })

  await loadRegistrations()

  patient.value = {}
  idCardSearch.value = ''
  regForm.deptId = null
}

const selectRegistration = (reg) => {
  currentRegistration.value = reg
}

// 辅助样式类方法
const getStatusClass = (status) => {
  switch(status) {
    case 1: return 'status-primary'
    case 2: return 'status-success'
    case 3: return 'status-warning'
    case 4: return 'status-danger'
    default: return 'status-info'
  }
}

const getPatientName = (patientId) => {
  if (patientMap.value[patientId]) {
    return patientMap.value[patientId].name
  }
  return `患者${patientId}`
}

const getPatientGender = (patientId) => {
  if (patientMap.value[patientId]) {
    return patientMap.value[patientId].gender
  }
  return '未知'
}

const getPatientAge = (patientId) => {
  if (patientMap.value[patientId]) {
    return patientMap.value[patientId].age
  }
  return '未知'
}

const getDoctorName = (doctorId) => {
  if (doctorMap.value[doctorId]) {
    return doctorMap.value[doctorId].name
  }
  return `医生${doctorId}`
}

const getDeptName = (deptId) => {
  return deptMap.value[deptId]?.name || `科室${deptId}`
}

const getLevelName = (levelId) => {
  return levelMap.value[levelId]?.levelName || `级别${levelId}`
}

const formatDate = (dateString) => {
  return dateString
}
</script>

<style scoped>
/* 全局设计语言：
  Glassmorphism (毛玻璃) + Neumorphism (拟态/软UI)
  主色调：#6c5ce7 (与 Layout 保持一致)
*/

.page-container {
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
  display: flex; /* 改为 flex 布局 */
  flex-direction: column;
}

/* 强制 el-row 占满剩余空间 */
.page-container > .el-row {
  flex: 1;
  height: 100%; /* 关键：让 row 高度撑开 */
}

/* 强制 el-col 占满高度 */
.page-container :deep(.el-col) {
  height: 100%;
}

/* =========================================
   Glass Card (玻璃卡片容器)
========================================= */
:deep(.glass-card) {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  overflow: hidden;
  transition: transform 0.3s ease;
  height: 100%;
  display: flex; /* 让卡片内容也 flex 布局 */
  flex-direction: column;
}

/* 强制卡片内容区占满并处理滚动 */
:deep(.el-card__body) {
  flex: 1;
  overflow: hidden; /* 防止双重滚动条 */
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  padding: 15px 20px;
  flex-shrink: 0; /* 防止 header 被压缩 */
}

.glass-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #6c5ce7;
  font-size: 20px;
}

.header-badge {
  background: rgba(108, 92, 231, 0.1);
  color: #6c5ce7;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

/* =========================================
   左侧：挂号列表 (3D 胶囊风格)
========================================= */
.registrations-scroll-area {
  flex: 1; /* 自动占据剩余空间 */
  overflow-y: auto; /* 内部滚动 */
  /* 移除固定的 max-height */
}

.registrations-inner-padding {
  padding: 10px; /* 将 padding 移到内部容器 */
}

.registration-item {
  margin-bottom: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;

  /* 默认状态：半透明玻璃 */
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.reg-glass-content {
  padding: 16px;
}

/* Hover: 上浮 + 投影 */
.registration-item:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(255, 255, 255, 0.7);
  box-shadow:
      0 10px 20px rgba(0, 0, 0, 0.05),
      0 4px 6px rgba(0, 0, 0, 0.02);
  z-index: 10;
}

/* Active: 拟态内陷 / 激活光晕 */
.registration-item.active {
  background: rgba(255, 255, 255, 0.9);
  border-color: #6c5ce7;
  /* 混合投影：外部柔和发光 */
  box-shadow: 0 0 0 1px #6c5ce7, 0 8px 20px rgba(108, 92, 231, 0.15);
}

/* 列表内部排版 */
.reg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reg-patient {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-name {
  font-weight: 600;
  font-size: 16px;
  color: #2d3436;
}

.patient-age {
  font-size: 12px;
  color: #636e72;
}

.reg-id {
  font-size: 12px;
  color: #b2bec3;
  font-family: monospace;
}

/* 状态小圆点 */
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-primary { background: #6c5ce7; box-shadow: 0 0 8px #6c5ce7; }
.status-success { background: #00b894; }
.status-warning { background: #fdcb6e; }
.status-danger  { background: #ff7675; }

.reg-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.info-label { color: #888; }
.info-value { color: #2d3436; font-weight: 500; }

.reg-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent);
  margin: 10px 0;
}

.reg-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reg-tag {
  background: rgba(108, 92, 231, 0.1);
  color: #6c5ce7;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.reg-fee {
  font-size: 16px;
  font-weight: bold;
  color: #6c5ce7;
}

/* =========================================
   右侧：表单与拟态输入框
========================================= */
.search-wrapper {
  margin: 20px 0 30px 0;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
}

/* 拟态输入框样式 (Neumorphic Input) */
:deep(.glass-input .el-input__wrapper),
:deep(.glass-select .el-select__wrapper),
:deep(.glass-input-sm .el-input__wrapper) {
  background: rgba(240, 245, 255, 0.6); /* 浅色背景 */
  box-shadow: inset 2px 2px 6px rgba(163, 177, 198, 0.3),
  inset -2px -2px 6px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: none;
  padding: 8px 15px;
  transition: all 0.3s;
}

:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-select .el-select__wrapper.is-focused) {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.3),
  inset 2px 2px 6px rgba(163, 177, 198, 0.1);
}

:deep(.el-input-group__append) {
  background: transparent;
  border: none;
  box-shadow: none;
}

.glass-append-btn {
  border-radius: 0 12px 12px 0;
  color: #6c5ce7;
}

/* 患者信息卡片 (Glass Panel) */
.patient-details-glass {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.patient-details-glass::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: #6c5ce7;
}

.details-title {
  font-size: 14px;
  color: #6c5ce7;
  font-weight: bold;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.detail-item label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.detail-item span {
  font-size: 16px;
  color: #2d3436;
  font-weight: 600;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}

.glass-btn-primary {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
  font-weight: 600;
  padding: 12px 30px;
  transition: transform 0.2s;
}

.glass-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.5);
  background: linear-gradient(135deg, #7b6bed, #b0aafc);
}

.glass-btn-outline {
  background: transparent;
  border: 2px solid #6c5ce7;
  color: #6c5ce7;
  border-radius: 12px;
  font-weight: 600;
}

.glass-btn-outline:hover {
  background: rgba(108, 92, 231, 0.1);
}

/* 下拉菜单 Popper 样式 */
:global(.glass-popper.el-select__popper) {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
}

:global(.glass-popper .el-select-dropdown__item.hover),
:global(.glass-popper .el-select-dropdown__item:hover) {
  background: rgba(108, 92, 231, 0.1) !important;
  color: #6c5ce7 !important;
  border-radius: 8px;
}

</style>