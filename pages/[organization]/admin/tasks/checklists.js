import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'
import api from 'Libs/esm/api'

function Checklists() {

    const [ taskTypes, setTaskTypes ] = useState([])
    const [ checklists, setChecklists ] = useState([])
    const [ selectedTaskTypeId, setSelectedTaskTypeId ] = useState('')
    const [ newChecklistName, setNewChecklistName ] = useState('')
    const router = useRouter()
    const { organization } = router.query
    const baseURL = `${organization}/admin/tasks/checklists`

    async function fetchTaskTypes() {
        const taskTypes = await api.get(`${organization}/admin/types`).json()
        setTaskTypes(taskTypes)
    }

    async function fetchChecklists() {
        const checklists = await api.get(`${baseURL}/${selectedTaskTypeId}`).json()
        setChecklists(checklists)
    }

    function addChecklist(e) {
        e.preventDefault()
        api.post(`${baseURL}/${selectedTaskTypeId}`, {
            json: {
                name: newChecklistName
            }
        }).then(() => {
            fetchChecklists()
        })
        setNewChecklistName('')
    }

    async function deleteItem(e, id) {
        e.preventDefault()
        if(confirm('Are you sure you want remove this checklist?')) {
            await api.delete(`${baseURL}/${id}`)
            fetchChecklists()
        }
    }

    useEffect(() => {
        fetchTaskTypes()
    }, [])

    useEffect(() => {
        if(selectedTaskTypeId) {
            fetchChecklists()
        }
    }, [selectedTaskTypeId])

    useEffect(() => {
        if(taskTypes.length > 0) {
            setSelectedTaskTypeId(taskTypes[0].id)
        }
    }, [taskTypes])

    return (
        <Container>
            <form className="d-f mb-1em" onSubmit={addChecklist}>
                <select required onChange={e => setSelectedTaskTypeId(e.target.value)} value={selectedTaskTypeId}>
                    {
                        taskTypes.map(taskType => (
                            <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                        ))
                    }
                </select>
                <input type="text" className="ml-1em" value={newChecklistName} onChange={e => setNewChecklistName(e.target.value)} required></input>
                <button className="ml-1em">Add Checklist</button>
            </form>
            <table className="table table-width-auto">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th colSpan="2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        checklists.length > 0 ?
                        checklists.map(checklist =>
                                <tr key={checklist.id}>
                                    <td>{checklist.name}</td>
                                    <td>
                                        <a href="#" onClick={e => deleteItem(e, checklist.id)}>Rename</a>
                                    </td>
                                    <td>
                                        <a href="#" onClick={e => deleteItem(e, checklist.id)}>Remove</a>
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

Checklists.getInitialProps = () => ({})

export default Checklists
