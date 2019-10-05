import { useEffect, useState, Fragment } from 'react'
import { format } from 'date-fns'
import Modal from 'Components/Modal.js'
import TaskView from 'Components/TaskView.js'
import Page from 'Components/Page.js'
import formatDate from 'Libs/formatDate.js'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import api from 'Libs/esm/api'

function Index() {

    const [ projects, setProjects ] = useState([])
    const [ taskTypes, setTaskTypes ] = useState([])
    const [ taskStatuses, setTaskStatuses ] = useState([])
    const [ projectCategories, setProjectCategories ] = useState([])
    const [ projectMembers, setProjectMembers ] = useState([])
    const [ tasks, setTasks ] = useState([])
    const [ currentProjectSlug, setCurrentProjectSlug ] = useState(null)
    const [ showAddTaskModal, setShowAddTaskModal ] = useState(false)
    const [ showViewTaskModal, setShowViewTaskModal ] = useState(false)
    const [ task, setTask ] = useState(null)
    const [ tasksFilterSelectedStatusId, setTasksFilterSelectedStatusId ] = useState('All')
    const [ tasksFilterSelectedTypeId, setTasksFilterSelectedTypeId ] = useState('All')
    const [ tasksFilterSelectedProjectCategoryId, setTasksFilterSelectedProjectCategoryId ] = useState('All')
    const [ tasksFilterSelectedAssignedUserId, setTasksFilterSelectedAssignedUserId ] = useState('All')
    const router = useRouter()

    var addTaskObj = {
        date: format(new Date, 'yyyy-MM-dd'),
        title: '',
        description: ''
    }

    async function fetchProjects() {
        const organizationSlug = document.location.pathname.replace('/', '')
        const projects = await api.get(`${organizationSlug}/projects`).json()
        setProjects(projects)
    }

    async function fetchTaskTypes() {
        const organizationSlug = document.location.pathname.replace('/', '')
        const taskTypes = await api.get(`${organizationSlug}/task-types`).json()
        setTaskTypes(taskTypes)
    }

    async function fetchTaskStatuses() {
        const organizationSlug = document.location.pathname.replace('/', '')
        const taskStatuses = await api.get(`${organizationSlug}/task-statuses`).json()
        setTaskStatuses(taskStatuses)
    }

    async function fetchProjectCategories(projectSlug) {
        const organizationSlug = document.location.pathname.replace('/', '')
        const projectCategories = await api.get(`${organizationSlug}/${projectSlug}/categories`).json()
        setProjectCategories(projectCategories)
    }

    function handleCurrentHash(hash) {
        if(!hash) {
            setCurrentProjectSlug(null)
            setProjectMembers([])
            setTasks([])
            setShowAddTaskModal(false)
            setShowViewTaskModal(false)
            return
        }

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

    async function fetchProjectMembers(projectSlug) {
        const organizationSlug = document.location.pathname.replace('/', '')
        const projectMembers = await api.get(`${organizationSlug}/${projectSlug}/members`).json()

        setProjectMembers(projectMembers)
    }

    async function fetchProjectTasks(projectSlug) {
        const organizationSlug = document.location.pathname.replace('/', '')
        const tasks = await api.get(`${organizationSlug}/${projectSlug}/tasks?status=${tasksFilterSelectedStatusId}&type=${tasksFilterSelectedTypeId}&category=${tasksFilterSelectedProjectCategoryId}&user=${tasksFilterSelectedAssignedUserId}`).json()

        setTasks(tasks)

        if(task) {
            setTask(tasks.find(taskItem => taskItem.id === task.id))
        }
    }

    async function loadProject(projectSlug) {
        setCurrentProjectSlug(projectSlug)

        fetchProjectMembers(projectSlug)
        fetchProjectTasks(projectSlug)
        fetchProjectCategories(projectSlug)
    }

    function handleAddTaskKeydown(e) {
        if(e.key === 'Escape') {
            setShowAddTaskModal(false)
        }
    }

    async function addTask(e) {
        e.preventDefault()

        const organizationSlug = document.location.pathname.replace('/', '')
        await api.post(`${organizationSlug}/${currentProjectSlug}/task`, {
            headers: {
                Token: localStorage.getItem('token')
            },
            json: Object.assign(addTaskObj, {
                task_status_id: taskStatuses[0].id,
                task_type_id: addTaskObj.task_type_id ? addTaskObj.task_type_id : taskTypes[0].id,
                project_category_id: addTaskObj.project_category_id ? addTaskObj.project_category_id : null
            })
        }).json()

        fetchProjectTasks(currentProjectSlug)

        setShowAddTaskModal(false)

        addTaskObj = {
            date: format(new Date, 'yyyy-MM-dd'),
            title: '',
            description: ''
        }
    }

    function viewTask(task) {
        setTask(JSON.parse(JSON.stringify(task)))
        setShowViewTaskModal(true)
    }

    function handleReset(url) {
        if(url === '/') {
            handleCurrentHash(null)
        }
    }

    useEffect(() => {
        handleCurrentHash(document.location.hash)

        window.onhashchange = () => {
            handleCurrentHash(document.location.hash)
        }

        Router.events.on('hashChangeComplete', handleReset)
        Router.events.on('routeChangeComplete', handleReset)

        fetchProjects()
        fetchTaskTypes()
        fetchTaskStatuses()

        return () => {
            Router.events.off('hashChangeComplete', handleReset)
            Router.events.off('routeChangeComplete', handleReset)
        }
    }, [])

    useEffect(() => {
        if(currentProjectSlug) {
            fetchProjectTasks(currentProjectSlug)
        }
    }, [tasksFilterSelectedStatusId, tasksFilterSelectedTypeId, tasksFilterSelectedProjectCategoryId, tasksFilterSelectedAssignedUserId])

    return (
        <Page>
            <Page.Nav>
                {
                    currentProjectSlug ?
                    <Fragment>
                        <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowViewTaskModal(false); setShowAddTaskModal(true) }}>+ Add task</a>

                        <div>
                            Tasks
                            <select className="ml-0_25em">
                                <option>Show Last 50</option>
                                <option>Show Last 100</option>
                                <option>Show All</option>
                            </select>
                            <select className="ml-0_25em" value={tasksFilterSelectedStatusId} onChange={e => setTasksFilterSelectedStatusId(e.target.value)}>
                                <option>All</option>
                                {
                                    taskStatuses.map(taskStatus => (
                                        <option key={taskStatus.id} value={taskStatus.id}>{taskStatus.status}</option>
                                    ))
                                }
                            </select>
                            <select className="ml-0_25em" value={tasksFilterSelectedTypeId} onChange={e => setTasksFilterSelectedTypeId(e.target.value)}>
                                <option>All</option>
                                {
                                    taskTypes.map(taskType => (
                                        <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                                    ))
                                }
                            </select>
                            <select className="ml-0_25em" value={tasksFilterSelectedProjectCategoryId} onChange={e => setTasksFilterSelectedProjectCategoryId(e.target.value)}>
                                <option>All</option>
                                <option value="">Not Applicable</option>
                                {
                                    projectCategories.map(projectCategory => (
                                        <option key={projectCategory.id} value={projectCategory.id}>{projectCategory.category}</option>
                                    ))
                                }
                            </select>
                            <select className="ml-0_25em" value={tasksFilterSelectedAssignedUserId} onChange={e => setTasksFilterSelectedAssignedUserId(e.target.value)}>
                                <option>All</option>
                                {
                                    projectMembers.map(projectMember => (
                                        <option key={projectMember.user_id} value={projectMember.user_id}>{projectMember.user}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </Fragment>
                    :
                    <select className="v-h"></select>
                }
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
                {
                    projectMembers.length > 0 &&
                    <Fragment>
                        <div className="fw-b mt-1em">Project Members</div>
                        <div className="mt-0_5em">
                            {
                                projectMembers.map(projectMember => {
                                    return (
                                        <div key={projectMember.id} className="mt-0_25em" title={projectMember.role}>
                                            <a
                                                href="#"
                                                onClick={e => {
                                                    e.preventDefault()
                                                    setTasksFilterSelectedAssignedUserId(projectMember.user_id)
                                                }}
                                                className={`td-n c-b ${projectMember.user_id == tasksFilterSelectedAssignedUserId ? 'td-u' : ''}`}>{projectMember.user}</a>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </Fragment>
                }
                <div className="fw-b mt-1em">Other Links</div>
                <div className="mt-0_5em">
                    <Link href="[organization]/admin" as={`${router.query.organization}/admin`}>
                        <a>Admin Panel</a>
                    </Link>
                </div>
            </Page.Sidebar>
            <Page.Content paddingBottom0={true}>
                <div className="oy-a" style={{ height: 'calc(100vh - 5.2em)' }}>
                    <table className="table table-hover">
                        <tbody>
                        {
                            tasks.map(task => {
                                return (
                                    <tr key={task.id} onClick={() => viewTask(task)} className="cur-p">
                                        <td style={{ width: '5em' }}>{ formatDate(task.date) }</td>
                                        <td style={{ width: '2em' }}>{ task.type }</td>
                                        {
                                            tasksFilterSelectedStatusId === 'All' &&
                                            <td style={{ width: '2em' }}>{ task.status }</td>
                                        }
                                        <td>{ task.title }</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
                {
                    currentProjectSlug &&
                    <div className="mt-0_5em">{ tasks.length } { tasks.length === 1 ? 'task' : 'tasks' } found</div>
                }
                <Modal showModal={showAddTaskModal} hideModal={() => setShowAddTaskModal(false)}>
                    <form onSubmit={addTask} style={{ width: '30vw' }}>
                        <div className="d-f">
                            <div>
                                <div>Date</div>
                                <input type="date"
                                    defaultValue={addTaskObj.date}
                                    onChange={e => addTaskObj.date = e.target.value}
                                />
                            </div>
                            <div className="ml-0_5em">
                                <div>Type</div>
                                <select onChange={e => addTaskObj.task_type_id = e.target.value}>
                                    {
                                        taskTypes.map(taskType => (
                                            <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="ml-0_5em">
                                <div>Category</div>
                                <select onChange={e => addTaskObj.project_category_id = e.target.value}>
                                    <option value="">Not Applicable</option>
                                    {
                                        projectCategories.map(projectCategory => (
                                            <option key={projectCategory.id} value={projectCategory.id}>{projectCategory.category}</option>
                                        ))
                                    }
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
                            <input type="file" multiple />
                        </div>
                        <div className="mt-1em">
                            <button>Add Task</button>
                            <button className="ml-1em" type="button" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                        </div>
                    </form>
                </Modal>
                {
                    task &&
                    <Modal showModal={showViewTaskModal} hideModal={() => setShowViewTaskModal(false)}>
                        <TaskView task={task} taskStatuses={taskStatuses} taskTypes={taskTypes} projectCategories={projectCategories} refreshTasks={() => fetchProjectTasks(currentProjectSlug)}></TaskView>
                    </Modal>
                }
            </Page.Content>
        </Page>
    )
}

export default Index
