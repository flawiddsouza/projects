import { useState, useEffect } from 'react'
import api from 'Libs/esm/api'
import formatDate from 'Libs/formatDate.js'
import AsyncSelect from 'react-select/async'

export default function TaskViewFiles({ taskId, setSubTasksCount, setCompletedSubTasksCount, tabsContentHeight=null, taskCompleted }) {
    const [ subTasks, setSubTasks ] = useState([])
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)
    const [ selectedTaskId, setSelectedTaskId ] = useState(null)

    async function fetchSubTasks() {
        const subTasks = await api.get(`task/${taskId}/sub-tasks`).json()
        setIntialLoadComplete(true)
        setSubTasks(subTasks.data)
        setCompletedSubTasksCount(subTasks.completedCount)
    }

    async function fetchMatchingTasks(inputValue) {
        return await api.get(`task/${taskId}/sub-tasks/matching-tasks?task=${inputValue}`).json()
    }

    async function addSubTask(e) {
        e.preventDefault()
        api.post(`task/${taskId}/sub-task`, {
            json: {
                sub_task_id: selectedTaskId.value
            }
        }).then(() => {
            fetchSubTasks()
        })
        setSelectedTaskId(null)
    }

    async function removeSubTask(e, subTask) {
        e.preventDefault()
        e.stopPropagation()
        if(confirm('Are you sure you want to remove this sub task?')) {
            await api.delete(`task/${taskId}/sub-task/${subTask.id}`)
            fetchSubTasks()
        }
    }

    function viewSubTask(task) {
        var params = `
            height=${window.screen.height},
            width=${window.screen.width}
        `
        const popup = window.open(`/task/${task.task_id}`, 'popup_window', params)
        popup.moveTo(0,0)
    }

    useEffect(() => {
        fetchSubTasks()
    }, [])

    useEffect(() => {
        if(initialLoadComplete) {
            setSubTasksCount(subTasks.length)
        }
    }, [subTasks])

    return (
        <div>
            <form onSubmit={addSubTask} className="d-f flex-ai-fs mb-1em">
                <div>
                    <div className="label">
                        Find Task
                    </div>
                    <div style={{ width: '30em' }}>
                        <AsyncSelect defaultOptions loadOptions={fetchMatchingTasks} onChange={selectedItem => setSelectedTaskId(selectedItem)} value={selectedTaskId} placeholder="Search..." isDisabled={taskCompleted}>
                        </AsyncSelect>
                        <input
                            tabIndex={-1}
                            autoComplete="off"
                            style={{ opacity: 0, height: 0, position: 'absolute' }}
                            value={selectedTaskId || ''}
                            required={true}
                            onChange={() => {}}
                        />
                    </div>
                </div>
                <button className="flex-as-fe ml-1em" style={{ height: '2.8em' }} disabled={taskCompleted}>Add Sub Task</button>
            </form>
            <div className="oy-a" style={{ maxHeight: tabsContentHeight ? `calc(${tabsContentHeight} - 4em)` : '23.2em' }}>
                <table className="table table-comfortable table-hover">
                    <thead>
                        <tr>
                            <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Start Date</th>
                            <th style={{ width: '2em' }} className="pos-s top-0 bc-white">Status</th>
                            <th style={{ width: '2em' }} className="pos-s top-0 bc-white">Type</th>
                            <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Category</th>
                            <th className="pos-s top-0 bc-white ta-l">Task</th>
                            <th style={{ width: '5em' }} className="pos-s top-0 bc-white">Due Date</th>
                            <th style={{ width: '8em' }} className="pos-s top-0 bc-white">Closed Date</th>
                            {
                                !taskCompleted &&
                                <th style={{ width: '2em' }} className="pos-s top-0 bc-white">Action</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                    {
                        subTasks.map(subTask =>
                            <tr key={subTask.id} onClick={() => viewSubTask(subTask)} className="cur-p">
                                <td className="ws-nw">{formatDate(subTask.date)}</td>
                                <td className="ws-nw">{subTask.status}</td>
                                <td className="ws-nw">{subTask.type}</td>
                                <td className="ws-nw">{subTask.category}</td>
                                <td>{subTask.title}</td>
                                <td className="ws-nw">{subTask.due_date ? formatDate(subTask.due_date) : null}</td>
                                <td className="ws-nw">{subTask.completed_date ? formatDate(subTask.completed_date) : null}</td>
                                {
                                    !taskCompleted &&
                                    <td>
                                        <a href="#" onClick={e => removeSubTask(e, subTask)}>Remove</a>
                                    </td>
                                }
                            </tr>
                        )
                    }
                    {
                        subTasks.length === 0 &&
                        <tr className="disable-table-hover">
                            <td colSpan="100%" className="ta-c">No Sub Tasks</td>
                        </tr>
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
