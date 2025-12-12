<template>
  <div class="page-container fade-in">
    <el-card class="glass-card" :body-style="{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }">
      <template #header>
        <div class="card-header glass-header">
          <span class="header-title">
            <el-icon class="header-icon"><FirstAidKit /></el-icon> 药房管理
          </span>
          <el-button type="primary" icon="Plus" @click="handleAdd" class="glass-btn-primary">新增药品</el-button>
        </div>
      </template>

      <div class="content-wrapper">
        <!-- 搜索栏 -->
        <div class="search-bar-glass">
          <el-input
              v-model="keyword"
              placeholder="搜索药品名称..."
              class="glass-input search-input"
              @keyup.enter="handleSearch"
              clearable
              @clear="handleSearch"
              prefix-icon="Search"
          >
            <template #append>
              <el-button icon="Search" @click="handleSearch" class="glass-append-btn" />
            </template>
          </el-input>
        </div>

        <!-- 玻璃表格容器 -->
        <div class="glass-table-container">
          <el-table :data="tableData" v-loading="loading" class="glass-table" height="100%">
            <el-table-column prop="medCode" label="编码" width="120">
              <template #default="scope">
                <span class="code-text">{{ scope.row.medCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="medName" label="药品名称" min-width="150">
              <template #default="scope">
                <span class="name-text">{{ scope.row.medName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="format" label="规格" width="150" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryType(scope.row.category)" effect="light" round>{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                <span class="price-text">￥{{ scope.row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="120">
              <template #default="scope">
                <div class="stock-badge" :class="{ 'stock-low': scope.row.stock < 10 }">
                  {{ scope.row.stock }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    inline-prompt
                    active-text="在售"
                    inactive-text="停售"
                    style="--el-switch-on-color: #6c5ce7; --el-switch-off-color: #b2bec3"
                    @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleEdit(scope.row)" class="action-btn">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <!-- 拟态弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.medId ? '编辑药品' : '新增药品'" width="500px" class="glass-dialog" center destroy-on-close>
      <el-form :model="form" label-width="90px" class="glass-form">
        <el-form-item label="药品名称">
          <el-input v-model="form.medName" placeholder="如：阿莫西林胶囊" class="glass-input-sm" />
        </el-form-item>
        <el-form-item label="药品编码">
          <el-input v-model="form.medCode" placeholder="如：MED001" class="glass-input-sm" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.format" placeholder="如：0.25g*24粒/盒" class="glass-input-sm" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择" style="width: 100%;" class="glass-select" popper-class="glass-popper">
            <el-option label="西药" value="西药" />
            <el-option label="中成药" value="中成药" />
            <el-option label="中草药" value="中草药" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%;" class="glass-input-number" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" :step="10" style="width: 100%;" class="glass-input-number" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1" class="glass-radio">在售</el-radio>
            <el-radio :label="0" class="glass-radio">停售</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" class="glass-btn-default">取消</el-button>
        <el-button type="primary" @click="handleSubmit" class="glass-btn-primary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { searchMedicines, saveMedicine } from '../api' // 引入接口
import { ElMessage } from 'element-plus'
import { Search, Plus, FirstAidKit, Edit } from '@element-plus/icons-vue'

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

// 辅助函数：分类Tag颜色
const getCategoryType = (category) => {
  if (category === '西药') return 'primary'
  if (category === '中成药') return 'success'
  if (category === '中草药') return 'warning'
  return 'info'
}

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
/* ================= 全局布局 ================= */
.page-container {
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
}

/* ================= Glass Card ================= */
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
  padding: 15px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.content-wrapper {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ================= 搜索栏 ================= */
.search-bar-glass {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-input {
  width: 350px;
}

/* 拟态输入框样式 (Neumorphic Input) */
:deep(.glass-input .el-input__wrapper),
:deep(.glass-input-sm .el-input__wrapper),
:deep(.glass-select .el-select__wrapper) {
  background: rgba(240, 245, 255, 0.6);
  box-shadow: inset 2px 2px 6px rgba(163, 177, 198, 0.3),
  inset -2px -2px 6px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: none;
  padding: 8px 15px;
  transition: all 0.3s;
}

:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input-sm .el-input__wrapper.is-focus) {
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
  color: #6c5ce7;
  font-weight: bold;
}

/* ================= 玻璃表格 ================= */
.glass-table-container {
  flex: 1;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.2);
}

.glass-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.5);
  --el-table-row-hover-bg-color: rgba(108, 92, 231, 0.05);
  --el-table-border-color: rgba(255, 255, 255, 0.3);
  background: transparent !important;
}

:deep(.glass-table th.el-table__cell) {
  background: rgba(255, 255, 255, 0.6) !important;
  color: #2d3436;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

:deep(.glass-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: #636e72;
}

.code-text { font-family: monospace; color: #b2bec3; }
.name-text { font-weight: 600; color: #2d3436; }
.price-text { color: #e67e22; font-weight: bold; }

.stock-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.4);
}

.stock-low {
  color: #ff7675;
  background: rgba(255, 118, 117, 0.1);
  font-weight: bold;
}

.action-btn {
  font-weight: 600;
}
.action-btn:hover {
  text-decoration: underline;
}

/* ================= 按钮样式 ================= */
.glass-btn-primary {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
  padding: 10px 20px;
  transition: transform 0.2s;
}

.glass-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
  background: linear-gradient(135deg, #7b6bed, #b0aafc);
}

.glass-btn-default {
  background: transparent;
  border: 1px solid #b2bec3;
  color: #636e72;
  border-radius: 10px;
}

.glass-btn-default:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #2d3436;
}

/* ================= Dialog 拟态表单 ================= */
:global(.glass-dialog) {
  border-radius: 20px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 15px 50px rgba(0,0,0,0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
}

:global(.glass-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(0,0,0,0.05);
  margin-right: 0;
}

:global(.glass-dialog .el-dialog__title) {
  color: #6c5ce7;
  font-weight: bold;
}

.glass-form {
  padding: 10px 20px 0;
}

/* 下拉菜单 Popper 样式 */
:global(.glass-popper.el-select__popper) {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px) !important;
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