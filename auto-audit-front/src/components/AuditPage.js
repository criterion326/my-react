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
} from 'antd'
import './AuditPage.css'
import { useAuth } from '../AuthContext'
import Fuse from 'fuse.js'
import userEvent from '@testing-library/user-event'
const { Title, Text } = Typography

function AuditPage() {
    const { id } = useParams()
    const location = useLocation()
    // const location = useLocation()
    const token = useAuth().token //获取其中的token
    // console.log('id', id, 'token', token)
    const { activityData: initialActivityData } = location.state // 获取传递的activityData
    const [selectedFile, setSelectedFile] = useState(null)
    // const [uploadStatus, setUploadStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [activityData, setActivityData] = useState(null)
    // 定义一个状态变量来存储文件ID
    const [fileId, setFileId] = useState(null)
    const [ocrResult, setOcrResult] = useState(null)
    const [editedRoles, setEditedRoles] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false) // 用于控制 Modal 的显示

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

    const handleFileChange = event => {
        setSelectedFile(event.target.files[0])
    }
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    const handleUpload = async () => {
        if (selectedFile) {
            // 创建一个 FormData 对象
            const formData = new FormData()
            formData.append('file', selectedFile)
            setIsLoading(true)
            // setUploadStatus('上传中')
            message.info('上传中')
            try {
                const response = await fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: formData,
                })
                await delay(1000)

                if (response.ok) {
                    const result = await response.json()
                    message.success(`文件 ${selectedFile.name} 上传成功！`) // 显示成功信息
                    setFileId(result.fileId) // 保存文件ID
                    message.success(response.message)
                } else {
                    message.error('文件上传失败！') // 显示失败信息
                    message.error(response.message)
                }
            } catch (error) {
                console.error('上传错误:', error)
                message.error('文件上传失败！') // 显示异常信息
            } finally {
                setIsLoading(false)
            }
        } else {
            message.warning('请选择一个文件') // 文件未选择时的提示
        }
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
    const processOcrResult = ocrResult => {
        console.log('ocrResult', ocrResult)
        if (!ocrResult) {
            message.error('OCR结果无效')
            return
        }

        // 将OCR结果按空格分割，并去除每个词的首尾空格和换行符
        const words = ocrResult
            .split(' ')
            .map(word => word.trim())
            .filter(word => word.length > 0)
        const fuse = new Fuse(activityData.activityStudents, {
            keys: ['userName'],
            threshold: 0.9, // 设置一个阈值，数值越低匹配越严格
        })
        words.forEach(word => {
            const result = fuse.search(word)
            if (result.length > 0) {
                const student = result[0].item
                handleRoleChange(student.id, '参与者')
            } else {
                console.warn(`未找到匹配的学生姓名: ${word}`)
            }
        })
    }

    const handleOcr = async () => {
        if (fileId) {
            // 确保文件已经上传，并且 fileId 已被设置
            setIsLoading(true)
            try {
                // 向后端发送带有 fileId 参数的 POST 请求
                const response = await fetch(`http://localhost:3000/ocr/${fileId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filename: fileId }), // 可以在请求体内也传递文件名，如果后端需要
                })
                const result = await response.json()
                var text = JSON.stringify(result)
                // setOcrResult(result)
                if (response.ok) {
                    message.info(`OCR识别结果: ${result}`) // 使用 message.info 显示 OCR 结果
                    processOcrResult(text) // 调用处理OCR结果的函数
                } else {
                    message.error('OCR识别失败') // 如果响应不是 ok，显示错误信息
                }
            } catch (error) {
                console.error('OCR识别错误:', error)
                message.error('OCR识别失败')
            } finally {
                setIsLoading(false)
            }
        } else {
            message.error('请先上传文件') // 如果 fileId 未设置，提示用户
        }
    }

    const fetchActivityData = async () => {
        setIsLoading(true)
        // const token=localStorage.getItem('token')
        try {
            const response = await fetch(`http://localhost:3000/activity/${id}`, {
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
                message.error('获取活动数据失败')
            }
        } catch (error) {
            console.error('获取活动数据错误:', error)
            message.error('获取活动数据错误')
        } finally {
            setIsLoading(false)
            // setActivityData(testdata)
        }
    }
    useEffect(() => {
        // 模拟获取活动数据的请求
        fetchActivityData()
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
    const handleRoleChange = (id, newRole) => {
        // const token=localStorage.getItem('token')
        setActivityData(prevState => {
            const updatedStudents = prevState.activityStudents.map(student =>
                student.id === id ? { ...student, role: newRole } : student
            )

            // 构建请求体
            const requestBody = {
                activityId: prevState.activityId,
                checkName: '研',
                activityStudents: updatedStudents.filter(student => student.id === id),
            }
            // 提示谁的信息被修改了
            message.info(`ID为 ${id} 的学生信息已被修改`)
            // 发起POST请求
            fetch('http://localhost:3000/updateRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // 添加token到请求头
                },
                body: JSON.stringify(requestBody),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        message.success('更新成功')
                    } else {
                        message.error('更新失败')
                    }
                })
                .catch(error => {
                    console.error('请求错误:', error)
                    message.error('请求错误')
                })

            return { ...prevState, activityStudents: updatedStudents }
        })
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
                        onChange={e => handleRoleChange(record.id, e.target.value)}
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
            <h2>审核页面, 正在审核的活动ID：{id}</h2>

            <div>
                {/* <label for="file-upload" class="custom-file-upload">
                    自定义上传按钮
                </label> */}
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="custom-input"
                />
                {/* <Button onClick={() => document.querySelector('input[type="file"]').click()}> */}
                <Button onClick={handleUpload}>上传文件</Button>
            </div>
            {/* {selectedFile && (
                <div className="status-message">
                    <p>选中的文件: {selectedFile.name}</p>
                </div>
            )} */}
            {/* {uploadStatus && (
                <div className="status-message">
                    <p>{uploadStatus}</p>
                </div>
            )} */}
            {isLoading && (
                <div className="status-message">
                    <Spin />
                </div>
            )}
            {/* // 修改渲染逻辑，使 fileId 存在时才显示“一键审核”按钮 */}
            {fileId && (
                <div>
                    <p>文件名: {fileId}</p>
                    <Button onClick={handleOcr}>一键审核</Button>
                </div>
            )}
            {/* {ocrResult && (
                <div className="ocr-result">
                    <pre>{JSON.stringify(ocrResult, null, 2)}</pre>
                </div>
            )} */}
            {isLoading && (
                <div className="status-message">
                    <p>加载中...</p>
                </div>
            )}
            <div>
                <Row gutter={[16, 16]} justify="center">
                    <Col span={18}>
                        <Card>
                            <Title level={4} className="title-left">
                                活动信息
                            </Title>
                            <Text className="ant-typography">
                                活动标题: {activityData?.activityTitle}
                            </Text>
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
                            <Title level={4} className="title-left"></Title>
                            <Input.Search
                                placeholder="请输入学号查询学生"
                                className="custom-input"
                                style={{ marginBottom: 16 }}
                            />
                            <Button type="primary" style={{ marginBottom: 16 }}>
                                新增学生
                            </Button>
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
                visible={isModalVisible}
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
