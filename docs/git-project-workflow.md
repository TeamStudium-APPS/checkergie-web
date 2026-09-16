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
- 관련 이슈가 있다면 PR 본문에 `Closes #<issue-number>`를 작성한다.
- PR이 이슈에 연결되면 Project 상태는 `Review`로 자동 변경된다.
- PR이 병합되면 Project 상태는 `Done`으로 자동 변경된다.

### Project Status

`Backlog → Todo → In Progress → Review → Done`

- `Backlog`: 아직 착수하지 않은 작업
- `Todo`: 작업하기로 결정된 작업
- `In Progress`: 현재 작업 중
- `Review`: PR 리뷰 및 병합 대기
- `Done`: 완료된 작업