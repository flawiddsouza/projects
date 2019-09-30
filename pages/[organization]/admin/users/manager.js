import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'

function Manager() {

    const [ organizationUsers, setOrganizationUsers ] = useState([])
    const router = useRouter()
    const { organization } = router.query

    useEffect(() => {
    }, [])

    return (
        <Container>
            Organizations User Manager
        </Container>
    )
}

Manager.getInitialProps = () => ({})

export default Manager
