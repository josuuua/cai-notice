# CAI Notice API 명세서

## 1. 개요

이 문서는 CAI Notice 1차 MVP용 API 명세서다.

CAI Notice 1차 버전은 로그인/회원가입 없이 익명 guest 사용자 기준으로 동작한다. 프론트엔드는 최초 접속 시 생성한 `guestId`를 localStorage에 저장하고, `/api/me` 계열 API 요청마다 `X-Guest-Id` 헤더로 전달한다.

1차 MVP API는 다음 기능만 포함한다.

- 공지 목록 조회
- 공지 상세 조회
- 폴더 관리
- 공지 저장 및 저장 공지 관리
- 날짜별 일정 목록 관리

다음 기능은 1차 API에서 제외한다.

- AI 요약
- AI 마감일 자동 추출
- 알림
- 구글 캘린더 연동
- 관리자 기능
- 로그인/회원가입

## 2. 공통 규칙

### 2.1 Base URL

```text
/api
```

### 2.2 Content-Type

요청과 응답의 기본 형식은 JSON이다.

```http
Content-Type: application/json
```

### 2.3 guest 사용자 식별

`/api/me` 계열 API는 로그인 사용자가 아니라 `X-Guest-Id` 헤더로 식별되는 guest 사용자 기준으로 동작한다.

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
```

백엔드는 `X-Guest-Id` 값으로 `GuestUser`를 조회한다. 존재하지 않으면 `GuestUser`를 생성하고 기본 폴더도 함께 생성한다.

공지 조회 API인 `GET /api/notices`, `GET /api/notices/{noticeId}`는 guestId 없이도 호출 가능하다. 저장 여부 표시는 `GET /api/me/saved-notices` 결과를 기준으로 프론트엔드가 판단한다.

### 2.4 날짜 형식

날짜는 `YYYY-MM-DD` 문자열을 사용한다.

```text
2026-06-20
```

### 2.5 에러 응답 형식

모든 API의 에러 응답은 다음 형식을 사용한다.

```json
{
  "error": {
    "code": "SAVED_NOTICE_DUPLICATED",
    "message": "이미 저장된 공지입니다.",
    "details": {
      "noticeId": 1
    }
  }
}
```

공통 실패 상태 코드:

- `400 Bad Request`: 요청 형식 또는 필수 값이 잘못된 경우
- `404 Not Found`: 대상 리소스를 찾을 수 없는 경우
- `409 Conflict`: 중복 저장 등 현재 상태와 충돌하는 경우
- `500 Internal Server Error`: 서버 내부 오류

`/api/me` 계열 API에서 `X-Guest-Id` 헤더가 없으면 `400 Bad Request`를 반환한다.

## 3. Notice API

### 3.1 공지 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| URL | `/api/notices` |
| 설명 | 공지 목록을 조회한다. 검색어, 카테고리, 학과, 탭 조건으로 필터링할 수 있다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `500 Internal Server Error` |

#### Request Headers

필수 헤더 없음.

```http
Accept: application/json
```

#### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `keyword` | string | 아니오 | 공지 제목, 본문, 카테고리, 학과, 출처 검색어 |
| `category` | string | 아니오 | `전체`, `학사`, `장학`, `학과`, `일반`, `비교과` |
| `department` | string | 아니오 | 내 학과 공지 필터에 사용할 학과명 |
| `tab` | string | 아니오 | `all` 또는 `myDepartment` |

`tab=myDepartment`인 경우 백엔드는 `department=전체`인 공지와 요청한 `department`가 일치하는 공지를 함께 반환한다.

#### Request Body

없음.

#### Response Body

목록 응답에는 `content` 전체를 포함하지 않고 `contentSnippet`만 포함한다.

`contentSnippet`은 AI 요약이 아니다. `Notice.content` 앞부분을 일정 글자 수로 잘라 만든 본문 미리보기다.

```json
{
  "items": [
    {
      "id": 1,
      "title": "2026학년도 2학기 수강신청 안내",
      "category": "학사",
      "department": "전체",
      "source": "동국대학교 학사공지",
      "originalUrl": "https://www.dongguk.edu/",
      "contentSnippet": "2026학년도 2학기 수강신청 일정을 안내합니다. 장바구니 신청 기간은...",
      "postedDate": "2026-06-11"
    }
  ]
}
```

#### 예시 요청

```http
GET /api/notices?keyword=수강신청&category=학사&department=컴퓨터공학과&tab=myDepartment
```

### 3.2 공지 상세 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| URL | `/api/notices/{noticeId}` |
| 설명 | 공지 상세 정보를 조회한다. CAI Notice 내부에서 본문을 보여주기 위해 `content` 전체를 포함한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

필수 헤더 없음.

```http
Accept: application/json
```

#### Query Parameters

없음.

#### Request Body

없음.

#### Response Body

```json
{
  "id": 1,
  "title": "2026학년도 2학기 수강신청 안내",
  "category": "학사",
  "department": "전체",
  "source": "동국대학교 학사공지",
  "originalUrl": "https://www.dongguk.edu/",
  "content": "2026학년도 2학기 수강신청 일정을 안내합니다.\n\n장바구니 신청 기간은 2026-07-20부터 2026-07-22까지이며...",
  "postedDate": "2026-06-11"
}
```

#### 예시 요청

```http
GET /api/notices/1
```

## 4. Folder API

공통 정책:

- 모든 Folder API는 `/api/me` 계열이며 `X-Guest-Id` 기준으로 동작한다.
- guest 사용자마다 기본 폴더가 자동으로 존재한다.
- 기본 폴더는 삭제할 수 없다.
- 폴더 삭제 시 해당 폴더에 있던 저장 공지는 기본 폴더로 이동한다.

### 4.1 폴더 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| URL | `/api/me/folders` |
| 설명 | 현재 guest 사용자의 폴더 목록을 조회한다. 기본 폴더가 없으면 백엔드가 자동 생성한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Accept: application/json
```

