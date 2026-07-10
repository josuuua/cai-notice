import EmptyState from './EmptyState'
import NoticeCard from './NoticeCard'

function NoticeList({ notices, savedNoticeIds, onViewNotice, onSaveNotice }) {
  if (notices.length === 0) {
    return (
      <EmptyState
        title="검색 결과가 없습니다."
        description="다른 키워드로 다시 검색해보세요."
      />
    )
  }

  return (
    <ul className="notice-list">
      {notices.map((notice) => (
        <li key={notice.id}>
          <NoticeCard
            notice={notice}
            isSaved={savedNoticeIds.has(notice.id)}
            onView={() => onViewNotice(notice.id)}
            onSave={() => onSaveNotice(notice.id)}
            onOriginal={() => window.open(notice.originalUrl, '_blank', 'noreferrer')}
          />
        </li>
      ))}
    </ul>
  )
}

export default NoticeList
