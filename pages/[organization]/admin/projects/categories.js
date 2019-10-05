import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'
import api from 'Libs/esm/api'

function Categories() {

    const [ projects, setProjects ] = useState([])
    const [ projectCategories, setProjectCategories ] = useState([])
    const [ selectedProjectId, setSelectedProjectId ] = useState('')
    const [ newCategory, setNewCategory ] = useState('')
    const router = useRouter()
    const { organization } = router.query
    const baseURL = `${organization}/admin/projects/categories`

    async function fetchProjects() {
        const projects = await api.get(`${organization}/admin/projects`).json()
        setProjects(projects)
    }

    async function fetchProjectCategories() {
        const projectCategories = await api.get(`${baseURL}/${selectedProjectId}`).json()
        setProjectCategories(projectCategories)
    }

    function addCategoryToProject(e) {
        e.preventDefault()
        api.post(`${baseURL}/${selectedProjectId}`, {
            json: {
                category: newCategory
            }
        }).then(() => {
            fetchProjectCategories()
        })
        setNewCategory('')
    }

    async function editItem(e, projectCategory) {
        e.preventDefault()
        let category = prompt('Enter category Name', projectCategory.category)
        if(category) {
            await api.put(`${baseURL}/${projectCategory.id}`, {
                json: {
                    category
                }
            })
            fetchProjectCategories()
        }
    }

    async function deleteItem(e, id) {
        e.preventDefault()
        if(confirm('Are you sure you want remove this category from this project?')) {
            await api.delete(`${baseURL}/${id}`)
            fetchProjectCategories()
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if(selectedProjectId) {
            fetchProjectCategories()
        }
    }, [selectedProjectId])

    useEffect(() => {
        if(projects.length > 0) {
            setSelectedProjectId(projects[0].id)
        }
    }, [projects])

    return (
        <Container>
            <form className="d-f mb-1em" onSubmit={addCategoryToProject}>
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
                    <div className="label">New Category</div>
                    <input required onChange={e => setNewCategory(e.target.value)} value={newCategory} className="w-100p" />
                </div>
                <button className="flex-as-fe ml-1em">Add Category to Project</button>
            </form>
            <table className="table table-width-auto">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th colSpan="2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        projectCategories.length > 0 ?
                            projectCategories.map(projectCategory =>
                                <tr key={projectCategory.id}>
                                    <td>{projectCategory.category}</td>
                                    <td>
                                        <a href="#" onClick={e => editItem(e, projectCategory)}>Edit</a>
                                    </td>
                                    <td>
                                        <a href="#" onClick={e => deleteItem(e, projectCategory.id)}>Remove</a>
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

Categories.getInitialProps = () => ({})

export default Categories
