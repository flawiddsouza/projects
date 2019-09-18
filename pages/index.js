import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Modal from '../components/Modal.js'
import TaskView from '../components/TaskView.js'
import Page from '../components/Page.js'
import formatDate from '../libs/formatDate.js'

export default function Index() {

    const [ projects, setProjects ] = useState([])
    const [ projectMembers, setProjectMembers ] = useState([])
    const [ tasks, setTasks ] = useState([])
    const [ currentProjectSlug, setCurrentProjectSlug ] = useState(null)
    const [ showAddTaskModal, setShowAddTaskModal ] = useState(false)
    const [ showViewTaskModal, setShowViewTaskModal ] = useState(false)
    const [ task, setTask ] = useState(null)

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
                    title: 'Test 1',
                    status: 'OPEN'
                },
                {
                    id: 2,
                    date: '2019-09-10',
                    type: 'CR',
                    title: 'Test 2',
                    status: 'OPEN'
                },
                {
                    id: 3,
                    date: '2019-09-05',
                    type: 'BUG',
                    title: 'Test 3',
                    status: 'OPEN'
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
                    title: 'Test 4',
                    status: 'OPEN'
                },
                {
                    id: 5,
                    date: '2019-09-15',
                    type: 'BUG',
                    title: 'Test 5',
                    status: 'OPEN'
                },
                {
                    id: 6,
                    date: '2019-09-14',
                    type: 'CR',
                    title: 'Test 6',
                    status: 'OPEN'
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
            setShowAddTaskModal(false)
        }
    }

    let addTaskObj = {
        date: format(new Date, 'yyyy-MM-dd'),
        type: 'NR',
        status: 'OPEN',
        title: '',
        description: ''
    }

    function addTask(e) {
        e.preventDefault()
        let pushArray = [{
            id: new Date().getTime(),
            date: addTaskObj.date,
            type: addTaskObj.type,
            title: addTaskObj.title,
            description: addTaskObj.description
        }]
        setTasks(pushArray.concat(tasks))
        setShowAddTaskModal(false)
        addTaskObj = {
            date: format(new Date, 'yyyy-MM-dd'),
            type: 'NR',
            status: 'OPEN',
            title: '',
            description: ''
        }
    }

    function viewTask(task) {
        setTask(JSON.parse(JSON.stringify(task)))
        setShowViewTaskModal(true)
    }

    useEffect(() => {
        handleCurrentHash(document.location.hash)

        window.onhashchange = () => {
            handleCurrentHash(document.location.hash)
        }

        fetchProjects()
    }, [])

    return (
        <Page>
            <Page.Nav>
                <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowAddTaskModal(true) }}>+ Add task</a>
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
            </Page.Nav>
            <Page.Sidebar>
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
            </Page.Sidebar>
            <Page.Content>
                <table className="table table-hover">
                    <tbody>
                    {
                        tasks.map(task => {
                            return (
                                <tr key={task.id} onClick={() => viewTask(task)} className="cur-p">
                                    <td style={{ width: '5em' }}>{ formatDate(task.date) }</td>
                                    <td style={{ width: '2em' }}>{ task.type }</td>
                                    <td>{ task.title }</td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
                <Modal showModal={showAddTaskModal} hideModal={() => setShowAddTaskModal(false)}>
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
                            <div>Title</div>
                            <input type="text" required onKeyDown={handleAddTaskKeydown} onChange={e => addTaskObj.title = e.target.value} className="w-100p" autoFocus></input>
                        </div>
                        <div className="mt-0_5em">
                            <div>Description</div>
                            <textarea onKeyDown={handleAddTaskKeydown} onChange={e => addTaskObj.description = e.target.value} className="w-100p" style={{ height: '5em' }}></textarea>
                        </div>
                        <div className="mt-0_5em">
                            <div>Attach Files</div>
                            <input type="file" mutliple="true" />
                        </div>
                        <div className="mt-1em">
                            <button>Add Task</button>
                            <button className="ml-1em" type="button" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                        </div>
                    </form>
                </Modal>
                { task &&
                    <Modal showModal={showViewTaskModal} hideModal={() => setShowViewTaskModal(false)}>
                        <TaskView task={task}></TaskView>
                    </Modal>
                }
            </Page.Content>
        </Page>
    )
}
