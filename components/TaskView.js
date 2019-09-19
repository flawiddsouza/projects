import React, { useState, useEffect, Fragment } from 'react'
import formatDate from 'Libs/formatDate.js'
import formatDateTime from 'Libs/formatDateTime.js'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

export default function TaskView({ task }) {
    const [ activeTab, setActiveTab ] = useState('comments')
    const [ comment, setComment ] = useState('')
    const [ comments, setComments ] = useState([])
    const [ files, setFiles ] = useState([])
    const [ assignedUsers, setAssignedUsers ] = useState([])
    const [ assignUserUser, setAssignUserUser ] = useState('')
    const [ assignUserTask, setAssignUserTask ] = useState('')
    const [ timeSpends, setTimeSpends ] = useState([])
    const [ timeSpendStartDescription, setTimeSpendDescription ] = useState('')
    const [ timeSpendStartDateTime, setTimeSpendStartDateTime ] = useState('')
    const [ timeSpendEndDateTime, setTimeSpendEndDateTime ] = useState('')
    const [ timeSpendUpdate, setTimeSpendUpdate ] = useState(null)

    const commentsContainer = React.createRef()

    useEffect(() => {
        fetchTaskDetails()
    }, [])

    function fetchTaskDetails() {
        setComments([
            {
                id: 1,
                user: 'Flawid',
                comment: 'Hello'
            },
            {
                id: 2,
                user: 'Keerthan',
                comment: 'Hi'
            },
            {
                id: 3,
                user: 'Deepa',
                comment: 'Test'
            }
        ])
        setFiles([
            {
                id: 1,
                filename: 'agnes_pacifyca_data.sql',
                size: '129.2 MB',
                created_at: '2019-09-01 16:31:00'
            },
            {
                id: 2,
                filename: 'agnes_pacifyca_structure.sql',
                size: '274.5 KB',
                created_at: '2019-09-10 13:12:00'
            }
        ])
        setAssignedUsers([
            {
                id: 1,
                user: 'Kavya',
                task: 'Development',
            },
            {
                id: 2,
                user: 'Shreekanth',
                task: 'Design'
            },
            {
                id: 3,
                user: 'Deepa',
                task: 'Testing'
            }
        ])
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
    }

    function handleAddCommentKeydown(e) {
        if(e.altKey && e.key === 'Enter') {
            e.target.value = e.target.value + '\n'
            e.target.scrollTop = e.target.scrollHeight
            return
        }

        if(e.key === 'Enter') {
            e.preventDefault()
            addComment()
        }
    }

    function addComment() {
        if(comment) {
            let pushArray = [{
                id: new Date().getTime(),
                user: 'Deepa',
                comment
            }]
            setComment('')
            setComments(comments.concat(pushArray))
            let commentsContainer2 = commentsContainer.current
            setTimeout(() => {
                commentsContainer2.scrollTop = commentsContainer2.scrollHeight
            }, 0)
        }
    }

    function assignUser() {
        let pushArray = [{
            id: new Date().getTime(),
            user: assignUserUser,
            task: assignUserTask
        }]
        setAssignedUsers(assignedUsers.concat(pushArray))
        setAssignUserUser('')
        setAssignUserTask('')
    }

    function removeAssignedUser(e, assignedUser) {
        e.preventDefault()
        if(confirm('Are you sure you want to unassign this user?')) {
            setAssignedUsers(assignedUsers.filter(item => item.id !== assignedUser.id))
        }
    }

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
        <div style={{ width: '63vw' }}>
            <div className="d-f">
                <div>
                    <div className="label">Date</div>
                    <div className="mt-0_25em">{ formatDate(task.date) }</div>
                </div>
                <div className="ml-3em">
                    <div className="label">Type</div>
                    <div className="mt-0_25em">{ task.type }</div>
                </div>
                <div className="ml-3em">
                    <div className="label">Status</div>
                    <div className="mt-0_25em">{ task.status }</div>
                </div>
            </div>
            <div className="mt-1em">
                <div className="label">Title</div>
                <div className="mt-0_25em">{ task.title }</div>
            </div>
            <div className="mt-1em">
                <div className="tabs">
                    <div className={ activeTab === 'comments' ? 'active': null} onClick={() => setActiveTab('comments') }>Comments ({comments.length})</div>
                    <div className={ activeTab === 'files' ? 'active': null} onClick={() => setActiveTab('files') }>Files ({files.length})</div>
                    <div className={ activeTab === 'assigned' ? 'active': null} onClick={() => setActiveTab('assigned') }>Assigned ({assignedUsers.length})</div>
                    <div className={ activeTab === 'time-spent' ? 'active': null} onClick={() => setActiveTab('time-spent') }>Time Spent ({timeSpends.length} / 0:00)</div>
                </div>
                <div className="tabs-content" style={{ height: '25em' }}>
                    {
                        activeTab === 'comments' &&
                            <div>
                                <div className="oy-a" style={{ maxHeight: '14em' }} ref={commentsContainer}>
                                {
                                    comments.map((commentItem, index) =>
                                        <div key={commentItem.id} className={ index > 0 ? 'mt-0_75em' : null}>
                                            <div className="label">{commentItem.user}</div>
                                            <div className="mt-0_25em">{commentItem.comment}</div>
                                        </div>
                                    )
                                }
                                </div>
                                <form onSubmit={addComment} className={ comments.length > 0 ? 'mt-1em' : null }>
                                    <textarea className="w-100p r-n" value={comment} onChange={e => setComment( e.target.value)} onKeyDown={handleAddCommentKeydown} style={{ height: '3.5em' }}></textarea>
                                    <div className="mt-0_5em">
                                        <div>Attach Files</div>
                                        <input type="file" mutliple="true" />
                                    </div>
                                    <button className="mt-1em">Add Comment</button>
                                </form>
                            </div>
                    }
                    {
                        activeTab === 'files' &&
                            <div className="oy-a" style={{ maxHeight: '23.2em' }}>
                                <table className="table table-comfortable">
                                    <tbody>
                                    {
                                        files.map(file =>
                                            <tr key={file.id}>
                                                <td style={{ width: '9.3em' }}>{formatDateTime(file.created_at)}</td>
                                                <td><a href={`static/${file.filename}`} target="_blank">{file.filename}</a></td>
                                                <td style={{ width: '5em' }}>{file.size}</td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                    }
                    {
                        activeTab === 'assigned' &&
                            <div>
                                <form onSubmit={assignUser} className="d-f flex-ai-fe">
                                    <div>
                                        <div className="label">Member</div>
                                        <select required onChange={e => setAssignUserUser(e.target.value)} value={assignUserUser}>
                                            <option></option>
                                            <option>Deepa</option>
                                            <option>Kavya</option>
                                            <option>Shreekanth</option>
                                        </select>
                                    </div>
                                    <div className="ml-0_5em">
                                        <div className="label">Task</div>
                                        <select required onChange={e => setAssignUserTask(e.target.value)} value={assignUserTask}>
                                            <option></option>
                                            <option>Development</option>
                                            <option>Design</option>
                                            <option>Testing</option>
                                        </select>
                                    </div>
                                    <div className="ml-1em">
                                        <button>Assign to Task</button>
                                    </div>
                                </form>
                                <div className="oy-a mt-1em" style={{ maxHeight: '17em' }}>
                                    <table className="table table-width-auto">
                                        <tbody>
                                        {
                                            assignedUsers.map(assignedUser =>
                                                <tr key={assignedUser.id}>
                                                    <td>{assignedUser.user}</td>
                                                    <td>{assignedUser.task}</td>
                                                    <td>
                                                        <a href="#" onClick={e => removeAssignedUser(e, assignedUser)}>Remove</a>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                    }
                    {
                        activeTab === 'time-spent' &&
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
                    }
                </div>
            </div>
        </div>
    )
}
