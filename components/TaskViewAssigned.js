import { useState, useEffect } from 'react'

export default function TaskViewAssigned({ setAssignedCount }) {
    const [ assignedUsers, setAssignedUsers ] = useState([])
    const [ assignUserUser, setAssignUserUser ] = useState('')

    useEffect(() => {
        setAssignedUsers([
            {
                id: 1,
                user: 'Kavya'
            },
            {
                id: 2,
                user: 'Shreekanth'
            },
            {
                id: 3,
                user: 'Deepa'
            }
        ])
    }, [])

    useEffect(() => {
        setAssignedCount(assignedUsers.length)
    }, [assignedUsers])

    function assignUser() {
        let pushArray = [{
            id: new Date().getTime(),
            user: assignUserUser
        }]
        setAssignedUsers(assignedUsers.concat(pushArray))
        setAssignUserUser('')
    }

    function removeAssignedUser(e, assignedUser) {
        e.preventDefault()
        if(confirm('Are you sure you want to unassign this user?')) {
            setAssignedUsers(assignedUsers.filter(item => item.id !== assignedUser.id))
        }
    }

    return (
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
