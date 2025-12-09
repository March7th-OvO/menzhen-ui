<template>
  <div class="page-container">
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
import { ref, onMounted, reactive } from 'vue'
import { getPatientInfo, addPatient, getDepts, getDoctors, getLevels, createRegistration } from '../api'
import { ElMessage, ElNotification } from 'element-plus'

const idCardSearch = ref('')
const patient = ref({})
const depts = ref([])
const doctors = ref([])
const levels = ref([])
const dialogVisible = ref(false)
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

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
})

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
  // 重置
  patient.value = {}
  idCardSearch.value = ''
  regForm.deptId = null
}
</script>

<style scoped>
.search-input { width: 400px; margin-bottom: 20px; }
.patient-info { margin-bottom: 20px; border-left: 5px solid #409EFF; padding-left: 10px; }
</style>