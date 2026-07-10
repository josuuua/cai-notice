function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="닫기"
            onClick={onClose}
          >
            X
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export default Modal
