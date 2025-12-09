<template>
  <div class="workbench-container">
    <el-row :gutter="20" style="height: 100%;">
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
        <el-card class="full-height" v-if="currentReg.regId">
          <template #header>
            <div class="diagnosis-header">
              <span>正在接诊：<b>{{ currentReg.patientName }}</b></span>
              <el-button type="success" @click="handleSubmitDiagnosis">提交诊疗结果</el-button>
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
                    :remote-method="searchMed"
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
import { getPendingPatients, searchMedicines, submitDiagnosis } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { jwtDecode } from 'jwt-decode'

// 获取当前登录用户信息
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

// 从JWT token中解析用户ID
let doctorId = null
try {
  const token = localStorage.getItem('token')
  if (token) {
    const decodedToken = jwtDecode(token)
    doctorId = decodedToken.userId || decodedToken.id || decodedToken.doctorId || null
  }
} catch (error) {
  console.error('解析JWT token失败:', error)
}

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
    // 只有医生才需要获取待诊患者列表
    if (currentUser.role === 'doctor') {
      refreshPatients()
    }
    // 预加载一些药品
    searchMed('')
  }
})

const refreshPatients = async () => {
  // 更详细的错误提示
  if (!doctorId) {
    console.error('无法从token中解析出医生ID，token信息:', localStorage.getItem('token'))
    return ElMessage.error('无法获取医生ID，请检查登录状态或联系管理员')
  }
  pendingPatients.value = await getPendingPatients(doctorId)
}

const selectPatient = (p) => {
  currentReg.value = p
  // 重置表单
  diagnosisForm.description = ''
  diagnosisForm.diagnosis = ''
  diagnosisForm.advice = ''
  diagnosisForm.medicines = []
}

const searchMed = async (query) => {
  medicineOptions.value = await searchMedicines(query)
}

const addMedicineToTable = (medId) => {
  const med = medicineOptions.value.find(m => m.medId === medId)
  if(med) {
    // 查重
    if(diagnosisForm.medicines.find(m => m.medId === medId)) {
      ElMessage.warning('该药品已添加')
      return
    }
    diagnosisForm.medicines.push({
      medId: med.medId,
      medName: med.medName,
      price: med.price,
      quantity: 1,
      usageInfo: ''
    })
  }
  selectedMedicineId.value = null
}

const removeMedicine = (index) => {
  diagnosisForm.medicines.splice(index, 1)
}

const handleSubmitDiagnosis = async () => {
  if (!hasPermission) {
    return ElMessage.error('当前用户无权执行此操作')
  }

  // 只有医生可以提交诊断结果
  if (currentUser.role !== 'doctor') {
    return ElMessage.error('只有医生可以提交诊断结果')
  }

  if(!diagnosisForm.diagnosis) return ElMessage.warning('请填写诊断结果')

  const payload = {
    regId: currentReg.value.regId,
    patientId: currentReg.value.patientId,
    doctorId: doctorId,
    ...diagnosisForm
  }

  try {
    await submitDiagnosis(payload)
    ElMessage.success('诊疗完成，处方已开具')
    // 移除已诊患者并重置
    currentReg.value = {}
    refreshPatients()
  } catch(e) {
    console.error(e)
  }
}
</script>



<style scoped>
.workbench-container { height: calc(100vh - 80px); } /* 减去头部高度 */
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