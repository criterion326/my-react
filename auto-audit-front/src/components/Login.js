import React, { useState } from 'react'
// import { useHistory } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext' // 引入 AuthContext

function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    // let history = useHistory()
    let navigate = useNavigate()
    const { saveToken } = useAuth() // 从 AuthContext 获取 saveToken 函数

    const handleSubmit = event => {
        event.preventDefault()
        // 在这里处理登录逻辑，例如发送请求到后端验证用户名和密码
        console.log('登录信息', { username, password })
        handleLogin()
    }
    function handleLogin() {
        // 登录成功后跳转到活动列表页面
        fetch('http://localhost:3000/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 保存 token 到全局状态
                    saveToken(data.token)
                    // 将用户数据和 token 保存到 state 并跳转到活动列表页面
                    navigate('/activityList', { state: { ...data, name: username } })
                } else {
                    console.log('登录失败:', data.message)
                }
            })
            .catch(error => {
                // handle the error
                console.log(error)
            })
    }
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', width: '300px' }}
            >
                <input
                    type="text"
                    placeholder="账号"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ marginBottom: '10px', padding: '10px' }}
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ marginBottom: '20px', padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px' }}>
                    登录
                </button>
            </form>
        </div>
    )
}

export default LoginForm
