// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs-ocr')

const OcrClient = tencentcloud.ocr.v20181119.Client

// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
    credential: {
        SecretId: 'AKIDlS3PWP2QXhYRXYNyKQG1dzLabPyNiwwI',
        SecretKey: 'IMBlKlyXwA2jDetJWVHpMmzzmKqOqLhr',
    },
    region: 'ap-shanghai',
    profile: {
        httpProfile: {
            endpoint: 'ocr.tencentcloudapi.com',
        },
    },
}

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new OcrClient(clientConfig)
// const params = {}
// client.RecognizeTableAccurateOCR(params).then(
//     data => {
//         console.log(data)
//     },
//     err => {
//         console.error('error', err)
//     }
// )

const recognizeTable = async base64Image => {
    const params = {
        ImageBase64: base64Image,
    }

    try {
        const data = await client.RecognizeTableAccurateOCR(params)
        return data
    } catch (err) {
        console.error('OCR 识别错误:', err)
        throw err // 根据你的错误处理策略，这里可以是抛出错误或者返回错误信息
    }
}

module.exports = {
    recognizeTable,
}
