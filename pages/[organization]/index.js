import { useEffect, useState, Fragment, createRef } from 'react'
import { format } from 'date-fns'
import Modal from 'Components/Modal.js'
import TaskView from 'Components/TaskView.js'
import AddTimeSpend from 'Components/AddTimeSpend.js'
import Settings from 'Components/Settings.js'
import Page from 'Components/Page.js'
import formatDate from 'Libs/formatDate.js'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import api from 'Libs/esm/api'
import logout from 'Libs/esm/logout'
import createLoader from 'Libs/esm/createLoader'

function Index() {

    const [ projects, setProjects ] = useState([])
    const [ taskTypes, setTaskTypes ] = useState([])
    const [ taskStatuses, setTaskStatuses ] = useState([])
    const [ taskPriorities, setTaskPriorities ] = useState([])
    const [ projectCategories, setProjectCategories ] = useState([])
    const [ projectMembers, setProjectMembers ] = useState([])
    const [ tasks, setTasks ] = useState([])
    const [ currentProjectSlug, setCurrentProjectSlug ] = useState(null)
    const [ showAddTaskModal, setShowAddTaskModal ] = useState(false)
    const [ showAddTimeSpendModal, setShowAddTimeSpendModal ] = useState(false)
    const [ showSettingsModal, setShowSettingsModal ] = useState(false)
    const [ addTaskObj, setAddTaskObj ] = useState({})
    const [ addTaskModalSelectedUserIds, setAddTaskModalSelectedUserIds ] = useState([])
    const [ addTaskNotifyUsersByEmail, setAddTaskNotifyUsersByEmail ] = useState(true)
    const [ selectedProjectIdForAddTask, setSelectedProjectIdForAddTask ] = useState('')
    const [ showViewTaskModal, setShowViewTaskModal ] = useState(false)
    const [ task, setTask ] = useState(null)
    const [ tasksFilterSelectedStatusId, setTasksFilterSelectedStatusId ] = useState('All')
    const [ tasksFilterSelectedTypeId, setTasksFilterSelectedTypeId ] = useState('All')
    const [ tasksFilterSelectedProjectCategoryId, setTasksFilterSelectedProjectCategoryId ] = useState('All')
    const [ tasksFilterSelectedAssignedUserId, setTasksFilterSelectedAssignedUserId ] = useState('All')
    const [ tasksFilterSortBy, setTasksFilterSortBy ] = useState('Created Date')
    const [ tasksFilterSelectedLimit, setTasksFilterSelectedLimit ] = useState('50')
    const [ isAdmin, setIsAdmin ] = useState(false)
    const [ authenticatedUserId, setAuthenticatedUserId ] = useState(null)
    const fileInput = createRef()
    const router = useRouter()
    const { organization } = router.query

    function setPropState(state, setStateFunction, prop, value) {
        setStateFunction({
            ...state,
            [prop]: value
        })
    }

    function setAddTaskObjProp(prop, value) {
        setPropState(addTaskObj, setAddTaskObj, prop, value)
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

    async function fetchTaskPriorities() {
        const organizationSlug = document.location.pathname.replace('/', '')
        const taskPriorities = await api.get(`${organizationSlug}/task-priorities`).json()
        setTaskPriorities(taskPriorities)
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

    async function fetchProjectMembers(projectSlug, alternateLoad=false) {
        const organizationSlug = document.location.pathname.replace('/', '')
        const projectMembers = await api.get(`${organizationSlug}/${projectSlug}/members`).json()

        setProjectMembers(projectMembers)

        if(alternateLoad) {
            return
        }

        let authenticatedUserId = projectMembers.find(item => item.you)
        if(authenticatedUserId) {
            setTasksFilterSelectedAssignedUserId(authenticatedUserId.user_id)
            fetchProjectTasks(projectSlug, authenticatedUserId.user_id)
            setAuthenticatedUserId(authenticatedUserId.user_id)
        } else {
            setAuthenticatedUserId(null)
            fetchProjectTasks(projectSlug)
        }

        // reset add task modal's properties if it is open
        setAddTaskModalSelectedUserIds(
            projectMembers
                .filter(item => {
                    if(projectSlug !== 'all') {
                        return true
                    }
                    if(item.project_ids.split(',').includes(selectedProjectIdForAddTask)) {
                        return true
                    }
                })
                .filter(item => item.you)
                .map(item => item.user_id)
        )
        setSelectedProjectIdForAddTask(selectedProjectIdForAddTask)
    }

    async function fetchProjectTasks(projectSlug, tasksFilterSelectedAssignedUserIdOverride=null) {
        const organizationSlug = document.location.pathname.replace('/', '')
        const tasks = await api.get(`${organizationSlug}/${projectSlug}/tasks?status=${tasksFilterSelectedStatusId}&type=${tasksFilterSelectedTypeId}&category=${tasksFilterSelectedProjectCategoryId}&user=${tasksFilterSelectedAssignedUserIdOverride ? tasksFilterSelectedAssignedUserIdOverride : tasksFilterSelectedAssignedUserId}&sort_by=${tasksFilterSortBy}&limit=${tasksFilterSelectedLimit}`).json()

        setTasks(tasks)

        if(task) {
            setTask(tasks.find(taskItem => taskItem.id === task.id))
        }
    }

    async function loadProject(projectSlug) {
        setCurrentProjectSlug(projectSlug)

        // close view task modal on project change
        setShowViewTaskModal(false)
        setTask(null)
        setShowAddTimeSpendModal(false)

        fetchProjectCategories(projectSlug)
        await fetchProjectMembers(projectSlug)
    }

    function handleAddTaskKeydown(e) {
        if(e.key === 'Escape') {
            setShowAddTaskModal(false)
        }
    }

    async function addTask(e) {
        e.preventDefault()

        let loader = createLoader('Adding task...')

        const fileInputElement = fileInput.current
        const filesCount = fileInputElement.files.length

        const currentProjectCategories = projectCategories
                                            .filter(item => {
                                                if(currentProjectSlug !== 'all') {
                                                    return true
                                                }
                                                if(item.project_id == selectedProjectIdForAddTask) {
                                                    return true
                                                }
                                            })

        let selectedProjectCategoryId = addTaskObj.project_category_id ? addTaskObj.project_category_id : null
        if(selectedProjectCategoryId) { // make selectedProjectCategoryId null if it doesn't belong to its project
            if(!currentProjectCategories.find(item => item.id == selectedProjectCategoryId)) {
                selectedProjectCategoryId = null
            }
        }

        const organizationSlug = document.location.pathname.replace('/', '')
        const { data: response } = await api.post(`${organizationSlug}/${currentProjectSlug}/task`, {
            headers: {
                Token: localStorage.getItem('token')
            },
            json: Object.assign(addTaskObj, {
                task_status_id: taskStatuses[0].id,
                task_type_id: addTaskObj.task_type_id ? addTaskObj.task_type_id : taskTypes[0].id,
                project_category_id: selectedProjectCategoryId,
                description: addTaskObj.description ? addTaskObj.description : null,
                hasAttachments: filesCount > 0 ? true : false,
                assignTo: addTaskModalSelectedUserIds,
                task_priority_id: addTaskObj.task_priority_id ? addTaskObj.task_priority_id : taskPriorities.find(item => item.default).id,
                due_date: addTaskObj.due_date ? addTaskObj.due_date : null,
                notifyUsersByEmail: addTaskNotifyUsersByEmail,
                project_id: currentProjectSlug === 'all' ? selectedProjectIdForAddTask : null
            })
        }).json()

        if(filesCount > 0) {
            const formData = new FormData()

            for(const file of fileInputElement.files) {
                formData.append('files', file)
            }

            await api.post(`task/${response.insertedId}/comment-files/${response.insertedCommentId}`, {
                body: formData
            })
        }

        fetchProjectTasks(currentProjectSlug)

        setShowAddTaskModal(false)

        loader.remove()
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

    async function fetchIsAdmin() {
        const organizationSlug = document.location.pathname.replace('/', '')
        const isAdmin = await api.get(`${organizationSlug}/is-admin`).json()
        setIsAdmin(isAdmin)
    }

    function initAddTask(e) {
        e.preventDefault()
        setShowViewTaskModal(false)
        hideModals()
        setAddTaskModalSelectedUserIds(
            projectMembers
                .filter(item => {
                    if(currentProjectSlug !== 'all') {
                        return true
                    }
                    if(item.project_ids.split(',').includes(selectedProjectIdForAddTask)) {
                        return true
                    }
                })
                .filter(item => item.you)
                .map(item => item.user_id)
        )
        setAddTaskNotifyUsersByEmail(true)
        setAddTaskObj({
            date: format(new Date, 'yyyy-MM-dd')
        })
        setShowAddTaskModal(true)
    }

    function addToAddTaskModalSelectedUserIds(e) {
        if(e.target.checked) {
            setAddTaskModalSelectedUserIds(
                addTaskModalSelectedUserIds.concat([Number(e.target.value)])
            )
        } else {
            setAddTaskModalSelectedUserIds(
                addTaskModalSelectedUserIds.filter(item => item !== Number(e.target.value))
            )
        }
    }

    function hideModals() {
        setShowAddTaskModal(false)
        setShowAddTimeSpendModal(false)
        setShowSettingsModal(false)
    }

    useEffect(() => {
        handleCurrentHash(document.location.hash)

        window.onhashchange = () => {
            handleCurrentHash(document.location.hash)
        }

        Router.events.on('hashChangeComplete', handleReset)
        Router.events.on('routeChangeComplete', handleReset)

        fetchIsAdmin()
        fetchProjects()
        fetchTaskTypes()
        fetchTaskStatuses()
        fetchTaskPriorities()

        return () => {
            Router.events.off('hashChangeComplete', handleReset)
            Router.events.off('routeChangeComplete', handleReset)
        }
    }, [])

    useEffect(() => {
        if(currentProjectSlug) {
            fetchProjectTasks(currentProjectSlug)
        }
    }, [tasksFilterSelectedStatusId, tasksFilterSelectedTypeId, tasksFilterSelectedProjectCategoryId, tasksFilterSelectedAssignedUserId, tasksFilterSortBy, tasksFilterSelectedLimit])

    const [ tasksFilterSelectedStatusIdPrevious, setTasksFilterSelectedStatusIdPrevious ] = useState(null)
    useEffect(() => {
        // reset sort by filter to created date if it is set to completed date and the user switched from the completed status to an open status
        if(tasksFilterSortBy === 'Completed Date') {
            if(taskStatuses.length > 1 && tasksFilterSelectedStatusIdPrevious == taskStatuses[taskStatuses.length - 1].id) {
                setTasksFilterSortBy('Created Date')
            }
        }
        setTasksFilterSelectedStatusIdPrevious(tasksFilterSelectedStatusId)
    }, [tasksFilterSelectedStatusId])

    useEffect(() => {
        setAddTaskObjProp('project_category_id', null)
        setAddTaskModalSelectedUserIds(
            projectMembers
                .filter(item => {
                    if(currentProjectSlug !== 'all') {
                        return true
                    }
                    if(item.project_ids.split(',').includes(selectedProjectIdForAddTask)) {
                        return true
                    }
                })
                .filter(item => item.you)
                .map(item => item.user_id)
        )
    }, [selectedProjectIdForAddTask])

    return (
        <Page>
            <Page.Nav>
                {
                    currentProjectSlug ?
                    <Fragment>
                        <div>
                            <a className="c-i" href="#" onClick={initAddTask}>+ Add task</a>
                            <a className="c-i ml-2em" href="#" onClick={e => {
                                e.preventDefault()
                                hideModals()
                                setShowAddTimeSpendModal(true)
                            }}>+ Add time spend</a>
                        </div>

                        <div>
                            <select className="v-h"></select>
                            {
                                isAdmin &&
                                <Link href="[organization]/admin" as={`${router.query.organization}/admin`}>
                                    <a className="c-i">Admin Panel</a>
                                </Link>
                            }
                            <a className="c-i ml-1em" href="#" onClick={e => {
                                e.preventDefault()
                                hideModals()
                                setShowSettingsModal(true)
                            }}>Settings</a>
                            <a className="c-i ml-1em" href="#" onClick={logout}>Logout</a>
                        </div>
                    </Fragment>
                    :
                    <Fragment>
                        <select className="v-h"></select>
                        <div>
                            {
                                isAdmin &&
                                <Link href="[organization]/admin" as={`${router.query.organization}/admin`}>
                                    <a className="c-i">Admin Panel</a>
                                </Link>
                            }
                            <a className="c-i ml-1em" href="#" onClick={e => {
                                e.preventDefault()
                                setShowAddTaskModal(false)
                                setShowAddTimeSpendModal(false)
                                setShowSettingsModal(true)
                            }}>Settings</a>
                            <a className="c-i ml-1em" href="#" onClick={logout}>Logout</a>
                        </div>
                    </Fragment>
                }
                </Page.Nav>
            <Page.Sidebar>
            <div className="fw-b">Projects</div>
                <div className="mt-0_5em">
                    {
                        projects.length > 1 &&
                        <a className={`mt-0_25em d-b ${'all' === currentProjectSlug ? 'td-n c-b' : ''}`} href={ '#project:all'}>All</a>
                    }
                    {
                        projects.length > 0 ?
                        projects.map(project => {
                            return (
                                <a className={`mt-0_25em d-b ${project.slug === currentProjectSlug ? 'td-n c-b' : ''}`} key={project.slug} href={ '#project:' + project.slug}>{ project.name }</a>
                            )
                        })
                        :
                        'No Projects Found'
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
                                        <div key={projectMember.user_id} className="mt-0_25em" title={projectMember.role}>
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
            </Page.Sidebar>
            <Page.Content paddingBottom0={true}>
                {
                    currentProjectSlug &&
                    <div className="d-f flex-ai-fe mb-1em flex-jc-fe filters">
                        <div>
                            <div className="label">Status</div>
                            <select className="mt-0_25em" value={tasksFilterSelectedStatusId} onChange={e => setTasksFilterSelectedStatusId(e.target.value)}>
                                <option value="All">All Open</option>
                                {
                                    taskStatuses.map(taskStatus => (
                                        <option key={taskStatus.id} value={taskStatus.id}>{taskStatus.status}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="ml-0_5em">
                            <div className="label">Type</div>
                            <select className="mt-0_25em" value={tasksFilterSelectedTypeId} onChange={e => setTasksFilterSelectedTypeId(e.target.value)}>
                                <option>All</option>
                                {
                                    taskTypes.map(taskType => (
                                        <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="ml-0_5em">
                            <div className="label">Category</div>
                            <select className="mt-0_25em" value={tasksFilterSelectedProjectCategoryId} onChange={e => setTasksFilterSelectedProjectCategoryId(e.target.value)}>
                                <option>All</option>
                                <option value="">Other</option>
                                {
                                    projectCategories.map(projectCategory => (
                                        <option key={projectCategory.id} value={projectCategory.id}>
                                            {currentProjectSlug === 'all' && '[' + projectCategory.project_name + '] '}{projectCategory.category}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="ml-0_5em">
                            <div className="label">Assigned To</div>
                            <select className="mt-0_25em" value={tasksFilterSelectedAssignedUserId} onChange={e => setTasksFilterSelectedAssignedUserId(e.target.value)}>
                                <option>All</option>
                                {
                                    projectMembers.map(projectMember => (
                                        <option key={projectMember.user_id} value={projectMember.user_id}>{projectMember.user}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="ml-0_5em">
                            <div className="label">Sort By</div>
                            <select className="mt-0_25em" value={tasksFilterSortBy} onChange={e => setTasksFilterSortBy(e.target.value)}>
                                <option>Created Date</option>
                                <option>Start Date</option>
                                <option>Due Date</option>
                                {
                                    taskStatuses.length > 1 && tasksFilterSelectedStatusId !== 'All' && Number(tasksFilterSelectedStatusId) === taskStatuses[taskStatuses.length - 1].id &&
                                    <option>Completed Date</option>
                                }
                            </select>
                        </div>
                        <select className="ml-0_5em" value={tasksFilterSelectedLimit} onChange={e => setTasksFilterSelectedLimit(e.target.value)}>
                            <option value="50">Show Last 50</option>
                            <option value="100">Show Last 100</option>
                            <option value="All">Show All</option>
                        </select>
                    </div>
                }
                {
                    currentProjectSlug &&
                    <Fragment>
                        <div className="oy-a" style={{ height: 'calc(100vh - 9.9em)' }}>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        {
                                            currentProjectSlug === 'all' &&
                                            <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Project</th>
                                        }
                                        <th style={{ width: '3.5em' }} className="pos-s top-0 bc-white">Task #</th>
                                        <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Start Date</th>
                                        <th style={{ width: '2em' }} className="pos-s top-0 bc-white">Status</th>
                                        <th style={{ width: '2em' }} className="pos-s top-0 bc-white">Type</th>
                                        <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Category</th>
                                        <th className="pos-s top-0 bc-white ta-l">Task</th>
                                        <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Priority</th>
                                        <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Due Date</th>
                                        {
                                            taskStatuses.length > 1 && tasksFilterSelectedStatusId !== 'All' && Number(tasksFilterSelectedStatusId) === taskStatuses[taskStatuses.length - 1].id &&
                                            <th style={{ width: '8em' }} className="pos-s top-0 bc-white">Completed Date</th>
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    tasks.map(task => {
                                        return (
                                            <tr key={task.id} onClick={() => viewTask(task)} className="cur-p">
                                                {
                                                    currentProjectSlug === 'all' &&
                                                    <td className="ws-nw">{task.project_name}</td>
                                                }
                                                <td className="ws-nw ta-c">{task.id.toString().padStart(6, '0')}</td>
                                                <td style={{ width: '5em' }} className="ta-c">{ formatDate(task.date) }</td>
                                                <td style={{ width: '2em' }} className="ws-nw">{ task.status }</td>
                                                <td style={{ width: '2em' }} className="ws-nw ta-c">{ task.type }</td>
                                                <td style={{ width: '5em' }} className="ws-nw ta-c">{ task.project_category ? task.project_category : 'Other' }</td>
                                                <td>{ task.title }</td>
                                                <td className="ws-nw ta-c">{ task.priority }</td>
                                                <td style={{ width: '5em' }} className="ta-c">{ task.due_date ? formatDate(task.due_date) : null }</td>
                                                {
                                                    taskStatuses.length > 1 && tasksFilterSelectedStatusId !== 'All' && Number(tasksFilterSelectedStatusId) === taskStatuses[taskStatuses.length - 1].id &&
                                                    <td className="ta-c">{ task.completed_date ? formatDate(task.completed_date) : null }</td>
                                                }
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-0_5em">{ tasks.length } { tasks.length === 1 ? 'task' : 'tasks' } found</div>
                    </Fragment>
                }
                <Modal showModal={showAddTaskModal} hideModal={() => setShowAddTaskModal(false)}>
                    <form onSubmit={addTask}>
                        <div className="d-f">
                            {
                                currentProjectSlug === 'all' &&
                                <div>
                                    <div>Project</div>
                                    <select
                                        value={selectedProjectIdForAddTask}
                                        onChange={e => setSelectedProjectIdForAddTask(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select project</option>
                                        {
                                            projects.map(project => (
                                                <option key={project.id} value={project.id}>{project.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            }
                            <div className={currentProjectSlug === 'all' ? 'ml-0_5em' : ''}>
                                <div>Start Date</div>
                                <input type="date"
                                    value={addTaskObj.date}
                                    onChange={e => setAddTaskObjProp('date', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="ml-0_5em">
                                <div>Type</div>
                                <select onChange={e => setAddTaskObjProp('task_type_id', e.target.value)} required>
                                    {
                                        taskTypes.map(taskType => (
                                            <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="ml-0_5em">
                                <div>Category</div>
                                <select onChange={e => setAddTaskObjProp('project_category_id', e.target.value)}>
                                    <option value="">Other</option>
                                    {
                                        projectCategories
                                            .filter(item => {
                                                if(currentProjectSlug !== 'all') {
                                                    return true
                                                }
                                                if(item.project_id == selectedProjectIdForAddTask) {
                                                    return true
                                                }
                                            })
                                            .map(projectCategory => (
                                                <option key={projectCategory.id} value={projectCategory.id}>{projectCategory.category}</option>
                                            ))
                                    }
                                </select>
                            </div>
                            <div className="ml-0_5em">
                                <div>Priority</div>
                                <select onChange={e => setAddTaskObjProp('task_priority_id', e.target.value)} required defaultValue={taskPriorities.find(item => item.default) ? taskPriorities.find(item => item.default).id : ''}>
                                    {
                                        taskPriorities.map(taskPriority => (
                                            <option key={taskPriority.id} value={taskPriority.id}>{taskPriority.priority}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="ml-0_5em">
                                <div>Due Date</div>
                                <input type="date"
                                    defaultValue={addTaskObj.due_date}
                                    onChange={e => setAddTaskObjProp('due_date', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-0_5em">
                            <div>Task</div>
                            <input type="text" required onKeyDown={handleAddTaskKeydown} onChange={e => setAddTaskObjProp('title', e.target.value)} className="w-100p" autoFocus></input>
                        </div>
                        <div className="mt-0_5em">
                            <div>Additional Comment</div>
                            <textarea onKeyDown={handleAddTaskKeydown} onChange={e => setAddTaskObjProp('description', e.target.value)} className="w-100p" style={{ height: '5em' }}></textarea>
                        </div>
                        <div className="mt-0_5em">
                            <div>Attach Files</div>
                            <input type="file" multiple ref={fileInput} />
                        </div>
                        <div className="mt-1em">
                            <div>Assign Members</div>
                            <div className="p-0_5em pb-0_75em-i oy-a" style={{ border: '1px solid var(--border-color)', maxHeight: '10em' }}>
                                {
                                    projectMembers
                                    .filter(item => {
                                        if(currentProjectSlug !== 'all') {
                                            return true
                                        }
                                        if(item.project_ids.split(',').includes(selectedProjectIdForAddTask)) {
                                            return true
                                        }
                                    }).length > 0 ?
                                    projectMembers
                                        .filter(item => {
                                            if(currentProjectSlug !== 'all') {
                                                return true
                                            }
                                            if(item.project_ids.split(',').includes(selectedProjectIdForAddTask)) {
                                                return true
                                            }
                                        })
                                        .map(projectMember => (
                                            <div key={projectMember.user_id}>
                                                <label className="d-b mt-0_5em">
                                                    <input type="checkbox" value={projectMember.user_id} checked={addTaskModalSelectedUserIds.includes(projectMember.user_id)} onChange={addToAddTaskModalSelectedUserIds}></input>
                                                    {projectMember.user}
                                                </label>
                                            </div>
                                        ))
                                    :
                                    <div className="mt-0_5em">No Project Members Found</div>
                                }
                            </div>
                        </div>
                        <div className="mt-0_5em">
                            <label className="d-f flex-ai-c">
                                <input type="checkbox" checked={addTaskNotifyUsersByEmail} onChange={e => setAddTaskNotifyUsersByEmail(e.target.checked ? true : false)}></input>
                                <span className="ml-0_25em">Notify Users By Email</span>
                            </label>
                        </div>
                        <div className="mt-1_5em">
                            <button>Add Task</button>
                            <button className="ml-1em" type="button" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                        </div>
                    </form>
                </Modal>
                {
                    task &&
                    <Modal showModal={showViewTaskModal} hideModal={() => setShowViewTaskModal(false)} inner={false}>
                        <TaskView task={task} taskStatuses={taskStatuses} taskTypes={taskTypes} projectCategories={projectCategories} taskPriorities={taskPriorities} refreshTasks={() => fetchProjectTasks(currentProjectSlug)} tabsContentHeight="calc(100vh - 17em)"></TaskView>
                    </Modal>
                }
                <Modal showModal={showAddTimeSpendModal} hideModal={() => setShowAddTimeSpendModal(false)} inner={false}>
                    <AddTimeSpend organizationSlug={organization} projectSlug={currentProjectSlug} height="calc(100vh - 25em)" projectMembers={projectMembers} authenticatedUserId={authenticatedUserId}></AddTimeSpend>
                </Modal>
                <Modal showModal={showSettingsModal} hideModal={() => setShowSettingsModal(false)} inner={false}>
                    <Settings refreshProjectMembers={() => fetchProjectMembers(currentProjectSlug, true)}></Settings>
                </Modal>
            </Page.Content>
        </Page>
    )
}

Index.getInitialProps = () => ({})

export default Index
