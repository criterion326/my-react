import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
    Table,
    Input,
    Button,
    Switch,
    Typography,
    Row,
    Col,
    Card,
    Divider,
    Spin,
    message,
    Radio,
    Modal,
    Select,
    Upload,
} from 'antd'
import './AuditPage.css'
import { useAuth } from '../AuthContext'
import FileUpload from './FileUpload'
import { useHandleRoleChange } from './HandleRoleChange' // 引入自定义 Hook'
import { useAddStudent } from './AddStudents'
const { Title, Text } = Typography
const { Option } = Select
function AuditPage() {
    const { id } = useParams()
    const location = useLocation()
    const token = useAuth()?.token //获取其中的token
    const { activityData: initialActivityData } = location.state // 获取传递的activityData
    const [isLoading, setIsLoading] = useState(false)
    const [activityData, setActivityData] = useState(null)
    const [editedRoles, setEditedRoles] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false) // 用于控制 Modal 的显示
    //下拉学生数据
    const handleRoleChange = useHandleRoleChange(token) // 使用自定义 Hook
    const [studentOptions, setStudentOptions] = useState([]) // 存储从后端获取的学生列表

    useEffect(() => {
        fetchStudents() // 组件加载时调用
    }, []) // 空依赖数组意味着只在组件第一次渲染时调用

    const showModal = () => {
        setIsModalVisible(true)
    }

    const handleOk = async () => {
        setIsModalVisible(false)
        await handleUpdate() // 调用更新函数
    }

    const handleCancel = () => {
        setIsModalVisible(false)
    }

    const handleUpdate = async () => {
        //这里写成handleUpdate是要表达通用的意思，但其实只修改了Roles中的point
        const requestBody = {
            id: parseInt(id), // 将id放入requestBody
            checkName: '研',
            checkDate: new Date().toISOString(),
            isActive: false,
            activityTitle: initialActivityData.activityTitle,
            selectPublisher: initialActivityData.selectPublisher,
            activityStartTime: initialActivityData.activityStartTime,
            activityEndTime: initialActivityData.activityEndTime,
            applyDeadline: initialActivityData.applyDeadline,
            activityContent: initialActivityData.activityContent,
            activityRoles: editedRoles,
            applyStatus: initialActivityData.applyStatus,
        }
        console.log('handleUpdate requestBody', requestBody)
        try {
            const response = await fetch(`http://localhost:3000/updateActivity`, {
                // 使用新的接口名称
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // 添加 token 到请求头
                },
                body: JSON.stringify(requestBody),
            })
            if (response.ok) {
                message.success('活动数据更新成功')
            } else {
                message.error('活动数据更新失败')
            }
        } catch (error) {
            console.error('更新错误:', error)
            message.error('活动数据更新失败')
        }
    }

    const fetchActivityData = async activityId => {
        setIsLoading(true)
        // const token=localStorage.getItem('token')
        try {
            const response = await fetch(`http://localhost:3000/activity/${activityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // 添加token到请求头
                },
            })
            const data = await response.json()
            // data.result = testdata
            if (data.code === 200) {
                console.log('data', data)
                setActivityData(data.result)
                setEditedRoles(data.result.activityRoles) // 初始化editedRoles
                message.success('获取活动数据成功')
            } else {
                console.error('获取活动数据失败:', data)
                message.error('获取活动数据失败,因为' + data.error.message)
            }
        } catch (error) {
            console.error('获取活动数据错误:', error)
            message.error('获取活动数据错误')
        } finally {
            setIsLoading(false)
            // setActivityData(testdata)
        }
    }
    // 在组件加载时获取学生数据
    const { selectedStudents, handleStudentSelect, handleClearStudents, handleAddStudents } =
        useAddStudent(token, activityData, fetchActivityData)
    useEffect(() => {
        // 模拟获取活动数据的请求
        if (id) {
            fetchActivityData(id)
        }
        // fetchStudents()
    }, [id])
    const getBackgroundColor = role => {
        switch (role) {
            case '未参与':
                return '#e0e0e0' // 浅灰色
            case '参与者':
                return '#b3d9ff' // 浅蓝色
            case '组织者':
                return '#ffcc99' // 浅橙色
            default:
                return '#f5f5f5' // 默认背景色
        }
    }
    const handlePointChange = (roleIndex, newPoint) => {
        setEditedRoles(prevRoles =>
            prevRoles.map((role, index) =>
                index === roleIndex ? { ...role, point: newPoint } : role
            )
        )
    }

    // 从后端获取学生数据
    const fetchStudents = async () => {
        try {
            const response = await fetch(`http://localhost:3000/students`, {
                headers: {
                    Authorization: `Bearer ${token}`, // 添加 token 到请求头
                },
            })

            const data = await response.json()
            // console.log(data)
            if (response.ok && Array.isArray(data.students)) {
                setStudentOptions(data.students) // 将学生数据设置到 state 中
            } else {
                message.error('获取学生数据失败或数据格式不正确')
            }
        } catch (error) {
            console.error('获取学生数据错误:', error)
            message.error('获取学生数据错误')
        }
    }

    const columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => index + 1,
            align: 'center',
            width: 50, // 设置第一列宽度
        },
        {
            title: '学号',
            dataIndex: 'userId',
            key: 'userId',
            align: 'center',
            width: 100, // 可以适当调整学号列宽度
        },
        {
            title: '姓名',
            dataIndex: 'userName',
            key: 'userName',
            align: 'center',
            width: 120, // 可以适当调整姓名列宽度
        },
        {
            title: '当前参与角色',
            dataIndex: 'role',
            key: 'role',
            align: 'center',
            width: 250, // 设置最后一列宽度
            render: (text, record) => (
                <div
                    style={{
                        backgroundColor: getBackgroundColor(record.role),
                        padding: '5px',
                        borderRadius: '5px',
                    }}
                >
                    <Radio.Group
                        value={record.role}
                        onChange={async e => {
                            // 找到需要更新的学生
                            const studentsToUpdate = activityData.activityStudents.filter(
                                student => student.id === record.id
                            )

                            // 调用 handleRoleChange 处理角色更新
                            await handleRoleChange(id, e.target.value, studentsToUpdate)

                            // 更新完成后，刷新活动数据
                            fetchActivityData(id)
                        }}
                    >
                        <Radio value="未参与">未参与</Radio>
                        <Radio value="参与者">参与者</Radio>
                        <Radio value="组织者">组织者</Radio>
                    </Radio.Group>
                </div>
            ),
        },
    ]
    return (
        <div>
            <h2>审核页面, 正在审核的活动ID:{id}</h2>
            <div>
                <Row gutter={[16, 16]} justify="center">
                    <Col span={18}>
                        <Title level={4} className="title-left">
                            活动信息
                        </Title>
                        <Card>
                            <Text className="ant-typography">
                                活动标题: {activityData?.activityTitle}
                            </Text>
                        </Card>
                    </Col>
                    <Col span={18}>
                        <Title level={4} className="title-left">
                            审核文件上传
                        </Title>
                        <Card>
                            {' '}
                            <FileUpload
                                token={token}
                                activityData={activityData}
                                studentOptions={studentOptions}
                                fetchActivityData={fetchActivityData}
                                handleRoleChange={handleRoleChange}
                                id={id}
                            />
                        </Card>
                    </Col>
                    <Col span={18}>
                        <Card>
                            <Title level={4} className="title-left">
                                角色信息
                            </Title>
                            <div className="role-container">
                                {activityData?.activityRoles.map((role, index) => (
                                    <div key={index} className="role-item">
                                        <Text className="ant-typography">{role.role}:</Text>
                                        <Input
                                            style={{ marginLeft: '10px', width: '100px' }}
                                            value={editedRoles[index]?.point || ''}
                                            onChange={e => handlePointChange(index, e.target.value)}
                                            placeholder="请输入分数"
                                            type="number"
                                            min={0.0}
                                            max={2.0}
                                        />
                                        <Button onClick={showModal} style={{ marginLeft: '10px' }}>
                                            保存
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                    <Col span={18}>
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span
                                    style={{
                                        marginRight: 16,
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    新增:
                                </span>
                                <Select
                                    mode="multiple"
                                    showSearch
                                    placeholder="输入学号或姓名查询"
                                    value={selectedStudents} // 绑定 Select 的 value 到 selectedStudents
                                    onChange={handleStudentSelect} // 处理选择
                                    filterOption={(input, option) => {
                                        const searchText = input.toLowerCase()
                                        const optionText =
                                            `${option.value} ${option.name}`.toLowerCase() // 将 userId 和 userName 拼接在一起作为 optionText
                                        return optionText.includes(searchText) // 模糊查询
                                    }}
                                    style={{ width: '500px', marginRight: 16 }} // 设置Select宽度
                                >
                                    {studentOptions.map(student => (
                                        <Option
                                            key={student.userId}
                                            value={student.userId}
                                            name={student.userName}
                                        >
                                            {student.userId} - {student.userName}
                                        </Option>
                                    ))}
                                </Select>
                                <Button
                                    type="primary"
                                    style={{ marginRight: 16, marginTop: 0 }}
                                    onClick={handleClearStudents}
                                >
                                    清除全部
                                </Button>
                                <Button
                                    type="primary"
                                    style={{ marginRight: 16, marginTop: 0 }}
                                    onClick={() => handleAddStudents(id)}
                                >
                                    新增学生
                                </Button>
                            </div>
                            <div className="table-container">
                                <Table
                                    className="custom-table"
                                    columns={columns}
                                    dataSource={activityData?.activityStudents}
                                    rowKey="id"
                                    loading={isLoading}
                                    scroll={{ y: 800 }}
                                    pagination={false}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Divider />
            </div>
            <Modal
                title="确认"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消"
            >
                <p>确定要保存修改吗？</p>
            </Modal>
        </div>
    )
}

export default AuditPage
