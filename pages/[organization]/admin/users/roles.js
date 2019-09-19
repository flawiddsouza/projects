import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'

export default function Roles() {

    const [ headers, setHeaders ] = useState([])

    useEffect(() => {
        setHeaders([
            {
                name: 'Role',
                column: 'role',
                inputType: 'text',
                required: true
            },
            {
                name: 'Task',
                column: 'task',
                inputType: 'text',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="Role"></Master>
    )
}
