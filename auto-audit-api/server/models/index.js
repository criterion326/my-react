const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 3000
// 允许所有来源
app.use(cors())
// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 设置存储引擎
const storage = multer.diskStorage({
    destination: './/uploads', //调整存储引擎的 destination 路径：使用 path.join(__dirname, '../../uploads/') 来导航到 uploads 文件夹。
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    },
})

// 初始化上传
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 设置文件大小限制为 1MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    },
}).single('file')

// 检查文件类型
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: 仅支持图片和 PDF 文件!')
    }
}

// 文件上传路由
app.post('/upload', (req, res) => {
    upload(req, res, err => {
        if (err) {
            res.status(400).json({ message: err })
        } else {
            if (req.file == undefined) {
                res.status(400).json({ message: '没有选择文件!' })
            } else {
                res.json({
                    message: '文件上传成功!',
                    file: `uploads/${req.file.filename}`,
                })
            }
        }
    })
})

// 设置静态文件夹
app.use('/uploads', express.static('.//uploads')) //设置静态文件夹路径：使用 express.static 中间件来正确地提供 uploads 文件夹中的静态文件。

// 登录校验路由
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const response = await axios.post('http://106.54.0.160:5001/api/auth/login', {
            id: username,
            password: password,
        })
        // console.log(response.data)
        const { token } = response.data.result
        // console.log(token)
        res.json({ success: true, code: 0, token: token })
    } catch (error) {
        console.error('登录错误:', error.response ? error.response.data : error.message)
        res.status(500).json({
            message: '登录失败',
            error: error.response ? error.response.data : error.message,
        })
    }
})

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`)
})
