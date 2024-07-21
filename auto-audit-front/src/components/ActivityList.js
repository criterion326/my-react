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
import { useLocation, useNavigate } from 'react-router-dom'
import { useTable, useSortBy, usePagination } from 'react-table'
import './ActivityList.css' // 引入自定义的 CSS 文件

// props 是一个对象，包含了从父组件传递过来的数据
function Greeting(props) {
    return <h1>你好, {props.name}!</h1>
}
function SortableTable({ columns, data, handleAuditClick }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page, // 代替 rows 用于分页
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0 }, // 初始页码
        },
        useSortBy,
        usePagination // 使用分页插件
    )
    // 初始化表格状态和钩子：通过useTable钩子，传入列定义(columns)和数据(data)，以及初始状态（如初始页码pageIndex: 0）。此外，还使用了useSortBy和usePagination插件来为表格添加排序和分页功能。

    // 渲染表格容器：使用<div>标签创建一个包含表格的容器，类名为table-container。

    // 渲染表格：使用<table>标签定义表格本身，并通过getTableProps()方法应用表格的属性，这是useTable钩子提供的方法。

    // 渲染表头：

    // 使用<thead>标签定义表头部分。
    // 遍历headerGroups数组（由useTable钩子提供，包含所有列的元数据）。
    // 对于每个表头组，渲染一个<tr>行，并遍历每个组中的列，为每列渲染一个<th>表头单元格。
    // 表头单元格通过column.getHeaderProps(column.getSortByToggleProps())获取必要的属性，并通过column.render('Header')渲染列标题。
    // 如果列已经被排序，会在标题旁边显示一个表示排序方向的箭头图标。
    // 渲染表体：

    // 使用<tbody>标签定义表体部分。
    // 遍历page数组（由useTable钩子提供，代表当前页的行数据），为每行数据渲染一个<tr>行。
    // 在每行内部，遍历行中的单元格，为每个单元格渲染一个<td>标签，并通过cell.render('Cell')渲染单元格的内容。
    return (
        <div className="table-container">
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell =>
                                    cell.column.id === 'index' ? (
                                        <td {...cell.getCellProps()}>
                                            {i + 1 + pageIndex * pageSize}
                                        </td>
                                    ) : cell.column.id === 'action' ? (
                                        <td {...cell.getCellProps()}>
                                            <button
                                                onClick={() => handleAuditClick(row.cells[1].value)}
                                            >
                                                审核
                                            </button>
                                        </td>
                                    ) : (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    )
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {/* 分页控制 */}
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>
                <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>
                </span>
                <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
// 通过useTable钩子，传入列定义(columns)和数据(data)，以及初始状态（如初始页码pageIndex: 0）。此外，还使用了useSortBy和usePagination插件来为表格添加排序和分页功能。
function namechange(number) {
    switch (number) {
        case 0:
            return '党建'
        case 1:
            return '团总支'
        case 2:
            return '研究生会'
        default:
            return '无'
    }
}
function ActivityList() {
    const location = useLocation()
    const navigate = useNavigate()
    const res = location.state || {}
    console.log('ActivityList', res)
    const { name: username, token } = res
    console.log(username)
    const [data, setData] = useState([])

    useEffect(() => {
        fetch('/activities.json') // 确保路径正确
            .then(response => response.json())
            .then(data => {
                data = data.result.data || []
                console.log('read json', data)

                if (Array.isArray(data)) {
                    const formattedData = data.map(item => ({
                        id: item.id,
                        activityTitle: item.activityTitle,
                        activityStartTime: item.activityStartTime,
                        activityEndTime: item.activityEndTime,
                        selectPublisher: namechange(item.selectPublisher),
                        applyStatus: item.applyStatus,
                        activityRoles: item.activityRoles || '无',
                        applyEndTime: item.applyDeadline,
                    }))
                    setData(formattedData)
                } else {
                    console.error('Expected an array but got:', data)
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error)
            })
    }, [])
    const handleAuditClick = id => {
        // navigate.push(`/audit/${id}`)
        navigate('/audit/' + id, { state: { username, token } })
    }

    const columns = [
        {
            Header: '序号',
            accessor: 'index',
        },
        {
            Header: '活动ID',
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
            Header: '是否申请',
            accessor: 'applyStatus',
        },
        {
            Header: '角色身份',
            accessor: 'activityRoles',
        },
        {
            Header: '申请截至时间',
            accessor: 'applyEndTime',
        },
        {
            Header: '操作',
            id: 'action',
            Cell: ({ row }) => (
                <button onClick={() => handleAuditClick(row.original.id)}>审核</button>
            ), // 通过row.original获取原始数据)
        },
    ]
    return (
        <div>
            <div className="header-container">
                <h1>Activity List,</h1>
                <Greeting name={username} />
            </div>
            <div>
                <SortableTable data={data} columns={columns} handleAuditClick={handleAuditClick} />
            </div>
        </div>
    )
}

export default ActivityList
