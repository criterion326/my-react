const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { recognizeTable } = require('./table-ocr') // 引入OCR识别模块
// 设置存储引擎
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'), //调整存储引擎的 destination 路径：使用 path.join(__dirname, '../../uploads/') 来导航到 uploads 文件夹。
    // 使用当前时间戳作为文件ID
    filename: (req, file, cb) => {
        const timestamp = Date.now()
        cb(null, `${timestamp}_${path.extname(file.originalname)}`)
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
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

// 文件上传处理函数
function handleFileUpload(req, res) {
    upload(req, res, err => {
        if (err) {
            res.status(400).json({ message: err })
        } else {
            if (req.file == undefined) {
                res.status(400).json({ message: '没有选择文件!' })
            } else {
                const fileId = path.parse(req.file.filename).name // 获取文件名（时间戳）
                res.json({
                    message: '文件上传成功!',
                    file: `uploads/${req.file.filename}`,
                    fileId: fileId, // 返回文件ID
                })
            }
        }
    })
}
// 处理OCR识别请求的函数
async function handleOcrRequest(req, res) {
    const filePath = path.join(__dirname, 'uploads', req.body.filename)

    // 读取文件并转换为Base64
    fs.readFile(filePath, 'base64', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err)
            return res.status(500).json({ error: 'Failed to read file' })
        }

        try {
            const ocrResult = await recognizeTable(data)
            res.json(ocrResult)
        } catch (error) {
            res.status(500).json({ error: 'OCR failed', details: error.message })
        }
    })
}
module.exports = {
    handleFileUpload,
    handleOcrRequest,
}
