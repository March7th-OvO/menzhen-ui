<template>
  <div class="workbench-container fade-in">
    <!-- 顶部：医生信息玻璃卡片 -->
    <div class="doctor-info-glass">
      <div class="doctor-profile">
        <div class="avatar-wrapper">
          <el-avatar :size="64" icon="UserFilled" class="glass-avatar" />
        </div>
        <div class="doctor-details">
          <div class="doctor-name-row">
            <span class="doctor-name">{{ doctorInfo.realName || '未知医生' }}</span>
            <span class="doctor-role-badge">医生</span>
          </div>
          <div class="doctor-meta-row">
            <span class="meta-tag"><el-icon><postcard /></el-icon> ID: {{ doctorInfo.doctorId || '--' }}</span>
            <span class="meta-separator">|</span>
            <span class="meta-tag">{{ doctorInfo.deptName || '未分配科室' }}</span>
            <span class="meta-separator">|</span>
            <span class="meta-tag">{{ doctorInfo.title || '医师' }}</span>
          </div>
        </div>
      </div>

      <div class="stats-glass">
        <div class="stat-item">
          <div class="stat-value">{{ pendingPatients.length }}</div>
          <div class="stat-label">待诊患者</div>
        </div>
      </div>
    </div>

    <!-- 主体内容区 -->
    <el-row :gutter="24" class="main-workspace-row">
      <!-- 左侧：待诊患者列表 -->
      <el-col :span="6" class="full-height-col">
        <el-card class="glass-card list-card" :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }">
          <template #header>
            <div class="card-header glass-header">
              <span class="header-title">
                <el-icon class="header-icon"><List /></el-icon> 待诊列表
              </span>
              <el-button link class="refresh-btn" @click="refreshPatients">
                <el-icon :class="{ 'is-loading': false }"><Refresh /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="patient-list-scroll">
            <div class="patient-list-inner">
              <div v-for="p in pendingPatients" :key="p.regId" class="patient-item-glass"
                   :class="{ active: currentReg.regId === p.regId }"
                   @click="selectPatient(p)">
                <div class="p-glass-content">
                  <div class="p-header">
                    <span class="p-name">{{ p.patientName }}</span>
                    <el-tag size="small" :type="p.gender === '男' ? '' : 'danger'" effect="plain" class="gender-tag">
                      {{ p.gender }}
                    </el-tag>
                  </div>
                  <div class="p-meta">
                    <span class="p-age">{{ p.age }}岁</span>
                    <!-- 修复：明确显示挂号ID -->
                    <span class="p-id">挂号ID: {{ p.regId }}</span>
                  </div>
                </div>
                <!-- 选中时的光条装饰 -->
                <div class="active-indicator" v-if="currentReg.regId === p.regId"></div>
              </div>
              <el-empty v-if="pendingPatients.length === 0" description="暂无待诊患者" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：诊疗工作台 -->
      <el-col :span="18" class="full-height-col">
        <el-card class="glass-card work-card" :body-style="{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }">
          <template v-if="currentReg && (currentReg.regId || currentReg.settlement_id)">
            <div class="work-header glass-header-lg">
              <div class="patient-status">
                <span class="label">正在接诊</span>
                <span class="value">{{ currentReg.patientName }}</span>
              </div>
              <div class="action-buttons">
                <el-button type="danger" plain class="glass-btn-danger" @click="handleCancelRegistration">
                  退号
                </el-button>
                <el-button type="primary" class="glass-btn-primary" @click="handleSubmitDiagnosis">
                  <el-icon style="margin-right:5px"><Check /></el-icon> 提交诊疗
                </el-button>
              </div>
            </div>

            <div class="work-content">
              <el-tabs v-model="activeTab" class="glass-tabs">
                <el-tab-pane label="📝 病历书写" name="record">
                  <div class="tab-scroll-content">
                    <el-form :model="diagnosisForm" label-position="top" class="glass-form">
                      <el-form-item label="主诉 (Description)">
                        <el-input v-model="diagnosisForm.description" type="textarea" rows="3" placeholder="患者哪里不舒服..." class="glass-textarea" />
                      </el-form-item>
                      <el-form-item label="初步诊断 (Diagnosis)">
                        <el-input v-model="diagnosisForm.diagnosis" type="textarea" rows="3" placeholder="诊断结果..." class="glass-textarea" />
                      </el-form-item>
                      <el-form-item label="医嘱 (Advice)">
                        <el-input v-model="diagnosisForm.advice" type="textarea" rows="3" placeholder="注意事项..." class="glass-textarea" />
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="💊 开具处方" name="prescription">
                  <div class="tab-scroll-content">
                    <div class="pres-tools">
                      <el-select
                          v-model="selectedMedicineId"
                          filterable
                          remote
                          :remote-method="searchMedicinesFunc"
                          placeholder="搜索药品名称..."
                          class="glass-select-lg"
                          popper-class="glass-popper"
                          @change="addMedicineToTable"
                      >
                        <el-option v-for="item in medicineOptions" :key="item.medId" :label="item.medName" :value="item.medId" />
                      </el-select>
                    </div>

                    <div class="glass-table-wrapper">
                      <el-table :data="diagnosisForm.medicines" style="width: 100%;" class="glass-table">
                        <el-table-column prop="medName" label="药品名称" />
                        <el-table-column prop="price" label="单价" width="100">
                          <template #default="scope">
                            <span class="price-text">￥{{ scope.row.price }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="数量" width="150">
                          <template #default="scope">
                            <el-input-number v-model="scope.row.quantity" :min="1" size="small" class="glass-input-number" />
                          </template>
                        </el-table-column>
                        <el-table-column label="用法用量">
                          <template #default="scope">
                            <el-input v-model="scope.row.usageInfo" size="small" placeholder="如：一日三次" class="glass-input-sm" />
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80" align="center">
                          <template #default="scope">
                            <el-button type="danger" link icon="Delete" class="delete-icon-btn" @click="removeMedicine(scope.$index)"></el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </template>

          <template v-else>
            <div class="empty-state-wrapper">
              <el-empty description="请从左侧选择一位患者开始接诊" :image-size="160" />
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPendingPatients, searchMedicines, submitDiagnosis, getDoctorInfoByUserId, getDeptById } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
import { UserFilled, List, Refresh, Check, Delete, Postcard } from '@element-plus/icons-vue'

