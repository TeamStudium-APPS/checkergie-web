## GitHub Workflow

### Issues

- 이슈 제목은 작업 내용을 한글로 간결하게 작성한다.
- 모든 이슈에는 작업 성격에 맞는 Label을 지정한다.
    - `feature`: 새로운 기능 및 체커 추가
    - `fix`: 오류 및 버그 수정
    - `refactor`: 기능 변화 없는 구조 개선
    - `chore`: 의존성, 도구, 설정 등 유지보수
    - `docs`: 문서 추가 및 수정
- Priority는 작업 중요도에 따라 `P0` ~ `P3`로 지정한다.
- 새 이슈는 GitHub Project의 `Backlog`에 자동으로 추가된다.

### Branches

브랜치는 다음 형식을 사용한다.

`<type>/<task-name>`

예:
- `feature/checker-result`
- `fix/url-validation`
- `refactor/checker-logic`

이슈 번호는 브랜치명에 포함하지 않는다.

### Pull Requests

- PR 제목은 브랜치명과 동일하게 작성한다.
- 이슈 하나는 PR 하나와 연결하고, PR 하나도 이슈 하나만 종료한다.
- 작업을 여러 PR로 나누면 동일한 수의 이슈로 범위를 나누며 하나의 포괄 이슈를 여러 PR에서 재사용하지 않는다.
- PR 본문에는 해당 PR만 담당하는 이슈를 `Closes #<issue-number>`로 작성해 이슈의 Development에 연결한다. 단순 URL이나 `Refs`는 사용하지 않는다.
- PR 생성 후 GitHub의 closing issue 연결을 확인한다.
- PR이 이슈에 연결되면 Project 상태는 `Review`로 자동 변경된다.
- PR이 병합되면 Project 상태는 `Done`으로 자동 변경된다.

### 메타데이터 확인

- 이슈와 PR을 생성하거나 수정할 때 `Labels`, `Assignees`, `Projects`를 각각 확인하고 누락된 연결을 채운다. 본문에 이름이나 URL을 적는 것으로 대체하지 않는다.
- Label은 작업의 주목적에 맞게 지정하며 기존의 유효한 Label은 유지한다.
- 담당자는 사용자가 지정한 사람을 우선한다. 별도 지정이 없으면 기존 담당자를 유지하고, 담당자가 없는 본인 작업은 현재 작업자의 GitHub 계정에 배정한다.
- Project는 연결된 이슈 또는 저장소에서 사용하는 팀 Project를 따른다. 후보가 여러 개여서 결정할 근거가 없으면 사용자에게 확인한다.
- PR이 리뷰 대기 상태이면 연결된 이슈와 PR의 Project 상태가 `Review`인지 확인한다. 자동화 실행을 가정하지 않고 실제 결과를 조회한다.
- 작업 완료 보고 전에 이슈·PR의 Label, 담당자, Project와 closing issue 연결을 다시 확인한다. API 권한이 부족하면 접근 가능한 GitHub 화면에서도 확인할 수 있으며, 확인·수정하지 못한 항목은 원인과 함께 명시한다.

### Project Status

`Backlog → Todo → In Progress → Review → Done`

- `Backlog`: 아직 착수하지 않은 작업
- `Todo`: 작업하기로 결정된 작업
- `In Progress`: 현재 작업 중
- `Review`: PR 리뷰 및 병합 대기
- `Done`: 완료된 작업
