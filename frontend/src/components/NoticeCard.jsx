import { createContentPreview } from '../utils/filterNotices'

function NoticeCard({
  notice,
  isSaved = false,
  folderName,
  memo,
  onView,
  onSave,
  onOriginal,
  children,
}) {
  return (
    <article className="notice-card">
      <div className="notice-card-main">
        <div className="notice-card-heading">
          <span className="category-badge">{notice.category}</span>
          {isSaved ? <span className="saved-badge">저장됨</span> : null}
        </div>

        <button type="button" className="notice-title-button" onClick={onView}>
          {notice.title}
        </button>

        <p className="notice-preview">{createContentPreview(notice.content)}</p>

        <dl className="notice-meta-list">
          <div>
            <dt>작성일</dt>
            <dd>{notice.postedDate}</dd>
          </div>
          <div>
            <dt>학과</dt>
            <dd>{notice.department}</dd>
          </div>
          <div>
            <dt>출처</dt>
            <dd>{notice.source}</dd>
          </div>
          {folderName ? (
            <div>
              <dt>폴더</dt>
              <dd>{folderName}</dd>
            </div>
          ) : null}
          {memo ? (
            <div>
              <dt>메모</dt>
              <dd>{memo}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="card-actions">
        {onSave ? (
          <button
            type="button"
            className={isSaved ? 'secondary-action muted-action' : 'primary-action'}
            onClick={onSave}
            disabled={isSaved}
          >
            {isSaved ? '저장됨' : '저장'}
          </button>
        ) : null}
        <button type="button" className="secondary-action" onClick={onView}>
          자세히 보기
        </button>
        <button type="button" className="secondary-action" onClick={onOriginal}>
          원본 공지 확인
        </button>
      </div>

      {children ? <div className="notice-card-extra">{children}</div> : null}
    </article>
  )
}

export default NoticeCard
