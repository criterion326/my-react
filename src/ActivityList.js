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

import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTable, useSortBy } from 'react-table'
let [data, setData] = useState([])
// props 是一个对象，包含了从父组件传递过来的数据
function Greeting(props) {
    return <h1>你好, {props.name}!</h1>
}
function SortableTable({ columns, data }) {
    // 使用useTable和useSortBy钩子初始化表格
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data,
        },
        useSortBy // 使用useSortBy插件来实现排序功能
    )

    // 渲染表格
    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps(column.getSortByToggleProps())} // 添加排序属性和事件
                            >
                                {column.render('Header')}
                                {/* 添加排序方向指示器 */}
                                <span>
                                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

// 使用示例
const columns = [
    {
        Header: 'ID',
        accessor: 'id', // 访问器是从原始数据中取出数据的键
    },
    {
        Header: '活动标题',
        accessor: 'activityTitle',
    },
    {
        Header: '开始时间',
        accessor: 'activityStartTime',
    },
    {
        Header: '结束时间',
        accessor: 'activityEndTime',
    },
    {
        Header: '发布人',
        accessor: 'selectPublisher',
    },
    {
        Header: '活动状态',
        accessor: 'activityStatus',
    },
    {
        Header: '申请截至时间',
        accessor: 'applyEndTime',
    },
    {
        Header: '操作',
    },
]
//     fetch('P:Data/react/my-react/public/activities.json') // 从本地资源文件中读取数据
//         .then(response => response.json())
//         .then(data2 => {
//             console.log('read json', data2)
//             data = data2.map(item => {
//                 return {
//                     id: item.id,
//                     activityTitle: item.activityTitle,
//                     activityStartTime: item.activityStartTime,
//                     activityEndTime: item.activityEndTime,
//                     selectPublisher: item.selectPublisher,
//                     activityStatus: item.activityStatus,
//                     applyEndTime: item.applyDeadline,
//                 }
//             })
//             setData(data)
//         })
// }, [])
function ActivityList() {
    const location = useLocation()
    const res = location.state || {}
    // console.log('res', res)
    const { name: username, token } = res
    return (
        <div>
            <div>
                <h1>Activity List</h1>
                <Greeting name={username} />
            </div>
            <div>
                <SortableTable data={data} columns={columns} />
            </div>
        </div>
    )
}

export default ActivityList
