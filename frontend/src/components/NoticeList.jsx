import EmptyState from './EmptyState'
import NoticeCard from './NoticeCard'

function NoticeList({ notices }) {
  if (notices.length === 0) {
    return <EmptyState />
  }

  return (
    <ul className="notice-list">
      {notices.map((notice) => (
        <li key={notice.id}>
          <NoticeCard notice={notice} />
        </li>
      ))}
    </ul>
  )
}

export default NoticeList
