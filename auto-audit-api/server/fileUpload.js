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
        const originalName = file.originalname.replace(path.extname(file.originalname), '') // 去除扩展名
        cb(null, `${timestamp}_${originalName}${path.extname(file.originalname)}`)
    },
})

// 初始化上传
const upload = multer({
    storage: storage,
    limits: { fileSize: 4096000 }, // 设置文件大小限制为4MB
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
    console.log('请求到达')
    upload(req, res, err => {
        if (err) {
            console.error('上传错误:', err)
            res.status(400).json({ message: err })
            return
        }
        if (req.file == undefined) {
            console.error('文件未接收')
            res.status(400).json({ message: '没有选择文件!' })
            return
        }
        const fileId = path.parse(req.file.filename).name
        console.log('上传成功:', req.file.filename)
        res.json({
            message: '文件上传成功!',
            file: `uploads/${req.file.filename}`,
            fileId: fileId,
        })
    })
}

// 处理OCR识别请求的函数
async function handleOcrRequest(req, res) {
    const { fileId } = req.params // 从URL参数中获取fileId
    const baseDir = path.join(__dirname, 'uploads')
    fs.readdir(baseDir, (err, files) => {
        if (err) {
            console.error('Directory read error:', err)
            return res.status(500).json({ error: 'Failed to read directory' })
        }

        // 查找匹配的文件名
        const file = files.find(f => f.startsWith(fileId))
        if (!file) {
            return res.status(404).json({ error: 'File not found' })
        }

        const filePath = path.join(baseDir, file)
        const fileExtension = path.extname(file).toLowerCase()

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err)
                return res.status(500).json({ error: 'Failed to read file' })
            }

            // 转换数据为Base64格式
            const base64Data = Buffer.from(data).toString('base64')

            try {
                if (/\.(jpeg|jpg|png)$/.test(fileExtension)) {
                    recognizeTable(base64Data) // 假设recognizeTable现在接收Base64编码的数据
                        .then(ocrResult => res.json(ocrResult))
                        .catch(error => {
                            console.error('OCR process error:', error)
                            res.status(500).json({ error: 'OCR failed', details: error.message })
                        })
                } else {
                    res.status(400).json({ error: 'Unsupported file type' })
                }
            } catch (error) {
                console.error('Unexpected error:', error)
                res.status(500).json({ error: 'Processing failed', details: error.message })
            }
        })
    })
}
module.exports = {
    handleFileUpload,
    handleOcrRequest,
}
