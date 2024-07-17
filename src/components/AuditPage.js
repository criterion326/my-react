import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

function AuditPage() {
    const { id } = useParams()
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadStatus, setUploadStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
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
                const response = await fetch('/api/upload', {
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

    return (
        <div>
            <h1>审核页面</h1>
            <p>正在审核的活动ID：{id}</p>
            <div>
                <input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
                <button onClick={handleUpload}>上传文件</button>
            </div>
            {selectedFile && (
                <div>
                    <p>选中的文件: {selectedFile.name}</p>
                </div>
            )}
            {uploadStatus && (
                <div>
                    <p>{uploadStatus}</p>
                </div>
            )}
            {isLoading && (
                <div>
                    <p>加载中...</p>
                </div>
            )}
        </div>
    )
}

export default AuditPage
