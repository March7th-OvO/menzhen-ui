<template>
  <div class="workbench-container">
    <!-- 医生信息卡片 -->
    <el-card class="doctor-info-card" shadow="hover">
      <div class="doctor-info">
        <el-avatar :size="60" icon="UserFilled" style="background-color: #409EFF;" />
        <div class="doctor-details">
          <div class="doctor-name">
            {{ doctorInfo.realName +"医生" || '未知医生' }}
            <span class="doctor-id">ID: {{ doctorInfo.doctorId || '未知' }}</span>
          </div>
          <div class="doctor-meta">
            <el-tag type="primary" size="small">{{ doctorInfo.deptName || '未分配科室' }}</el-tag>
            <el-tag type="success" size="small">{{ doctorInfo.title || '医师' }}</el-tag>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">{{ pendingPatients.length }}</div>
            <div class="stat-label">待诊患者</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="height: calc(100% - 120px); margin-top: 20px;">
      <el-col :span="6" class="full-height">
        <el-card class="full-height patient-list-card" body-style="padding:0">
          <template #header>
            <div class="clearfix">
              <span>📋 待诊患者</span>
              <el-button style="float: right; padding: 3px 0" type="primary" link @click="refreshPatients">刷新</el-button>
            </div>
          </template>
          <div v-for="p in pendingPatients" :key="p.regId" class="patient-item"
               :class="{ active: currentReg.regId === p.regId }"
               @click="selectPatient(p)">
            <div class="p-name">{{ p.patientName }} <el-tag size="small">{{ p.gender }}</el-tag></div>
            <div class="p-info">{{ p.age }}岁 | 挂号ID: {{ p.regId }}</div>
          </div>
          <el-empty v-if="pendingPatients.length === 0" description="暂无待诊患者" image-size="60" />
        </el-card>
      </el-col>

      <el-col :span="18" class="full-height">
        <el-card class="full-height" v-if="currentReg && (currentReg.regId || currentReg.settlement_id)">
          <template #header>
            <div class="diagnosis-header">
              <span>正在接诊：<b>{{ currentReg.patientName }}</b></span>
              <div>
                <el-button type="warning" @click="handleCancelRegistration" style="margin-right: 10px;">退号</el-button>
                <el-button type="success" @click="handleSubmitDiagnosis">提交诊疗结果</el-button>
              </div>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="📝 病历信息" name="record">
              <el-form :model="diagnosisForm" label-position="top">
                <el-form-item label="主诉 (Description)">
                  <el-input v-model="diagnosisForm.description" type="textarea" rows="3" placeholder="患者哪里不舒服..." />
                </el-form-item>
                <el-form-item label="初步诊断 (Diagnosis)">
                  <el-input v-model="diagnosisForm.diagnosis" type="textarea" rows="3" placeholder="诊断结果..." />
                </el-form-item>
                <el-form-item label="医嘱 (Advice)">
                  <el-input v-model="diagnosisForm.advice" type="textarea" rows="3" placeholder="注意事项..." />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="💊 开具处方" name="prescription">
              <div class="pres-tools">
                <el-select
                    v-model="selectedMedicineId"
                    filterable
                    remote
                    :remote-method="searchMedicinesFunc"
                    placeholder="搜索药品名称..."
                    style="width: 300px;"
                    @change="addMedicineToTable"
                >
                  <el-option v-for="item in medicineOptions" :key="item.medId" :label="item.medName" :value="item.medId" />
                </el-select>
              </div>

              <el-table :data="diagnosisForm.medicines" stripe style="width: 100%; margin-top: 10px;">
                <el-table-column prop="medName" label="药品名称" />
                <el-table-column prop="price" label="单价" width="100" />
                <el-table-column label="数量" width="150">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.quantity" :min="1" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="用法用量">
                  <template #default="scope">
                    <el-input v-model="scope.row.usageInfo" size="small" placeholder="如：一日三次" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="scope">
                    <el-button type="danger" link icon="Delete" @click="removeMedicine(scope.$index)"></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <el-empty v-else description="请从左侧选择一位患者开始接诊" />
      </el-col>
    </el-row>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPendingPatients, searchMedicines, submitDiagnosis, getDoctorInfoByUserId, getDeptById } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

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
.doctor-name {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.doctor-id {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
  margin-left: 12px;
}

.doctor-meta {
  display: flex;
  gap: 10px;
}

.workbench-container {
  height: calc(100vh - 80px);
  padding: 20px;
}

.doctor-info-card {
  margin-bottom: 20px;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.doctor-details {
  flex: 1;
}

.doctor-name {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.doctor-meta {
  display: flex;
  gap: 10px;
}

.stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.full-height { height: 100%; }
.patient-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
}
.patient-item:hover { background-color: #f5f7fa; }
.patient-item.active { background-color: #e6f7ff; border-right: 3px solid #1890ff; }
.p-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
.p-info { font-size: 12px; color: #666; }
.diagnosis-header { display: flex; justify-content: space-between; align-items: center; }
</style>