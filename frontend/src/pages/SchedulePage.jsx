import { useMemo } from 'react'
import EmptyState from '../components/EmptyState'
import { getNoticeById } from '../services/noticeService'

function SchedulePage({
  scheduleEvents,
  onGoNotices,
  onGoSaved,
  onViewNotice,
  onEditEvent,
  onDeleteEvent,
}) {
  const eventItems = useMemo(
    () =>
      scheduleEvents
        .map((event) => ({
          event,
          notice: getNoticeById(event.noticeId),
        }))
        .filter((item) => item.notice)
        .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate)),
    [scheduleEvents],
  )

  return (
    <main className="app workspace-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">내 일정</p>
          <h1>마감 일정 목록</h1>
          <p>마감일과 신청 기간을 날짜순으로 확인합니다.</p>
        </div>
        <nav className="page-actions" aria-label="주요 이동">
          <button type="button" className="secondary-action" onClick={onGoNotices}>
            공지 목록
          </button>
          <button type="button" className="secondary-action" onClick={onGoSaved}>
            내 공지함
          </button>
        </nav>
      </header>

      <section className="schedule-list-section">
        {eventItems.length === 0 ? (
          <EmptyState
            title="등록된 일정이 없습니다."
            description="마감일이 있는 공지를 일정으로 등록해보세요."
          />
        ) : (
          <ul className="schedule-list">
            {eventItems.map(({ event, notice }) => (
              <li key={event.id} className="schedule-card">
                <div className="schedule-date">
                  {event.startDate === event.endDate
                    ? event.startDate
                    : `${event.startDate} ~ ${event.endDate}`}
                </div>
                <h2>{event.title}</h2>
                <button
                  type="button"
                  className="linked-notice-button"
                  onClick={() => onViewNotice(notice.id)}
                >
                  {notice.title}
                </button>
                {event.memo ? <p className="schedule-memo">{event.memo}</p> : null}

                <div className="card-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => onViewNotice(notice.id)}
                  >
                    공지 보기
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => onEditEvent(event.id)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="danger-action"
                    onClick={() => onDeleteEvent(event.id)}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      window.open(notice.originalUrl, '_blank', 'noreferrer')
                    }
                  >
                    원본 공지 확인
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default SchedulePage
