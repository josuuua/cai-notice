function NoticeCard({ notice }) {
  return (
    <article className="notice-card">
      <span className="category-badge">{notice.category}</span>
      <h3>{notice.title}</h3>

      <dl className="notice-meta-list">
        <div>
          <dt>작성일</dt>
          <dd>{notice.date}</dd>
        </div>
        <div>
          <dt>학과</dt>
          <dd>{notice.department}</dd>
        </div>
        <div>
          <dt>출처</dt>
          <dd>{notice.source}</dd>
        </div>
      </dl>

      <a href={notice.url} target="_blank" rel="noreferrer">
        원본 공지 보기
      </a>
    </article>
  )
}

export default NoticeCard
