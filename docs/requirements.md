# CAI Notice 기능 명세서

## 1. 프로젝트 개요

CAI Notice는 동국대학교 학생이 학교 공지와 학과 공지를 CAI Notice 내부에서 확인하고, 관심 있는 공지를 저장해 폴더별로 관리하며, 마감일이나 신청 기간을 `ScheduleEvent`로 등록해 관리하는 서비스다.

기존 공지 사이트의 핵심은 카테고리별 공지 조회지만, CAI Notice의 핵심은 **내 공지함**이다. 사용자는 공지를 읽고 끝내는 것이 아니라, 나중에 다시 확인해야 하는 공지를 저장하고 메모를 남기며 일정으로 관리할 수 있어야 한다.

1차 버전은 로그인/회원가입 없이 익명 `guestId` 기반으로 동작하는 MVP로 구현한다.

## 2. 해결하려는 문제

기존 동국대학교 공지 사이트는 공지를 카테고리별로 확인하는 데는 적합하지만, 학생 개인의 관리 흐름에는 부족한 점이 있다.

- 관심 있는 공지를 개인 공간에 저장하기 어렵다.
- 장학, 학사, 졸업요건 등 성격이 다른 공지를 폴더별로 정리하기 어렵다.
- 신청 기간이나 마감일을 별도 일정으로 관리해야 한다.
- 나중에 다시 확인할 공지를 찾기 위해 같은 검색을 반복해야 한다.
- 원본 공지 링크만으로는 여러 공지를 한 곳에서 관리하기 어렵다.

CAI Notice는 이 문제를 `공지 조회 -> 공지 상세 확인 -> 내 공지함 저장 -> 폴더 관리 -> 내 일정 등록` 흐름으로 해결한다.

## 3. 핵심 차별화 기능: 내 공지함

`내 공지함`은 CAI Notice의 중심 기능이다.

사용자는 공지 목록이나 공지 상세 화면에서 관심 있는 공지를 저장할 수 있다. 저장할 때 폴더를 선택하고, 개인 메모를 남기고, 필요한 경우 마감일 또는 신청 기간을 `ScheduleEvent`로 함께 등록한다.

내 공지함에서 사용자는 다음 작업을 할 수 있다.

- 저장한 공지 다시 확인
- 저장 공지 클릭 후 공지 상세 화면에서 본문 전체 확인
- 폴더별 저장 공지 분류
- 저장 공지 메모 수정
- 저장 공지 폴더 이동
- 저장 취소
- 원본 공지 확인

## 4. 1차 버전 목표

1차 버전은 기능을 넓히기보다 CAI Notice의 핵심 사용 흐름을 안정적으로 구현하는 MVP다.

1차 목표는 다음과 같다.

- 공지 목록 조회
- 공지 상세 조회
- CAI Notice 내부에서 공지 본문 확인
- 내 학과 공지 조회
- 검색
- 카테고리 필터
- 공지 저장
- 폴더 관리
- 내 일정 등록/조회
- 원본 공지 링크 이동
- 로그인 없이 guest 사용자 기준 데이터 저장/조회

1차 버전에서는 AI, 알림, 공유, 협업, 관리자 기능을 구현하지 않는다.

## 5. 대상 사용자

주 대상 사용자는 동국대학교 재학생이다.

특히 다음 사용자에게 초점을 둔다.

- 학교 공지와 학과 공지를 자주 확인해야 하는 학생
- 장학, 학사, 졸업요건, 비교과 공지를 놓치고 싶지 않은 학생
- 관심 있는 공지를 나중에 다시 확인하고 싶은 학생
- 신청 기간이나 마감일이 있는 공지를 일정처럼 관리하고 싶은 학생
- 여러 공지를 주제별 폴더로 정리하고 싶은 학생

## 6. guest 사용자 정책

1차 버전에서는 로그인/회원가입을 구현하지 않는다. 대신 익명 `guestId`로 사용자를 식별한다.

### 6.1 guestId 생성

- 사용자가 처음 서비스에 접속하면 프론트엔드가 `guestId`를 생성한다.
- `guestId` 생성에는 `crypto.randomUUID()` 같은 브라우저 API를 사용할 수 있다.
- 생성한 `guestId`는 브라우저 localStorage에 저장한다.

프론트엔드 저장 키는 다음으로 통일한다.

```text
localStorage key: cai_notice_guest_id
```

### 6.2 API 전달 방식

