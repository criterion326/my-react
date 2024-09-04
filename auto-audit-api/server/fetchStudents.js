const fs = require('fs')
const path = require('path')

// 定义一个函数来获取学生数据
const fetchStudents = callback => {
    const filePath = path.join(__dirname, 'assets', 'filtered_data.json')
    // console.log('读取的文件路径:', filePath) // 打印文件路径
    // 读取 JSON 文件
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // console.error('读取学生数据错误:', err)
            return callback(err, null) // 通过回调返回错误
        }

        try {
            const students = JSON.parse(data)
            // console.log(students)
            // 转换为前端需要的字段格式
            const formattedStudents = Object.keys(students).map(key => ({
                userId: students[key].user_id,
                userName: students[key].user_name,
            }))
            callback(null, formattedStudents) // 返回已格式化的数据
        } catch (parseErr) {
            callback(parseErr, null)
        }
    })
}

module.exports = fetchStudents
