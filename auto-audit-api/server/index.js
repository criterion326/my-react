const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const axios = require('axios')
const { handleFileUpload, handleOcrRequest } = require('./fileUpload') // 引入 fileUpload 模块
const fetchActivities = require('./fetchActivities') // 引入 fetchActivities 模块
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
    const token = req.headers.authorization.split(' ')[1] // 获取请求头中的token
    console.log('activities 请求参数:', { currentPage, pageSize, user_id, token })
    try {
        const data = await fetchActivities(currentPage, pageSize, user_id, token)
        res.json(data)
    } catch (error) {
        console.error('Error fetching activities:', error)
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
        // console.log(token)
        res.json({ success: true, code: 0, token: token, user_id: user_id })
    } catch (error) {
        console.error('登录错误:', error.response ? error.response.data : error.message)
        res.status(500).json({
            message: '登录失败',
            error: error.response ? error.response.data : error.message,
        })
    }
})
// 新增的处理单选框状态更新的路由
app.post('/updateRole', async (req, res) => {
    const { activityId, checkName, activityStudents } = req.body
    const token = req.headers.authorization.split(' ')[1] // 获取请求头中的token
    // 打印接收到的数据
    console.log('接收到的数据:', { activityId, checkName, activityStudents })

    // 构建请求体
    const requestBody = {
        activityId,
        checkName,
        activityStudents,
    }

    try {
        // 向远程服务器发起POST请求
        const response = await axios.post(
            'http://106.54.0.160:5001/api/activity/audit',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // 添加token到请求头
                },
            }
        )
        // 打印响应数据
        console.log('响应数据:', response.data)
        if (response.data && response.data.code === 200) {
            res.json({ success: true, message: '角色更新成功' })
        } else {
            res.status(500).json({ success: false, message: '角色更新失败' })
        }
    } catch (error) {
        console.error('请求错误:', error.response ? error.response.data : error.message)
        res.status(500).json({
            message: '请求错误',
            error: error.response ? error.response.data : error.message,
        })
    }
})
app.get('/activity/:id', async (req, res) => {
    const activityId = req.params.id
    const token = req.headers.authorization.split(' ')[1] // 获取请求头中的token

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
        console.log(response.data)
        if (response.data && response.data.code === 200) {
            res.json({ code: 200, result: response.data.result })
        } else {
            res.status(500).json({ code: 500, message: '获取活动信息失败' })
        }
    } catch (error) {
        console.error('请求错误:', error.response ? error.response.data : error.message)
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
    console.log('接收到的数据:', requestBody)
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
        if (response.data && response.data.code === 200) {
            res.json({ success: true, message: '活动数据更新成功' })
        } else {
            res.status(500).json({ success: false, message: '活动数据更新失败' })
        }
    } catch (error) {
        console.error('请求错误:', error.response ? error.response.data : error.message)
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

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`)
})