`/api/me` 계열 API는 로그인 사용자가 아니라 `X-Guest-Id` 헤더로 식별되는 guest 사용자 기준으로 동작한다.

```http
X-Guest-Id: 2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
```

프론트엔드는 내 공지함, 폴더, ScheduleEvent 관련 API를 호출할 때 항상 `X-Guest-Id` 헤더를 전달한다.

### 6.3 백엔드 처리

- 백엔드는 `X-Guest-Id`로 `GuestUser`를 조회한다.
- 존재하지 않는 `guestId`면 `GuestUser`를 생성한다.
- `GuestUser` 생성 시 기본 폴더도 함께 생성한다.
- 이후 내 공지함, 폴더, ScheduleEvent 데이터는 `guestUserId` 기준으로 저장/조회한다.

### 6.4 한계

브라우저 localStorage를 삭제하면 기존 `guestId`를 복구할 수 없다. 이 경우 이전에 저장한 내 공지함, 폴더, ScheduleEvent 데이터에 접근할 수 없다.

다른 브라우저나 다른 기기에서도 같은 `guestId`를 알 수 없으므로 동일 데이터 접근이 불가능하다.

### 6.5 추후 로그인 확장 고려

1차에서는 `GuestUser` 중심으로 구현하되, 추후 로그인 기능을 추가할 수 있도록 `User`와 연결 가능한 구조를 고려한다. 예를 들어 이후 로그인 사용자가 생기면 기존 `GuestUser`의 저장 공지, 폴더, ScheduleEvent 데이터를 로그인 `User`로 이전할 수 있어야 한다.

## 7. 핵심 기능

### 7.1 공지 조회

사용자는 수집된 공지 목록을 조회할 수 있다.

공지 목록에는 다음 정보를 표시한다.

- 공지 제목
- 카테고리
- 학과
- 작성일
- 출처
- 본문 일부 미리보기
- 저장 버튼
- 원본 공지 확인 버튼

공지 목록 화면에서 공지 카드를 클릭하면 공지 상세 화면으로 이동한다.

### 7.2 공지 상세 조회

사용자는 선택한 공지의 상세 내용을 확인할 수 있다.

공지 상세 화면에는 다음 정보를 표시한다.

- 공지 제목
- 카테고리
- 학과
- 작성일
- 출처
- 공지 본문 전체
- 저장 버튼
- 일정 등록 버튼
- 원본 공지 확인 버튼

### 7.3 CAI Notice 내부에서 공지 본문 확인

1차 버전에서도 공지 본문은 CAI Notice 내부에서 직접 보여준다.

- `Notice` 엔티티에는 `content` 필드를 유지한다.
- 공지 상세 화면은 `content` 전체를 표시한다.
- 목록 화면은 `content`의 일부를 미리보기로 표시한다.
- 내 공지함에서 저장한 공지를 클릭해도 공지 상세 화면으로 이동해 본문 전체를 확인한다.
- 원본 공지 링크는 출처 확인 및 최신 내용 검증용 보조 링크다.

첨부파일 분석, PDF/HWP 요약, 이미지/표 완전 재현은 2차 이후 기능으로 분리한다.

### 7.4 내 학과 공지 조회

사용자는 홈 화면에서 학과를 선택할 수 있다.

내 학과 공지 탭에서는 다음 공지를 보여준다.

- 학과가 `전체`인 공지
- 사용자가 선택한 학과와 일치하는 공지

선택한 학과는 프론트엔드에서 `localStorage.cai_notice_department`로 저장할 수 있다.

### 7.5 검색

사용자는 키워드로 공지를 검색할 수 있다.

검색 대상은 다음을 기준으로 한다.

- 공지 제목
- 공지 본문
- 카테고리
- 학과
- 출처

검색 결과가 없으면 다음 빈 상태를 보여준다.

```text
검색 결과가 없습니다.
다른 키워드로 다시 검색해보세요.
```

### 7.6 카테고리 필터

사용자는 카테고리별로 공지를 필터링할 수 있다.

1차 기본 카테고리는 다음과 같다.

- 전체
- 학사
- 장학
- 학과
- 일반
- 비교과

### 7.7 공지 저장

사용자는 공지 목록 또는 공지 상세 화면에서 공지를 저장할 수 있다.

공지 저장 흐름은 다음과 같다.

