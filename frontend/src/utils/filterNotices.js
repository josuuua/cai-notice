export function filterNotices({
  notices,
  searchKeyword,
  selectedCategory,
  activeTab,
  selectedDepartment,
}) {
  const keyword = searchKeyword.trim().toLowerCase()

  return notices.filter((notice) => {
    const matchesTab =
      activeTab === 'all' ||
      notice.department === '전체' ||
      notice.department === selectedDepartment

    const matchesCategory =
      selectedCategory === '전체' || notice.category === selectedCategory

    const searchableText = [
      notice.title,
      notice.content,
      notice.category,
      notice.department,
      notice.source,
    ]
      .join(' ')
      .toLowerCase()

    const matchesKeyword = keyword === '' || searchableText.includes(keyword)

    return matchesTab && matchesCategory && matchesKeyword
  })
}