// 获取当前登录用户信息
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

// 医生信息
const doctorInfo = ref({
  doctorId: null,
  realName: '',
  deptId: null,
  deptName: '',
  title: ''
})

// 医生ID（用于其他功能调用）
let doctorId = null

// 检查用户是否有权限访问医生工作台
const hasPermission = currentUser.role && (currentUser.role === 'doctor' || currentUser.role === 'admin')

if (!hasPermission) {
  ElMessage.warning('当前用户无权访问医生工作台')
}

const pendingPatients = ref([])
const currentReg = ref({})
const activeTab = ref('record')
const medicineOptions = ref([])
const selectedMedicineId = ref(null)

// 诊疗表单数据结构
const diagnosisForm = reactive({
  description: '',
  diagnosis: '',
  advice: '',
  medicines: []
})

onMounted(() => {
  if (hasPermission) {
    // 获取医生信息
    loadDoctorInfo()
    // 预加载一些药品
    searchMedicinesFunc('')
  }
})

// 加载医生信息（分步查询：userId → doctorId → deptId → deptName）
const loadDoctorInfo = async () => {
  try {
    // 步骤1: 通过 userId 获取医生基本信息（包含 doctorId 和 deptId）
    console.log('步骤1: 正在通过 userId 获取医生基本信息...')
    const doctorData = await getDoctorInfoByUserId()
    console.log('获取到的医生原始信息:', doctorData)

    // 提取医生基本信息
    const extractedDoctorId = doctorData.doctorId
    const extractedDeptId = doctorData.deptId
    const extractedName = doctorData.name || '未知姓名'
    const extractedTitle = doctorData.title || '未知职称'

    console.log('提取的信息:', {
      doctorId: extractedDoctorId,
      deptId: extractedDeptId,
      name: extractedName,
      title: extractedTitle
    })

    // 步骤2: 如果有科室ID，则查询科室详细信息
    let deptName = '未分配科室'
    if (extractedDeptId) {
      try {
        console.log(`步骤2: 正在查询科室信息，科室ID: ${extractedDeptId}`)
        const deptData = await getDeptById(extractedDeptId)
        console.log('获取到的科室信息:', deptData)

        // 提取科室名称
        deptName = deptData.deptName || '未知科室'
        console.log('提取的科室名称:', deptName)
      } catch (deptError) {
        console.error('获取科室信息失败:', deptError)
        // 科室信息获取失败不影响整体流程，使用默认值
        deptName = '未分配科室'
      }
    } else {
      console.log('医生未分配科室')
    }

    // 步骤3: 组装完整的医生信息
    doctorInfo.value = {
      doctorId: extractedDoctorId,
      realName: extractedName,
      deptId: extractedDeptId,
      deptName: deptName,
      title: extractedTitle
    }

    // 设置 doctorId 供其他功能使用
    doctorId = doctorInfo.value.doctorId

    console.log('最终组装的医生信息:', doctorInfo.value)
    console.log('doctorId:', doctorId)

    // 获取医生信息后，再获取待诊患者列表
    if (currentUser.role === 'doctor' && doctorId) {
      await refreshPatients()
    }
  } catch (error) {
    console.error('获取医生信息失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data
    })

    // 即使获取失败也设置默认值
    doctorInfo.value = {
      doctorId: null,
      realName: currentUser.realName || '未知医生',
      deptId: null,
      deptName: '未分配科室',
      title: '医师'
    }

    ElMessage.error('获取医生信息失败: ' + (error.message || '未知错误'))
  }
}

