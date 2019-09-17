import { useState } from 'react'
import formatDate from '../libs/formatDate.js'

export default function TaskView({ task }) {
    const [ activeTab, setActiveTab ] = useState('comments')

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
                    <div className={ activeTab === 'comments' ? 'active': null} onClick={() => setActiveTab('comments') }>Comments (0)</div>
                    <div className={ activeTab === 'files' ? 'active': null} onClick={() => setActiveTab('files') }>Files (0)</div>
                    <div className={ activeTab === 'assigned' ? 'active': null} onClick={() => setActiveTab('assigned') }>Assigned (0)</div>
                    <div className={ activeTab === 'time-spent' ? 'active': null} onClick={() => setActiveTab('time-spent') }>Time Spent (0 / 0:00)</div>
                </div>
                <div className="tabs-content">
                    {
                        activeTab === 'comments' &&
                            <div>
                                Comments
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
