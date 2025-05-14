# ⚙️ 시스템 패턴 (System Patterns)

## 1. 시스템 아키텍처 (System Architecture)

이 프로젝트는 클라이언트-서버 아키텍처 또는 순수 클라이언트 사이드 아키텍처로 구현될 수 있습니다.

- **순수 클라이언트 사이드 아키텍처 (Pure Client-Side Architecture)**:

  - 모든 게임 로직, 단어 유효성 검사(내장 단어 리스트 사용 시), AI 응답 생성(단순 규칙 기반 또는 내장 데이터 활용 시)이 사용자의 웹 브라우저 내에서 JavaScript를 통해 실행됩니다.
  - 장점: 서버 구축 및 관리 비용이 없고, 응답 속도가 빠를 수 있습니다.
  - 단점: 복잡한 AI 로직이나 대규모 단어 DB 관리가 어렵고, 클라이언트 자원에 의존적입니다.

- **클라이언트-서버 아키텍처 (Client-Server Architecture)**:
  - **클라이언트 (프론트엔드)**: 사용자 인터페이스(UI)를 제공하고 사용자 입력을 받아 서버로 전송합니다. 서버로부터 받은 AI의 응답을 화면에 표시합니다.
  - **서버 (백엔드)**: 단어 유효성 검사 (외부 사전 API 연동 또는 서버 DB 조회), AI의 다음 단어 생성 로직 (외부 AI API 연동 또는 서버 내 복잡한 로직 수행), 게임 상태 관리 등을 담당할 수 있습니다.
  - 장점: 복잡한 로직 처리, 보안, 데이터 중앙 관리가 용이합니다.
  - 단점: 서버 개발 및 유지보수 비용이 발생하고, 네트워크 지연이 있을 수 있습니다.

_초기에는 순수 클라이언트 사이드 아키텍처로 시작하여, 필요에 따라 클라이언트-서버 아키텍처로 확장하는 것을 고려할 수 있습니다._

## 2. 주요 구성 요소 (Key Components)

- **UI 모듈 (UI Module)**:

  - 역할: 게임 화면 렌더링, 사용자 입력(단어) 처리, 게임 상태(현재 단어, 사용된 단어, 점수 등) 표시.
  - 기술: React 컴포넌트 (예: `WordInput`, `WordDisplay`, `GameStatus`) 또는 DOM 조작 JavaScript 함수.

- **게임 로직 모듈 (Game Logic Module)**:

  - 역할: 게임 시작/종료 관리, 턴 관리, 사용자 입력 단어와 이전 단어의 끝말/첫말 일치 여부 판단, 게임 규칙 적용 (예: 시간 제한, 중복 단어).
  - 구현: JavaScript 함수 또는 클래스.

- **단어 유효성 검사 모듈 (Word Validation Module)**:

  - 역할: 입력된 단어가 실제 한글 단어인지, 이미 사용된 단어는 아닌지 등을 검사합니다.
  - 구현:
    - 내장 단어 리스트 (JSON, Array)를 필터링합니다.
    - (선택적) 국어사전 API를 호출하여 단어 존재 유무를 확인합니다.

- **AI 응답 생성 모듈 (AI Response Generation Module)**:

  - 역할: 주어진 끝말에 해당하는 다음 단어를 생성합니다.
  - 구현:
    - 내장 단어 리스트에서 조건에 맞는 단어를 무작위 또는 특정 규칙에 따라 선택합니다.
    - (선택적) ChatGPT와 같은 외부 AI API를 호출하여 단어를 추천받습니다.

- **상태 관리 모듈 (State Management Module)** (React 사용 시):
  - 역할: 게임의 현재 상태(예: 현재 제시 단어, 사용된 단어 목록, 현재 턴, 점수, 게임 종료 여부 등)를 관리합니다.
  - 기술: React의 `useState`, `useReducer` 훅 또는 `Zustand`, `Redux Toolkit` 같은 상태 관리 라이브러리.

## 3. 디자인 패턴 (Design Patterns - 고려 사항)

- **모듈 패턴 (Module Pattern)** (JavaScript):

  - 각 주요 기능을 독립적인 모듈로 분리하여 코드의 가독성, 재사용성, 유지보수성을 높입니다.

- **상태 패턴 (State Pattern)**:

  - 게임의 여러 상태(예: 시작 전, 진행 중, 종료)에 따라 객체의 행동이 달라져야 할 때 유용할 수 있습니다. (복잡도에 따라 고려)

- **전략 패턴 (Strategy Pattern)**:

  - AI의 난이도에 따라 단어 선택 전략을 다르게 가져가거나, 단어 유효성 검사 방식을 여러 가지로 둘 때 적용 가능합니다.

- **옵저버 패턴 (Observer Pattern)**:
  - 게임 상태 변경(예: 점수 변경, 턴 변경) 시 UI 요소들이 자동으로 업데이트되도록 하는 데 활용될 수 있습니다. (React와 같은 선언형 UI 라이브러리 사용 시 내부적으로 유사한 메커니즘 활용)

## 4. 데이터 흐름 (Data Flow)

1. 사용자 단어 입력 (UI Module) → 입력 값 전달 (Game Logic Module)
2. 이전 단어 끝말과 사용자 입력 단어 첫말 일치 확인 (Game Logic Module)
3. 단어 유효성 검사 요청 (Game Logic Module → Word Validation Module)
4. 유효성 검사 결과 반환 (Word Validation Module → Game Logic Module)
5. (유효 시) 사용된 단어 목록 업데이트, AI 턴으로 전환 (Game Logic Module)
6. AI 응답 생성 요청 (Game Logic Module → AI Response Generation Module)
7. AI 단어 반환 (AI Response Generation Module → Game Logic Module)
8. AI 단어 유효성 검사 (Game Logic Module → Word Validation Module) - AI가 생성한 단어도 검증 필요
9. (유효 시) AI 단어를 현재 단어로 설정, 사용자 턴으로 전환 (Game Logic Module)
10. 변경된 게임 상태 UI에 반영 (Game Logic Module → UI Module / State Management Module → UI Module)
11. 게임 종료 조건 충족 시 게임 종료 처리 (Game Logic Module)
