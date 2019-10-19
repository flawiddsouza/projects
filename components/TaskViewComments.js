import { createRef, useState, useEffect, Fragment } from 'react'
import Modal from 'Components/Modal'
import urlifyText from 'Libs/esm/urlifyText'
import api from 'Libs/esm/api'
import formatDateTime from 'Libs/formatDateTime.js'
import bytesToHumanReadableFileSize from 'Libs/esm/bytesToHumanReadableFileSize'
import Select from 'react-select'

export default function TaskViewComments({ taskId, setCommentsCount, tabsContentHeight=null, taskCompleted }) {
    const [ comment, setComment ] = useState('')
    const [ comments, setComments ] = useState([])
    const [ updateCommentId, setUpdateCommentId ] = useState(null)
    const [ updateCommentData, setUpdateCommentData ] = useState(null)
    const [ initialLoadComplete, setIntialLoadComplete ] = useState(false)
    const [ addingComment, setAddingComment ] = useState(false)
    const commentsContainer = createRef()
    const fileInput = createRef()
    const [ scrollCommentsToBottom, setScrollCommentsToBottom ] = useState(true)
    const [ assignedUsers, setAssignedUsers ] = useState([])
    const [ commentNotifyList, setCommentNotifyList ] = useState([])

    async function fetchComments() {
        const comments = await api.get(`task/${taskId}/comments`).json()
        setIntialLoadComplete(true)
        setComments(comments)
    }

    async function fetchAssignedUsers() {
        let { assignedUsers } = await api.get(`task/${taskId}/assigned-users`).json()
        assignedUsers = assignedUsers.filter(item => !item.you).map(item => {
            return {
                label: item.user,
                value: item.user_id
            }
        })
        setAssignedUsers(assignedUsers)
        setCommentNotifyList(assignedUsers)
    }

    useEffect(() => {
        fetchComments()
        fetchAssignedUsers()
    }, [])

    useEffect(() => {
        if(initialLoadComplete) {
            setCommentsCount(comments.length)
        }

        if(scrollCommentsToBottom) {
            let commentsContainer2 = commentsContainer.current
            setTimeout(() => {
                commentsContainer2.scrollTop = commentsContainer2.scrollHeight
            }, 0)
            setScrollCommentsToBottom(false)
        }
    }, [comments])

    function handleAddCommentKeydown(e) {
        if(e.ctrlKey && e.key === 'Enter') { // Add comment on Ctrl + Enter
            e.preventDefault()
            addComment(e)
            return
        }

        if(e.target.value === '@all') {
            e.preventDefault()
            setCommentNotifyList(assignedUsers)
            setComment('')
        }
    }

    async function addComment(e) {
        e.preventDefault()

        const fileInputElement = fileInput.current
        const filesCount = fileInputElement.files.length

        if(comment || filesCount > 0) {
            if(filesCount > 0) {
                setAddingComment(true)
            }

            const { data: response } = await api.post(`task/${taskId}/comment`, {
                json: {
                    comment: comment !== '' ? comment : null,
                    notifyUserIds: commentNotifyList.map(item => item.value)
                }
            }).json()

            if(fileInputElement.files.length > 0) {
                const formData = new FormData()

                for(const file of fileInputElement.files) {
                    formData.append('files', file)
                }

                await api.post(`task/${taskId}/comment-files/${response.insertedId}`, {
                    body: formData
                })
            }

            setComment('')

            fileInputElement.value = ''

            setScrollCommentsToBottom(true)
            fetchComments()

            if(filesCount > 0) {
                setAddingComment(false)
            }
        }
    }

    function startCommentUpdate(e, comment) {
        e.preventDefault()
        setUpdateCommentData(comment.comment)
        setUpdateCommentId(comment.id)
    }

    async function updateComment(e) {
        e.preventDefault()
        api.put(`task/${taskId}/comment/${updateCommentId}`, {
            json: {
                comment: updateCommentData
            }
        }).then(() => {
            fetchComments()
        })
        cancelUpdateComment()
    }

    function cancelUpdateComment() {
        setUpdateCommentData('')
        setUpdateCommentId(null)
    }

    async function removeComment(e, comment) {
        e.preventDefault()
        if(confirm('Are you sure you want to delete this comment?')) {
            await api.delete(`task/${taskId}/comment/${comment.id}`)
            fetchComments()
        }
    }

    function setFocusToEndOfInput(e) {
        let val = e.target.value
        e.target.value = ''
        e.target.value = val
    }

    return (
        <Fragment>
            <div className="d-f flex-d-c flex-jc-sb h-100p">
                <div className="oy-a" style={{ maxHeight: tabsContentHeight ? 'calc('+tabsContentHeight+' - 5em)' : '14em' }} ref={commentsContainer}>
                {
                    comments.map((commentItem, index) =>
                        <div key={commentItem.id}>
                            <div style={{ borderBottom: index > 0 ? '1px solid lightgrey' : '' }}></div>
                            <div className={`${index > 0 ? '' : 'mt-1em'} hover-background-color hover-show-child-parent p-1em`}>
                                <div className="label d-f flex-jc-sb">
                                    <div>{commentItem.user}</div>
                                    <div className="d-f" style={{ position: 'relative' }}>
                                        {
                                            !taskCompleted &&
                                            <div className="hover-show-child d-f" style={{ position: 'absolute', top: '-28px', 'left': '-76px' }}>
                                                <a href="#" onClick={e => startCommentUpdate(e, commentItem)}>
                                                    <img src="/static/assets/pencil.svg" style={{ width: '15px', height: '15px', padding: '0.5em', backgroundColor: 'white', border: '1px solid black' }}></img>
                                                </a>
                                                <a href="#" className="ml-1em" onClick={e => removeComment(e, commentItem)}>
                                                    <img src="/static/assets/delete.svg" style={{ width: '15px', height: '15px', padding: '0.5em', backgroundColor: 'white', border: '1px solid black' }}></img>
                                                </a>
                                            </div>
                                        }
                                        <div className={`${!taskCompleted ? 'hover-hide-child' : ''} mr-0_5em`}>{formatDateTime(commentItem.created_at)}</div>
                                    </div>
                                </div>
                                <div className="mt-0_25em ws-pw wb-bw" dangerouslySetInnerHTML={{__html: commentItem.comment ? urlifyText(commentItem.comment) : '' }}></div>
                                <table className={`table table-width-auto ${commentItem.files.length > 0 && 'mt-0_5em'}`}>
                                    <tbody>
                                    {
                                        commentItem.files.map(file =>
                                            <tr key={file.id}>
                                                <td><a href={`static/uploads/${file.saved_file_name}`} target="_blank">{file.original_file_name}</a></td>
                                                <td style={{ width: '5em' }}>{bytesToHumanReadableFileSize(file.file_size)}</td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
                </div>
                <form onSubmit={addComment} className="mt-1em">
                    <textarea className="w-100p r-n" value={comment} onChange={e => setComment( e.target.value)} onKeyDown={handleAddCommentKeydown} style={{ height: '3.5em' }} disabled={addingComment || taskCompleted}></textarea>
                    <div className="mt-0_5em">
                        <div>Attach Files</div>
                        <input type="file" multiple ref={fileInput} disabled={addingComment || taskCompleted} />
                    </div>
                    {
                        !addingComment ?
                        <div className="mt-1em pos-r">
                            <button disabled={taskCompleted}>Add Comment</button>
                            <div className="pos-a" style={{ top: '-33px', right: '2px' }}>
                                <div className="label">Notify By Email</div>
                                <div style={{ width: '30em' }}>
                                    <Select
                                        isMulti
                                        options={assignedUsers}
                                        menuPlacement="auto"
                                        isClearable={false}
                                        value={commentNotifyList}
                                        onChange={value => {
                                            if(value) {
                                                setCommentNotifyList(value)
                                            } else {
                                                setCommentNotifyList([])
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        :
                        <button className="mt-1em" disabled>Adding Comment...</button>
                    }
                </form>
            </div>
            <Modal showModal={updateCommentId !== null} hideModal={() => cancelUpdateComment()}>
                <form onSubmit={updateComment} style={{ width: '50em' }}>
                    <div>Edit Comment</div>
                    <div className="mt-0_5em">
                        <textarea value={updateCommentData} onChange={e => setUpdateCommentData(e.target.value)} autoFocus className="w-100p" style={{ height: '6em' }} onFocus={setFocusToEndOfInput} required></textarea>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </form>
            </Modal>
        </Fragment>
    )
}
