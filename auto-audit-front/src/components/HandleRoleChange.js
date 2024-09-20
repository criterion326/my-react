import { message } from 'antd'

export const useHandleRoleChange = token => {
    const handleRoleChange = async (activityId, newRole, activityStudents) => {
        // 构建请求体
        const requestBody = {
            activityId: parseInt(activityId),
            checkName: '研',
            activityStudents: activityStudents.map(student => ({
                userId: student.userId,
                role: newRole,
                userName: student.userName,
                activityId: parseInt(activityId),
                id: student.id,
            })),
        }

        // console.log('Request Body:', requestBody, token)

        try {
            // 发起POST请求更新学生信息
            const response = await fetch('http://localhost:3000/updateRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token, // 添加 token 到请求头
                },
                body: JSON.stringify(requestBody),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                message.success(`活动 ${activityId} 的角色更新成功`)
            } else {
                message.error(`活动 ${activityId} 的角色更新失败`)
            }
        } catch (error) {
            console.error('请求错误:', error)
            message.error('请求错误')
        } finally {
            console.log('请求结束')
        }
    }

    return handleRoleChange
}
