import React, { useState, useEffect } from 'react'
import { Row, Col, Spin, Button, Typography, message, Upload, Radio, Modal } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { useHandleRoleChange } from './HandleRoleChange'
import { useAddStudent } from './AddStudents'
import Fuse from 'fuse.js'

const { Text } = Typography

const FileUpload = ({
    token,
    activityData,
    studentOptions,
    fetchActivityData,
    handleRoleChange,
    id,
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const [fileId, setFileId] = useState(null)
    const [selectedFile, setSelectedFile] = useState([])
    // const [localActivityData, setlocalActivityData] = useState(activityData) // 初始化 activityData
    const { selectedStudents, handleStudentSelect, handleClearStudents, handleAddStudents } =
        useAddStudent(token, activityData, fetchActivityData)
    // const { handleRoleChange } = useHandleRoleChange(token, fetchActivityData) // 使用自定义 Hook
    const [matchType, setMatchType] = useState('byId') // 新增的状态，用于保存匹配类型（ID或姓名）
    const handleFileChange = info => {
        const { status } = info.file
        if (!status || status === 'done' || status === 'uploading') {
            setSelectedFile([info.file]) // 保存当前选择的文件
        } else if (status === 'removed') {
            handleRemoveFile()
        }
    }
    useEffect(() => {
        // 当 activityData 再auditpage页面里变化时触发
        if (activityData) {
            // console.log('最新的活动数据:', activityData)
            // 在这里执行你的逻辑，例如处理最新的活动数据
        }
    }, [activityData]) // 监听 activityData 的变化
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    const handleUpload = async () => {
        if (selectedFile.length > 0) {
            const formData = new FormData()
            formData.append('file', selectedFile[0])
            setIsLoading(true)
            message.info('上传中')
            try {
                const response = await fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: formData,
                })
                await delay(1000)
                if (response.ok) {
                    const result = await response.json()
                    message.success(`文件 ${selectedFile[0].name} 上传成功！`)
                    setFileId(result.fileId)
                } else {
                    message.error('文件上传失败！')
                }
            } catch (error) {
                console.error('上传错误:', error)
                message.error('文件上传失败！')
            } finally {
                setIsLoading(false)
            }
        } else {
            message.warning('请选择一个文件')
        }
    }

    const handleOcr = async () => {
        if (fileId) {
            setIsLoading(true)
            try {
                const response = await fetch(`http://localhost:3000/ocr/${fileId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filename: fileId }),
                })
                const result = await response.json()
                const text = JSON.stringify(result)
                if (response.ok) {
                    message.info(`OCR识别结果: ${result}`)
                    await processOcrResult(text)
                } else {
                    message.error('OCR识别失败')
                }
            } catch (error) {
                console.error('OCR识别错误:', error)
                message.error('OCR识别失败')
            } finally {
                setIsLoading(false)
            }
        } else {
            message.error('请先上传文件')
        }
    }

    const processOcrResult = async ocrResult => {
        // console.log('ocrResult', ocrResult)
        // console.log('localActivityData', activityData)
        // console.log('localselectedStudents', selectedStudents)
        if (!ocrResult) {
            message.error('OCR结果无效')
            return
        }
        console.log('ocrResult', ocrResult)
        if (!activityData || !activityData.activityStudents) {
            message.error('活动数据未加载，无法处理OCR结果')
            return
        }
        const words = ocrResult
            .split(' ')
            .map(word => word.trim())
            .filter(word => word.length > 0)
        // 匹配 studentOptions 中的学生
        const matchedStudentIds = []
        //去除重复的学生id
        // console.log('studentOptions', studentOptions)
        // 遍历 OCR 分词结果，使用 Fuse.js 或直接遍历来匹配 studentOptions 中的姓名
        let fuse //
        words.forEach(word => {
            if (matchType === 'byId') {
                // 使用正则表达式来严格匹配 ID（只匹配数字）
                const numericWord = /^\d+$/.test(word) ? word : null // 仅处理纯数字字符串
                if (numericWord) {
                    const matchedStudent = studentOptions.find(
                        student => String(student.userId) === numericWord
                    )
                    if (matchedStudent) {
                        matchedStudentIds.push(matchedStudent.userId) // 将匹配到的学生ID放入数组
                    }
                }
            } else if (matchType === 'byName') {
                // 根据姓名进行模糊匹配
                fuse = new Fuse(studentOptions, {
                    keys: ['userName'],
                    threshold: 0.5, // 设置一个严格的阈值
                })
                const result = fuse.search(word) // 使用 Fuse.js 进行模糊匹配
                if (result.length > 0) {
                    const matchedStudent = result[0].item
                    matchedStudentIds.push(matchedStudent.userId) // 将找到的学生 ID 放入数组
                }
            } else {
                // 根据姓名和学号进行模糊匹配
                fuse = new Fuse(studentOptions, {
                    keys: ['userName', 'userId'],
                    threshold: 0.5, // 设置一个严格的阈值
                })
                const result = fuse.search(word)
                if (result.length > 0) {
                    const student = result[0].item
                    matchedStudentIds.push(student.userId)
                } else {
                    console.warn(`未找到匹配的学生姓名或学号: ${word}`)
                }
            }
        })
        const uniqueStudentIds = [...new Set(matchedStudentIds)]
        if (uniqueStudentIds.length === 0) {
            message.warning('OCR结果中没有匹配到任何学生')
            return
        }
        // 调用 handleAddStudents 来处理新增学生
        await handleStudentSelect(uniqueStudentIds) // 传入匹配到的学生 ID
        await handleAddStudents(id) // 传入活动的 id
        await fetchActivityData(id) // 重新获取活动数据

        console.log('unique matchedStudent', uniqueStudentIds)
        console.log('fetch activityStudents', activityData.activityStudents)
        const studentsToUpdate = activityData.activityStudents.filter(
            student => uniqueStudentIds.includes(Number(student.userId)) && student.role != '参与者'
        )

        if (studentsToUpdate.length === 0) {
            message.warning('没有找到要更新的学生')
            return
        }
        console.log('过滤的', studentsToUpdate)
        // 检查是否找到学生，并且角色不是 '参与者'
        try {
            await handleRoleChange(id, '参与者', studentsToUpdate)
            await fetchActivityData(id)
            message.success('OCR识别成功并更新学生角色')
        } catch (error) {
            console.error('身份修改失败:', error)

            // 弹出确认提示框
            Modal.confirm({
                title: '修改身份失败',
                content: '部分学生身份修改失败，是否重试？',
                okText: '重试',
                cancelText: '取消',
                onOk: async () => {
                    try {
                        await handleRoleChange(id, '参与者', studentsToUpdate) // 再次尝试
                        await fetchActivityData(id) // 更新数据
                        message.success('学生身份修改成功')
                    } catch (retryError) {
                        console.error('重试失败:', retryError)
                        message.error('重试修改身份失败')
                    }
                },
                onCancel: () => {
                    message.info('取消了重试修改身份')
                },
            })
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile([]) // 清除当前选择的文件
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {/* 文件上传按钮部分 */}
            <Col>
                <Upload
                    accept=".pdf,image/*"
                    beforeUpload={() => false} // 阻止自动上传
                    onChange={handleFileChange} // 文件选择后触发
                    fileList={selectedFile} // 保持选择的文件
                    showUploadList={false} // 显示上传列表
                >
                    <Button icon={<UploadOutlined />} disabled={selectedFile.length >= 1}>
                        {selectedFile.length >= 1 ? '已选择' : '选择文件'}
                    </Button>
                </Upload>
            </Col>
            {/* 自定义文件列表，展示在右侧 */}
            <Col style={{ marginLeft: '20px' }}>
                {selectedFile.length >= 1 && Array.isArray(selectedFile) && (
                    <div>
                        <Text>已选择文件：</Text>
                        {selectedFile.map(file => (
                            <p key={file.uid}>
                                {file.name} <DeleteOutlined onClick={handleRemoveFile} />
                            </p>
                        ))}
                    </div>
                )}
            </Col>
            {/* 上传文件按钮 */}
            <Col style={{ marginLeft: '10px' }}>
                <Button
                    onClick={handleUpload}
                    icon={<UploadOutlined />}
                    type="primary"
                    disabled={selectedFile.length === 0}
                >
                    上传文件
                </Button>
            </Col>
            <Col style={{ marginLeft: '10px' }}>
                {isLoading && (
                    <Row style={{ marginLeft: '10px' }}>
                        <Col>
                            <Spin />
                        </Col>
                        <Col style={{ marginLeft: '10px' }}>
                            <Text>加载中...</Text>
                        </Col>
                    </Row>
                )}
                {fileId && !isLoading && (
                    <Row style={{ marginLeft: '20px', alignItems: 'center' }}>
                        <Col>
                            <Text>文件ID: {fileId}</Text>
                        </Col>
                        <Col>
                            <Button
                                onClick={handleOcr}
                                style={{ marginLeft: '10px' }}
                                type="primary"
                                disabled={isLoading}
                            >
                                一键审核
                            </Button>
                        </Col>
                        {/* 匹配类型选择的Radio */}
                        <Col style={{ marginLeft: '20px' }}>
                            <Radio.Group
                                onChange={e => setMatchType(e.target.value)}
                                value={matchType}
                                style={{ marginRight: '10px' }}
                            >
                                <Radio value="byId">根据学号匹配</Radio>
                                <Radio value="byName">根据姓名匹配</Radio>
                                <Radio value="byBoth">根据姓名或学号匹配</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                )}
            </Col>
        </div>
    )
}

export default FileUpload
