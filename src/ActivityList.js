// import React from 'react'

// function ActivityList() {
//     return (
//         <div>
//             <h2>Activity List</h2>
//             {/* Activity list content here */}
//         </div>
//     )
// }

// export default ActivityList

import React from 'react'
import { useLocation } from 'react-router-dom'
function Greeting(props) {
    return <h1>你好, {props.name}!</h1>
}
function ActivityList() {
    const location = useLocation()
    const { username, password } = location.state || {}

    return (
        <div>
            <h1>Activity List</h1>
            <Greeting name={username} />
            <p>密码: {password}</p>
        </div>
    )
}

export default ActivityList
