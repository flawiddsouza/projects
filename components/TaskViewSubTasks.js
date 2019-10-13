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
        if(confirm('Are you sure you want to remove this sub task?')) {
            await api.delete(`task/${taskId}/sub-task/${subTask.id}`)
            fetchSubTasks()
        }
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
                <table className="table table-width-auto">
                    <tbody>
                    {
                        subTasks.map(subTask =>
                            <tr key={subTask.id}>
                                <td>{formatDate(subTask.date)}</td>
                                <td>{subTask.type}</td>
                                <td>{subTask.status}</td>
                                <td>{subTask.category}</td>
                                <td>{subTask.title}</td>
                                {
                                    !taskCompleted &&
                                    <td>
                                        <a href="#" onClick={e => removeSubTask(e, subTask)}>Remove</a>
                                    </td>
                                }
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
