const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const axios = require('axios')
const logger = require('./logger') // 引入 logger
const { handleFileUpload, handleOcrRequest } = require('./fileUpload') // 引入 fileUpload 模块
const fetchActivities = require('./fetchActivities') // 引入 fetchActivities 模块
const fetchStudents = require('./fetchStudents') // 引入 fetchStudents 模块
const addStudentsBatch = require('./addStudents') // 引入 addStudents 模块
const app = express()
const port = 3000
// 允许所有来源
app.use(cors())
// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 文件上传路由
app.post('/upload', handleFileUpload)
// OCR识别路由
app.post('/ocr/:fileId', handleOcrRequest)
// 设置静态文件夹
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))) //设置静态文件夹路径：使用 express.static 中间件来正确地提供 uploads 文件夹中的静态文件。
app.get('/activities', async (req, res) => {
    const { currentPage, pageSize, user_id } = req.query
    const token = req.headers.authorization.split(' ')[1]
    logger.info('Received activities request', { currentPage, pageSize, user_id, token })

    try {
        const data = await fetchActivities(currentPage, pageSize, user_id, token)
        res.json(data)
    } catch (error) {
        logger.error('Error fetching activities', error)
        res.status(500).json({ message: 'Error fetching activities' })
    }
})
// 登录校验路由
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const response = await axios.post('http://106.54.0.160:5001/api/auth/login', {
            id: username,
            password: password,
        })
        // console.log(response.data)
        const { token, user_id } = response.data.result
        logger.info('User logged in', { username, user_id })
        res.json({ success: true, code: 0, token: token, user_id: user_id })
    } catch (error) {
        logger.error('Login error', error.response ? error.response.data : error.message)
        res.status(500).json({
            message: '登录失败',
            error: error.response ? error.response.data : error.message,
        })
    }
})
// 新增的处理单选框状态更新的路由
app.post('/updateRole', async (req, res) => {
    // const { activityId, checkName, activityStudents } = req.body
    const token = req.headers.authorization // 获取请求头中的token
    // 打印接收到的数据
    // logger.info('Received updateRole request', { activityId, checkName, activityStudents })

    // 构建请求体
    // const requestBody = {
    //     activityId,
    //     checkName,
    //     activityStudents,
    // }
    logger.info('requestBody1111', req.body, token)
    console.log('req', req.body, token)
    try {
        // 向远程服务器发起POST请求
        const response = await axios.post('http://106.54.0.160:5001/api/activity/audit', req.body, {
            headers: {
                Authorization: `Bearer ${token}`, // 添加token到请求头
                'Content-Type': 'application/json',
            },
        })
        logger.info('Role update response', response.data)
        if (response.data && response.data.code === 200) {
            res.json({ success: true, message: '角色更新成功' })
        } else {
            res.status(500).json({ success: false, message: '角色更新失败' })
        }
    } catch (error) {
        logger.error(
            'Role update request error',
            error.response ? error.response.data : error.message
        )
        res.status(500).json({
            message: '请求错误',
            error: error.response ? error.response.data : error.message,
        })
    }
})
app.get('/activity/:id', async (req, res) => {
    const activityId = req.params.id
    const token = req.headers.authorization.split(' ')[1] // 获取请求头中的token
    logger.info('Received activity details request', { activityId })
    try {
        // 向远程服务器发起GET请求获取活动信息
        const response = await axios.get(
            `http://106.54.0.160:5001/api/activity/activityStudent/${activityId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // 添加token到请求头
                },
            }
        )
        logger.info('申请单个活动详情', response.data)
        if (response.data && response.data.code === 200) {
            res.json({ code: 200, result: response.data.result })
        } else {
            res.status(500).json({ code: 500, message: '获取活动信息失败' + res.data.message })
        }
    } catch (error) {
        const errorWithStack = new Error(error.message)
        errorWithStack.stack = error.stack || new Error().stack
        logger.error('Activity details request error', errorWithStack)
        res.status(500).json({
            message: '请求错误',
            error: error.response ? error.response.data : error.message,
        })
    }
})
app.post('/updateActivity', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1] // 获取请求头中的token
    const requestBody = req.body
    const activityId = requestBody.id // 从请求体中获取activityId
    logger.info('Received updateActivity request', requestBody)

    try {
        const response = await axios.put(
            `http://106.54.0.160:5001/api/activity/admin/${activityId}`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // 添加token到请求头
                },
            }
        )
        logger.info('Update activity response', response.data)
        if (response.data && response.data.code === 200) {
            res.json({ success: true, message: '活动数据更新成功' })
        } else {
            res.status(500).json({ success: false, message: '活动数据更新失败' })
        }
    } catch (error) {
        logger.error(
            'Update activity request error',
            error.response ? error.response.data : error.message
        )
        // res.status(500).json({
        //     message: '请求错误',
        //     error: error.response ? error.response.data : error.message,
        // })
        if (error.response) {
            res.status(error.response.status).json({
                message: '请求错误',
                error: error.response.data,
            })
        } else {
            res.status(500).json({
                message: '请求错误',
                error: error.message,
            })
        }
    } finally {
        console.log('finally')
        // 如何把报错信息反馈给前端
    }
})
// 路由处理 - 获取所有学生数据
app.get('/students', (req, res) => {
    fetchStudents((err, students) => {
        if (err) {
            return res.status(500).json({ message: '读取学生数据错误' })
        }

        // 成功返回学生数据
        res.json({ students })
    })
})
// 路由处理 - 添加学生
app.post('/addStudentBatch', async (req, res) => {
    const studentsData = req.body
    const token = req.headers.authorization // 从请求头中获取 token
    // console.log('req.body', req.body)
    if (!token) {
        return res.status(401).json({ success: false, message: '未授权，缺少token' })
    }

    // 调用 addStudentsBatch 函数
    const result = await addStudentsBatch(studentsData, token)

    // 根据返回结果发送响应
    if (result.success) {
        res.json({
            success: true,
            successList: result.successList,
            failureList: result.failureList,
        })
    } else {
        res.status(500).json({ success: false, message: result.message })
    }
})

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`)
})
