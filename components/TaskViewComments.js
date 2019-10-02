import { createRef, useState, useEffect } from 'react'
import Modal from 'Components/Modal'
import urlifyText from 'Libs/esm/urlifyText'

export default function TaskViewComments({ setCommentsCount }) {
    const [ comment, setComment ] = useState('')
    const [ comments, setComments ] = useState([])
    const [ updateCommentId, setUpdateCommentId ] = useState(null)
    const [ updateCommentData, setUpdateCommentData ] = useState(null)
    const commentsContainer = createRef()

    useEffect(() => {
        setComments([
            {
                id: 1,
                user: 'Flawid',
                comment: 'Hello'
            },
            {
                id: 2,
                user: 'Keerthan',
                comment: 'Hi'
            },
            {
                id: 3,
                user: 'Deepa',
                comment: 'Test'
            }
        ])
    }, [])

    useEffect(() => {
        setCommentsCount(comments.length)
    }, [comments])

    function handleAddCommentKeydown(e) {
        if(e.altKey && e.key === 'Enter') {
            e.target.value = e.target.value + '\n'
            e.target.scrollTop = e.target.scrollHeight
            return
        }

        if(e.key === 'Enter') {
            e.preventDefault()
            addComment()
        }
    }

    function addComment() {
        if(comment) {
            let pushArray = [{
                id: new Date().getTime(),
                user: 'Deepa',
                comment
            }]
            setComment('')
            setComments(comments.concat(pushArray))
            let commentsContainer2 = commentsContainer.current
            setTimeout(() => {
                commentsContainer2.scrollTop = commentsContainer2.scrollHeight
            }, 0)
        }
    }

    function startCommentUpdate(e, comment) {
        e.preventDefault()
        setUpdateCommentData(comment.comment)
        setUpdateCommentId(comment.id)
    }

    function updateComment(e) {
        e.preventDefault()
        // updateCommentId
        // updateCommentData
        cancelUpdateComment()
    }

    function cancelUpdateComment() {
        setUpdateCommentData(null)
        setUpdateCommentId(null)
    }

    function removeComment(e, comment) {
        e.preventDefault()
        if(confirm('Are you sure you want to delete this comment?')) {
            setComments(comments.filter(item => item.id !== comment.id))
        }
    }

    function setFocusToEndOfInput(e) {
        let val = e.target.value
        e.target.value = ''
        e.target.value = val
    }

    return (
        <div className="d-f flex-d-c flex-jc-sb h-100p">
            <div className="oy-a" style={{ maxHeight: '14em' }} ref={commentsContainer}>
            {
                comments.map((commentItem, index) =>
                    <div key={commentItem.id} className={`${index > 0 ? 'mt-0_75em' : ''} hover-background-color hover-show-child-parent`}>
                        <div className="label d-f flex-jc-sb">
                            <div>{commentItem.user}</div>
                            <div className="mr-0_5em hover-show-child">
                                <a href="#" onClick={e => startCommentUpdate(e, commentItem)}>
                                    <img src="/static/assets/pencil.svg" style={{ width: '15px', height: '15px'  }}></img>
                                </a>
                                <a href="#" className="ml-0_5em" onClick={e => removeComment(e, commentItem)}>
                                    <img src="/static/assets/delete.svg" style={{ width: '15px', height: '15px'  }}></img>
                                </a>
                            </div>
                        </div>
                        <div className="mt-0_25em ws-pw" dangerouslySetInnerHTML={{__html: urlifyText(commentItem.comment) }}></div>
                    </div>
                )
            }
            </div>
            <form onSubmit={addComment} className="mt-1em">
                <textarea className="w-100p r-n" value={comment} onChange={e => setComment( e.target.value)} onKeyDown={handleAddCommentKeydown} style={{ height: '3.5em' }}></textarea>
                <div className="mt-0_5em">
                    <div>Attach Files</div>
                    <input type="file" mutliple="true" />
                </div>
                <button className="mt-1em">Add Comment</button>
            </form>
            <Modal showModal={updateCommentId !== null} hideModal={() => cancelUpdateComment()}>
                <form onSubmit={updateComment} style={{ width: '50em' }}>
                    <div>Edit Comment</div>
                    <div className="mt-0_5em">
                        <textarea value={updateCommentData} onChange={e => setUpdateCommentData(e.target.value)} autoFocus className="w-100p" style={{ height: '3.5em' }} onFocus={setFocusToEndOfInput} required></textarea>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