const searchMedicinesFunc = async (keyword) => {
  try {
    // 构造查询参数
    let url = '/medicine/search';
    const params = [];

    if (keyword) {
      params.push(`keyword=${encodeURIComponent(keyword)}`);
    }

    // 添加状态过滤参数，只显示在售药品
    params.push('status=1');

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    // 发起请求
    const response = await request.get(url);
    medicineOptions.value = response.filter(med => med.status === 1);
  } catch (error) {
    console.error('搜索药品失败:', error);
    medicineOptions.value = [];
  }
}

const refreshPatients = async () => {
  // 移除了对 doctorId 的严格检查，改为更宽松的检查
  if (!doctorId) {
    console.error('无法获取医生ID，当前doctorId:', doctorId)
    ElMessage.error('无法获取医生ID，请检查登录状态或联系管理员')
    return
  }

  console.log('正在获取待诊患者，doctorId:', doctorId)
  try {
    pendingPatients.value = await getPendingPatients(doctorId)
    console.log('获取到的患者列表:', pendingPatients.value)
    console.log('患者数量:', pendingPatients.value.length)
  } catch (error) {
    console.error('获取待诊患者失败:', error)
    ElMessage.error('获取待诊患者失败: ' + (error.message || '未知错误'))
  }
}

// 添加更多调试信息的 selectPatient 方法
const selectPatient = (patient) => {
  console.log('点击了患者:', patient)
  currentReg.value = patient
  console.log('当前选中患者更新为:', currentReg.value)
  console.log('患者的所有属性:', Object.keys(patient))
}



// 添加添加药品到处方的方法
const addMedicineToTable = (medicineId) => {
  const medicine = medicineOptions.value.find(item => item.medId === medicineId)
  if (medicine) {
    // 检查是否已经添加了该药品
    const existingMedicine = diagnosisForm.medicines.find(item => item.medId === medicineId)
    if (existingMedicine) {
      ElMessage.warning('该药品已添加到处方中')
      return
    }

    diagnosisForm.medicines.push({
      medId: medicine.medId,
      medName: medicine.medName,
      price: medicine.price,
      quantity: 1,
      usageInfo: ''
    })
    selectedMedicineId.value = null
  }
}

// 添加从处方中移除药品的方法
const removeMedicine = (index) => {
  diagnosisForm.medicines.splice(index, 1)
}

