import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'
import AsyncSelect from 'react-select/async'
import api from 'Libs/esm/api'
import Modal from 'Components/Modal'

function Manage() {

    const [ organizationRoles, setOrganizationRoles ] = useState([])
    const [ organizationMembers, setOrganizationMembers ] = useState([])
    const [ selectedUserId, setSelectedUserId ] = useState(undefined)
    const [ selectedOrganizationRoleId, setSelectedOrganizationRoleId ] = useState('')
    const [ changeRoleOrganizationMemberId, setChangeRoleOrganizationMemberId ] = useState('')
    const [ changeRoleOrganizationRoleId, setChangeRoleOrganizationRoleId ] = useState('')
    const [ changeRoleModalShow, setChangeRoleModalShow ] = useState(false)
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

    function showChangeRoleModal(e, organizationUser) {
        e.preventDefault()
        setChangeRoleOrganizationMemberId(organizationUser.id)
        setChangeRoleOrganizationRoleId(organizationUser.organization_role_id)
        setChangeRoleModalShow(true)
    }

    function changeRole(e) {
        e.preventDefault()
        setChangeRoleModalShow(false)
        api.put(`${organization}/admin/member/${changeRoleOrganizationMemberId}/change-role`, {
            json: {
                organization_role_id: changeRoleOrganizationRoleId
            }
        }).then(() => {
            fetchOrganizationMembers()
        })
        setChangeRoleOrganizationMemberId('')
        setChangeRoleOrganizationRoleId('')
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
            <form onSubmit={addMemberToOrganization} className="d-f flex-ai-fs mb-1em">
                <div>
                    <div className="label">
                        Find User
                    </div>
                    <div style={{ width: '20em' }}>
                        <AsyncSelect defaultOptions loadOptions={fetchMatchingUsers} onChange={selectedItem => setSelectedUserId(selectedItem)} value={selectedUserId} placeholder="Search...">
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
                </div>
                <div className="ml-1em">
                    <div className="label">
                        Select Role
                    </div>
                    <select required onChange={e => setSelectedOrganizationRoleId(e.target.value)} value={selectedOrganizationRoleId} style={{ height: '2.8em' }}>
                        <option></option>
                        {
                            organizationRoles.map(organizationRole => (
                                <option key={organizationRole.id} value={organizationRole.id}>{organizationRole.role}</option>
                            ))
                        }
                    </select>
                </div>
                <button className="flex-as-fe ml-1em" style={{ height: '2.8em' }}>Add User to Organization</button>
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
                                        <a href="#" onClick={e => showChangeRoleModal(e, organizationUser)}>Change Role</a>
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
            <Modal showModal={changeRoleModalShow} hideModal={() => setChangeRoleModalShow(false)}>
                <form onSubmit={changeRole}>
                    <div className="label">Role</div>
                    <div>
                    <select required onChange={e => setChangeRoleOrganizationRoleId(e.target.value)} value={changeRoleOrganizationRoleId}>
                        <option></option>
                        {
                            organizationRoles.map(organizationRole => (
                                <option key={organizationRole.id} value={organizationRole.id}>{organizationRole.role}</option>
                            ))
                        }
                    </select>
                    </div>
                    <button className="mt-1em">Update</button>
                </form>
            </Modal>
        </Container>
    )
}

Manage.getInitialProps = () => ({})

export default Manage