```text
1. 공지 목록에서 [저장] 클릭
2. 저장 모달 열림
3. 저장할 폴더 선택
4. 메모 입력 선택
5. 마감일 또는 신청 기간 입력 선택
6. [저장하기] 클릭
7. 저장 공지는 내 공지함에 추가됨
8. 일정 날짜를 입력한 경우 내 일정에도 ScheduleEvent가 함께 등록됨
```

일정 등록은 필수가 아니라 선택이다.

중복 저장은 허용하지 않는다. 동일한 guest 사용자가 같은 공지를 다시 저장하려고 하면 `이미 저장된 공지입니다` 상태를 보여준다.

### 7.8 폴더 관리

guest 사용자마다 기본 폴더가 자동으로 존재한다.

폴더 정책은 다음과 같다.

- 사용자가 폴더를 선택하지 않으면 기본 폴더에 저장한다.
- 폴더 생성, 수정, 삭제가 가능하다.
- 기본 폴더는 삭제할 수 없다.
- 폴더 삭제 시 해당 폴더에 있던 저장 공지는 기본 폴더로 이동한다.
- 폴더 삭제는 `Notice`나 `SavedNotice` 자체를 삭제하지 않는다.

### 7.9 내 일정 등록/조회

사용자는 마감일 또는 신청 기간이 있는 공지를 `ScheduleEvent`로 등록할 수 있다.

1차 버전에서는 복잡한 월별 캘린더 UI를 구현하지 않는다. `내 일정 화면`에서 날짜별 일정 목록을 보여주는 방식으로 구현한다.

ScheduleEvent에는 다음 정보가 포함된다.

- 연결 공지
- 일정 제목
- 시작일
- 종료일
- 메모

사용자는 내 일정 화면에서 ScheduleEvent를 조회, 수정, 삭제할 수 있다. 연결 공지 제목을 클릭하면 공지 상세 화면으로 이동한다.

### 7.10 원본 공지 링크 이동

모든 공지에는 원본 공지 링크를 제공한다.

버튼 이름은 모든 화면에서 `원본 공지 확인`으로 통일한다.

원본 공지 링크는 CAI Notice 내부 본문 확인을 대체하는 메인 수단이 아니라, 출처 확인 및 최신 내용 검증을 위한 보조 수단이다.

## 8. 1차 프론트엔드 범위

1차 프론트엔드는 다음 화면과 기능을 구현한다.

- 홈 화면
- 공지 목록 화면
- 공지 상세 화면
- 공지 저장 모달
- 내 공지함 화면
- 폴더 관리 모달
- 내 일정 화면
- 일정 등록/수정 모달
- guestId 생성 및 localStorage 저장
- `/api/me` 계열 요청 시 `X-Guest-Id` 헤더 전달
- 내 학과 선택값 저장
- 검색 결과 없음, 내 공지함 빈 상태, 내 일정 빈 상태 표시

1차 프론트엔드는 월별 캘린더 UI를 구현하지 않고, 내 일정 화면의 날짜별 목록 UI만 구현한다.

## 9. 1차 백엔드 범위

1차 백엔드는 다음 API와 데이터 구조를 구현한다.

- 공지 목록 조회 API
- 공지 상세 조회 API
- GuestUser 조회/생성 처리
- 기본 폴더 자동 생성 처리
- 폴더 생성/조회/수정/삭제 API
- 저장 공지 생성/조회/수정/삭제 API
- ScheduleEvent 생성/조회/수정/삭제 API
- `SavedNotice` 중복 저장 방지
- 폴더 삭제 시 저장 공지를 기본 폴더로 이동

공지 수집 파이프라인은 1차 백엔드 API 구현 후 단계적으로 연결할 수 있다. 초기 개발 단계에서는 DB에 저장된 샘플 공지 데이터로 API를 먼저 구현한다.

## 10. API 명세

### 10.1 공통 규칙

`/api/me` 계열 API는 로그인 사용자가 아니라 `X-Guest-Id` 헤더로 식별되는 guest 사용자 기준으로 동작한다.

```http
X-Guest-Id: 2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
```

`X-Guest-Id`가 필요한 API에서 헤더가 없으면 `400 Bad Request`를 반환한다.

같은 guest 사용자가 같은 공지를 중복 저장하려고 하면 `409 Conflict`와 함께 `이미 저장된 공지입니다`에 해당하는 상태를 반환한다.

### 10.2 공지 API

```text
GET /api/notices
GET /api/notices/{noticeId}
```

`GET /api/notices` 쿼리 파라미터:

