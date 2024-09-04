const axios = require('axios')

const addStudentsBatch = async (activityId, studentsData, token) => {
    if (!activityId || !studentsData || studentsData.length === 0) {
        return {
            success: false,
            message: '活动ID或学生信息无效',
        }
    }

    try {
        // 并发发送每个学生的请求
        const results = await Promise.all(
            studentsData.map(student =>
                axios
                    .post(
                        'http://106.54.0.160:5001/api/activity/admin/addStudent',
                        {
                            activityId: activityId,
                            role: student.role,
                            userId: student.userId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`, // 传递token
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    .then(response => ({
                        userId: student.userId,
                        success: true,
                    }))
                    .catch(error => ({
                        userId: student.userId,
                        success: false,
                    }))
            )
        )

        // 分离成功和失败的结果
        const successList = results.filter(result => result.success).map(result => result.userId)
        const failureList = results.filter(result => !result.success).map(result => result.userId)

        // 返回结果
        return {
            code: 200,
            success: true,
            successList,
            failureList,
        }
    } catch (error) {
        console.error('添加学生到外部API时出错:', error)
        return {
            success: false,
            message: '服务器错误，无法添加学生',
        }
    }
}

module.exports = addStudentsBatch
