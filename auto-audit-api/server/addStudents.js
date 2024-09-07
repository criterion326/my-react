const axios = require('axios')

const addStudentsBatch = async (studentsData, token) => {
    // 检查活动ID和学生信息是否有效
    // console.log('activityId:', activityId, studentsData, token)
    if (!studentsData || studentsData.length === 0) {
        return {
            success: false,
            message: '活动ID或学生信息无效',
        }
    }
    console.log('studentsData:', studentsData)
    try {
        // 并发发送每个学生的请求
        const results = await Promise.all(
            studentsData.map(student =>
                axios
                    .post(
                        'http://106.54.0.160:5001/api/activity/admin/addStudent',
                        {
                            activityId: String(student.activityId),
                            role: String(student.role),
                            userId: String(student.userId),
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`, // 传递token
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    .then(response => {
                        console.log(`Success for studentId: ${student.userId}`, response.data)
                        return {
                            userId: student.userId,
                            success: true,
                        }
                    })
                    .catch(error => {
                        console.error(
                            `Error for studentId: ${student.userId}`,
                            error.response?.data || error.message
                        )
                        return {
                            userId: student.userId,
                            success: false,
                        }
                    })
            )
        )

        // 分离成功和失败的结果
        const successList = results.filter(result => result.success).map(result => result.userId)
        const failureList = results.filter(result => !result.success).map(result => result.userId)
        console.log('成功的学生:', successList)
        console.log('失败的学生:', failureList)
        // 返回结果
        return {
            code: 200,
            success: true,
            successList,
            failureList,
        }
    } catch (error) {
        console.error('添加学生到外部API时出错:', error)
        console.error(
            `学生 ${student.userId} 添加失败:`,
            error.response?.data || error.message || error
        )
        return {
            userId: student.userId,
            success: false,
        }
    }
}

module.exports = addStudentsBatch
