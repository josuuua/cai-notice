import { useMemo, useState } from 'react'
import CategoryFilter from '../components/CategoryFilter'
import NoticeList from '../components/NoticeList'
import NoticeSearch from '../components/NoticeSearch'
import NoticeTabs from '../components/NoticeTabs'
import { categories, noticeTabs } from '../constants/noticeOptions'
import { filterNotices } from '../utils/filterNotices'

function NoticeListPage({
  notices,
  savedNotices,
  selectedDepartment,
  onBackToHome,
  onViewNotice,
  onSaveNotice,
  onGoSaved,
  onGoSchedule,
}) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredNotices = useMemo(
    () =>
      filterNotices({
        notices,
        searchKeyword,
        selectedCategory,
        activeTab,
        selectedDepartment,
      }),
    [activeTab, notices, searchKeyword, selectedCategory, selectedDepartment],
  )

  const savedNoticeIds = useMemo(
    () => new Set(savedNotices.map((savedNotice) => savedNotice.noticeId)),
    [savedNotices],
  )

  const activeTabLabel =
    noticeTabs.find((tab) => tab.id === activeTab)?.label ?? '공지'

  return (
    <main className="app notice-page">
      <header className="page-header notice-header">
        <div>
          <p className="eyebrow">공지 목록</p>
          <h1>필요한 공지를 찾고 저장하세요.</h1>
          <p>
            {selectedDepartment} 기준으로 전체 공지와 내 학과 공지를 확인할 수
            있습니다.
          </p>
        </div>
        <nav className="page-actions" aria-label="주요 이동">
          <button type="button" className="secondary-action" onClick={onGoSaved}>
            내 공지함
          </button>
          <button type="button" className="secondary-action" onClick={onGoSchedule}>
            내 일정
          </button>
          <button type="button" className="secondary-action" onClick={onBackToHome}>
            학과 변경
          </button>
        </nav>
      </header>

      <section className="notice-controls" aria-label="공지 검색 및 필터">
        <NoticeSearch value={searchKeyword} onChange={setSearchKeyword} />
        <NoticeTabs
          tabs={noticeTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      <section className="notice-section" aria-labelledby="notice-list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeTabLabel}</p>
            <h2 id="notice-list-title">공지 카드 목록</h2>
          </div>
          <p>{filteredNotices.length}개의 공지</p>
        </div>
        <NoticeList
          notices={filteredNotices}
          savedNoticeIds={savedNoticeIds}
          onViewNotice={onViewNotice}
          onSaveNotice={onSaveNotice}
        />
      </section>
    </main>
  )
}

export default NoticeListPage
