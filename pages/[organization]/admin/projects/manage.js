import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'

function Manage() {

    const [ headers, setHeaders ] = useState([])
    const router = useRouter()
    const { organization } = router.query

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
        <Master Container={Container} headers={headers} itemName="Project" apiPath={`${organization}/admin/projects`}></Master>
    )
}

Manage.getInitialProps = () => ({})

export default Manage
