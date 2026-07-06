function NoticeTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="notice-tabs" role="tablist" aria-label="공지 탭">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default NoticeTabs
