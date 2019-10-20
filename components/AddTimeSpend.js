import { useState, useEffect, Fragment } from 'react'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import api from 'Libs/esm/api'
import { secondsInHHMMSS } from 'Libs/esm/dateUtils'
import parseISO from 'date-fns/parseISO'
import formatDate from 'Libs/formatDate.js'

export default function AddTimeSpend({ organizationSlug, projectSlug, height, projectMembers, authenticatedUserId }) {

    const [ pendingTasksAssignedToYou, setPendingTasksAssignedToYou ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(format(new Date, 'yyyy-MM-dd'))
    const [ description, setDescription ] = useState('')
    const [ startTime, setStartTime ] = useState('')
    const [ endTime, setEndTime ] = useState('')
    const [ timeSpends, setTimeSpends ] = useState([])
    const [ selectedProjectMemberUserId, setSelectedProjectMemberUserId ] = useState(authenticatedUserId || 'All')
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
        const timeSpends = await api.get(`${organizationSlug}/${projectSlug}/time-spends-for-authenticated-user?filter=${selectedFilter}&date=${selectedDate}&user=${selectedProjectMemberUserId}`).json()
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

            api.put(`task/${timeSpendUpdate.task_id}/time-spend/${timeSpendUpdate.id}`, {
                json: {
                    description: description,
                    start_date_time: format(startTime, 'yyyy-MM-dd HH:mm'),
                    end_date_time: endTime ? format(endTime, 'yyyy-MM-dd HH:mm') : null
                }
            }).then(() => {
                fetchTimeSpends()
            })

            setTimeSpendUpdate(null)

        }

        setDescription('')
        setStartTime('')
        setEndTime('')
    }

    function editTimeSpend(e, timeSpend) {
        e.preventDefault()

        setDescription(timeSpend.description)
        setStartTime(parseISO(timeSpend.start_date_time))
        setEndTime(timeSpend.end_date_time ? parseISO(timeSpend.end_date_time) : null)

        setTimeSpendUpdate(timeSpend)
    }

    function cancelEditTimeSpend() {
        setDescription('')
        setStartTime('')
        setEndTime('')

        setTimeSpendUpdate(null)
    }

    async function removeTimeSpend(e, timeSpend) {
        e.preventDefault()
        if(confirm('Are you sure you want to remove this time spend?')) {
            if(timeSpendUpdate && timeSpendUpdate.id === timeSpend.id) {
                cancelEditTimeSpend()
            }

            await api.delete(`task/${timeSpend.task_id}/time-spend/${timeSpend.id}`)
            fetchTimeSpends()
        }
    }

    useEffect(() => {
        fetchPendingTasksAssignedToYou()
    }, [])

    useEffect(() => {
        fetchTimeSpends()
    }, [selectedDate, selectedFilter, selectedProjectMemberUserId])

    return (
        <div style={{ width: '60vw' }} className="p-1em">
            <form onSubmit={addTimeSpend}>
                <div className="d-f flex-d-c flex-ai-fe">
                    <div className="label">Date</div>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required disabled={timeSpendUpdate}></input>
                </div>
                <div className="mt-1em">
                    <div className="label">Task</div>
                    <select className="w-100p" required={timeSpendUpdate ? false : true} autoFocus value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} disabled={!authenticatedUserId || timeSpendUpdate}>
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
                        <input type="text" className="w-100p" value={description || ''} onChange={e => setDescription(e.target.value)} disabled={!authenticatedUserId}></input>
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
                            required
                            disabled={!authenticatedUserId} />
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
                            dateFormat="h:mm aa"
                            disabled={!authenticatedUserId} />
                    </div>
                    <div className="ml-1em">
                        {
                            !timeSpendUpdate ?
                                <button className="ws-nw" disabled={!authenticatedUserId}>Add Time Spend</button>
                            :
                                <div className="ws-nw">
                                    <button className="ws-nw">Update</button>
                                    <button className="ws-nw ml-0_5em" type="button" onClick={cancelEditTimeSpend}>Cancel</button>
                                </div>
                        }
                    </div>
                </div>
            </form>
            <div className="mt-1em d-f flex-jc-fe">
                <div>
                    <div className="label">Project Member</div>
                    <select value={selectedProjectMemberUserId} onChange={e => setSelectedProjectMemberUserId(e.target.value)} className="w-100p" disabled={timeSpendUpdate}>
                        <option>All</option>
                        {
                            projectMembers.map(projectMember => (
                                <option key={projectMember.id} value={projectMember.user_id}>{projectMember.user}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="ml-2em">
                    <div className="label">Filter</div>
                    <select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)} disabled={timeSpendUpdate}>
                        <option>Selected Date</option>
                        <option>This Week</option>
                        <option>Last Week</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                        <option>Last Year</option>
                    </select>
                </div>
            </div>
            <div>
                <div className="label">{authenticatedUserId == selectedProjectMemberUserId ? 'Your ' : ''}Time Spends</div>
                <div className="oy-a" style={{ height: height }}>
                    <table className="table table-comfortable">
                        <thead>
                            <tr>
                                {
                                    selectedProjectMemberUserId === 'All' &&
                                    <th className="ws-nw pos-s top-0 bc-white">Member</th>
                                }
                                <th className="w-100p ta-l pos-s top-0 bc-white">Task</th>
                                <th className="ws-nw pos-s top-0 bc-white" style={{ width: '5em' }}>Date</th>
                                <th className="ws-nw pos-s top-0 bc-white" style={{ width: '5em' }}>Start Time</th>
                                <th className="ws-nw pos-s top-0 bc-white" style={{ width: '5em' }}>End Time</th>
                                <th className="ws-nw pos-s top-0 bc-white" style={{ width: '5em' }}>Duration</th>
                                {
                                    authenticatedUserId &&
                                    <th style={{ width: '6em' }} colSpan="2" className="pos-s top-0 bc-white">Actions</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                timeSpends.map(timeSpend => (
                                    <tr key={timeSpend.id}>
                                        {
                                            selectedProjectMemberUserId === 'All' &&
                                            <td className="ws-nw">{timeSpend.user}</td>
                                        }
                                        <td>[{timeSpend.type}] {timeSpend.project_category ? `[${timeSpend.project_category}] ` : ''}{timeSpend.task}{timeSpend.description ? ' - ' + timeSpend.description : ''}</td>
                                        <td className="ta-c ws-nw">{formatDate(timeSpend.start_date_time)}</td>
                                        <td className="ta-c">{timeSpend.start_time}</td>
                                        <td className="ta-c">{timeSpend.end_time}</td>
                                        <td className="ta-c">{timeSpend.duration ? secondsInHHMMSS(timeSpend.duration) : null}</td>
                                        {
                                            authenticatedUserId &&
                                            <Fragment>
                                                {
                                                    authenticatedUserId == timeSpend.user_id ?
                                                    <Fragment>
                                                        <td style={{ width: '2em' }}>
                                                            <a href="#" onClick={e => editTimeSpend(e, timeSpend)}>Edit</a>
                                                        </td>
                                                        <td style={{ width: '4em' }}>
                                                            <a href="#" onClick={e => removeTimeSpend(e, timeSpend)}>Remove</a>
                                                        </td>
                                                    </Fragment>
                                                    :
                                                    <td style={{ width: '6em' }} colSpan="2"></td>
                                                }
                                            </Fragment>
                                        }
                                    </tr>
                                ))
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <th className="ta-l" colSpan={selectedProjectMemberUserId === 'All' ? 2 : 1} className="pos-s bottom-0 bc-white">{timeSpends.length} time spend{ timeSpends.length !== 1 && 's'}</th>
                                <th colSpan="3" className="pos-s bottom-0 bc-white">Total Duration</th>
                                <th className="pos-s bottom-0 bc-white">{ secondsInHHMMSS(timeSpends.reduce((a, b) => a + Number(b.duration), 0)) }</th>
                                {
                                    authenticatedUserId &&
                                    <th colSpan="2" className="pos-s bottom-0 bc-white"></th>
                                }
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
