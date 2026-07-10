import { useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import NoticeCard from '../components/NoticeCard'
import { getNoticeById } from '../services/noticeService'

function SavedNoticesPage({
  folders,
  savedNotices,
  onGoNotices,
  onGoSchedule,
  onOpenFolderManage,
  onViewNotice,
  onUpdateSavedNotice,
  onDeleteSavedNotice,
}) {
  const [activeFolderId, setActiveFolderId] = useState('all')
  const [editingMemoId, setEditingMemoId] = useState(null)
  const [memoDraft, setMemoDraft] = useState('')

  const folderById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  )

  const savedNoticeItems = useMemo(
    () =>
      savedNotices
        .map((savedNotice) => ({
          savedNotice,
          notice: getNoticeById(savedNotice.noticeId),
          folder: folderById.get(savedNotice.folderId),
        }))
        .filter((item) => item.notice),
    [folderById, savedNotices],
  )

  const visibleItems =
    activeFolderId === 'all'
      ? savedNoticeItems
      : savedNoticeItems.filter(
          (item) => item.savedNotice.folderId === activeFolderId,
        )

  function startMemoEdit(savedNotice) {
    setEditingMemoId(savedNotice.id)
    setMemoDraft(savedNotice.memo)
  }

  function saveMemo(savedNoticeId) {
    onUpdateSavedNotice(savedNoticeId, { memo: memoDraft })
    setEditingMemoId(null)
    setMemoDraft('')
  }

  return (
    <main className="app workspace-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">내 공지함</p>
          <h1>저장한 공지를 폴더별로 관리하세요.</h1>
        </div>
        <nav className="page-actions" aria-label="주요 이동">
          <button type="button" className="secondary-action" onClick={onGoNotices}>
            공지 목록
          </button>
          <button type="button" className="secondary-action" onClick={onGoSchedule}>
            내 일정
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={onOpenFolderManage}
          >
            폴더 관리
          </button>
        </nav>
      </header>

      <div className="workspace-layout">
        <aside className="folder-sidebar" aria-label="폴더 목록">
          <button
            type="button"
            className={activeFolderId === 'all' ? 'active' : ''}
            onClick={() => setActiveFolderId('all')}
          >
            전체 저장 공지
            <span>{savedNoticeItems.length}</span>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              className={activeFolderId === folder.id ? 'active' : ''}
              onClick={() => setActiveFolderId(folder.id)}
            >
              {folder.name}
              <span>
                {
                  savedNoticeItems.filter(
                    (item) => item.savedNotice.folderId === folder.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </aside>

        <section className="workspace-content" aria-label="저장 공지 목록">
          {visibleItems.length === 0 ? (
            <EmptyState
              title="아직 저장한 공지가 없습니다."
              description="관심 있는 공지를 저장하면 이곳에서 다시 확인할 수 있어요."
              actionLabel="공지 보러 가기"
              onAction={onGoNotices}
            />
          ) : (
            <ul className="notice-list">
              {visibleItems.map(({ savedNotice, notice, folder }) => (
                <li key={savedNotice.id}>
                  <NoticeCard
                    notice={notice}
                    isSaved
                    folderName={folder?.name}
                    memo={savedNotice.memo}
                    onView={() => onViewNotice(notice.id)}
                    onOriginal={() =>
                      window.open(notice.originalUrl, '_blank', 'noreferrer')
                    }
                  >
                    <div className="saved-controls">
                      <label className="form-field compact-field">
                        <span>폴더 이동</span>
                        <select
                          value={savedNotice.folderId}
                          onChange={(event) =>
                            onUpdateSavedNotice(savedNotice.id, {
                              folderId: event.target.value,
                            })
                          }
                        >
                          {folders.map((folderOption) => (
                            <option key={folderOption.id} value={folderOption.id}>
                              {folderOption.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      {editingMemoId === savedNotice.id ? (
                        <div className="memo-editor">
                          <textarea
                            rows="3"
                            value={memoDraft}
                            onChange={(event) => setMemoDraft(event.target.value)}
                          />
                          <div className="row-actions">
                            <button
                              type="button"
                              className="primary-action"
                              onClick={() => saveMemo(savedNotice.id)}
                            >
                              메모 저장
                            </button>
                            <button
                              type="button"
                              className="secondary-action"
                              onClick={() => setEditingMemoId(null)}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="secondary-action"
                            onClick={() => startMemoEdit(savedNotice)}
                          >
                            메모 수정
                          </button>
                          <button
                            type="button"
                            className="danger-action"
                            onClick={() => onDeleteSavedNotice(savedNotice.id)}
                          >
                            저장 취소
                          </button>
                        </div>
                      )}
                    </div>
                  </NoticeCard>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default SavedNoticesPage