#### Query Parameters

없음.

#### Request Body

없음.

#### Response Body

```json
{
  "items": [
    {
      "id": "default",
      "name": "기본 폴더",
      "isDefault": true,
      "createdAt": "2026-07-10T09:00:00Z",
      "updatedAt": "2026-07-10T09:00:00Z"
    },
    {
      "id": "folder-1",
      "name": "장학 공지",
      "isDefault": false,
      "createdAt": "2026-07-10T09:10:00Z",
      "updatedAt": "2026-07-10T09:10:00Z"
    }
  ]
}
```

### 4.2 폴더 생성

| 항목 | 내용 |
| --- | --- |
| Method | `POST` |
| URL | `/api/me/folders` |
| 설명 | 현재 guest 사용자의 새 폴더를 생성한다. |
| 성공 상태 코드 | `201 Created` |
| 실패 상태 코드 | `400 Bad Request`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Content-Type: application/json
```

#### Query Parameters

없음.

#### Request Body

```json
{
  "name": "장학 공지"
}
```

#### Response Body

```json
{
  "id": "folder-1",
  "name": "장학 공지",
  "isDefault": false,
  "createdAt": "2026-07-10T09:10:00Z",
  "updatedAt": "2026-07-10T09:10:00Z"
}
```

### 4.3 폴더 이름 수정

| 항목 | 내용 |
| --- | --- |
| Method | `PATCH` |
| URL | `/api/me/folders/{folderId}` |
| 설명 | 현재 guest 사용자의 폴더 이름을 수정한다. 기본 폴더 이름 수정 허용 여부는 백엔드 정책으로 결정하되, 1차 프론트에서는 사용자 생성 폴더 수정만 사용한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Content-Type: application/json
```

#### Query Parameters

없음.

#### Request Body

```json
{
  "name": "장학금 공지"
}
```

#### Response Body

```json
{
  "id": "folder-1",
  "name": "장학금 공지",
  "isDefault": false,
  "createdAt": "2026-07-10T09:10:00Z",
  "updatedAt": "2026-07-10T09:20:00Z"
}
```

### 4.4 폴더 삭제

