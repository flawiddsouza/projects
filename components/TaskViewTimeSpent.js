import { useState, useEffect } from 'react'
import format from 'date-fns/format'
import formatDateTime from 'Libs/formatDateTime.js'
import parseISO from 'date-fns/parseISO'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import api from 'Libs/esm/api'
import { secondsInHHMMSS } from 'Libs/esm/dateUtils'

export default function TaskViewTimeSpent({ taskId, setTimeSpentCount, setTimeSpentDuration, tabsContentHeight=null }) {
    const [ timeSpends, setTimeSpends ] = useState([])
    const [ timeSpendStartDescription, setTimeSpendDescription ] = useState('')
    const [ timeSpendStartDateTime, setTimeSpendStartDateTime ] = useState('')
    const [ timeSpendEndDateTime, setTimeSpendEndDateTime ] = useState('')
    const [ timeSpendUpdate, setTimeSpendUpdate ] = useState(null)
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)

    async function fetchTimeSpends() {
        const timeSpends = await api.get(`task/${taskId}/time-spends`).json()
        setIntialLoadComplete(true)
        setTimeSpends(timeSpends)
    }

    useEffect(() => {
        fetchTimeSpends()
    }, [])

    useEffect(() => {
        if(initialLoadComplete) {
            setTimeSpentCount(timeSpends.length)
            setTimeSpentDuration(timeSpends.reduce((acc, timeSpend) => acc + Number(timeSpend.duration), 0))
        }
    }, [timeSpends])

    function addTimeSpend(e) {
        e.preventDefault()

        if(!timeSpendUpdate) { // add

            api.post(`task/${taskId}/time-spend`, {
                json: {
                    description: timeSpendStartDescription,
                    start_date_time: format(timeSpendStartDateTime, 'yyyy-MM-dd HH:mm'),
                    end_date_time: timeSpendEndDateTime ? format(timeSpendEndDateTime, 'yyyy-MM-dd HH:mm') : null
                }
            }).then(() => {
                fetchTimeSpends()
            })

        } else { // update

            api.put(`task/${taskId}/time-spend/${timeSpendUpdate}`, {
                json: {
                    description: timeSpendStartDescription,
                    start_date_time: format(timeSpendStartDateTime, 'yyyy-MM-dd HH:mm'),
                    end_date_time: timeSpendEndDateTime ? format(timeSpendEndDateTime, 'yyyy-MM-dd HH:mm') : null
                }
            }).then(() => {
                fetchTimeSpends()
            })

            setTimeSpendUpdate(null)

        }

        setTimeSpendDescription('')
        setTimeSpendStartDateTime('')
        setTimeSpendEndDateTime('')
    }

    async function removeTimeSpend(e, timeSpend) {
        e.preventDefault()
        if(confirm('Are you sure you want to remove this time spend?')) {
            if(timeSpendUpdate && timeSpendUpdate === timeSpend.id) {
                cancelEditTimeSpend()
            }

            await api.delete(`task/${taskId}/time-spend/${timeSpend.id}`)
            fetchTimeSpends()
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
                        <div className="label">Additional Description</div>
                        <input type="text" value={timeSpendStartDescription} onChange={e => setTimeSpendDescription(e.target.value)} className="w-100p"></input>
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
            <div className="oy-a mt-1em" style={{ maxHeight: tabsContentHeight ? 'calc('+tabsContentHeight+' - 4em)' : '21em' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '6em' }}>Member</th>
                            <th className="ta-l">Additional Description</th>
                            <th style={{ width: '9.5em' }}>Start Date Time</th>
                            <th style={{ width: '9.5em' }}>End Date Time</th>
                            <th style={{ width: '4em' }}>Duration</th>
                            <th colSpan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        timeSpends.map(timeSpent =>
                            <tr key={timeSpent.id}>
                                <td className="ws-nw">{timeSpent.user}</td>
                                <td>{timeSpent.description}</td>
                                <td className="ta-c">{formatDateTime(timeSpent.start_date_time)}</td>
                                <td className="ta-c">{timeSpent.end_date_time ? formatDateTime(timeSpent.end_date_time) : null}</td>
                                <td className="ta-c">{timeSpent.duration ? secondsInHHMMSS(timeSpent.duration) : null}</td>
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
