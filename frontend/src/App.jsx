import { useMemo, useState } from 'react'
import FolderManageModal from './components/FolderManageModal'
import NoticeSaveModal from './components/NoticeSaveModal'
import ScheduleEventModal from './components/ScheduleEventModal'
import { departments } from './constants/noticeOptions'
import HomePage from './pages/HomePage'
import NoticeDetailPage from './pages/NoticeDetailPage'
import NoticeListPage from './pages/NoticeListPage'
import SavedNoticesPage from './pages/SavedNoticesPage'
import SchedulePage from './pages/SchedulePage'
import {
  createFolder,
  createSavedNotice,
  createScheduleEvent,
  deleteFolder,
  deleteSavedNotice,
  deleteScheduleEvent,
  ensureGuestId,
  getFolders,
  getSavedNotices,
  getScheduleEvents,
  getStoredDepartment,
  setStoredDepartment,
  updateFolder,
  updateSavedNotice,
  updateScheduleEvent,
} from './services/localStorageService'
import { getNoticeById, getNotices } from './services/noticeService'
import './App.css'

function App() {
  const [guestId] = useState(() => ensureGuestId())
  const [currentPage, setCurrentPage] = useState('home')
  const [previousPage, setPreviousPage] = useState('noticeList')
  const [selectedNoticeId, setSelectedNoticeId] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(() =>
    getStoredDepartment(departments[0]),
  )
  const [folders, setFolders] = useState(() => getFolders(guestId))
  const [savedNotices, setSavedNotices] = useState(() => getSavedNotices(guestId))
  const [scheduleEvents, setScheduleEvents] = useState(() =>
    getScheduleEvents(guestId),
  )
  const [saveModalNoticeId, setSaveModalNoticeId] = useState(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [scheduleModalState, setScheduleModalState] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')

  const notices = useMemo(() => getNotices(), [])
  const savedNoticeIds = useMemo(
    () => new Set(savedNotices.map((savedNotice) => savedNotice.noticeId)),
    [savedNotices],
  )

  const saveModalNotice = saveModalNoticeId
    ? getNoticeById(saveModalNoticeId)
    : null
  const scheduleModalNotice = scheduleModalState
    ? getNoticeById(scheduleModalState.noticeId)
    : null
  const scheduleModalEvent =
    scheduleModalState?.eventId &&
    scheduleEvents.find((event) => event.id === scheduleModalState.eventId)

  function refreshGuestData() {
    setFolders(getFolders(guestId))
    setSavedNotices(getSavedNotices(guestId))
    setScheduleEvents(getScheduleEvents(guestId))
  }

  function showStatus(message) {
    setStatusMessage(message)
    window.setTimeout(() => setStatusMessage(''), 2400)
  }

  function handleDepartmentChange(department) {
    setSelectedDepartment(department)
    setStoredDepartment(department)
  }

  function openNoticeDetail(noticeId, fromPage = currentPage) {
    setPreviousPage(fromPage)
    setSelectedNoticeId(noticeId)
    setCurrentPage('noticeDetail')
  }

  function openSaveModal(noticeId) {
    if (savedNoticeIds.has(noticeId)) {
      showStatus('이미 저장된 공지입니다.')
      return
    }

    setSaveModalNoticeId(noticeId)
  }

  function handleCreateFolder(name) {
    const result = createFolder(guestId, name)
    setFolders(result.folders)
    return result.folder
  }

  function handleUpdateFolder(folderId, name) {
    setFolders(updateFolder(guestId, folderId, name))
  }

  function handleDeleteFolder(folderId) {
    deleteFolder(guestId, folderId)
    refreshGuestData()
  }

  function handleSubmitSavedNotice(payload) {
    const result = createSavedNotice(guestId, payload)

    if (result.status === 'duplicate') {
      showStatus('이미 저장된 공지입니다.')
      setSaveModalNoticeId(null)
      refreshGuestData()
      return
    }

    if (payload.schedule) {
      createScheduleEvent(guestId, {
        noticeId: payload.noticeId,
        ...payload.schedule,
      })
    }

    setSaveModalNoticeId(null)
    refreshGuestData()
    showStatus('내 공지함에 저장했습니다.')
  }

  function handleUpdateSavedNotice(savedNoticeId, updates) {
    setSavedNotices(updateSavedNotice(guestId, savedNoticeId, updates))
  }

  function handleDeleteSavedNotice(savedNoticeId) {
    setSavedNotices(deleteSavedNotice(guestId, savedNoticeId))
  }

  function openScheduleModal(noticeId) {
    setScheduleModalState({ noticeId, eventId: null })
  }

  function openScheduleEditModal(eventId) {
    const event = scheduleEvents.find((scheduleEvent) => scheduleEvent.id === eventId)
    if (event) {
      setScheduleModalState({ noticeId: event.noticeId, eventId })
    }
  }

  function handleSubmitScheduleEvent(eventPayload) {
    if (eventPayload.id) {
      setScheduleEvents(
        updateScheduleEvent(guestId, eventPayload.id, {
          title: eventPayload.title,
          startDate: eventPayload.startDate,
          endDate: eventPayload.endDate,
          memo: eventPayload.memo,
        }),
      )
    } else {
      createScheduleEvent(guestId, eventPayload)
      setScheduleEvents(getScheduleEvents(guestId))
    }

    setScheduleModalState(null)
    showStatus('내 일정에 반영했습니다.')
  }

  function handleDeleteScheduleEvent(eventId) {
    setScheduleEvents(deleteScheduleEvent(guestId, eventId))
  }

  function renderPage() {
    if (currentPage === 'noticeList') {
      return (
        <NoticeListPage
          notices={notices}
          savedNotices={savedNotices}
          selectedDepartment={selectedDepartment}
          onBackToHome={() => setCurrentPage('home')}
          onViewNotice={(noticeId) => openNoticeDetail(noticeId, 'noticeList')}
          onSaveNotice={openSaveModal}
          onGoSaved={() => setCurrentPage('savedNotices')}
          onGoSchedule={() => setCurrentPage('schedule')}
        />
      )
    }

    if (currentPage === 'noticeDetail') {
      const selectedNotice = getNoticeById(selectedNoticeId)

      return (
        <NoticeDetailPage
          notice={selectedNotice}
          isSaved={savedNoticeIds.has(Number(selectedNoticeId))}
          onBack={() => setCurrentPage(previousPage)}
          onSaveNotice={openSaveModal}
          onRegisterSchedule={openScheduleModal}
        />
      )
    }

    if (currentPage === 'savedNotices') {
      return (
        <SavedNoticesPage
          folders={folders}
          savedNotices={savedNotices}
          onGoNotices={() => setCurrentPage('noticeList')}
          onGoSchedule={() => setCurrentPage('schedule')}
          onOpenFolderManage={() => setIsFolderModalOpen(true)}
          onViewNotice={(noticeId) => openNoticeDetail(noticeId, 'savedNotices')}
          onUpdateSavedNotice={handleUpdateSavedNotice}
          onDeleteSavedNotice={handleDeleteSavedNotice}
        />
      )
    }

    if (currentPage === 'schedule') {
      return (
        <SchedulePage
          scheduleEvents={scheduleEvents}
          onGoNotices={() => setCurrentPage('noticeList')}
          onGoSaved={() => setCurrentPage('savedNotices')}
          onViewNotice={(noticeId) => openNoticeDetail(noticeId, 'schedule')}
          onEditEvent={openScheduleEditModal}
          onDeleteEvent={handleDeleteScheduleEvent}
        />
      )
    }

    return (
      <HomePage
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleDepartmentChange}
        onStart={() => setCurrentPage('noticeList')}
      />
    )
  }

  return (
    <>
      {renderPage()}

      {statusMessage ? <div className="app-toast">{statusMessage}</div> : null}

      {saveModalNotice ? (
        <NoticeSaveModal
          notice={saveModalNotice}
          folders={folders}
          onClose={() => setSaveModalNoticeId(null)}
          onSubmit={handleSubmitSavedNotice}
          onCreateFolder={handleCreateFolder}
        />
      ) : null}

      {isFolderModalOpen ? (
        <FolderManageModal
          folders={folders}
          onClose={() => setIsFolderModalOpen(false)}
          onCreate={handleCreateFolder}
          onUpdate={handleUpdateFolder}
          onDelete={handleDeleteFolder}
        />
      ) : null}

      {scheduleModalNotice ? (
        <ScheduleEventModal
          notice={scheduleModalNotice}
          event={scheduleModalEvent || null}
          onClose={() => setScheduleModalState(null)}
          onSubmit={handleSubmitScheduleEvent}
        />
      ) : null}
    </>
  )
}

export default App
