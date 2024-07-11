import React, { useState } from 'react'
// import { useHistory } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    // let history = useHistory()
    let navigate = useNavigate()
    const handleSubmit = event => {
        event.preventDefault()
        // 在这里处理登录逻辑，例如发送请求到后端验证用户名和密码
        console.log('登录信息', { username, password })
        handleLogin()
    }
    function handleLogin() {
        // 登录成功后跳转到活动列表页面
        navigate('/activityList', { state: { username, password } })
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