| 항목 | 내용 |
| --- | --- |
| Method | `DELETE` |
| URL | `/api/me/folders/{folderId}` |
| 설명 | 현재 guest 사용자의 폴더를 삭제한다. 삭제된 폴더에 있던 저장 공지는 기본 폴더로 이동한다. |
| 성공 상태 코드 | `204 No Content` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
```

#### Query Parameters

없음.

#### Request Body

없음.

#### Response Body

없음.

기본 폴더 삭제 요청 실패 예시:

```json
{
  "error": {
    "code": "DEFAULT_FOLDER_CANNOT_BE_DELETED",
    "message": "기본 폴더는 삭제할 수 없습니다.",
    "details": {
      "folderId": "default"
    }
  }
}
```

## 5. SavedNotice API

공통 정책:

- 모든 SavedNotice API는 `/api/me` 계열이며 `X-Guest-Id` 기준으로 동작한다.
- 같은 guest 사용자는 같은 공지를 중복 저장할 수 없다.
- 중복 저장 시 `409 Conflict`를 반환한다.
- 저장 공지는 폴더와 메모를 가질 수 있다.

### 5.1 저장 공지 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| URL | `/api/me/saved-notices` |
| 설명 | 현재 guest 사용자의 저장 공지 목록을 조회한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Accept: application/json
```

#### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `folderId` | string | 아니오 | 특정 폴더의 저장 공지만 조회 |

#### Request Body

없음.

#### Response Body

저장 공지 목록 화면에서 별도 Notice 조회 없이 카드 렌더링이 가능하도록 `notice` 요약 정보를 함께 내려준다.

```json
{
  "items": [
    {
      "id": "saved-1",
      "noticeId": 1,
      "folderId": "default",
      "folder": {
        "id": "default",
        "name": "기본 폴더",
        "isDefault": true
      },
      "memo": "장바구니 기간 확인",
      "savedAt": "2026-07-10T09:30:00Z",
      "updatedAt": "2026-07-10T09:30:00Z",
      "notice": {
        "id": 1,
        "title": "2026학년도 2학기 수강신청 안내",
        "category": "학사",
        "department": "전체",
        "source": "동국대학교 학사공지",
        "originalUrl": "https://www.dongguk.edu/",
        "contentSnippet": "2026학년도 2학기 수강신청 일정을 안내합니다...",
        "postedDate": "2026-06-11"
      }
    }
  ]
}
```

### 5.2 공지 저장

| 항목 | 내용 |
| --- | --- |
| Method | `POST` |
| URL | `/api/me/saved-notices` |
| 설명 | 현재 guest 사용자의 내 공지함에 공지를 저장한다. |
| 성공 상태 코드 | `201 Created` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Content-Type: application/json
```

#### Query Parameters

없음.

#### Request Body

`folderId`가 없거나 유효하지 않으면 기본 폴더에 저장한다.

```json
{
  "noticeId": 1,
  "folderId": "folder-1",
  "memo": "수강신청 기간 확인 필요"
}
```

#### Response Body

```json
{
  "id": "saved-1",
  "noticeId": 1,
  "folderId": "folder-1",
  "memo": "수강신청 기간 확인 필요",
  "savedAt": "2026-07-10T09:30:00Z",
  "updatedAt": "2026-07-10T09:30:00Z"
}
```

중복 저장 실패 예시:

```json
{
  "error": {
    "code": "SAVED_NOTICE_DUPLICATED",
    "message": "이미 저장된 공지입니다.",
    "details": {
      "noticeId": 1
    }
  }
}
```

### 5.3 저장 공지 수정

| 항목 | 내용 |
| --- | --- |
| Method | `PATCH` |
| URL | `/api/me/saved-notices/{savedNoticeId}` |
| 설명 | 저장 공지의 폴더 또는 메모를 수정한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Content-Type: application/json
```

#### Query Parameters

없음.

#### Request Body

`folderId`, `memo` 중 필요한 값만 보낼 수 있다.

```json
{
  "folderId": "folder-2",
  "memo": "서류 제출 여부 확인"
}
```

