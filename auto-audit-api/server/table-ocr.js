const axios = require('axios')
const fs = require('fs')
const path = require('path')

// 配置
const host = 'https://shouxiegen.market.alicloudapi.com'
const endpoint = '/ocrservice/shouxie'
const appcode = '218dafcd3a654490a2981e0de04c51b8' // 替换为你的AppCode

// 读取图片文件并转换为 base64
function readImageAsBase64(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
            if (err) {
                return reject(err)
            }
            resolve(data)
        })
    })
}

// 发送 OCR 请求
async function recognizeTable(imageBase64) {
    const url = `${host}${endpoint}`
    const requestBody = {
        img: imageBase64,
        prob: false,
        charInfo: false,
        rotate: false,
        table: false,
        sortPage: false,
    }

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                Authorization: `APPCODE ${appcode}`,
                'Content-Type': 'application/json; charset=UTF-8',
            },
        })
        return response.data.content // 返回识别的文字结果
    } catch (error) {
        throw new Error(`请求失败: ${error.message}`)
    }
}

module.exports = {
    recognizeTable,
}
