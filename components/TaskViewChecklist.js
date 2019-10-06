import { useState, useEffect } from 'react'
import api from 'Libs/esm/api'
import formatDateTime from 'Libs/formatDateTime.js'
import Modal from 'Components/Modal'

export default function TaskViewChecklist({ taskId, checklistId, setChecklistCount=null, tabsContentHeight=null }) {
    const [ checklistItems, setChecklistItems ] = useState([])
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)
    const [ newChecklistItemContent, setNewChecklistItemContent ] = useState('')
    const [ updateChecklistItemData, setUpdateChecklistItemData ] = useState(null)
    const [ updateChecklistItemId, setUpdateChecklistItemId ] = useState(null)

    async function fetchChecklistItems() {
        const checklistItems = await api.get(`task/${taskId}/checklist-items/${checklistId}`).json()
        setIntialLoadComplete(true)
        setChecklistItems(checklistItems)
    }

    function addChecklistItem(e) {
        e.preventDefault()
        api.post(`task/${taskId}/checklist-item/${checklistId}`, {
            json: {
                content: newChecklistItemContent,
                sort_order: checklistItems.length + 1
            }
        }).then(() => {
            fetchChecklistItems()
        })
        setNewChecklistItemContent('')
    }

    async function updateChecked(id, checked) {
        await api.put(`task/${taskId}/checklist-item/${id}/checked`, {
            json: {
                checked: checked ? 1 : 0
            }
        })
        fetchChecklistItems()
    }

    function startChecklistItemUpdate(e, checklistItem) {
        e.preventDefault()
        setUpdateChecklistItemData(checklistItem.content)
        setUpdateChecklistItemId(checklistItem.id)
    }

    async function updateChecklistItem(e) {
        e.preventDefault()
        api.put(`task/${taskId}/checklist-item/${updateChecklistItemId}`, {
            json: {
                content: updateChecklistItemData
            }
        }).then(() => {
            fetchChecklistItems()
        })
        cancelUpdateChecklistItem()
    }

    function cancelUpdateChecklistItem() {
        setUpdateChecklistItemData('')
        setUpdateChecklistItemId(null)
    }

    async function removeChecklistItem(e, checklistItem) {
        e.preventDefault()
        if(confirm('Are you sure you want to delete this checklist item?')) {
            await api.delete(`task/${taskId}/checklist-item/${checklistItem.id}`)
            fetchChecklistItems()
        }
    }

    function setFocusToEndOfInput(e) {
        let val = e.target.value
        e.target.value = ''
        e.target.value = val
    }

    useEffect(() => {
        fetchChecklistItems()
    }, [])

    useEffect(() => {
        if(initialLoadComplete) {
            setChecklistCount(checklistId, {
                checked: checklistItems.filter(item => item.checked).length,
                count: checklistItems.length
            })
        }
    }, [checklistItems])

    return (
        <div>
            <form className="d-f mb-1em" onSubmit={addChecklistItem}>
                <input
                    type="text"
                    className="w-100p"
                    required
                    value={newChecklistItemContent}
                    onChange={e => setNewChecklistItemContent(e.target.value)}
                />
                <button className="ws-nw ml-1em">Add to List</button>
            </form>
            <div className="oy-a" style={{ maxHeight: tabsContentHeight ? 'calc('+tabsContentHeight+' - 4em)' : '21em' }}>
                <div className="mt-1em"></div>
                {
                    checklistItems.map((checklistItem, index) =>
                        <div key={checklistItem.id}>
                            <div className="hover-background-color pos-r hover-show-child-parent">
                                <label className="d-f flex-ai-c p-1em">
                                    <input type="checkbox" checked={checklistItem.checked} onChange={e => updateChecked(checklistItem.id, e.target.checked)}></input>
                                    <span className="ml-0_5em">{checklistItem.content}</span>
                                </label>
                                <div className="pos-a" style={{ top: '0', right: '0' }}>
                                    <div className="hover-show-child d-f" style={{ position: 'absolute', top: '-13px', 'right': '20px' }}>
                                        <a href="#" onClick={e => startChecklistItemUpdate(e, checklistItem)}>
                                            <img src="/static/assets/pencil.svg" style={{ width: '15px', height: '15px', padding: '0.5em', backgroundColor: 'white', border: '1px solid black' }}></img>
                                        </a>
                                        <a href="#" className="ml-1em" onClick={e => removeChecklistItem(e, checklistItem)}>
                                            <img src="/static/assets/delete.svg" style={{ width: '15px', height: '15px', padding: '0.5em', backgroundColor: 'white', border: '1px solid black' }}></img>
                                        </a>
                                    </div>
                                    <div className="hover-hide-child mr-0_5em mt-0_25em label">{formatDateTime(checklistItem.created_at)}</div>
                                </div>
                            </div>
                            <div style={{ borderBottom: index < (checklistItems.length - 1) ? '1px solid lightgrey' : '' }}></div>
                        </div>
                    )
                }
            </div>
            <Modal showModal={updateChecklistItemId !== null} hideModal={() => cancelUpdateChecklistItem()}>
                <form onSubmit={updateChecklistItem} style={{ width: '50em' }}>
                    <div>Edit Checklist Item</div>
                    <div className="mt-0_5em">
                        <textarea value={updateChecklistItemData} onChange={e => setUpdateChecklistItemData(e.target.value)} autoFocus className="w-100p" style={{ height: '3.5em' }} onFocus={setFocusToEndOfInput} required></textarea>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
