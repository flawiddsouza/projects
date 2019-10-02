import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'

function Manage() {

    const [ organizationUsers, setOrganizationUsers ] = useState([])
    const router = useRouter()
    const { organization } = router.query

    useEffect(() => {
    }, [])

    return (
        <Container>
            Manage Organizations Users
        </Container>
    )
}

Manage.getInitialProps = () => ({})

export default Manage
