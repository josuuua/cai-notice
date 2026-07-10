import { mockNotices } from '../data/mockNotices'

export function getNotices() {
  return mockNotices
}

export function getNoticeById(noticeId) {
  return mockNotices.find((notice) => notice.id === Number(noticeId)) ?? null
}
