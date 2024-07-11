// import logo from './logo.svg'
// import './App.css'
// import LoginForm from './Login'
// function App() {
//     return (
//         <div className="App">
//             <LoginForm />
//         </div>
//     )
// }

// export default App

import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginForm from './Login'
import ActivityList from './ActivityList'

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<LoginForm />}></Route>
                    <Route path="/activityList" element={<ActivityList />}></Route>
                </Routes>
            </div>
        </Router>
    )
}

export default App
