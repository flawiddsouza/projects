import { useState, useEffect, Fragment } from 'react'
import formatDate from 'Libs/formatDate.js'
import Modal from 'Components/Modal'
import TaskViewComments from 'Components/TaskViewComments'
import TaskViewFiles from 'Components/TaskViewFiles'
import TaskViewAssigned from 'Components/TaskViewAssigned'
import TaskViewTimeSpent from 'Components/TaskViewTimeSpent'
import TaskViewSubTasks from 'Components/TaskViewSubTasks'
import TaskViewChecklist from 'Components/TaskViewChecklist'
import { secondsInHHMMSS } from 'Libs/esm/dateUtils'
import api from 'Libs/esm/api'
import Link from 'next/link'

function UpdateTaskModal({ task, taskTypes, taskStatuses, projectCategories, updateTaskColumn, setUpdateTaskColumn, updateTaskColumnData, setUpdateTaskColumnData, refreshTasks }) {
    const updateColumn = e => {
        e.preventDefault()
        api.put(`task/${task.id}/update/${updateTaskColumn}`, {
            json: {
                [updateTaskColumn]: updateTaskColumnData ? updateTaskColumnData : null
            }
        }).json().then(response => {
            if(response.status === 'success') {
                refreshTasks()
            } else {
                alert(response.message)
            }
        })
        cancelTaskColumnUpdate()
    }

    const cancelTaskColumnUpdate = () => {
        setUpdateTaskColumn(null)
        setUpdateTaskColumnData(null)
    }

    return (
        <Modal showModal={updateTaskColumn !== null} hideModal={() => cancelTaskColumnUpdate()}>
            <form onSubmit={updateColumn} style={{ width: updateTaskColumn !== 'title' ? '15em' : '40em' }}>
            {
                updateTaskColumn === 'date' &&
                <Fragment>
                    <div>Change Start Date</div>
                    <div className="mt-0_5em">
                        <input type="date" value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p" required></input>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            {
                updateTaskColumn === 'task_type_id' &&
                <Fragment>
                    <div>Change Type</div>
                    <div className="mt-0_5em">
                        <select value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p">
                            {
                                taskTypes.map(taskType => (
                                    <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            {
                updateTaskColumn === 'task_status_id' &&
                <Fragment>
                    <div>Change Status</div>
                    <div className="mt-0_5em">
                        <select value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p">
                            {
                                taskStatuses.map(taskStatus => (
                                    <option key={taskStatus.id} value={taskStatus.id}>{taskStatus.status}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            {
                updateTaskColumn === 'project_category_id' &&
                <Fragment>
                    <div>Change Category</div>
                    <div className="mt-0_5em">
                        <select value={updateTaskColumnData ? updateTaskColumnData : ''} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p">
                            <option value="">Other</option>
                            {
                                projectCategories.map(projectCategory => (
                                    <option key={projectCategory.id} value={projectCategory.id}>{projectCategory.category}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            {
                updateTaskColumn === 'title' &&
                <Fragment>
                    <div>Change Task Title</div>
                    <div className="mt-0_5em">
                        <input type="text" value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p" required></input>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            {
                updateTaskColumn === 'due_date' &&
                <Fragment>
                    <div>Change Due Date</div>
                    <div className="mt-0_5em">
                        <input type="date" value={updateTaskColumnData || ''} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p"></input>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            {
                updateTaskColumn === 'completed_date' &&
                <Fragment>
                    <div>Change Completed Date</div>
                    <div className="mt-0_5em">
                        <input type="date" value={updateTaskColumnData || ''} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p" required></input>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </Fragment>
            }
            </form>
        </Modal>
    )
}

export default function TaskView({ task, taskStatuses, taskTypes, projectCategories, refreshTasks, tabsContentHeight=null, width=null }) {
    const [ activeTab, setActiveTab ] = useState('comments')
    const [ commentsCount, setCommentsCount ] = useState(0)
    const [ filesCount, setFilesCount ] = useState(0)
    const [ assignedCount, setAssignedCount ] = useState(0)
    const [ timeSpentCount, setTimeSpentCount ] = useState(0)
    const [ timeSpentDuration, setTimeSpentDuration ] = useState(0)
    const [ subTasksCount, setSubTasksCount ] = useState(0)
    const [ completedSubTasksCount, setCompletedSubTasksCount ] = useState(0)
    const [ updateTaskColumn, setUpdateTaskColumn ] = useState(null)
    const [ updateTaskColumnData, setUpdateTaskColumnData ] = useState(null)
    const [ checklists, setChecklists ] = useState([])
    const [ checklistCount, setChecklistCount ] = useState({})

    async function fetchCount() {
        const counts = await api.get(`task/${task.id}/counts`).json()
        setCommentsCount(counts.comments)
        setFilesCount(counts.files)
        setAssignedCount(counts.assigned)
        setTimeSpentCount(counts.timeSpends.count)
        setTimeSpentDuration(counts.timeSpends.duration)
        setSubTasksCount(counts.subTasks.count)
        setCompletedSubTasksCount(counts.subTasks.completedCount)
    }

    async function fetchChecklists() {
        const { checklists, checklistCount } = await api.get(`task/${task.id}/checklists`).json()
        setChecklists(checklists)
        setChecklistCount(checklistCount)
    }

    function setChecklistCountSetter(checklistId, countObj) {
        setChecklistCount({...checklistCount, [checklistId]: countObj })
    }

    useEffect(() => {
        fetchCount()
        fetchChecklists()
    }, [])

    function startTaskColumnUpdate(column, columnData) {
        if(task.completed && column !== 'task_status_id' && column !== 'completed_date') {
            alert('You cannot edit a task unless you reopen it')
            return
        }
        setUpdateTaskColumnData(columnData)
        setUpdateTaskColumn(column)
    }

    return (
        <div style={{ width: width ? width : '70vw' }}>
            <div className="d-f flex-jc-sb">
                <div className="d-f">
                    <div>
                        <div className="label">Start Date</div>
                        <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('date', task.date)}>{ formatDate(task.date) }</div>
                    </div>
                    <div className="ml-3em">
                        <div className="label">Status</div>
                        <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('task_status_id', task.task_status_id)}>{ task.status }</div>
                    </div>
                    <div className="ml-3em">
                        <div className="label">Type</div>
                        <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('task_type_id', task.task_type_id)}>{ task.type }</div>
                    </div>
                    <div className="ml-3em">
                        <div className="label">Category</div>
                        <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('project_category_id', task.project_category_id)}>{ task.project_category ? task.project_category : 'Other' }</div>
                    </div>
                    <div className="ml-3em">
                        <div className="label">Due Date</div>
                        <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('due_date', task.due_date)}>{ task.due_date ? formatDate(task.due_date) : 'No Due Date' }</div>
                    </div>
                    {
                        task.completed ?
                        <div className="ml-3em">
                            <div className="label">Completed Date</div>
                            <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('completed_date', task.completed_date)}>{ task.completed_date ? formatDate(task.completed_date) : 'No Completed Date' }</div>
                        </div>
                        :
                        ''
                    }
                </div>
                <div>
                    <Link href="/task/[taskId]" as={`/task/${task.id}`}><a>{task.id.toString().padStart(6, '0')}</a></Link>
                </div>
            </div>
            <div className="mt-1em">
                <div className="label">Task</div>
                <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('title', task.title)}>{ task.title.trim() ? task.title : 'UNTITLED' }</div>
            </div>
            <div className="mt-1em">
                <div className="tabs ox-a">
                    <div className={ activeTab === 'comments' ? 'active': null} onClick={() => setActiveTab('comments') }>Comments ({commentsCount})</div>
                    <div className={ activeTab === 'files' ? 'active': null} onClick={() => setActiveTab('files') }>Files ({filesCount})</div>
                    <div className={ activeTab === 'assigned' ? 'active': null} onClick={() => setActiveTab('assigned') }>Assigned ({assignedCount})</div>
                    <div className={ activeTab === 'time-spent' ? 'active': null} onClick={() => setActiveTab('time-spent') }>Time Spent ({timeSpentCount} / {secondsInHHMMSS(timeSpentDuration)})</div>
                    <div className={ activeTab === 'sub-tasks' ? 'active': null} onClick={() => setActiveTab('sub-tasks') }>Sub Tasks ({completedSubTasksCount}/{subTasksCount})</div>
                    {
                        checklists.map(checklist => (
                            <div key={checklist.id} className={ activeTab === 'checklist-' + checklist.name ? 'active': null} onClick={() => setActiveTab('checklist-' + checklist.name) }>
                                {checklist.name} ({checklistCount.hasOwnProperty(checklist.id) && checklistCount[checklist.id].checked}/{checklistCount.hasOwnProperty(checklist.id) && checklistCount[checklist.id].count})
                            </div>
                        ))
                    }
                </div>
                <div className="tabs-content" style={{ height: tabsContentHeight ? tabsContentHeight : '25em' }}>
                    {
                        activeTab === 'comments' &&
                        <TaskViewComments taskId={task.id} taskCompleted={task.completed} setCommentsCount={setCommentsCount} tabsContentHeight={tabsContentHeight}></TaskViewComments>
                    }
                    {
                        activeTab === 'files' &&
                        <TaskViewFiles taskId={task.id} setFilesCount={setFilesCount}></TaskViewFiles>
                    }
                    {
                        activeTab === 'assigned' &&
                        <TaskViewAssigned taskId={task.id} taskCompleted={task.completed} setAssignedCount={setAssignedCount}></TaskViewAssigned>
                    }
                    {
                        activeTab === 'time-spent' &&
                        <TaskViewTimeSpent taskId={task.id} taskCompleted={task.completed} setTimeSpentCount={setTimeSpentCount} setTimeSpentDuration={setTimeSpentDuration} tabsContentHeight={tabsContentHeight}></TaskViewTimeSpent>
                    }
                    {
                        activeTab === 'sub-tasks' &&
                        <TaskViewSubTasks taskId={task.id} taskCompleted={task.completed} setSubTasksCount={setSubTasksCount} setCompletedSubTasksCount={setCompletedSubTasksCount} tabsContentHeight={tabsContentHeight}></TaskViewSubTasks>
                    }
                    {
                        checklists.map(checklist => (
                            <div key={checklist.id}>
                                {
                                    activeTab === 'checklist-' + checklist.name &&
                                    <TaskViewChecklist taskId={task.id} taskCompleted={task.completed} checklistId={checklist.id}tabsContentHeight={tabsContentHeight} setChecklistCount={setChecklistCountSetter}></TaskViewChecklist>
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
            <UpdateTaskModal task={task} taskTypes={taskTypes} taskStatuses={taskStatuses} projectCategories={projectCategories} updateTaskColumn={updateTaskColumn} setUpdateTaskColumn={setUpdateTaskColumn} updateTaskColumnData={updateTaskColumnData} setUpdateTaskColumnData={setUpdateTaskColumnData} refreshTasks={refreshTasks} />
        </div>
    )
}
