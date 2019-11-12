import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'

function Statuses() {

    const [ headers, setHeaders ] = useState([])
    const router = useRouter()
    const { organization } = router.query

    useEffect(() => {
        setHeaders([
            {
                name: 'Status',
                column: 'status',
                inputType: 'text',
                required: true
            },
            {
                name: 'Status Type',
                column: 'status_type',
                inputType: 'select',
                required: true,
                selectData: [
                    {
                        label: 'Open',
                        value: 'OPEN'
                    },
                    {
                        label: 'Closed',
                        value: 'CLOSED'
                    }
                ]
            },
            {
                name: 'Sort Order',
                column: 'sort_order',
                inputType: 'number',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="Status" apiPath={`${organization}/admin/statuses`}></Master>
    )
}

Statuses.getInitialProps = () => ({})

export default Statuses
