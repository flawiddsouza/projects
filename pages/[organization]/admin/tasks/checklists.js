import { useState, useEffect } from 'react'
import Container from '../_container'
import { useRouter } from 'next/router'
import api from 'Libs/esm/api'
import Modal from 'Components/Modal'

function Checklists() {

    const [ taskTypes, setTaskTypes ] = useState([])
    const [ checklists, setChecklists ] = useState([])
    const [ selectedTaskTypeId, setSelectedTaskTypeId ] = useState('')
    const [ newChecklistName, setNewChecklistName ] = useState('')
    const [ newChecklistSortOrder, setNewChecklistSortOrder ] = useState('')
    const [ editChecklistModalShow, setEditChecklistModalShow ] = useState(false)
    const [ editChecklistId, setEditChecklistId ] = useState(null)
    const [ editChecklistName, setEditChecklistName ] = useState(null)
    const [ editChecklistSortOrder, setEditChecklistSortOrder ] = useState(null)
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
                name: newChecklistName,
                sort_order: newChecklistSortOrder
            }
        }).then(() => {
            fetchChecklists()
        })
        setNewChecklistName('')
        setNewChecklistSortOrder('')
    }

    function startEditChecklist(e, checklist) {
        e.preventDefault()
        setEditChecklistId(checklist.id)
        setEditChecklistName(checklist.name)
        setEditChecklistSortOrder(checklist.sort_order)
        setEditChecklistModalShow(true)
    }

    function updateChecklist(e) {
        e.preventDefault()
        api.put(`${baseURL}/${editChecklistId}`, {
            json: {
                name: editChecklistName,
                sort_order: editChecklistSortOrder
            }
        }).then(() => {
            fetchChecklists()
        })
        setEditChecklistModalShow(false)
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
            <form className="d-f flex-ai-fe mb-1em" onSubmit={addChecklist}>
                <div>
                    <div className="label">Select Task Type</div>
                    <select required onChange={e => setSelectedTaskTypeId(e.target.value)} value={selectedTaskTypeId} className="w-100p">
                        {
                            taskTypes.map(taskType => (
                                <option key={taskType.id} value={taskType.id}>{taskType.type}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="ml-1em">
                    <div className="label">New Checklist Name</div>
                    <input type="text" value={newChecklistName} onChange={e => setNewChecklistName(e.target.value)} required style={{ height: '1.3em' }}></input>
                </div>
                <div className="ml-1em">
                    <div className="label">Sort Order</div>
                    <input type="number" value={newChecklistSortOrder} onChange={e => setNewChecklistSortOrder(e.target.value)} required style={{ height: '1.3em', width: '6em' }}></input>
                </div>
                <button className="ml-1em">Add Checklist</button>
            </form>
            <table className="table table-width-auto">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Sort Order</th>
                        <th colSpan="2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        checklists.length > 0 ?
                        checklists.map(checklist =>
                                <tr key={checklist.id}>
                                    <td>{checklist.name}</td>
                                    <td>{checklist.sort_order}</td>
                                    <td>
                                        <a href="#" onClick={e => startEditChecklist(e, checklist)}>Edit</a>
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
            <Modal showModal={editChecklistModalShow} hideModal={() => setEditChecklistModalShow(false)}>
                <form onSubmit={updateChecklist}>
                    <div className="label">Name</div>
                    <div>
                        <input type="text" value={editChecklistName} onChange={e => setEditChecklistName(e.target.value)} required autoFocus></input>
                    </div>
                    <div className="label">Sort Order</div>
                    <div>
                        <input type="number" value={editChecklistSortOrder ? editChecklistSortOrder : ''} onChange={e => setEditChecklistSortOrder(e.target.value)} required></input>
                    </div>
                    <button className="mt-1em">Update</button>
                </form>
            </Modal>
        </Container>
    )

}

Checklists.getInitialProps = () => ({})

export default Checklists
