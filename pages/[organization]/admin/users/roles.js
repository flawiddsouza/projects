import Master from 'Components/Master'
import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'

function Roles() {

    const [ headers, setHeaders ] = useState([])
    const router = useRouter()
    const { organization } = router.query

    useEffect(() => {
        setHeaders([
            {
                name: 'Role',
                column: 'role',
                inputType: 'text',
                required: true
            }
        ])
    }, [])

    return (
        <Master Container={Container} headers={headers} itemName="Role" apiPath={`${organization}/admin/roles`}></Master>
    )
}

Roles.getInitialProps = () => ({})

export default Roles
