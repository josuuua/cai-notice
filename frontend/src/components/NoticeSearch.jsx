function NoticeSearch({ value, onChange }) {
  return (
    <div className="notice-search">
      <label htmlFor="notice-search">공지 검색</label>
      <input
        id="notice-search"
        type="search"
        placeholder="공지 검색하기..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default NoticeSearch
