import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'

export default function Statuses() {

    const [ headers, setHeaders ] = useState([])

    useEffect(() => {
        setHeaders([
            {
                name: 'Status',
                column: 'status',
                inputType: 'text',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="Status"></Master>
    )
}
