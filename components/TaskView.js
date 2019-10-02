import { useState, useEffect, Fragment } from 'react'
import formatDate from 'Libs/formatDate.js'
import Modal from 'Components/Modal'
import TaskViewComments from 'Components/TaskViewComments'
import TaskViewFiles from 'Components/TaskViewFiles'
import TaskViewAssigned from 'Components/TaskViewAssigned'
import TaskViewTimeSpent from 'Components/TaskViewTimeSpent'

export default function TaskView({ task }) {
    const [ activeTab, setActiveTab ] = useState('comments')
    const [ commentsCount, setCommentsCount ] = useState(0)
    const [ filesCount, setFilesCount ] = useState(0)
    const [ assignedCount, setAssignedCount ] = useState(0)
    const [ timeSpentCount, setTimeSpentCount ] = useState(0)
    const [ updateTaskColumn, setUpdateTaskColumn ] = useState(null)
    const [ updateTaskColumnData, setUpdateTaskColumnData ] = useState(null)

    useEffect(() => {
        // fetch counts for init
    }, [])

    function startTaskColumnUpdate(column, columnData) {
        setUpdateTaskColumnData(columnData)
        setUpdateTaskColumn(column)
    }

    function UpdateTaskModal() {
        function updateColumn(e) {
            e.preventDefault()
            cancelTaskColumnUpdate()
        }

        function cancelTaskColumnUpdate() {
            setUpdateTaskColumn(null)
            setUpdateTaskColumnData(null)
        }

        return (
            <Modal showModal={updateTaskColumn !== null} hideModal={() => cancelTaskColumnUpdate()}>
                <form onSubmit={updateColumn} style={{ width: updateTaskColumn !== 'title' ? '15em' : '25em' }}>
                {
                    updateTaskColumn === 'date' &&
                    <Fragment>
                        <div>Change Date</div>
                        <div className="mt-0_5em">
                            <input type="date" value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p" required></input>
                        </div>
                        <div className="mt-1em ta-r">
                            <button>Update</button>
                        </div>
                    </Fragment>
                }
                {
                    updateTaskColumn === 'type' &&
                    <Fragment>
                        <div>Change Type</div>
                        <div className="mt-0_5em">
                            <select value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p">
                                <option>NR</option>
                                <option>CR</option>
                                <option>BUG</option>
                            </select>
                        </div>
                        <div className="mt-1em ta-r">
                            <button>Update</button>
                        </div>
                    </Fragment>
                }
                {
                    updateTaskColumn === 'status' &&
                    <Fragment>
                        <div>Change Status</div>
                        <div className="mt-0_5em">
                            <select value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p">
                                <option>OPEN</option>
                                <option>CLOSED</option>
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
                        <div>Change Title</div>
                        <div className="mt-0_5em">
                            <input type="text" value={updateTaskColumnData} onChange={e => setUpdateTaskColumnData(e.target.value)} autoFocus className="w-100p" required></input>
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

    return (
        <div style={{ width: '63vw' }}>
            <div className="d-f">
                <div>
                    <div className="label">Date</div>
                    <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('date', task.date)}>{ formatDate(task.date) }</div>
                </div>
                <div className="ml-3em">
                    <div className="label">Type</div>
                    <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('type', task.type)}>{ task.type }</div>
                </div>
                <div className="ml-3em">
                    <div className="label">Status</div>
                    <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('status', task.status)}>{ task.status }</div>
                </div>
            </div>
            <div className="mt-1em">
                <div className="label">Title</div>
                <div className="mt-0_25em" onClick={() => startTaskColumnUpdate('title', task.title)}>{ task.title }</div>
            </div>
            <div className="mt-1em">
                <div className="tabs">
                    <div className={ activeTab === 'comments' ? 'active': null} onClick={() => setActiveTab('comments') }>Comments ({commentsCount})</div>
                    <div className={ activeTab === 'files' ? 'active': null} onClick={() => setActiveTab('files') }>Files ({filesCount})</div>
                    <div className={ activeTab === 'assigned' ? 'active': null} onClick={() => setActiveTab('assigned') }>Assigned ({assignedCount})</div>
                    <div className={ activeTab === 'time-spent' ? 'active': null} onClick={() => setActiveTab('time-spent') }>Time Spent ({timeSpentCount} / 0:00)</div>
                </div>
                <div className="tabs-content" style={{ height: '25em' }}>
                    {
                        activeTab === 'comments' &&
                        <TaskViewComments taskId={task.id} setCommentsCount={setCommentsCount}></TaskViewComments>
                    }
                    {
                        activeTab === 'files' &&
                        <TaskViewFiles setFilesCount={setFilesCount}></TaskViewFiles>
                    }
                    {
                        activeTab === 'assigned' &&
                        <TaskViewAssigned setAssignedCount={setAssignedCount}></TaskViewAssigned>
                    }
                    {
                        activeTab === 'time-spent' &&
                        <TaskViewTimeSpent setTimeSpentCount={setTimeSpentCount}></TaskViewTimeSpent>
                    }
                </div>
            </div>
            <UpdateTaskModal/>
        </div>
    )
}
