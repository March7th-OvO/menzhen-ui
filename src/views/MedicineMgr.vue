<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>💊 药房管理</span>
          <el-button type="primary" icon="Plus" @click="handleAdd">新增药品</el-button>
        </div>
      </template>

      <div class="search-box" style="margin-bottom: 20px; display: flex; gap: 10px;">
        <el-input
            v-model="keyword"
            placeholder="搜索药品名称..."
            style="width: 300px;"
            @keyup.enter="handleSearch"
            clearable
            @clear="handleSearch"
        >
          <template #append><el-button icon="Search" @click="handleSearch" /></template>
        </el-input>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="medCode" label="编码" width="120" />
        <el-table-column prop="medName" label="药品名称" min-width="150" />
        <el-table-column prop="format" label="规格" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100">
          <template #default="scope">￥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="scope">
            <span :style="{ color: scope.row.stock < 10 ? 'red' : 'inherit', fontWeight: scope.row.stock < 10 ? 'bold' : 'normal' }">
              {{ scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.medId ? '编辑药品' : '新增药品'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="药品名称">
          <el-input v-model="form.medName" placeholder="如：阿莫西林胶囊" />
        </el-form-item>
        <el-form-item label="药品编码">
          <el-input v-model="form.medCode" placeholder="如：MED001" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.format" placeholder="如：0.25g*24粒/盒" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择" style="width: 100%;">
            <el-option label="西药" value="西药" />
            <el-option label="中成药" value="中成药" />
            <el-option label="中草药" value="中草药" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="0">停售</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { searchMedicines, saveMedicine } from '../api' // 引入接口
import { ElMessage } from 'element-plus'

const keyword = ref('')
const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)

// 表单数据
const form = reactive({
  medId: null,
  medName: '',
  medCode: '',
  format: '',
  price: 0,
  stock: 0,
  category: '西药',
  status: 1
})

onMounted(() => {
  handleSearch()
})

// 查询药品
const handleSearch = async () => {
  loading.value = true
  try {
    // 如果没有关键词，搜索空字符串会返回所有
    tableData.value = await searchMedicines(keyword.value || '')
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
const handleAdd = () => {
  form.medId = null
  form.medName = ''
  form.medCode = ''
  form.format = ''
  form.price = 0
  form.stock = 100
  form.category = '西药'
  form.status = 1
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  // 复制数据到表单
  Object.assign(form, row)
  dialogVisible.value = true
}

// 快速修改状态（Switch开关）
const handleStatusChange = async (row) => {
  try {
    await saveMedicine(row)
    ElMessage.success('状态更新成功')
  } catch (e) {
    // 失败回滚状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 提交保存
const handleSubmit = async () => {
  if (!form.medName || !form.price) return ElMessage.warning('请填写完整信息')

  try {
    await saveMedicine(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    handleSearch() // 刷新列表
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>