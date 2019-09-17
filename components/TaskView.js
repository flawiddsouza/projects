import React, { useState, useEffect } from 'react'
import formatDate from '../libs/formatDate.js'
import formatDateTime from '../libs/formatDateTime.js'

export default function TaskView({ task }) {
    const [ activeTab, setActiveTab ] = useState('comments')
    const [ comment, setComment ] = useState('')
    const [ comments, setComments ] = useState([])
    const [ files, setFiles ] = useState([])

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
    }

    function addComment() {
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

    return (
        <div style={{ width: '40vw' }}>
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
                <div className="label">Description</div>
                <div className="mt-0_25em">{ task.description }</div>
            </div>
            <div className="mt-1em">
                <div className="tabs">
                    <div className={ activeTab === 'comments' ? 'active': null} onClick={() => setActiveTab('comments') }>Comments ({comments.length})</div>
                    <div className={ activeTab === 'files' ? 'active': null} onClick={() => setActiveTab('files') }>Files ({files.length})</div>
                    <div className={ activeTab === 'assigned' ? 'active': null} onClick={() => setActiveTab('assigned') }>Assigned (0)</div>
                    <div className={ activeTab === 'time-spent' ? 'active': null} onClick={() => setActiveTab('time-spent') }>Time Spent (0 / 0:00)</div>
                </div>
                <div className="tabs-content">
                    {
                        activeTab === 'comments' &&
                            <div>
                                <div className="oy-a" style={{ maxHeight: '14em' }} ref={commentsContainer}>
                                {
                                    comments.map((commentItem, index) =>
                                        <div key={commentItem.id} className={ index > 0 ? 'mt-0_5em' : null}>
                                            <div className="label">{commentItem.user}</div>
                                            <div>{commentItem.comment}</div>
                                        </div>
                                    )
                                }
                                </div>
                                <form onSubmit={addComment} className={ comments.length > 0 ? 'mt-1em' : null }>
                                    <textarea className="w-100p" required value={comment} onChange={e => setComment( e.target.value)}></textarea>
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
                                Assigned
                            </div>
                    }
                    {
                        activeTab === 'time-spent' &&
                            <div>
                                Time Spent
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}
