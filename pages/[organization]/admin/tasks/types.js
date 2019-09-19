import Container from '../_container';
import { useState } from 'react'

export default function Types() {
    const [ showAddModal, setShowAddModal ] = useState(false)

    function Nav() {
        return (
            <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowAddModal(true) }}>+ Add Type</a>
        )
    }

    return (
        <Container Nav={<Nav/>}>
            Types
        </Container>
    )
}
