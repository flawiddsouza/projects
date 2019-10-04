import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'
import api from 'Libs/esm/api'

function AssignMembers() {

    const [ projects, setProjects ] = useState([])
    const [ organizationMembers, setOrganizationMembers ] = useState([])
    const [ projectMembers, setProjectMembers ] = useState([])
    const [ selectedProjectId, setSelectedProjectId ] = useState('')
    const [ selectedOrganizationMemberId, setSelectedOrganizationMemberId ] = useState('')
    const router = useRouter()
    const { organization } = router.query
    const baseURL = `${organization}/admin/projects/assign-members`

    async function fetchProjects() {
        const projects = await api.get(`${baseURL}/projects`).json()
        setProjects(projects)
    }

    async function fetchOrganizationMembers() {
        const organizationMembers = await api.get(`${baseURL}/organization-members/${selectedProjectId}`).json()
        setOrganizationMembers(organizationMembers)
    }

    async function fetchProjectMembers() {
        const projectMembers = await api.get(`${baseURL}/project-members/${selectedProjectId}`).json()
        setProjectMembers(projectMembers)
    }

    function addMemberToProject(e) {
        e.preventDefault()
        api.post(`${baseURL}/project-members/${selectedProjectId}`, {
            json: {
                organization_member_id: selectedOrganizationMemberId
            }
        }).then(() => {
            fetchOrganizationMembers()
            fetchProjectMembers()
        })
        setSelectedOrganizationMemberId('')
    }

    async function deleteItem(e, id) {
        e.preventDefault()
        if(confirm('Are you sure you want remove this member from this project?')) {
            await api.delete(`${baseURL}/project-member/${id}`)
            fetchOrganizationMembers()
            fetchProjectMembers()
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if(selectedProjectId) {
            fetchOrganizationMembers()
            fetchProjectMembers()
        }
    }, [selectedProjectId])

    useEffect(() => {
        if(projects.length > 0) {
            setSelectedProjectId(projects[0].id)
        }
    }, [projects])

    return (
        <Container>
            <form className="d-f mb-1em" onSubmit={addMemberToProject}>
                <div>
                    <div className="label">Select Project</div>
                    <select required onChange={e => setSelectedProjectId(e.target.value)} value={selectedProjectId}>
                        {
                            projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="ml-1em">
                    <div className="label">Select Member</div>
                    <select required onChange={e => setSelectedOrganizationMemberId(e.target.value)} value={selectedOrganizationMemberId} className="w-100p">
                            <option></option>
                            {
                                organizationMembers.map(organizationMember => (
                                    <option key={organizationMember.id} value={organizationMember.id}>{organizationMember.user}</option>
                                ))
                            }
                    </select>
                </div>
                <button className="flex-as-fe ml-1em">Add Member to Project</button>
            </form>
            <table className="table table-width-auto">
                <thead>
                    <tr>
                        <th>Member</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        projectMembers.length > 0 ?
                            projectMembers.map(projectMember =>
                                <tr key={projectMember.id}>
                                    <td>{projectMember.user}</td>
                                    <td>
                                        <a href="#" onClick={e => deleteItem(e, projectMember.id)}>Remove</a>
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

AssignMembers.getInitialProps = () => ({})

export default AssignMembers