#### Response Body

```json
{
  "id": "saved-1",
  "noticeId": 1,
  "folderId": "folder-2",
  "memo": "서류 제출 여부 확인",
  "savedAt": "2026-07-10T09:30:00Z",
  "updatedAt": "2026-07-10T09:45:00Z"
}
```

### 5.4 저장 취소

| 항목 | 내용 |
| --- | --- |
| Method | `DELETE` |
| URL | `/api/me/saved-notices/{savedNoticeId}` |
| 설명 | 저장 공지를 삭제한다. Notice 원본 데이터는 삭제하지 않는다. |
| 성공 상태 코드 | `204 No Content` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
```

#### Query Parameters

없음.

#### Request Body

없음.

#### Response Body

없음.

## 6. ScheduleEvent API

공통 정책:

- 모든 ScheduleEvent API는 `/api/me` 계열이며 `X-Guest-Id` 기준으로 동작한다.
- 일정은 특정 공지와 연결될 수 있다.
- 일정은 `startDate`, `endDate`를 가진다.
- 이 API는 월별 캘린더 UI가 아니라 날짜별 일정 목록을 위한 API다.

### 6.1 내 일정 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| URL | `/api/me/schedule-events` |
| 설명 | 현재 guest 사용자의 일정 목록을 조회한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Accept: application/json
```

#### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `startDate` | string | 아니오 | 조회 시작일, `YYYY-MM-DD` |
| `endDate` | string | 아니오 | 조회 종료일, `YYYY-MM-DD` |

#### Request Body

없음.

#### Response Body

일정 목록 화면에서 연결된 공지 제목과 원본 링크를 표시할 수 있도록 `notice` 요약 정보를 함께 내려준다.

```json
{
  "items": [
    {
      "id": "event-1",
      "noticeId": 1,
      "title": "수강신청 기간",
      "startDate": "2026-08-03",
      "endDate": "2026-08-07",
      "memo": "장바구니와 정정 기간도 함께 확인",
      "createdAt": "2026-07-10T09:40:00Z",
      "updatedAt": "2026-07-10T09:40:00Z",
      "notice": {
        "id": 1,
        "title": "2026학년도 2학기 수강신청 안내",
        "category": "학사",
        "department": "전체",
        "source": "동국대학교 학사공지",
        "originalUrl": "https://www.dongguk.edu/",
        "postedDate": "2026-06-11"
      }
    }
  ]
}
```

### 6.2 일정 생성

| 항목 | 내용 |
| --- | --- |
| Method | `POST` |
| URL | `/api/me/schedule-events` |
| 설명 | 현재 guest 사용자의 일정 목록에 ScheduleEvent를 생성한다. |
| 성공 상태 코드 | `201 Created` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Content-Type: application/json
```

#### Query Parameters

없음.

#### Request Body

```json
{
  "noticeId": 1,
  "title": "수강신청 기간",
  "startDate": "2026-08-03",
  "endDate": "2026-08-07",
  "memo": "신청 시간과 정정 기간 확인"
}
```

#### Response Body

```json
{
  "id": "event-1",
  "noticeId": 1,
  "title": "수강신청 기간",
  "startDate": "2026-08-03",
  "endDate": "2026-08-07",
  "memo": "신청 시간과 정정 기간 확인",
  "createdAt": "2026-07-10T09:40:00Z",
  "updatedAt": "2026-07-10T09:40:00Z"
}
```

### 6.3 일정 수정

| 항목 | 내용 |
| --- | --- |
| Method | `PATCH` |
| URL | `/api/me/schedule-events/{eventId}` |
| 설명 | 기존 ScheduleEvent의 제목, 시작일, 종료일, 메모를 수정한다. |
| 성공 상태 코드 | `200 OK` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
Content-Type: application/json
```

#### Query Parameters

없음.

#### Request Body

필요한 값만 보낼 수 있다.

```json
{
  "title": "수강신청 및 정정 기간",
  "startDate": "2026-08-03",
  "endDate": "2026-08-07",
  "memo": "정정 기간도 함께 확인"
}
```

