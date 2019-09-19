import Container from '../_container';
import { useState } from 'react'

export default function Manager() {
    const [ showAddModal, setShowAddModal ] = useState(false)

    function Nav() {
        return (
            <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowAddModal(true) }}>+ Add User</a>
        )
    }

    return (
        <Container Nav={<Nav/>}>
            Manager
        </Container>
    )
}
