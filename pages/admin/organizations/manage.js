import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'

export default function Manage() {

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
                name: 'Slug',
                column: 'slug',
                inputType: 'text',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="Organization" apiPath="admin/organizations"></Master>
    )
}
