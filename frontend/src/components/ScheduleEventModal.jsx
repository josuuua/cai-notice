import { useState } from 'react'
import Modal from './Modal'

function ScheduleEventModal({ notice, event, onClose, onSubmit }) {
  const [title, setTitle] = useState(event?.title ?? `${notice.title} 일정`)
  const [startDate, setStartDate] = useState(event?.startDate ?? '')
  const [endDate, setEndDate] = useState(event?.endDate ?? '')
  const [memo, setMemo] = useState(event?.memo ?? '')

  function handleSubmit(submitEvent) {
    submitEvent.preventDefault()
    onSubmit({
      id: event?.id,
      noticeId: notice.id,
      title,
      startDate,
      endDate: endDate || startDate,
      memo,
    })
  }

  return (
    <Modal title={event ? '일정 수정' : '일정 등록'} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-notice-title">
          <span>연결 공지</span>
          <strong>{notice.title}</strong>
        </div>

        <label className="form-field">
          <span>일정 제목</span>
          <input
            type="text"
            value={title}
            onChange={(inputEvent) => setTitle(inputEvent.target.value)}
            required
          />
        </label>

        <div className="form-grid">
          <label className="form-field">
            <span>시작일</span>
            <input
              type="date"
              value={startDate}
              onChange={(inputEvent) => setStartDate(inputEvent.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>종료일</span>
            <input
              type="date"
              value={endDate}
              onChange={(inputEvent) => setEndDate(inputEvent.target.value)}
            />
          </label>
        </div>

        <label className="form-field">
          <span>메모</span>
          <textarea
            rows="3"
            value={memo}
            onChange={(inputEvent) => setMemo(inputEvent.target.value)}
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="secondary-action" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="primary-action">
            저장
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ScheduleEventModal
