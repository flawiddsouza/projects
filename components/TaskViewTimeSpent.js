import { useState, useEffect } from 'react'
import format from 'date-fns/format'
import formatDateTime from 'Libs/formatDateTime.js'
import parseISO from 'date-fns/parseISO'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function TaskViewTimeSpent({ setTimeSpentCount }) {
    const [ timeSpends, setTimeSpends ] = useState([])
    const [ timeSpendStartDescription, setTimeSpendDescription ] = useState('')
    const [ timeSpendStartDateTime, setTimeSpendStartDateTime ] = useState('')
    const [ timeSpendEndDateTime, setTimeSpendEndDateTime ] = useState('')
    const [ timeSpendUpdate, setTimeSpendUpdate ] = useState(null)

    useEffect(() => {
        setTimeSpends([
            {
                id: 1,
                user: 'Kavya',
                description: 'Development',
                start_date_time: '2019-09-19 10:00',
                end_date_time: '2019-09-19 15:00'
            },
            {
                id: 2,
                user: 'Shreekanth',
                description: 'Design',
                start_date_time: '2019-09-19 10:00',
                end_date_time: '2019-09-19 15:00'
            },
            {
                id: 3,
                user: 'Deepa',
                description: 'Testing',
                start_date_time: '2019-09-19 10:00',
                end_date_time: '2019-09-19 15:00'
            }
        ])
    }, [])

    useEffect(() => {
        setTimeSpentCount(timeSpends.length)
    }, [timeSpends])

    function addTimeSpend(e) {
        e.preventDefault()

        if(!timeSpendUpdate) { // add

            let pushArray = [{
                id: new Date().getTime(),
                user: 'Deepa',
                description: timeSpendStartDescription,
                start_date_time: format(timeSpendStartDateTime, 'yyyy-MM-dd HH:mm'),
                end_date_time: timeSpendEndDateTime ? format(timeSpendEndDateTime, 'yyyy-MM-dd HH:mm') : null,
            }]

            setTimeSpends(timeSpends.concat(pushArray))

        } else { // update

            let timeSpendsCopy = JSON.parse(JSON.stringify(timeSpends))
            let timeSpend = timeSpendsCopy.find(item => item.id === timeSpendUpdate)
            timeSpend.description = timeSpendStartDescription
            timeSpend.start_date_time = format(timeSpendStartDateTime, 'yyyy-MM-dd HH:mm')
            timeSpend.end_date_time = timeSpendEndDateTime ? format(timeSpendEndDateTime, 'yyyy-MM-dd HH:mm') : null

            setTimeSpends(timeSpendsCopy)

            setTimeSpendUpdate(null)

        }

        setTimeSpendDescription('')
        setTimeSpendStartDateTime('')
        setTimeSpendEndDateTime('')
    }

    function removeTimeSpend(e, timeSpend) {
        e.preventDefault()
        if(confirm('Are you sure you want to unassign this user?')) {
            if(timeSpendUpdate && timeSpendUpdate === timeSpend.id) {
                cancelEditTimeSpend()
            }
            setTimeSpends(timeSpends.filter(item => item.id !== timeSpend.id))
        }
    }

    function editTimeSpend(e, timeSpend) {
        e.preventDefault()

        setTimeSpendDescription(timeSpend.description)
        setTimeSpendStartDateTime(parseISO(timeSpend.start_date_time))
        setTimeSpendEndDateTime(timeSpend.end_date_time ? parseISO(timeSpend.end_date_time) : null)

        setTimeSpendUpdate(timeSpend.id)
    }

    function cancelEditTimeSpend() {
        setTimeSpendDescription('')
        setTimeSpendStartDateTime('')
        setTimeSpendEndDateTime('')

        setTimeSpendUpdate(null)
    }

    return (
        <div>
            <form onSubmit={addTimeSpend}>
                <div className="d-f flex-ai-fe">
                    <div className="w-100p">
                        <div className="label">Description</div>
                        <input type="text" value={timeSpendStartDescription} onChange={e => setTimeSpendDescription(e.target.value)} required className="w-100p"></input>
                    </div>
                    <div className="ml-1em">
                        <div className="label">Start Date Time</div>
                        <DatePicker selected={timeSpendStartDateTime} onChange={date => setTimeSpendStartDateTime(date)} showTimeSelect dateFormat="dd-MMM-yy hh:mm a" required></DatePicker>
                    </div>
                    <div className="ml-1em">
                        <div className="label">End Date Time</div>
                        <DatePicker selected={timeSpendEndDateTime} onChange={date => setTimeSpendEndDateTime(date)} showTimeSelect dateFormat="dd-MMM-yy hh:mm a"></DatePicker>
                    </div>
                    <div className="ml-1em">
                        {
                            !timeSpendUpdate ?
                                <button className="ws-nw">Add Time Spend</button>
                            :
                                <div className="ws-nw">
                                    <button className="ws-nw">Update</button>
                                    <button className="ws-nw ml-0_5em" type="button" onClick={cancelEditTimeSpend}>Cancel</button>
                                </div>
                        }
                    </div>
                </div>
            </form>
            <div className="oy-a mt-1em" style={{ maxHeight: '23.2em' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '6em' }}>Member</th>
                            <th className="ta-l">Description</th>
                            <th style={{ width: '9.5em' }}>Start Date Time</th>
                            <th style={{ width: '9.5em' }}>End Date Time</th>
                            <th colSpan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        timeSpends.map(timeSpent =>
                            <tr key={timeSpent.id}>
                                <td className="ws-nw">{timeSpent.user}</td>
                                <td>{timeSpent.description}</td>
                                <td>{formatDateTime(timeSpent.start_date_time)}</td>
                                <td>{timeSpent.end_date_time ? formatDateTime(timeSpent.end_date_time) : null}</td>
                                <td style={{ width: '2em' }}>
                                    <a href="#" onClick={e => editTimeSpend(e, timeSpent)}>Edit</a>
                                </td>
                                <td style={{ width: '4em' }}>
                                    <a href="#" onClick={e => removeTimeSpend(e, timeSpent)}>Remove</a>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
