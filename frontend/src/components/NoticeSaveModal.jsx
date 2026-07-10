import { useState } from 'react'
import Modal from './Modal'

function NoticeSaveModal({ notice, folders, onClose, onSubmit, onCreateFolder }) {
  const defaultFolder = folders.find((folder) => folder.isDefault)
  const [folderId, setFolderId] = useState(defaultFolder?.id ?? '')
  const [memo, setMemo] = useState('')
  const [createFolderName, setCreateFolderName] = useState('')
  const [withSchedule, setWithSchedule] = useState(false)
  const [eventTitle, setEventTitle] = useState(`${notice.title} 일정`)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [eventMemo, setEventMemo] = useState('')
  const selectedFolderId = folders.some((folder) => folder.id === folderId)
    ? folderId
    : defaultFolder?.id ?? folders[0]?.id ?? ''

  function handleCreateFolder() {
    const createdFolder = onCreateFolder(createFolderName)
    if (createdFolder) {
      setFolderId(createdFolder.id)
      setCreateFolderName('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    let targetFolderId = selectedFolderId

    if (createFolderName.trim()) {
      const createdFolder = onCreateFolder(createFolderName)
      if (createdFolder) {
        targetFolderId = createdFolder.id
      }
    }

    onSubmit({
      noticeId: notice.id,
      folderId: targetFolderId,
      memo,
      schedule:
        withSchedule && startDate
          ? {
              title: eventTitle || notice.title,
              startDate,
              endDate: endDate || startDate,
              memo: eventMemo,
            }
          : null,
    })
  }

  return (
    <Modal title="공지 저장" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-notice-title">{notice.title}</div>

        <label className="form-field">
          <span>저장할 폴더</span>
          <select
            value={selectedFolderId}
            onChange={(event) => setFolderId(event.target.value)}
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-form">
          <label className="form-field">
            <span>새 폴더 이름</span>
            <input
              type="text"
              value={createFolderName}
              onChange={(event) => setCreateFolderName(event.target.value)}
              placeholder="예: 장학 공지"
            />
          </label>
          <button
            type="button"
            className="secondary-action"
            onClick={handleCreateFolder}
            disabled={!createFolderName.trim()}
          >
            새 폴더 만들기
          </button>
        </div>

        <label className="form-field">
          <span>메모</span>
          <textarea
            rows="3"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="나중에 확인할 내용을 적어두세요."
          />
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={withSchedule}
            onChange={(event) => setWithSchedule(event.target.checked)}
          />
          <span>이 공지의 마감일 또는 신청 기간을 내 일정에 등록</span>
        </label>

        {withSchedule ? (
          <div className="schedule-fields">
            <label className="form-field">
              <span>일정 제목</span>
              <input
                type="text"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
              />
            </label>
            <div className="form-grid">
              <label className="form-field">
                <span>시작일</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required={withSchedule}
                />
              </label>
              <label className="form-field">
                <span>종료일</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            </div>
            <label className="form-field">
              <span>일정 메모</span>
              <textarea
                rows="3"
                value={eventMemo}
                onChange={(event) => setEventMemo(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        <div className="modal-actions">
          <button type="button" className="secondary-action" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="primary-action">
            저장하기
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default NoticeSaveModal
