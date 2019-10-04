import { useState, useEffect } from 'react'
import api from 'Libs/esm/api'

export default function TaskViewChecklist({ taskId, checklistId, setChecklistCount=null, tabsContentHeight=null }) {
    const [ checklistItems, setChecklistItems ] = useState([])
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)
    const [ newChecklistItemContent, setNewChecklistItemContent ] = useState('')

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
                {
                    checklistItems.map(checklistItem =>
                        <div key={checklistItem.id} className="pb-0_75em">
                            <label className="d-f flex-ai-c">
                                <input type="checkbox" checked={checklistItem.checked} onChange={e => updateChecked(checklistItem.id, e.target.checked)}></input>
                                <span className="ml-0_5em">{checklistItem.content}</span>
                            </label>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
