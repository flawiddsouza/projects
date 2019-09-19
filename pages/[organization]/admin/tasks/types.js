import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'

export default function Types() {

    const [ headers, setHeaders ] = useState([])

    useEffect(() => {
        setHeaders([
            {
                name: 'Type',
                column: 'type',
                inputType: 'text',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="Type"></Master>
    )
}
