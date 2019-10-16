import { useState, useEffect } from 'react'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import api from 'Libs/esm/api'
import { secondsInHHMMSS } from 'Libs/esm/dateUtils'
import parseISO from 'date-fns/parseISO'

export default function AddTimeSpend({ organizationSlug, projectSlug, height }) {

    const [ pendingTasksAssignedToYou, setPendingTasksAssignedToYou ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(format(new Date, 'yyyy-MM-dd'))
    const [ description, setDescription ] = useState('')
    const [ startTime, setStartTime ] = useState('')
    const [ endTime, setEndTime ] = useState('')
    const [ timeSpends, setTimeSpends ] = useState([])
    const [ selectedFilter, setSelectedFilter ] = useState('Selected Date')
    const [ selectedTaskId, setSelectedTaskId ] = useState('')
    const [ timeSpendUpdate, setTimeSpendUpdate ] = useState(null)

    async function fetchPendingTasksAssignedToYou() {
        const pendingTasksAssignedToYou = await api.get(`${organizationSlug}/${projectSlug}/tasks?status=All&type=All&category=All&user=authenticated`).json()
        setPendingTasksAssignedToYou(pendingTasksAssignedToYou)
        if(pendingTasksAssignedToYou.length > 0) {
            setSelectedTaskId(pendingTasksAssignedToYou[0].id)
        }
    }

    async function fetchTimeSpends() {
        const timeSpends = await api.get(`${organizationSlug}/${projectSlug}/time-spends-for-authenticated-user?filter=${selectedFilter}&date=${selectedDate}`).json()
        setTimeSpends(timeSpends)
    }

    function addTimeSpend(e) {
        e.preventDefault()

        if(!timeSpendUpdate) { // add

            let selectedDateObj = parseISO(selectedDate)

            let startDateTime = startTime
            startDateTime.setDate(selectedDateObj.getDate())
            startDateTime.setMonth(selectedDateObj.getMonth())
            startDateTime.setFullYear(selectedDateObj.getFullYear())

            let endDateTime = endTime
            if(endDateTime) {
                endDateTime.setDate(selectedDateObj.getDate())
                endDateTime.setMonth(selectedDateObj.getMonth())
                endDateTime.setFullYear(selectedDateObj.getFullYear())
            }

            api.post(`task/${selectedTaskId}/time-spend`, {
                json: {
                    description: description,
                    start_date_time: format(startDateTime, 'yyyy-MM-dd HH:mm'),
                    end_date_time: endDateTime ? format(endDateTime, 'yyyy-MM-dd HH:mm') : null
                }
            }).then(() => {
                fetchTimeSpends()
            })

        } else { // update

            // api.put(`task/${taskId}/time-spend/${timeSpendUpdate}`, {
            //     json: {
            //         description: timeSpendStartDescription,
            //         start_date_time: format(timeSpendStartDateTime, 'yyyy-MM-dd HH:mm'),
            //         end_date_time: timeSpendEndDateTime ? format(timeSpendEndDateTime, 'yyyy-MM-dd HH:mm') : null
            //     }
            // }).then(() => {
            //     fetchTimeSpends()
            // })

            // setTimeSpendUpdate(null)

        }

        setDescription('')
        setStartTime('')
        setEndTime('')
    }

    function editTimeSpend(e, timeSpend) {
        e.preventDefault()
    }

    async function removeTimeSpend(e, timeSpend) {
        e.preventDefault()
        if(confirm('Are you sure you want to remove this time spend?')) {
            // if(timeSpendUpdate && timeSpendUpdate === timeSpend.id) {
            //     cancelEditTimeSpend()
            // }

            await api.delete(`task/${timeSpend.task_id}/time-spend/${timeSpend.id}`)
            fetchTimeSpends()
        }
    }

    useEffect(() => {
        console.log(organizationSlug, projectSlug)

        fetchPendingTasksAssignedToYou()
    }, [])

    useEffect(() => {
        fetchTimeSpends()
    }, [selectedDate])

    return (
        <div style={{ minWidth: '60vw' }} className="p-1em">
            <form onSubmit={addTimeSpend}>
                <div className="d-f flex-d-c flex-ai-fe">
                    <div className="label">Date</div>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required></input>
                </div>
                <div className="mt-1em">
                    <div className="label">Task</div>
                    <select className="w-100p" required autoFocus value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}>
                        {
                            pendingTasksAssignedToYou.map(task => (
                                <option key={task.id} value={task.id}>[{task.type}] {task.project_category ? `[${task.project_category}] ` : ''}{task.title}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="mt-1em d-f flex-ai-fe">
                    <div className="w-100p">
                        <div className="label">Additional Description</div>
                        <input type="text" className="w-100p" value={description} onChange={e => setDescription(e.target.value)}></input>
                    </div>
                    <div className="ml-1em">
                        <div className="label">Start Time</div>
                        <DatePicker
                            selected={startTime}
                            onChange={time => setStartTime(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            required />
                    </div>
                    <div className="ml-1em">
                        <div className="label">End Time</div>
                        <DatePicker
                            selected={endTime}
                            onChange={time => setEndTime(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa" />
                    </div>
                    <div className="ml-1em">
                        <button className="ws-nw">Add Time Spend</button>
                    </div>
                </div>
            </form>
            <div className="mt-1em d-f flex-d-c flex-ai-fe">
                <div className="label">Filter</div>
                <select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)} disabled>
                    <option>Selected Date</option>
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                </select>
            </div>
            <div>
                <div className="label">Your Time Spends</div>
                <div className="oy-a" style={{ height: height }}>
                    <table className="table table-comfortable">
                        <thead>
                            <tr>
                                <th className="w-100p ta-l">Task</th>
                                <th className="ws-nw" style={{ width: '5em' }}>Start Time</th>
                                <th className="ws-nw" style={{ width: '5em' }}>End Time</th>
                                <th className="ws-nw" style={{ width: '5em' }}>Duration</th>
                                <th style={{ width: '6em' }} colSpan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                timeSpends.map(timeSpend => (
                                    <tr key={timeSpend.id}>
                                        <td>[{timeSpend.type}] {timeSpend.project_category ? `[${timeSpend.project_category}] ` : ''}{timeSpend.task}{timeSpend.description ? ' - ' + timeSpend.description : ''}</td>
                                        <td className="ta-c">{timeSpend.start_time}</td>
                                        <td className="ta-c">{timeSpend.end_time}</td>
                                        <td className="ta-c">{timeSpend.duration ? secondsInHHMMSS(timeSpend.duration) : null}</td>
                                        <td style={{ width: '2em' }}>
                                            <a href="#" onClick={e => editTimeSpend(e, timeSpend)}>Edit</a>
                                        </td>
                                        <td style={{ width: '4em' }}>
                                            <a href="#" onClick={e => removeTimeSpend(e, timeSpend)}>Remove</a>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <th className="ta-l">{timeSpends.length} time spends</th>
                                <th colSpan="2">Total Duration</th>
                                <th>{ secondsInHHMMSS(timeSpends.reduce((a, b) => a + Number(b.duration), 0)) }</th>
                                <th colSpan="2"></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
