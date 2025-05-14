# 🚀 현재 컨텍스트 (Active Context)

## 1. 현재 작업 초점 (Current Work Focus)

- `prd.txt` (제품 요구사항 문서)를 기반으로 `memory-bank`의 핵심 문서들(`projectbrief.md`, `productContext.md`, `techContext.md`, `systemPatterns.md`, `activeContext.md`, `progress.md`)을 초기화하고 있습니다.
- 프로젝트의 목표, 범위, 사용자, 기술 스택, 시스템 구조에 대한 초기 정의를 수립하는 단계입니다.

## 2. 최근 변경 사항 (Recent Changes)

- `memory-bank/projectbrief.md` 생성 완료
- `memory-bank/productContext.md` 생성 완료
- `memory-bank/techContext.md` 생성 완료
- `memory-bank/systemPatterns.md` 생성 완료
- `memory-bank/activeContext.md` 생성 완료
- `memory-bank/progress.md` 생성 완료
- `shadcn/ui` (shadcn) 프로젝트 초기화 완료
- `shadcn/ui` 주요 컴포넌트 (`Button`, `Input`, `Card`, `Alert`, `sonner`) 설치 완료
- `src/app/page.js`에 기본 UI 프로토타입 생성
- `@google/generative-ai` 라이브러리 설치
- Gemini API (gemini-1.5-flash-latest, 이후 gemini-2.0-flash로 변경 시도) 연동 로직 추가 (`src/app/page.js`):
  - API 키 설정 (.env.local) 및 클라이언트 초기화
  - 끝말잇기 단어 생성을 위한 함수 선언 (generate_korean_word_chain_word) 정의
  - AI 응답 요청 및 처리 함수 (getAiResponse) 구현
  - handleSubmit 함수 내 AI 호출 및 결과 반영 로직 추가
  - AI 응답 대기 상태(isAiThinking), API 준비 상태(isApiReady) UI 반영
- **Gemini API 응답 디버깅 및 프롬프트 수정**:
  - 모델이 함수 호출(Function Call)만 반환하고 텍스트 응답이 없는 문제 해결.
  - `getAiResponse` 함수 내 프롬프트를 수정하여 모델이 직접 텍스트로 단어를 응답하도록 강력히 유도.
  - 디버깅용 로그 추가 및 문제 해결 확인.

## 3. 다음 단계 (Next Steps)

- **Gemini API 연동 테스트 및 디버깅**: 실제 API 키를 사용하여 기능 테스트 및 오류 수정. -> **기본적인 문제 해결 및 정상 작동 확인.**
- 핵심 게임 로직 (단어 입력, 유효성 검사, AI 응답 기초) 구현을 진행합니다. -> **Gemini 연동으로 AI 응답 기초 구현 완료, 유효성 검사 강화 필요**
- **프롬프트 엔지니어링 지속**: AI 응답 품질 (다양성, 적절성 등) 향상을 위한 프롬프트 지속적 개선.
- **고급 유효성 검사**: 사용자 및 AI 생성 단어에 대한 정교한 검증 로직 추가 (예: 실제 한글 명사인지, 비속어 필터링 등).
- **AI 재시도 로직**: AI가 부적절한 단어(중복, 한 글자, 규칙 위반 등) 생성 시, 자동으로 다시 단어 생성을 요청하는 로직 구현.
- **게임 종료 조건 구체화 및 로직 구현** (예: AI 연속 실패, 사용자 연속 오류 등).
- **게임 재시작 로직 구현**.
- UI/UX 개선: 사용자 피드백, 게임 기록 표시 방법 등 개선.

## 4. 주요 결정 및 고려 사항 (Active Decisions and Considerations)

- **기술 스택 확정**: Next.js (React 기반) 확정
- **UI 라이브러리**: `shadcn/ui` 사용 확정
- **AI 모델**: Gemini API (`gemini-1.5-flash-latest`) 사용 확정 (함수 호출 기능 활용한 텍스트 생성 유도 방식)
- **AI 단어 추천 방식 선택**: 내장 단어 DB로 시작할지, 초기부터 외부 AI API를 연동할지 결정이 필요합니다. (초기에는 내장 DB, 이후 확장 고려) -> **Gemini API 직접 연동으로 변경**
- **단어 데이터 확보**: 한글 단어 리스트를 어떻게 구성하고 확보할지 계획해야 합니다. -> **Gemini가 생성하므로 별도 데이터베이스 불필요 (단, 모델 학습 데이터에 의존)**
- **API 키 관리**: `.env.local` 파일을 통한 안전한 API 키 관리. -> **정상 확인.**
- **Gemini 모델 응답 방식**: 함수 호출 선언은 유지하되, 프롬프트를 통해 모델이 직접 텍스트로 응답하도록 유도하는 방식으로 최종 결정 및 작동 확인.