// 添加提交诊疗结果的方法
const handleSubmitDiagnosis = async () => {
  console.log('当前选中患者:', currentReg.value)
  // 更新检查逻辑,使其与渲染条件保持一致
  if (!currentReg.value || !(currentReg.value.regId || currentReg.value.settlement_id)) {
    ElMessage.warning('请选择患者')
    return
  }

  // 检查必填字段
  if (!diagnosisForm.description || !diagnosisForm.diagnosis) {
    ElMessage.warning('主诉和初步诊断不能为空')
    return
  }

  try {
    // 使用标准化的ID
    const regId = currentReg.value.reg_id
    const patientId = currentReg.value.patient_id

    // 准备提交的数据,严格按照后端 DiagnosisDTO 格式
    const submitData = {
      regId: Number(regId),           // 后端期望的是 Long 类型
      patientId: Number(patientId),   // 后端期望的是 Long 类型
      doctorId: Number(doctorId),     // 后端期望的是 Long 类型
      description: diagnosisForm.description,
      diagnosis: diagnosisForm.diagnosis,
      advice: diagnosisForm.advice,
      medicines: diagnosisForm.medicines.map(med => ({
        medId: Number(med.medId),         // 后端期望的是 Long 类型
        medName: med.medName,
        price: med.price,                 // 后端期望的是 BigDecimal 类型
        quantity: Number(med.quantity),   // 后端期望的是 Integer 类型
        usageInfo: med.usageInfo
      }))
    }

    console.log('提交的数据:', JSON.stringify(submitData, null, 2))
    console.log('当前医生ID:', doctorId)
    console.log('当前用户:', currentUser)

    await submitDiagnosis(submitData)

    ElMessage.success('诊疗结果提交成功')
    // 提交成功后刷新患者列表，确保状态同步
    await refreshPatients()
    // 清空当前选中患者和表单
    currentReg.value = {}
    diagnosisForm.description = ''
    diagnosisForm.diagnosis = ''
    diagnosisForm.advice = ''
    diagnosisForm.medicines = []
  } catch (error) {
    console.error('提交诊疗结果失败:', error)

    // 特殊处理挂号状态错误
    if (error.message && error.message.includes('未能更新挂号状态')) {
      ElMessageBox.alert(
          '该患者的挂号记录可能已被处理或不存在，请刷新患者列表后重试',
          '提交失败',
          {
            confirmButtonText: '确定',
            type: 'warning',
          }
      )
      // 刷新患者列表以同步最新状态
      await refreshPatients()
    } else {
      ElMessageBox.alert(
          error.message || '未知错误',
          '提交失败',
          {
            confirmButtonText: '确定',
            type: 'error',
          }
      )
    }
  }
}

// 添加退号处理方法
const handleCancelRegistration = async () => {
  if (!(currentReg.value.reg_id)) {
    ElMessage.warning('请选择患者')
    return
  }

  try {
    // 确认是否要退号
    await ElMessageBox.confirm(
        `确定要为患者 ${currentReg.value.patientName} 办理退号吗？此操作将把挂号状态修改为已退号。`,
        '确认退号',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    // 执行退号操作（修改挂号状态为3-已退号）
    const regId = currentReg.value.reg_id
    await request.post(`/registration/cancel/${regId}`)

    ElMessage.success('退号成功，挂号状态已更新')

    // 刷新患者列表
    await refreshPatients()

    // 清空当前选中患者和表单
    currentReg.value = {}
    diagnosisForm.description = ''
    diagnosisForm.diagnosis = ''
    diagnosisForm.advice = ''
    diagnosisForm.medicines = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退号失败:', error)
      ElMessageBox.alert(
          error.message || '退号失败，请稍后重试',
          '退号失败',
          {
            confirmButtonText: '确定',
            type: 'error',
          }
      )
    }
  }
}

</script>

