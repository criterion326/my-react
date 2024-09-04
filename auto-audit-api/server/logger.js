const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf, errors } = format

// 自定义日志格式，提取文件名和行号
const myFormat = printf(({ level, message, label, timestamp, stack }) => {
    let location = ''
    if (stack) {
        const stackLines = stack.split('\n')
        if (stackLines.length > 1) {
            // 第二行通常是错误发生的地方，提取文件路径、行号、列号
            const match = stackLines[1].match(/\((.*)\)/)
            location = match ? match[1] : stackLines[1].trim()
        }
    }

    return `${timestamp} [${label}] ${level}: ${message} ${location ? `(${location})` : ''}`
})

const logger = createLogger({
    level: 'info',
    format: combine(
        label({ label: 'my-app' }),
        timestamp(),
        errors({ stack: true }), // 捕获堆栈信息
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
})

module.exports = logger
