import { useState, useEffect } from 'react'
import api from 'Libs/esm/api'

export default function TaskViewAssigned({ taskId, setAssignedCount }) {
    const [ assignableUsers, setAssignableUsers ] = useState([])
    const [ assignedUsers, setAssignedUsers ] = useState([])
    const [ assignUserUser, setAssignUserUser ] = useState('')
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)

    async function fetchAssignedUsers() {
        const { assignedUsers, assignableUsers } = await api.get(`task/${taskId}/assigned-users`).json()
        setIntialLoadComplete(true)
        setAssignableUsers(assignableUsers)
        setAssignedUsers(assignedUsers)
    }

    useEffect(() => {
        fetchAssignedUsers()
    }, [])

    useEffect(() => {
        if(initialLoadComplete) {
            setAssignedCount(assignedUsers.length)
        }
    }, [assignedUsers])

    function assignUser(e) {
        e.preventDefault()
        api.post(`task/${taskId}/assigned-user`, {
            json: {
                user_id: assignUserUser
            }
        }).then(() => {
            fetchAssignedUsers()
        })
        setAssignUserUser('')
    }

    async function removeAssignedUser(e, assignedUser) {
        e.preventDefault()
        if(confirm('Are you sure you want to unassign this user?')) {
            await api.delete(`task/${taskId}/assigned-user/${assignedUser.id}`)
            fetchAssignedUsers()
        }
    }

    return (
        <div>
            <form onSubmit={assignUser} className="d-f flex-ai-fe">
                <div>
                    <div className="label">Member</div>
                    <select required onChange={e => setAssignUserUser(e.target.value)} value={assignUserUser}>
                        <option></option>
                        {
                            assignableUsers.map(assignableUser => (
                                <option key={assignableUser.id} value={assignableUser.id}>{assignableUser.user}</option>
                            ))
                        }
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
    )
}
