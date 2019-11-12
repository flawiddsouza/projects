import { useState, useEffect } from 'react'
import Modal from 'Components/Modal'
import api from 'Libs/esm/api'

export default function Master({ Container, headers, itemName, apiPath }) {
    const [ showAddModal, setShowAddModal ] = useState(false)
    const [ showEditModal, setShowEditModal ] = useState(false)
    const [ items, setItems ] = useState([])
    let addObj = {}
    const [ editObj, setEditObj ] = useState({})

    headers.forEach(header => {
        if(header.inputType === 'select' && header.hasOwnProperty('selectData') && header.selectData.length > 0) {
            addObj[header.column] = header.selectData[0].value
        }
    })

    useEffect(() => {
        fetchItems()
    }, [])

    async function fetchItems() {
        let items = await api.get(apiPath).json()
        setItems(items)
    }

    function Nav() {
        return (
            <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowAddModal(true) }}>+ Add {itemName}</a>
        )
    }

    async function addItem(e) {
        e.preventDefault()

        let response = await api.post(apiPath, {
            headers: {
                Token: localStorage.getItem('token')
            },
            json: addObj
        }).json()

        if(response.status === 'error') {
            alert(response.message)
        } else {
            fetchItems()
        }

        setShowAddModal(false)
        addObj = {}
    }

    function showEditModalFunction(e, item) {
        e.preventDefault()
        setEditObj(JSON.parse(JSON.stringify(item)))
        setShowEditModal(true)
    }

    function setObjectProperty(property, value, setFunction) {
        let editObjCopy = JSON.parse(JSON.stringify(editObj))
        editObjCopy[property] = value
        setFunction(editObjCopy)
    }

    async function updateItem(e) {
        e.preventDefault()

        let response = await api.put(apiPath + '/' + editObj.id, {
            headers: {
                Token: localStorage.getItem('token')
            },
            json: editObj
        }).json()

        if(response.status === 'error') {
            alert(response.message)
        } else {
            fetchItems()
        }

        setShowEditModal(false)
        setEditObj({})
    }

    async function deleteItem(id) {
        if(confirm('Are you sure you want to delete this item?')) {
            let response = await api.delete(apiPath + '/' + id, {
                headers: {
                    Token: localStorage.getItem('token')
                }
            }).json()

            if(response.status === 'error') {
                alert(response.message)
            } else {
                fetchItems()
            }
        }
    }

    return (
        <Container Nav={<Nav/>}>
            <table className="table table-width-auto">
                <thead>
                    <tr>
                        {
                            headers.map(header =>
                                <th key={'thead' + header.column}>{header.name}</th>
                            )
                        }
                        <th colSpan="100%">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        items.length > 0 ?
                            items.map(item =>
                                <tr key={item.id}>
                                    {
                                        headers.map(header =>
                                            <td key={'tbody' + header.column}>{item[header.column]}</td>
                                        )
                                    }
                                    <td>
                                        <a href="#" onClick={e => showEditModalFunction(e, item)}>Edit</a>
                                    </td>
                                    <td>
                                        <a href="#" onClick={e => { e.preventDefault(); deleteItem(item.id) }}>Remove</a>
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
            <Modal showModal={showAddModal} hideModal={() => setShowAddModal(false)}>
                <form onSubmit={addItem}>
                    {
                        headers.map((header, index) =>
                            <div key={'add' + header.column} className={index > 0 ? 'mt-0_5em' : null}>
                                <div className="label">{header.name}</div>
                                <div>
                                    {
                                        header.inputType === 'select' ?
                                        <select
                                            required={header.required}
                                            autoFocus={index === 0}
                                            onChange={e => addObj[header.column] = e.target.value}
                                            className="w-100p"
                                        >
                                            {
                                                header.selectData.map(item => (
                                                    <option value={item.value}>{item.label}</option>
                                                ))
                                            }
                                        </select>
                                        :
                                        <input type={header.inputType} required={header.required} autoFocus={index === 0}  onInput={e => addObj[header.column] = e.target.value}></input>
                                    }
                                </div>
                            </div>
                        )
                    }
                    <button className="mt-1em">Add</button>
                </form>
            </Modal>
            <Modal showModal={showEditModal} hideModal={() => setShowEditModal(false)}>
                <form onSubmit={updateItem}>
                    {
                        headers.map((header, index) =>
                            <div key={'edit' + header.column} className={index > 0 ? 'mt-0_5em' : null}>
                                <div className="label">{header.name}</div>
                                <div>
                                    {
                                        header.inputType === 'select' ?
                                        <select
                                            required={header.required}
                                            autoFocus={index === 0}
                                            onChange={e => setObjectProperty(header.column, e.target.value, setEditObj)}
                                            value={editObj[header.column]}
                                            className="w-100p"
                                        >
                                            {
                                                header.selectData.map(item => (
                                                    <option value={item.value}>{item.label}</option>
                                                ))
                                            }
                                        </select>
                                        :
                                        <input
                                            type={header.inputType}
                                            required={header.required}
                                            autoFocus={index === 0}
                                            onChange={e => setObjectProperty(header.column, e.target.value, setEditObj)}
                                            value={editObj[header.column]}
                                        ></input>
                                    }
                                </div>
                            </div>
                        )
                    }
                    <button className="mt-1em">Update</button>
                </form>
            </Modal>
        </Container>
    )
}
