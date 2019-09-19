import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'

export default function Manager() {

    const [ headers, setHeaders ] = useState([])

    useEffect(() => {
        setHeaders([
            {
                name: 'Name',
                column: 'name',
                inputType: 'text',
                required: true
            },
            {
                name: 'Username',
                column: 'username',
                inputType: 'text',
                required: true
            },
            {
                name: 'Password',
                column: 'password',
                inputType: 'password',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="User"></Master>
    )
}
