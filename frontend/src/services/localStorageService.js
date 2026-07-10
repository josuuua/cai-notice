const GUEST_ID_KEY = 'cai_notice_guest_id'
const DEPARTMENT_KEY = 'cai_notice_department'
const DEFAULT_FOLDER_NAME = '기본 폴더'

function createId(prefix) {
  const randomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}-${randomId}`
}

function readJson(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function guestKey(guestId, resource) {
  return `cai_notice_${guestId}_${resource}`
}

export function ensureGuestId() {
  const existingGuestId = localStorage.getItem(GUEST_ID_KEY)

  if (existingGuestId) {
    ensureDefaultFolder(existingGuestId)
    return existingGuestId
  }

  const guestId = createId('guest')
  localStorage.setItem(GUEST_ID_KEY, guestId)
  ensureDefaultFolder(guestId)
  return guestId
}

export function getGuestHeaders(guestId) {
  return {
    'X-Guest-Id': guestId,
  }
}

export function getStoredDepartment(fallbackDepartment) {
  return localStorage.getItem(DEPARTMENT_KEY) || fallbackDepartment
}

export function setStoredDepartment(department) {
  localStorage.setItem(DEPARTMENT_KEY, department)
}

export function getFolders(guestId) {
  ensureDefaultFolder(guestId)
  return readJson(guestKey(guestId, 'folders'), [])
}

export function saveFolders(guestId, folders) {
  writeJson(guestKey(guestId, 'folders'), folders)
}

export function getDefaultFolder(guestId) {
  return getFolders(guestId).find((folder) => folder.isDefault)
}

export function ensureDefaultFolder(guestId) {
  const key = guestKey(guestId, 'folders')
  const folders = readJson(key, [])

  if (folders.some((folder) => folder.isDefault)) {
    return folders
  }

  const defaultFolder = {
    id: 'default',
    name: DEFAULT_FOLDER_NAME,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const nextFolders = [defaultFolder, ...folders]
  writeJson(key, nextFolders)
  return nextFolders
}

export function createFolder(guestId, name) {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return {
      folders: getFolders(guestId),
      folder: null,
    }
  }

  const now = new Date().toISOString()
  const folders = getFolders(guestId)
  const folder = {
    id: createId('folder'),
    name: trimmedName,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }
  const nextFolders = [...folders, folder]

  saveFolders(guestId, nextFolders)
  return {
    folders: nextFolders,
    folder,
  }
}

export function updateFolder(guestId, folderId, name) {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return getFolders(guestId)
  }

  const folders = getFolders(guestId).map((folder) =>
    folder.id === folderId && !folder.isDefault
      ? { ...folder, name: trimmedName, updatedAt: new Date().toISOString() }
      : folder,
  )

  saveFolders(guestId, folders)
  return folders
}

export function deleteFolder(guestId, folderId) {
  const folders = getFolders(guestId)
  const targetFolder = folders.find((folder) => folder.id === folderId)

  if (!targetFolder || targetFolder.isDefault) {
    return folders
  }

  const defaultFolder = folders.find((folder) => folder.isDefault)
  const nextFolders = folders.filter((folder) => folder.id !== folderId)
  const savedNotices = getSavedNotices(guestId).map((savedNotice) =>
    savedNotice.folderId === folderId
      ? {
          ...savedNotice,
          folderId: defaultFolder.id,
          updatedAt: new Date().toISOString(),
        }
      : savedNotice,
  )

  saveFolders(guestId, nextFolders)
  writeJson(guestKey(guestId, 'saved_notices'), savedNotices)
  return nextFolders
}

export function getSavedNotices(guestId) {
  return readJson(guestKey(guestId, 'saved_notices'), [])
}

export function createSavedNotice(guestId, { noticeId, folderId, memo }) {
  const savedNotices = getSavedNotices(guestId)
  const existingSavedNotice = savedNotices.find(
    (savedNotice) => savedNotice.noticeId === Number(noticeId),
  )

  if (existingSavedNotice) {
    return {
      savedNotice: existingSavedNotice,
      status: 'duplicate',
    }
  }

  const folders = getFolders(guestId)
  const defaultFolder = folders.find((folder) => folder.isDefault)
  const targetFolder = folders.find((folder) => folder.id === folderId)
  const now = new Date().toISOString()
  const savedNotice = {
    id: createId('saved'),
    noticeId: Number(noticeId),
    folderId: targetFolder?.id || defaultFolder.id,
    memo: memo.trim(),
    savedAt: now,
    updatedAt: now,
  }

  writeJson(guestKey(guestId, 'saved_notices'), [...savedNotices, savedNotice])
  return {
    savedNotice,
    status: 'created',
  }
}

export function updateSavedNotice(guestId, savedNoticeId, updates) {
  const savedNotices = getSavedNotices(guestId).map((savedNotice) =>
    savedNotice.id === savedNoticeId
      ? {
          ...savedNotice,
          ...updates,
          memo:
            typeof updates.memo === 'string'
              ? updates.memo.trim()
              : savedNotice.memo,
          updatedAt: new Date().toISOString(),
        }
      : savedNotice,
  )

  writeJson(guestKey(guestId, 'saved_notices'), savedNotices)
  return savedNotices
}

export function deleteSavedNotice(guestId, savedNoticeId) {
  const savedNotices = getSavedNotices(guestId).filter(
    (savedNotice) => savedNotice.id !== savedNoticeId,
  )

  writeJson(guestKey(guestId, 'saved_notices'), savedNotices)
  return savedNotices
}

export function getScheduleEvents(guestId) {
  return readJson(guestKey(guestId, 'schedule_events'), [])
}

export function createScheduleEvent(
  guestId,
  { noticeId, title, startDate, endDate, memo },
) {
  const now = new Date().toISOString()
  const event = {
    id: createId('event'),
    noticeId: Number(noticeId),
    title: title.trim(),
    startDate,
    endDate: endDate || startDate,
    memo: memo.trim(),
    createdAt: now,
    updatedAt: now,
  }

  writeJson(guestKey(guestId, 'schedule_events'), [
    ...getScheduleEvents(guestId),
    event,
  ])
  return event
}

export function updateScheduleEvent(guestId, eventId, updates) {
  const events = getScheduleEvents(guestId).map((event) =>
    event.id === eventId
      ? {
          ...event,
          ...updates,
          title:
            typeof updates.title === 'string' ? updates.title.trim() : event.title,
          memo: typeof updates.memo === 'string' ? updates.memo.trim() : event.memo,
          endDate: updates.endDate || updates.startDate || event.endDate,
          updatedAt: new Date().toISOString(),
        }
      : event,
  )

  writeJson(guestKey(guestId, 'schedule_events'), events)
  return events
}

export function deleteScheduleEvent(guestId, eventId) {
  const events = getScheduleEvents(guestId).filter((event) => event.id !== eventId)
  writeJson(guestKey(guestId, 'schedule_events'), events)
  return events
}