```text
keyword    선택, 검색어
category   선택, 카테고리
department 선택, 학과
tab        선택, all 또는 myDepartment
```

요청 예시:

```http
GET /api/notices?keyword=장학&category=장학&department=컴퓨터공학과&tab=myDepartment
```

응답 예시:

```json
{
  "items": [
    {
      "id": 1,
      "title": "2026학년도 2학기 교내장학금 신청 안내",
      "category": "장학",
      "department": "전체",
      "source": "동국대학교 장학공지",
      "originalUrl": "https://example.com/notices/1",
      "contentPreview": "교내장학금 신청 기간과 제출 서류를 안내합니다...",
      "postedDate": "2026-06-13"
    }
  ]
}
```

`GET /api/notices/{noticeId}` 응답에는 공지 본문 전체를 포함한다.

```json
{
  "id": 1,
  "title": "2026학년도 2학기 교내장학금 신청 안내",
  "category": "장학",
  "department": "전체",
  "source": "동국대학교 장학공지",
  "originalUrl": "https://example.com/notices/1",
  "content": "교내장학금 신청 기간, 신청 방법, 제출 서류에 대한 전체 본문...",
  "postedDate": "2026-06-13"
}
```

공지 조회 API 자체는 guestId 없이도 조회 가능하다. 저장 여부 표시는 프론트엔드가 `/api/me/saved-notices` 결과를 기준으로 판단한다.

### 10.3 폴더 API

```text
GET /api/me/folders
POST /api/me/folders
PATCH /api/me/folders/{folderId}
DELETE /api/me/folders/{folderId}
```

모든 요청에 `X-Guest-Id` 헤더가 필요하다.

폴더 생성 요청:

```json
{
  "name": "장학 공지"
}
```

폴더 수정 요청:

```json
{
  "name": "장학금 공지"
}
```

폴더 삭제 정책:

- 기본 폴더는 삭제할 수 없다.
- 사용자 생성 폴더 삭제 시 해당 폴더의 SavedNotice는 기본 폴더로 이동한다.

### 10.4 저장 공지 API

```text
GET /api/me/saved-notices
POST /api/me/saved-notices
PATCH /api/me/saved-notices/{savedNoticeId}
DELETE /api/me/saved-notices/{savedNoticeId}
```

모든 요청에 `X-Guest-Id` 헤더가 필요하다.

`GET /api/me/saved-notices` 쿼리 파라미터:

```text
folderId 선택, 특정 폴더의 저장 공지만 조회
```

공지 저장 요청:

```json
{
  "noticeId": 1,
  "folderId": 3,
  "memo": "신청 기간 확인 필요"
}
```

`folderId`가 없으면 기본 폴더에 저장한다.

저장 공지 수정 요청:

```json
{
  "folderId": 4,
  "memo": "서류 제출 여부 확인"
}
```

중복 저장 방지를 위해 `SavedNotice`는 `guestUserId + noticeId` 조합이 중복되지 않아야 한다.

공지 저장 모달에서 일정 날짜를 입력한 경우 프론트엔드는 저장 공지 생성 성공 후 `POST /api/me/schedule-events`를 호출해 ScheduleEvent를 함께 생성한다.

### 10.5 ScheduleEvent API

```text
GET /api/me/schedule-events
POST /api/me/schedule-events
PATCH /api/me/schedule-events/{eventId}
DELETE /api/me/schedule-events/{eventId}
```

모든 요청에 `X-Guest-Id` 헤더가 필요하다.

`GET /api/me/schedule-events` 쿼리 파라미터:

```text
startDate 선택, 조회 시작일
endDate   선택, 조회 종료일
```

ScheduleEvent 생성 요청:

```json
{
  "noticeId": 1,
  "title": "교내장학금 신청 마감",
  "startDate": "2026-06-20",
  "endDate": "2026-06-20",
  "memo": "서류 제출 여부 확인"
}
```

ScheduleEvent 수정 요청:

```json
{
  "title": "교내장학금 신청 기간",
  "startDate": "2026-06-18",
  "endDate": "2026-06-20",
  "memo": "신청서와 증빙 서류 확인"
}
```

`startDate`와 `endDate`가 같으면 단일 마감일로 표시한다. 두 값이 다르면 기간 일정으로 표시한다.

## 11. DB 엔티티

### 11.1 GuestUser 또는 User

