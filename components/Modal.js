export default function Modal({ children, showModal, hideModal }) {
    if(showModal) {
        return (
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
