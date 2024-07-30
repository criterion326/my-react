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
} from 'antd'
import './AuditPage.css'
import { useAuth } from '../AuthContext'
import userEvent from '@testing-library/user-event'
const { Title, Text } = Typography
// const testdata = {
//     activityId: 971,
//     activityTitle: '【学术活动】“一国两制”在香港的实践',
//     activityRoles: [
//         {
//             role: '参与者',
//             point: '0.00',
//         },
//         {
//             role: '组织者',
//             point: '0.00',
//         },
//     ],
//     activityStudents: [
//         {
//             id: 36339,
//             userId: '21820245',
//             role: '未参与',
//             userName: '黄宇喆',
//             activityId: 971,
//         },
//         {
//             id: 36388,
//             userId: '22721481',
//             role: '未参与',
//             userName: '叶文斌',
//             activityId: 971,
//         },
//         {
//             id: 36190,
//             userId: '23721459',
//             role: '未参与',
//             userName: '段帅',
//             activityId: 971,
//         },
//         {
//             id: 36189,
//             userId: '23721461',
//             role: '未参与',
//             userName: '毛梦茜',
//             activityId: 971,
//         },
//         {
//             id: 36217,
//             userId: '23721463',
//             role: '未参与',
//             userName: '范亚婷',
//             activityId: 971,
//         },
//         {
//             id: 36224,
//             userId: '23721485',
//             role: '未参与',
//             userName: '展晨',
//             activityId: 971,
//         },
//         {
//             id: 36193,
//             userId: '23721486',
//             role: '未参与',
//             userName: '李春洁',
//             activityId: 971,
//         },
//         {
//             id: 36225,
//             userId: '23721489',
//             role: '未参与',
//             userName: '刘瑶',
//             activityId: 971,
//         },
//         {
//             id: 36191,
//             userId: '23721499',
//             role: '未参与',
//             userName: '李佳美',
//             activityId: 971,
//         },
//         {
//             id: 36196,
//             userId: '23721500',
//             role: '未参与',
//             userName: '张一丹',
//             activityId: 971,
//         },
//         {
//             id: 36194,
//             userId: '23721501',
//             role: '未参与',
//             userName: '王波',
//             activityId: 971,
//         },
//         {
//             id: 36227,
//             userId: '23721533',
//             role: '未参与',
//             userName: '钱磊',
//             activityId: 971,
//         },
//         {
//             id: 36374,
//             userId: '23721568',
//             role: '未参与',
//             userName: '李盈谕',
//             activityId: 971,
//         },
//         {
//             id: 36192,
//             userId: '23721578',
//             role: '未参与',
//             userName: '龚梦迪',
//             activityId: 971,
//         },
//     ],
// }

function AuditPage() {
    const { id } = useParams()
    // const location = useLocation()
    const token = useAuth()
    console.log('id', id, 'token', token)

    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadStatus, setUploadStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [activityData, setActivityData] = useState(null)
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
            setUploadStatus('上传中')
            try {
                const response = await fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: formData,
                })
                await delay(2000)

                if (response.ok) {
                    setUploadStatus(`文件 ${selectedFile.name} 上传成功！`)
                } else {
                    setUploadStatus('文件上传失败！')
                }
            } catch (error) {
                console.error('上传错误:', error)
                setUploadStatus('文件上传失败！')
            } finally {
                setIsLoading(false)
            }
        } else {
            setUploadStatus('请选择一个文件')
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
            <div className="upload-section">
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="custom-input"
                />
                <Button onClick={handleUpload}>上传文件</Button>
            </div>
            {selectedFile && (
                <div className="status-message">
                    <p>选中的文件: {selectedFile.name}</p>
                </div>
            )}
            {uploadStatus && (
                <div className="status-message">
                    <p>{uploadStatus}</p>
                </div>
            )}
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
                                        <Text className="ant-typography">
                                            {role.role}: {role.point}分
                                        </Text>
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
        </div>
    )
}

export default AuditPage
