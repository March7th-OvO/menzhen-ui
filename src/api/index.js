import request from '../utils/request'

export const login = (data) => request.post('/user/login', data)
export const register = (data) => request.post('/user/register', data)

// 挂号相关
export const getPatientInfo = (idCard) => request.get(`/patient/info/${idCard}`)
export const addPatient = (data) => request.post('/patient/add', data)
// 获取科室列表
export const getDepts = async () => {
    try {
        const res = await request.get('/dept/list')
        console.log('API接收到的原始数据:', res)
        // 将后端返回的字段名映射为前端使用的字段名
        if (Array.isArray(res)) {
            const mappedData = res.map(dept => ({
                id: dept.deptId,
                name: dept.deptName,
                code: dept.deptCode,
                category: dept.category,
                status: dept.status
            }))
            console.log('映射后的数据:', mappedData)
            return mappedData
        } else {
            console.log('返回的数据不是数组格式')
            return []
        }
    } catch (error) {
        console.error('获取科室列表失败:', error)
        return []
    }
}
export const getDoctors = (deptId) => request.get(`/doctor/list-available?deptId=${deptId}`)
export const getLevels = () => request.get('/reg-level/list')
export const createRegistration = (data) => request.post('/registration/create', data)

// 医生工作台
export const getPendingPatients = (doctorId) => request.get(`/doctor/workbench/pending?doctorId=${doctorId}`)
export const submitDiagnosis = (data) => request.post('/doctor/workbench/diagnose', data)

// 药品
export const getMedicines = () => request.get('/medicine/list-active')
export const searchMedicines = (keyword) => request.get(`/medicine/search?keyword=${keyword}`)

export const saveMedicine = (data) => request.post('/medicine/save', data)
