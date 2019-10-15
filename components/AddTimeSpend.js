import { useState, useEffect } from 'react'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function AddTimeSpend({ organizationSlug, projectSlug, height }) {

    const [ pendingTasksAssignedToYou, setPendingTasksAssignedToYou ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(format(new Date, 'yyyy-MM-dd'))
    const [ startTime, setStartTime ] = useState('')
    const [ endTime, setEndTime ] = useState('')
    const [ timeSpends, setTimeSpends ] = useState([])

    async function fetchPendingTasksAssignedToYou() {
        setPendingTasksAssignedToYou([
            {
                id: 1,
                title: 'hey 1'
            },
            {
                id: 2,
                title: 'hey 2'
            },
            {
                id: 3,
                title: 'hey 3'
            },
            {
                id: 4,
                title: 'hey 4'
            }
        ])
    }

    async function fetchTimeSpends() {
        setTimeSpends([
            {
                id: 1,
                task: 'Test 1',
                start_time: '01:00 PM',
                end_time: '02:00 PM',
                duration: '01:00:00'
            },
            {
                id: 2,
                task: 'Test 2',
                start_time: '02:00 PM',
                end_time: '03:00 PM',
                duration: '01:00:00'
            },
            {
                id: 3,
                task: 'Test 3',
                start_time: '02:00 PM',
                end_time: '03:00 PM',
                duration: '01:00:00'
            },
            {
                id: 4,
                task: 'Test 4',
                start_time: '03:00 PM',
                end_time: '04:00 PM',
                duration: '01:00:00'
            },
            {
                id: 5,
                task: 'Test 5',
                start_time: '04:00 PM',
                end_time: '05:00 PM',
                duration: '01:00:00'
            }
        ])
    }

    function editTimeSpend(e, timeSpend) {
        e.preventDefault()
    }

    function removeTimeSpend(e, timeSpend) {
        e.preventDefault()
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
            <form>
                <div className="d-f flex-d-c flex-ai-fe">
                    <div className="label">Date</div>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required></input>
                </div>
                <div className="mt-1em">
                    <div className="label">Task</div>
                    <select className="w-100p" required autoFocus>
                        {
                            pendingTasksAssignedToYou.map(task => (
                                <option key={task.id} value={task.id}>{task.title}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="mt-1em d-f flex-ai-fe">
                    <div className="w-100p">
                        <div className="label">Additional Description</div>
                        <input type="text" className="w-100p"></input>
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
                            dateFormat="h:mm aa"
                            required />
                    </div>
                    <div className="ml-1em">
                        <button className="ws-nw">Add Time Spend</button>
                    </div>
                </div>
            </form>
            <div className="mt-1em d-f flex-d-c flex-ai-fe">
                <div className="label">Filter</div>
                <select>
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
                                <th className="ta-l">Task</th>
                                <th style={{ width: '5em' }}>Start Time</th>
                                <th style={{ width: '5em' }}>End Time</th>
                                <th style={{ width: '5em' }}>Duration</th>
                                <th colSpan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                timeSpends.map(timeSpend => (
                                    <tr key={timeSpend.id}>
                                        <td>{timeSpend.task}</td>
                                        <td className="ta-c">{timeSpend.start_time}</td>
                                        <td className="ta-c">{timeSpend.end_time}</td>
                                        <td className="ta-c">{timeSpend.duration}</td>
                                        <td style={{ width: '2em' }}>
                                            <a href="#" onClick={e => editTimeSpend(e, timeSpent)}>Edit</a>
                                        </td>
                                        <td style={{ width: '4em' }}>
                                            <a href="#" onClick={e => removeTimeSpend(e, timeSpent)}>Remove</a>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <th className="ta-l">{timeSpends.length} time spends</th>
                                <th colSpan="2">Total Duration</th>
                                <th>05:00:00</th>
                                <th colSpan="2"></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
