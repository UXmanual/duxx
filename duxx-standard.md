# DUXX Project Standard Specification (v1.3.3)

이 문서는 DUXX 프로젝트의 핵심 아키텍처와 관리 규칙을 정의합니다. 새로운 에이전트나 개발자가 프로젝트에 참여할 때 이 가이드를 반드시 준수해야 합니다.

---

## 🏗 1. Core Architecture Structure

프로젝트는 **"물리적 격리(Physical Isolation)"**와 **"역할 분담(Role Separation)"**을 원칙으로 합니다.

| 폴더/파일명 | 역할 | 비고 |
| :--- | :--- | :--- |
| `src/Index.jsx` | 시스템 진입점 (System Entry) | 스타일 로드 및 앱 구동 |
| `src/components/Layout.jsx` | 껍데기 레이아웃 (Dumb Shell) | 고정 요소(Header, Footer) 관리 |
| `src/pages/Main.jsx` | 메인 콘텐츠 (Real Content) | 실제 업무 로직 및 화면 구성 |
| `src/context/ThemeContext.jsx` | 로직 엔진 (Logic Engine) | 다크모드 등 전역 상태 제어 |
| `src/styles/themes/` | 디자인 토큰 (Design Tokens) | 색상 변수(light.css, dark.css) 관리 |
| `src/data/` | 정적 데이터 (Asset Data) | JSON 기반의 중앙 집중식 데이터 관리 |

---

## 📜 2. Essential Rules (반드시 지켜야 할 규칙)

### 2.1. 명명 규칙 (Naming Convention)
- **PascalCase**: 모든 `.jsx` 파일과 소스 파일명은 대문자로 시작합니다.
- **Semantic Classes**: 색상명(blue-500) 대신 테마 변수(`text-theme-primary`)를 사용합니다.

### 2.2. 제로 하드코딩 (Zero Hardcoding)
- 모든 수치와 텍스트는 가급적 `src/data/` 내의 JSON 파일이나 CSS 변수를 통해 제어합니다.
- 에이전트는 코드 내부의 직접적인 스타일 주입을 금지합니다.

### 2.3. 자기 결정적 레이아웃 원칙 (Self-determined Layout)
- **Layout.jsx**는 여백이나 크기를 강제하지 않습니다.
- **콘텐츠 페이지(Main.jsx 등)**가 테일윈드 클래스(`pt-40`, `max-w-6xl` 등)를 통해 자신의 레이아웃을 스스로 결정합니다.
- 이 원칙은 수정 시 타 영역(Header, Footer)에 대한 간섭을 물리적으로 차단합니다.

---

## 🤖 3. Agent Instruction (에이전트 작업 지침)

1. **격리 준수**: 특정 페이지 수정 요청 시, 해당 파일(`src/pages/`) 외의 레이아웃 파일은 절대 건드리지 마십시오.
2. **테마 일관성**: 새로운 UI 추가 시 반드시 `src/styles/global.css` 및 `themes/`에 정의된 CSS 변수를 활용하십시오.
3. **업데이트 고지 (필수)**: 소스 수정 후 배포 시에는 반드시 `package.json`의 버전을 소수점 첫째 자리까지만 상향(예: 4.2 -> 4.3)하고, `Footer.jsx`의 `Last Deployed` 타임스탬프를 현재 시간으로 업데이트하여 배포 여부를 명시하십시오. 이는 모든 에이전트 작업의 필수 마무리 단계입니다.

---

## 🛠 4. Technology Stack
- **Library**: React (Vite)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide-React
- **Animation**: Framer Motion (Optional)

---

**Confirmed by Admin: Hyeon**
**Latest Standard Version: 1.3.3**
