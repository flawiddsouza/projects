import { useState } from 'react'
import Modal from 'Components/Modal'

export default function Master({ Container, headers, itemName }) {
    const [ showAddModal, setShowAddModal ] = useState(false)
    const [ showEditModal, setShowEditModal ] = useState(false)
    const [ items, setItems ] = useState([])
    let addObj = {}
    const [ editObj, setEditObj ] = useState({})

    function Nav() {
        return (
            <a className="c-i" href="#" onClick={(e) => { e.preventDefault(); setShowAddModal(true) }}>+ Add {itemName}</a>
        )
    }

    function addItem(e) {
        e.preventDefault()
        addObj.id = new Date().getTime()
        setItems(items.concat([JSON.parse(JSON.stringify(addObj))]))
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

    function updateItem(e) {
        e.preventDefault()
        let itemsCopy = JSON.parse(JSON.stringify(items))
        let item = itemsCopy.find(item => item.id === editObj.id)
        headers.forEach(header => {
            item[header.column] = editObj[header.column]
        })
        setItems(itemsCopy)
        setShowEditModal(false)
        setEditObj({})
    }

    function deleteItem(id) {
        if(confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id))
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
                                        header.inputType === 'text' &&
                                        <input type="text" required={header.required} autoFocus={index === 0}  onInput={e => addObj[header.column] = e.target.value}></input>
                                    }
                                    {
                                        header.inputType === 'password' &&
                                        <input type="password" required={header.required} onInput={e => addObj[header.column] = e.target.value}></input>
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
                                        header.inputType === 'text' &&
                                        <input type="text" required={header.required} autoFocus={index === 0}  onChange={e => setObjectProperty(header.column, e.target.value, setEditObj)} value={editObj[header.column]}></input>
                                    }
                                    {
                                        header.inputType === 'password' &&
                                        <input type="password" required={header.required} onChange={e => setObjectProperty(header.column, e.target.value, setEditObj)} value={editObj[header.column]}></input>
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