<style scoped>
/* ================= 全局布局与色彩 ================= */
.workbench-container {
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.main-workspace-row {
  flex: 1;
  margin-top: 20px;
  overflow: hidden; /* 防止溢出 */
}

.full-height-col {
  height: 100%;
}

/* ================= 1. 顶部医生信息 (Glass Panel) ================= */
.doctor-info-glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.doctor-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.glass-avatar {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  box-shadow: 0 4px 10px rgba(9, 132, 227, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.doctor-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.doctor-name {
  font-size: 22px;
  font-weight: 700;
  color: #2d3436;
}

.doctor-role-badge {
  background: rgba(108, 92, 231, 0.1);
  color: #6c5ce7;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.doctor-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #636e72;
}

.meta-separator { color: #b2bec3; }

.stats-glass {
  background: rgba(255, 255, 255, 0.3);
  padding: 10px 25px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.5);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0984e3;
}

.stat-label {
  font-size: 12px;
  color: #636e72;
}

/* ================= 2. 玻璃卡片通用样式 ================= */
:deep(.glass-card) {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  overflow: hidden;
  height: 100%;
}

.glass-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-weight: 600;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-icon {
  color: #6c5ce7;
  font-size: 18px;
}

/* ================= 3. 左侧：拟态患者列表 ================= */
.patient-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.patient-item-glass {
  position: relative;
  margin-bottom: 12px;
  border-radius: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.p-glass-content {
  padding: 15px;
}

.patient-item-glass:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.patient-item-glass.active {
  background: rgba(255, 255, 255, 0.9);
  border-color: #6c5ce7;
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.15);
}

.active-indicator {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: #6c5ce7;
}

.p-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.p-name {
  font-weight: 600;
  color: #2d3436;
  font-size: 15px;
}

.p-meta {
  font-size: 12px;
  color: #636e72;
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.p-id {
  font-family: monospace; /* 稍微等宽一点，显示数字更整齐 */
}

.gender-tag {
  background: rgba(255, 255, 255, 0.5);
  border: none;
}

/* ================= 4. 右侧：工作区 ================= */
.glass-header-lg {
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
}

.patient-status .label {
  font-size: 14px;
  color: #636e72;
  margin-right: 10px;
}

.patient-status .value {
  font-size: 20px;
  font-weight: 700;
  color: #2d3436;
}

.work-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 拟态 Tabs 样式重写 */
:deep(.glass-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.glass-tabs .el-tabs__header) {
  margin: 0;
  padding: 10px 20px 0;
}

:deep(.glass-tabs .el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.5);
}

:deep(.glass-tabs .el-tabs__item) {
  font-size: 15px;
  color: #636e72;
  transition: all 0.3s;
}

:deep(.glass-tabs .el-tabs__item.is-active) {
  font-weight: bold;
  color: #6c5ce7;
}

:deep(.glass-tabs .el-tabs__active-bar) {
  background-color: #6c5ce7;
  height: 3px;
  border-radius: 3px;
}

:deep(.glass-tabs .el-tabs__content) {
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* 内容区滚动 */
}

/* 拟态表单控件 */
.glass-textarea :deep(.el-textarea__inner) {
  background: rgba(240, 245, 255, 0.6);
  border: none;
  border-radius: 12px;
  box-shadow: inset 2px 2px 6px rgba(163, 177, 198, 0.3),
  inset -2px -2px 6px rgba(255, 255, 255, 0.8);
  padding: 15px;
  font-size: 14px;
  transition: all 0.3s;
}

.glass-textarea :deep(.el-textarea__inner:focus) {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2), inset 1px 1px 3px rgba(0,0,0,0.05);
}

/* 药品选择与表格 */
.pres-tools {
  margin-bottom: 20px;
}

.glass-select-lg {
  width: 100%;
  max-width: 400px;
}

.glass-select-lg :deep(.el-select__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-table-wrapper {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.glass-table {
  --el-table-bg-color: rgba(255, 255, 255, 0.3);
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.5);
  background: transparent !important;
}

:deep(.glass-table th.el-table__cell) {
  background: rgba(255, 255, 255, 0.5) !important;
  color: #2d3436;
  font-weight: 600;
}

:deep(.glass-table tr) {
  background: transparent !important;
}

.price-text {
  color: #e67e22;
  font-weight: bold;
}

/* 按钮样式 */
.glass-btn-primary {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.glass-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 92, 231, 0.4);
}

.glass-btn-danger {
  background: transparent;
  border: 1px solid #ff7675;
  color: #ff7675;
  border-radius: 10px;
}

.glass-btn-danger:hover {
  background: #ff7675;
  color: white;
}

/* 空状态 */
.empty-state-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>