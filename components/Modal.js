export default function Modal({ children, showModal, hideModal, inner=true }) {
    if(showModal) {
        return (
            !inner ?
            <div>
                <div className="modal-background d-f flex-jc-c flex-ai-c" onClick={e => { if(!e.target.closest('.modal')) { hideModal() } }}>
                    <dialog open className="modal top-0 pos-r">
                        { children }
                    </dialog>
                </div>
            </div>
            :
            <div>
                <div className="modal-background" onClick={hideModal}></div>
                <dialog open className="modal">
                    { children }
                </dialog>
            </div>
        )
    } else {
        return null
    }
}
