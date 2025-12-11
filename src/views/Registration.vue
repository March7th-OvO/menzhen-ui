<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="registrations-list">
          <template #header>
            <div class="card-header">
              <span>📋 挂号列表</span>
            </div>
          </template>
          <div class="registration-item" 
               v-for="reg in registrations" 
               :key="reg.regId"
               @click="selectRegistration(reg)"
               :class="{ active: currentRegistration && currentRegistration.regId === reg.regId }">
            <div class="reg-header">
              <div class="reg-patient">
                <el-tag :type="getStatusType(reg.status)" effect="dark" size="small">
                  {{ getStatusText(reg.status) }}
                </el-tag>
                <span class="patient-name">{{ getPatientName(reg.patientId) }}</span>
                <span class="patient-age">({{ getPatientGender(reg.patientId) }} {{ getPatientAge(reg.patientId) }}岁)</span>
              </div>
              <div class="reg-id">挂号ID: {{ reg.regId }}</div>
            </div>
            
            <div class="reg-body">
              <div class="reg-doctor-info">
                <div class="reg-dept">{{ getDeptName(reg.deptId) }}</div>
                <div class="reg-doctor">主治医生: {{ getDoctorName(reg.doctorId) }}</div>
              </div>
              
              <div class="reg-details">
                <div class="reg-level">级别: {{ getLevelName(reg.levelId) }}</div>
                <div class="reg-fee">费用: ￥{{ reg.fee }}</div>
                <div class="reg-date">时间: {{ formatDate(reg.regDate) }} {{ reg.regTimeSlot }}</div>
              </div>
            </div>
          </div>
          <el-empty v-if="registrations.length === 0" description="暂无挂号记录" />
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>📅 门诊挂号</span>
            </div>
          </template>

          <div class="step-box">
            <el-input
                v-model="idCardSearch"
                placeholder="输入身份证号回车查询"
                class="search-input"
                @keyup.enter="searchPatient"
            >
              <template #append><el-button icon="Search" @click="searchPatient" /></template>
            </el-input>
          </div>

          <div v-if="patient.patientId" class="patient-info">
            <el-descriptions title="患者信息" border>
              <el-descriptions-item label="姓名">{{ patient.name }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ patient.gender }}</el-descriptions-item>
              <el-descriptions-item label="年龄">{{ patient.age }}</el-descriptions-item>
              <el-descriptions-item label="电话">{{ patient.phone }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <el-form v-if="patient.patientId" :model="regForm" label-width="100px" style="margin-top: 20px;">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="选择科室">
                  <el-select v-model="regForm.deptId" placeholder="请选择科室" @change="handleDeptChange">
                    <el-option
                        v-for="d in depts"
                        :key="d.id"
                        :label="`${d.code} - ${d.name}`"
                        :value="d.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="选择医生">
                  <el-select v-model="regForm.doctorId" placeholder="请选择医生">
                    <el-option v-for="doc in doctors" :key="doc.doctorId" :label="doc.name" :value="doc.doctorId" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="挂号级别">
                  <el-select v-model="regForm.levelId" placeholder="选择级别">
                    <el-option v-for="l in levels" :key="l.levelId" :label="l.levelName + ' (￥' + l.fee + ')'" :value="l.levelId" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <div style="text-align: right;">
              <el-button type="primary" size="large" @click="submitReg">确认挂号</el-button>
            </div>
          </el-form>

          <el-empty v-else description="请先查询或建档患者信息">
            <el-button type="primary" @click="dialogVisible = true">新建患者档案</el-button>
          </el-empty>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" title="新建患者档案" width="500px">
      <el-form :model="newPatient" label-width="80px">
        <el-form-item label="姓名"><el-input v-model="newPatient.name" /></el-form-item>
        <el-form-item label="身份证"><el-input v-model="newPatient.idCard" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="newPatient.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄"><el-input-number v-model="newPatient.age" /></el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker v-model="newPatient.birthDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期"/>
        </el-form-item>
        <el-form-item label="电话"><el-input v-model="newPatient.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="newPatient.address" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreatePatient">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { getPatientInfo, getPatientInfoById, addPatient, getDepts, getDoctors, getLevels, createRegistration, getAllRegistrations, getRegistrationNames } from '../api'
import { ElMessage, ElNotification } from 'element-plus'

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
        // 获取患者详细信息
        const patientDetails = await getPatientInfoById(patientId)
        patientMap.value[patientId] = {
          name: patientDetails.name,
          gender: patientDetails.gender,
          age: patientDetails.age
        }
      } catch (error) {
        console.error(`获取患者${patientId}信息失败:`, error)
        // 设置默认值
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
        // 查找与此医生ID关联的任何挂号记录，以获取患者ID
        const regWithDoctor = registrations.value.find(r => r.doctorId === doctorId)
        if (regWithDoctor) {
          const names = await getRegistrationNames(regWithDoctor.patientId, doctorId)
          
          // 更新医生信息
          if (names.doctorName && !doctorMap.value[doctorId]) {
            doctorMap.value[doctorId] = {
              name: names.doctorName,
              deptId: regWithDoctor.deptId
            }
          }
        }
      } catch (error) {
        console.error(`获取医生${doctorId}信息失败:`, error)
        // 设置默认值
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
      // 创建成功后，主动查询一次以验证数据是否真的被保存了
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
  
  // 更新医生映射
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
  
  // 重新加载挂号列表
  await loadRegistrations()
  
  // 重置
  patient.value = {}
  idCardSearch.value = ''
  regForm.deptId = null
}

