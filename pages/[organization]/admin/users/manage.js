import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'
import AsyncSelect from 'react-select/async'
import api from 'Libs/esm/api'

function Manage() {

    const [ organizationRoles, setOrganizationRoles ] = useState([])
    const [ organizationMembers, setOrganizationMembers ] = useState([])
    const [ selectedUserId, setSelectedUserId ] = useState(undefined)
    const [ selectedOrganizationRoleId, setSelectedOrganizationRoleId ] = useState('')
    const router = useRouter()
    const { organization } = router.query

    async function fetchMatchingUsers(inputValue) {
        return await api.get(`${organization}/admin/matching-users?name=${inputValue}`).json()
    }

    function addMemberToOrganization(e) {
        e.preventDefault()
        api.post(`${organization}/admin/member`, {
            json: {
                user_id: selectedUserId.value,
                organization_role_id: selectedOrganizationRoleId
            }
        }).then(() => {
            fetchOrganizationMembers()
        })
        setSelectedUserId('')
        setSelectedOrganizationRoleId('')
    }

    function showEditModalFunction(e, organizationUser) {
        e.preventDefault()
    }

    async function deleteItem(e, id) {
        e.preventDefault()
        if(confirm('Are you sure you want remove this member from your organization?')) {
            await api.delete(`${organization}/admin/member/${id}`)
            fetchOrganizationMembers()
        }
    }

    async function fetchOrganizationRoles() {
        const organizationRoles = await api.get(`${organization}/admin/roles`).json()
        setOrganizationRoles(organizationRoles)
    }

    async function fetchOrganizationMembers() {
        const organizationMembers = await api.get(`${organization}/admin/members`).json()
        setOrganizationMembers(organizationMembers)
    }

    useEffect(() => {
        fetchOrganizationMembers()
        fetchOrganizationRoles()
    }, [])

    return (
        <Container>
            <form onSubmit={addMemberToOrganization} className="d-f mb-1em">
                <div style={{ width: '20em' }}>
                    <AsyncSelect defaultOptions loadOptions={fetchMatchingUsers} onChange={selectedItem => setSelectedUserId(selectedItem)} value={selectedUserId}>
                    </AsyncSelect>
                    <input
                        tabIndex={-1}
                        autoComplete="off"
                        style={{ opacity: 0, height: 0, position: 'absolute' }}
                        value={selectedUserId || ''}
                        required={true}
                        onChange={() => {}}
                    />
                </div>
                <select className="ml-1em" required onChange={e => setSelectedOrganizationRoleId(e.target.value)} value={selectedOrganizationRoleId}>
                    <option></option>
                    {
                        organizationRoles.map(organizationRole => (
                            <option key={organizationRole.id} value={organizationRole.id}>{organizationRole.role}</option>
                        ))
                    }
                </select>
                <button className="ml-1em">Add User to Organization</button>
            </form>
            <table className="table table-width-auto">
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        organizationMembers.length > 0 ?
                            organizationMembers.map(organizationUser =>
                                <tr key={organizationUser.id}>
                                    <td>{organizationUser.user}</td>
                                    <td>{organizationUser.role}</td>
                                    <td>
                                        <a href="#" onClick={e => showEditModalFunction(e, organizationUser)}>Edit</a>
                                    </td>
                                    <td>
                                        <a href="#" onClick={e => deleteItem(e, organizationUser.id)}>Remove</a>
                                    </td>
                                </tr>
                            )
                            :
                            <tr>
                                <td colSpan="100%" className="ta-c">No Records Found</td>
                            </tr>
                    }
                </tbody>
            </table>
        </Container>
    )
}

Manage.getInitialProps = () => ({})

export default Manage
