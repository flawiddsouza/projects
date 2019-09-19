import Container from '../_container';
import { useState } from 'react'

export default function Manage() {
    const [ showAddModal, setShowAddModal ] = useState(false)

    function Nav() {
        return (
            <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowAddModal(true) }}>+ Add Organization</a>
        )
    }

    return (
        <Container Nav={<Nav/>}>
            Manage
        </Container>
    )
}