1차 버전에서는 `GuestUser`를 사용한다. 추후 로그인 기능이 추가되면 `User`로 확장하거나 `GuestUser` 데이터를 `User`에 연결할 수 있는 구조를 고려한다.

필드:

- id
- guestId
- createdAt
- updatedAt

정책:

- `guestId`는 유니크해야 한다.
- `GuestUser` 생성 시 기본 폴더를 자동 생성한다.

### 11.2 Notice

공지 원본 데이터를 저장한다.

필드:

- id
- title
- category
- department
- source
- originalUrl
- content
- postedDate
- createdAt
- updatedAt

정책:

- `content`는 CAI Notice 내부 공지 상세 화면에서 보여줄 본문이다.
- `originalUrl`은 `원본 공지 확인` 버튼에 사용한다.
- 첨부파일 분석 결과나 PDF/HWP 요약 데이터는 1차 엔티티에 포함하지 않는다.

### 11.3 Folder

guest 사용자의 내 공지함 폴더를 저장한다.

필드:

- id
- guestUserId
- name
- isDefault
- createdAt
- updatedAt

정책:

- guest 사용자마다 `isDefault = true`인 기본 폴더가 하나 존재한다.
- 기본 폴더는 삭제할 수 없다.
- 폴더 삭제 시 해당 폴더의 SavedNotice는 기본 폴더로 이동한다.

### 11.4 SavedNotice

guest 사용자가 저장한 공지를 저장한다.

필드:

- id
- guestUserId
- noticeId
- folderId
- memo
- savedAt
- updatedAt

정책:

- `guestUserId + noticeId` 조합은 중복될 수 없다.
- 중복 저장 요청 시 저장하지 않고 `이미 저장된 공지입니다` 상태를 반환한다.
- `folderId`가 요청에 없으면 기본 폴더를 사용한다.

### 11.5 ScheduleEvent

guest 사용자가 내 일정에 등록한 공지 기반 일정을 저장한다.

필드:

- id
- guestUserId
- noticeId
- title
- startDate
- endDate
- memo
- createdAt
- updatedAt

정책:

- ScheduleEvent는 특정 Notice와 연결된다.
- 시작일과 종료일이 같으면 단일 마감일로 표시한다.
- 시작일과 종료일이 다르면 기간 일정으로 표시한다.

## 12. 1차 제외 기능

다음 기능은 1차 버전에서 제외하고 2차 이후로 분리한다.

- 로그인
- 회원가입
- AI 요약
- AI 마감일 자동 추출
- 푸시 알림
- 실시간 알림
- 월별 캘린더 UI
- 구글 캘린더 연동
- 공유 폴더
- 협업 기능
- 관리자 기능
- 마이페이지
- 첨부파일 분석
- PDF/HWP 요약
- 이미지/표 완전 재현
- e-Class 연동
- nDRIMS 연동

## 13. 예정 기술 스택

예정 기술 스택은 다음을 기준으로 한다.

- 프론트엔드: React + Vite
- 백엔드: Spring Boot
- 데이터베이스: MySQL
- 공지 수집: Python 크롤러 또는 백엔드 배치 작업
- 서버: AWS EC2 Ubuntu
- 웹 서버: Nginx
- HTTPS: Let's Encrypt

기술 스택은 구현 과정에서 변경될 수 있지만, 1차 MVP 범위는 이 문서의 기능 범위를 넘지 않는다.

## 14. 개발 순서

1차 개발은 다음 순서로 진행한다.

1. 문서 정리 및 용어 통일
2. 프론트엔드 라우팅과 기본 화면 구성
3. 프론트엔드 guestId 생성 및 `X-Guest-Id` 헤더 처리
4. 샘플 Notice 데이터와 공지 목록/상세 화면 구현
5. 공지 목록 조회 API와 공지 상세 조회 API 구현
6. GuestUser 생성/조회 및 기본 폴더 자동 생성 구현
7. 폴더 API와 폴더 관리 모달 구현
8. 저장 공지 API와 공지 저장 모달 구현
9. `guestUserId + noticeId` 중복 저장 방지 구현
10. 내 공지함 화면 구현
11. ScheduleEvent API 구현
12. 내 일정 화면과 일정 등록/수정 모달 구현
13. 검색, 내 학과 공지, 카테고리 필터 연결
14. 원본 공지 확인 링크 연결
15. 빈 상태 화면과 오류 상태 정리
16. 공지 수집 파이프라인 연결
17. 배포 환경 구성