#### Response Body

```json
{
  "id": "event-1",
  "noticeId": 1,
  "title": "수강신청 및 정정 기간",
  "startDate": "2026-08-03",
  "endDate": "2026-08-07",
  "memo": "정정 기간도 함께 확인",
  "createdAt": "2026-07-10T09:40:00Z",
  "updatedAt": "2026-07-10T10:00:00Z"
}
```

### 6.4 일정 삭제

| 항목 | 내용 |
| --- | --- |
| Method | `DELETE` |
| URL | `/api/me/schedule-events/{eventId}` |
| 설명 | 기존 ScheduleEvent를 삭제한다. 연결된 Notice 원본 데이터는 삭제하지 않는다. |
| 성공 상태 코드 | `204 No Content` |
| 실패 상태 코드 | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |

#### Request Headers

```http
X-Guest-Id: guest-2b6f3b5e-9f4b-4df7-8c30-1cf3b7a5f001
```

#### Query Parameters

없음.

#### Request Body

없음.

#### Response Body

없음.

## 7. 프론트엔드 화면별 API 사용 표

| 화면 | 사용하는 API | 사용 목적 |
| --- | --- | --- |
| 홈 화면 | 없음 | guestId 생성과 학과 선택은 프론트엔드 localStorage에서 처리한다. |
| 공지 목록 화면 | `GET /api/notices`, `GET /api/me/saved-notices` | 공지 목록 조회, 검색/필터 적용, 저장됨 상태 판단 |
| 공지 상세 화면 | `GET /api/notices/{noticeId}`, `GET /api/me/saved-notices` | 공지 본문 전체 조회, 저장됨 상태 판단 |
| 공지 저장 모달 | `GET /api/me/folders`, `POST /api/me/folders`, `POST /api/me/saved-notices`, `POST /api/me/schedule-events` | 저장할 폴더 조회/생성, 공지 저장, 선택적 일정 등록 |
| 내 공지함 화면 | `GET /api/me/folders`, `GET /api/me/saved-notices`, `PATCH /api/me/saved-notices/{savedNoticeId}`, `DELETE /api/me/saved-notices/{savedNoticeId}` | 폴더별 저장 공지 조회, 폴더 이동, 메모 수정, 저장 취소 |
| 폴더 관리 모달 | `GET /api/me/folders`, `POST /api/me/folders`, `PATCH /api/me/folders/{folderId}`, `DELETE /api/me/folders/{folderId}` | 폴더 생성, 이름 수정, 삭제 |
| 내 일정 화면 | `GET /api/me/schedule-events`, `DELETE /api/me/schedule-events/{eventId}` | 날짜별 일정 목록 조회, 일정 삭제 |
| 일정 등록/수정 모달 | `POST /api/me/schedule-events`, `PATCH /api/me/schedule-events/{eventId}` | 일정 생성과 수정 |

## 8. 백엔드 구현 우선순위

1. Notice API
2. GuestUser 식별 처리
3. Folder API
4. SavedNotice API
5. ScheduleEvent API

구현 순서 제안:

- Notice API를 먼저 구현해 공지 목록/상세 화면을 백엔드 데이터로 전환한다.
- `/api/me` 계열 API 공통 처리로 `X-Guest-Id` 기반 `GuestUser` 조회/생성과 기본 폴더 자동 생성을 구현한다.
- Folder API를 구현해 공지 저장 모달과 폴더 관리 모달을 연결한다.
- SavedNotice API를 구현해 내 공지함의 저장, 수정, 삭제 흐름을 연결한다.
- ScheduleEvent API를 구현해 내 일정 화면과 일정 등록/수정 모달을 연결한다.

## 9. 1차에서 제외하는 API

다음 API는 1차 MVP에서 구현하지 않는다.

- 로그인/회원가입 API
- AI 요약 API
- AI 마감일 자동 추출 API
- 푸시 알림 API
- 구글 캘린더 연동 API
- 공유 폴더 API
- 관리자 API
- 크롤러 실행 API
