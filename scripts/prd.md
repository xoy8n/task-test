# 📄 제품 요구사항 문서 (PRD)

## 1. 📌 프로젝트 개요

- **제품명:** AI와 함께하는 끝말잇기
- **목적:** 사용자가 AI와 한국어 끝말잇기 게임을 즐길 수 있도록 Next.js와 Gemini-2.0-Flash 모델을 활용한 싱글플레이 웹 애플리케이션 개발
- **주요 기술 스택:**
  - Frontend: Next.js (App Router, React 18)
  - AI API: Google Gemini-2.0-Flash (Function Calling 사용)
  - 배포: 초기 로컬 테스트, 추후 Vercel 배포 예정

---

## 2. 🎮 핵심 기능 정의

### 2.1. 게임 기능

| 기능명       | 설명                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| 게임 시작    | 사용자가 게임 시작 버튼 클릭 시 AI와 끝말잇기 세션 시작                |
| 단어 입력    | 사용자가 입력한 단어를 제출                                            |
| AI 응답      | Gemini-2.0-Flash API로 Function Calling을 사용해 AI가 다음 단어 제시   |
| 단어 검증    | 사용자의 단어 유효성 검증 (사전에 존재 여부, 올바른 끝말잇기 단어인지) |
| AI 단어 검증 | AI가 제시한 단어에 대한 유효성 검증 (옵션)                             |
| 게임 종료    | 패배 조건 충족 시 게임 종료 및 결과 표시                               |
| 리셋         | 게임 초기화 및 재시작 가능                                             |

### 2.2. 유저 인터페이스 (UI)

- 단어 입력창
- AI 응답 출력 영역
- 현재 단어 표시
- 게임 상태(진행 중, 승리, 패배) 표시
- 게임 시작/재시작 버튼

---

## 3. 🤖 AI 통합 설계

- **모델:** Gemini-2.0-Flash
- **기능 호출 방식:** Function Calling ([Google Gemini API Docs - Function Calling](https://ai.google.dev/gemini-api/docs/function-calling?hl=ko&example=weather#step_3_execute_set_light_values_function_code))

### Function 정의 예시

```json
{
  "name": "get_next_korean_word",
  "description": "끝말잇기 규칙에 맞는 다음 한국어 단어를 제안합니다.",
  "parameters": {
    "type": "object",
    "properties": {
      "last_word": {
        "type": "string",
        "description": "마지막으로 사용된 단어"
      }
    },
    "required": ["last_word"]
  }
}
```

### Prompt 예시

```txt
너는 끝말잇기 AI야. 사용자가 제시한 단어의 마지막 글자로 시작하는 새로운 한국어 단어를 제안해줘.
반드시 한국어 명사만 사용하고, 올바른 단어인지 확인해.
마지막 단어: {last_word}
```

---

## 4. 📚 기술적 고려사항

- 프론트엔드에서 Google Gemini API 호출 시 API Key 보호를 위해 Proxy 서버 고려 (향후 Vercel Edge Function으로 확장 가능)

- 단어 유효성 검증을 위한 간단한 한국어 단어 리스트 또는 외부 사전 API 사용 고려 (초기 MVP에서는 검증 생략 가능)

- 비동기 처리 시 사용자 경험을 위한 로딩 상태 표시

- 에러 핸들링: API 실패, 잘못된 입력, AI 무응답 시 graceful degradation 처리

---

## 5. 🚀 개발 및 테스트 계획

| 단계 | 작업 내용                                           |
| ---- | --------------------------------------------------- |
| 1    | Next.js 프로젝트 세팅 (App Router, Typescript 적용) |
| 2    | 기본 UI 구성 (게임 화면, 입력창, 결과 표시)         |
| 3    | Gemini API Function Calling 연동                    |
| 4    | 단어 검증 로직 개발 (간단한 리스트 활용)            |
| 5    | 게임 흐름 컨트롤 구현                               |
| 6    | 로컬 환경 테스트 및 버그 수정                       |
| 7    | (추후) Vercel 배포 준비                             |
