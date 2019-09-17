import React, { useState, useEffect } from 'react'
import formatDate from '../libs/formatDate.js'

export default function TaskView({ task }) {
    const [ activeTab, setActiveTab ] = useState('comments')
    const [ comment, setComment ] = useState('')
    const [ comments, setComments ] = useState([])

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
                    <div className={ activeTab === 'files' ? 'active': null} onClick={() => setActiveTab('files') }>Files (0)</div>
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
                                        <div key={commentItem.id} className={`comment ${ index > 0 ? 'mt-0_5em' : ''}`}>
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
                                        <input type="file" mutliple />
                                    </div>
                                    <button className="mt-1em">Add Comment</button>
                                </form>
                            </div>
                    }
                    {
                        activeTab === 'files' &&
                            <div>
                                Files
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
