import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'

function Types() {

    const [ headers, setHeaders ] = useState([])
    const router = useRouter()
    const { organization } = router.query

    useEffect(() => {
        setHeaders([
            {
                name: 'Type',
                column: 'type',
                inputType: 'text',
                required: true
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
        <Master Container={Container} headers={headers} itemName="Type" apiPath={`${organization}/admin/types`}></Master>
    )
}

Types.getInitialProps = () => ({})

export default Types
