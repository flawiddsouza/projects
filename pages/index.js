import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

export default function Index() {

    const [ projects, setProjects ] = useState([])
    const [ tasks, setTasks ] = useState([])
    const [ currentProjectSlug, setCurrentProjectSlug ] = useState(null)
    const [ addTaskBool, setAddTaskBool ] = useState(false)
    let addTaskObj = {
        date: format(new Date, 'yyyy-MM-dd'),
        type: 'NR',
        description: ''
    }

    function fetchProjects() {
        setProjects([
            {
                name: 'Agnes Pacifyca',
                slug: 'agnes-pacifyca'
            },
            {
                name: 'Aloysius Pacifyca',
                slug: 'aloysius-pacifyca'
            }
        ])
    }

    function handleCurrentHash(hash) {
        hash = hash.replace('#', '')
        let hashSplit = hash.split(',')

        let keyValue = {}
        hashSplit.forEach(item => {
            let splitItem = item.split(':')
            keyValue[splitItem[0]] = splitItem[1]
        })

        if(keyValue.project) {
            loadProject(keyValue.project)
        }
    }

    function loadProject(projectSlug) {
        setCurrentProjectSlug(projectSlug)

        if(projectSlug === 'agnes-pacifyca') {
            setTasks([
                {
                    id: 1,
                    date: '2019-09-12',
                    type: 'NR',
                    description: 'Test 1',
                },
                {
                    id: 2,
                    date: '2019-09-10',
                    type: 'CR',
                    description: 'Test 2',
                },
                {
                    id: 3,
                    date: '2019-09-05',
                    type: 'BUG',
                    description: 'Test 3',
                }
            ])
        }

        if(projectSlug === 'aloysius-pacifyca') {
            setTasks([
                {
                    id: 4,
                    date: '2019-09-16',
                    type: 'BUG',
                    description: 'Test 4',
                },
                {
                    id: 5,
                    date: '2019-09-15',
                    type: 'BUG',
                    description: 'Test 5',
                },
                {
                    id: 6,
                    date: '2019-09-14',
                    type: 'CR',
                    description: 'Test 6'
                }
            ])
        }
    }

    function handleAddTaskKeydown(e) {
        if(e.key === 'Escape') {
            setAddTaskBool(false)
        }
    }

    function addTask(e) {
        e.preventDefault()
        let pushArray = [{
            id: new Date().getTime(),
            date: addTaskObj.date,
            type: addTaskObj.type,
            description: addTaskObj.description
        }]
        setTasks(pushArray.concat(tasks))
        setAddTaskBool(false)
        addTaskObj = {
            date: format(new Date, 'yyyy-MM-dd'),
            type: 'NR',
            description: ''
        }
    }

    useEffect(() => {
        handleCurrentHash(document.location.hash)

        window.onhashchange = () => {
            handleCurrentHash(document.location.hash)
        }

        fetchProjects()
    }, [])

    return (
        <div>
            <Head>
                <title>Project Management Tool</title>
                <link rel="stylesheet" href="static/global.css" />
                <link rel="stylesheet" href="static/functional.css" />
            </Head>
            <main>
                <div className="nav-logo">Logo</div>
                <div className="nav-area d-f flex-jc-sb">
                    <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setAddTaskBool(true) }}>+ Add task</a>
                    <div>
                        Tasks
                        <select className="ml-0_25em">
                            <option>Show Last 20</option>
                            <option>Show Last 50</option>
                            <option>Show Last 100</option>
                            <option>Show All</option>
                        </select>
                        <select className="ml-0_25em" defaultValue="Open">
                            <option>All</option>
                            <option>Open</option>
                            <option>Closed</option>
                        </select>
                        <select className="ml-0_25em">
                            <option>All</option>
                            <option>NR</option>
                            <option>CR</option>
                            <option>BUG</option>
                        </select>
                    </div>
                </div>
                <div className="sidebar">
                    <div className="fw-b">Projects</div>
                    <div className="mt-0_5em">
                        {
                            projects.map(project => {
                                return (
                                    <a className={`mt-0_25em d-b ${project.slug === currentProjectSlug ? 'td-n c-b' : ''}`} key={project.slug} href={ '#project:' + project.slug}>{ project.name }</a>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="main">
                    <form onSubmit={addTask}>
                        <table className="table">
                            <tbody>
                            {
                                addTaskBool &&
                                    <tr>
                                        <td style={{ width: '5em' }}>
                                            <input type="date"
                                                style={{ width: '4.6em' }}
                                                value={addTaskObj.date}
                                                onChange={e => addTaskObj.date = e.target.value}
                                            />
                                            </td>
                                        <td style={{ width: '2em' }}>
                                            <select onChange={e => addTaskObj.type = e.target.value}>
                                                <option>NR</option>
                                                <option>CR</option>
                                                <option>BUG</option>
                                            </select>
                                        </td>
                                        <td><input type="text" className="w-100p" required onKeyDown={handleAddTaskKeydown} onChange={e => addTaskObj.description = e.target.value}></input></td>
                                    </tr>
                            }
                            {
                                tasks.map(task => {
                                    return (
                                        <tr key={task.id}>
                                            <td style={{ width: '5em' }}>{ format(parseISO(task.date), 'dd-MMM-yy') }</td>
                                            <td style={{ width: '2em' }}>{ task.type }</td>
                                            <td>{ task.description }</td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </form>
                </div>
            </main>
        </div>
    )
}
