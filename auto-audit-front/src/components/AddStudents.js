// AddStudents.js
import { useState } from 'react'
import { message } from 'antd'

export const useAddStudent = (token, activityData, fetchActivityData) => {
    const [selectedStudents, setSelectedStudents] = useState([]) // 初始化 selectedStudents

    // 处理选择学生的逻辑
    const handleStudentSelect = async values => {
        setSelectedStudents(values) // 更新已选择的学生ID
        message.info(`已选择 ${values.length} 个学生`)
    }

    // 清空选择的学生
    const handleClearStudents = () => {
        setSelectedStudents([]) // 清空已选择的学生
    }

    // 添加学生的逻辑
    const handleAddStudents = async id => {
        if (selectedStudents.length === 0) {
            message.warning('请选择学生')
            return
        }
        // await fetchActivityData(id)
        // console.log('add activityData', activityData)
        // 获取活动已有的学生ID
        const existingStudentIds = activityData.activityStudents.map(student => student.userId)

        // 过滤出不在 activityData.activityStudents 中的学生
        const newStudents = selectedStudents.filter(
            studentId => !existingStudentIds.includes(studentId)
        )

        if (newStudents.length === 0) {
            message.info('所选学生已参与该活动，无需新增')
            return
        }

        const requestBody = {
            students: newStudents.map(studentId => ({
                activityId: parseInt(id),
                userId: studentId,
                role: '未参与', // 默认角色
            })),
        }
        console.log('requestBody', requestBody)
        try {
            const response = await fetch('http://localhost:3000/addStudentBatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify(requestBody.students),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // await fetchActivityData(id)
                // handleClearStudents() // 清空已选择的学生
                // console.log('data', activityData)
                message.success('成功添加学生')
            } else {
                message.error('添加学生失败')
            }
        } catch (error) {
            console.error('新增学生错误:', error)
            message.error('添加学生请求失败')
        } finally {
            // 重新获取活动数据并刷新
            message.info('增加学生操作完成')
            await fetchActivityData(id)
        }
    }

    return { selectedStudents, handleStudentSelect, handleClearStudents, handleAddStudents }
}