const selectRegistration = (reg) => {
  currentRegistration.value = reg
}

// 获取状态文本
const getStatusText = (status) => {
  switch(status) {
    case 1: return '已挂号'
    case 2: return '已问诊'
    case 3: return '已退号'
    case 4: return '已作废'
    default: return '未知'
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch(status) {
    case 1: return 'primary'  // 已挂号 - 蓝色
    case 2: return 'success'  // 已问诊 - 绿色
    case 3: return 'warning'  // 已退号 - 橙色
    case 4: return 'danger'   // 已作废 - 红色
    default: return 'info'    // 未知 - 灰色
  }
}

// 获取患者姓名
const getPatientName = (patientId) => {
  // 如果已经有缓存的患者信息，直接返回姓名
  if (patientMap.value[patientId]) {
    return patientMap.value[patientId].name
  }
  
  // 否则返回默认值
  return `患者${patientId}`
}

// 获取患者性别
const getPatientGender = (patientId) => {
  // 如果已经有缓存的患者信息，直接返回性别
  if (patientMap.value[patientId]) {
    return patientMap.value[patientId].gender
  }
  
  // 否则返回默认值
  return '未知'
}

// 获取患者年龄
const getPatientAge = (patientId) => {
  // 如果已经有缓存的患者信息，直接返回年龄
  if (patientMap.value[patientId]) {
    return patientMap.value[patientId].age
  }
  
  // 否则返回默认值
  return '未知'
}

// 获取医生姓名
const getDoctorName = (doctorId) => {
  // 如果已经有缓存的医生信息，直接返回姓名
  if (doctorMap.value[doctorId]) {
    return doctorMap.value[doctorId].name
  }
  
  // 否则返回默认值
  return `医生${doctorId}`
}

// 获取科室名称
const getDeptName = (deptId) => {
  return deptMap.value[deptId]?.name || `科室${deptId}`
}

// 获取级别名称
const getLevelName = (levelId) => {
  return levelMap.value[levelId]?.levelName || `级别${levelId}`
}

// 格式化日期
const formatDate = (dateString) => {
  return dateString
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.search-input { width: 400px; margin-bottom: 20px; }
.patient-info { margin-bottom: 20px; border-left: 5px solid #409EFF; padding-left: 10px; }

.registrations-list {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.registration-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.registration-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
}

.registration-item.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.reg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reg-patient {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-name {
  font-weight: bold;
  font-size: 16px;
}

.patient-age {
  color: #606266;
  font-size: 14px;
}

.reg-id {
  color: #909399;
  font-size: 12px;
}

.reg-body {
  display: flex;
  justify-content: space-between;
}

.reg-doctor-info {
  flex: 1;
}

.reg-dept {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.reg-doctor {
  color: #606266;
  font-size: 14px;
  margin-bottom: 5px;
}

.reg-details {
  text-align: right;
}

.reg-level, .reg-fee, .reg-date {
  color: #606266;
  font-size: 13px;
  margin-bottom: 3px;
}

.reg-fee {
  font-weight: bold;
  color: #e6a23c;
}
</style>