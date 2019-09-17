import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import Modal from '../components/Modal.js'

const displayDateFormat = 'dd-MMM-yy'

export default function Index() {

    const [ projects, setProjects ] = useState([])
    const [ projectMembers, setProjectMembers ] = useState([])
    const [ tasks, setTasks ] = useState([])
    const [ currentProjectSlug, setCurrentProjectSlug ] = useState(null)
    const [ showAddTaskModal, setshowAddTaskModal ] = useState(false)

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
            setProjectMembers([
                {
                    id: 1,
                    name: 'Deepa',
                    role: 'Tester'
                },
                {
                    id: 2,
                    name: 'Flawid',
                    role: 'Team Lead'
                },
                {
                    id: 3,
                    name: 'Kavya',
                    role: 'Assistant Team Lead'
                },
                {
                    id: 4,
                    name: 'Keerthan',
                    role: 'Developer'
                },
                {
                    id: 5,
                    name: 'Ranjith',
                    role: 'Developer'
                },
                {
                    id: 6,
                    name: 'Shreekanth',
                    role: 'Developer'
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
            setProjectMembers([
                {
                    id: 7,
                    name: 'Aniketh',
                    role: 'Team Lead'
                },
                {
                    id: 8,
                    name: 'Chaitra',
                    role: 'Tester'
                },
                {
                    id: 9,
                    name: 'Denzil',
                    role: 'Developer'
                },
                {
                    id: 10,
                    name: 'Sanath',
                    role: 'Developer'
                }
            ])
        }
    }

    function handleAddTaskKeydown(e) {
        if(e.key === 'Escape') {
            setshowAddTaskModal(false)
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
        setshowAddTaskModal(false)
        addTaskObj = {
            date: format(new Date, 'yyyy-MM-dd'),
            type: 'NR',
            description: ''
        }
    }

    function viewTask(task) {
        console.log(task)
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
                    <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setshowAddTaskModal(true) }}>+ Add task</a>
                    <div>
                        Tasks
                        <select className="ml-0_25em">
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
                    <div className="fw-b mt-1em">Project Members</div>
                    <div className="mt-0_5em">
                        {
                            projectMembers.map(projectMember => {
                                return (
                                    <div key={projectMember.id} className="mt-0_25em" title={projectMember.role}>
                                        { projectMember.name } {projectMember.id === 1 ? '(you)' : ''}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="main">
                    <table className="table">
                        <tbody>
                        {
                            tasks.map(task => {
                                return (
                                    <tr key={task.id} onClick={() => viewTask(task)} className="cur-p">
                                        <td style={{ width: '5em' }}>{ format(parseISO(task.date), displayDateFormat) }</td>
                                        <td style={{ width: '2em' }}>{ task.type }</td>
                                        <td>{ task.description }</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                    <Modal showModal={showAddTaskModal} hideModal={() => setshowAddTaskModal(false)}>
                        <form onSubmit={addTask} style={{ width: '30vw' }}>
                            <div className="d-f">
                                <div>
                                    <div>Date</div>
                                    <input type="date"
                                        value={addTaskObj.date}
                                        onChange={e => addTaskObj.date = e.target.value}
                                    />
                                </div>
                                <div className="ml-0_5em">
                                    <div>Type</div>
                                    <select onChange={e => addTaskObj.type = e.target.value}>
                                        <option>NR</option>
                                        <option>CR</option>
                                        <option>BUG</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-0_5em">
                                <div>Description</div>
                                <textarea required onKeyDown={handleAddTaskKeydown} onChange={e => addTaskObj.description = e.target.value}className="w-100p" style={{ height: '5em' }} autoFocus></textarea>
                            </div>
                            <div className="mt-0_5em">
                                <div>Attach Files</div>
                                <input type="file" />
                            </div>
                            <div className="mt-1em">
                                <button>Add Task</button>
                                <button className="ml-1em" type="button" onClick={() => setshowAddTaskModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </main>
        </div>
    )
}
