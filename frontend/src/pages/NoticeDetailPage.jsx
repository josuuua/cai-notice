function NoticeDetailPage({
  notice,
  isSaved,
  onBack,
  onSaveNotice,
  onRegisterSchedule,
}) {
  if (!notice) {
    return (
      <main className="app detail-page">
        <section className="detail-panel">
          <h1>공지 정보를 찾을 수 없습니다.</h1>
          <button type="button" className="secondary-action" onClick={onBack}>
            뒤로가기
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app detail-page">
      <article className="detail-panel">
        <button type="button" className="back-button" onClick={onBack}>
          뒤로가기
        </button>

        <header className="detail-header">
          <span className="category-badge">{notice.category}</span>
          <h1>{notice.title}</h1>
          <dl className="detail-meta">
            <div>
              <dt>학과</dt>
              <dd>{notice.department}</dd>
            </div>
            <div>
              <dt>작성일</dt>
              <dd>{notice.postedDate}</dd>
            </div>
            <div>
              <dt>출처</dt>
              <dd>{notice.source}</dd>
            </div>
          </dl>
        </header>

        {isSaved ? (
          <div className="status-banner">이미 저장된 공지입니다.</div>
        ) : null}

        <div className="notice-content">
          {notice.content.split('\n').map((paragraph, index) => (
            <p key={`${notice.id}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className={isSaved ? 'secondary-action muted-action' : 'primary-action'}
            onClick={() => onSaveNotice(notice.id)}
            disabled={isSaved}
          >
            {isSaved ? '저장됨' : '저장'}
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => onRegisterSchedule(notice.id)}
          >
            일정 등록
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => window.open(notice.originalUrl, '_blank', 'noreferrer')}
          >
            원본 공지 확인
          </button>
        </div>
      </article>
    </main>
  )
}

export default NoticeDetailPage
