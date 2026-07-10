function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="primary-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

export default EmptyState
