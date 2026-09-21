---
name: checkergie-git-workflow
description: Manage Checkergie Git and GitHub changes safely, including branches, commits, pushes, issues, pull requests, organization templates, and unmerged history corrections. Use whenever a task mutates Git history or GitHub state in Checkergie repositories; do not use for read-only inspection.
---

# Checkergie Git Workflow

Follow the user's requested scope exactly. GitHub mutations require explicit user authorization and do not grant permission for unrelated repository changes.

## Resolve the target

- Read `docs/git-convention.md`, `docs/branch-convention.md`, and `docs/git-project-workflow.md` when present.
- Confirm the repository, organization, branch, and requested number of pull requests from the user's words.
- Do not treat a repository-local `.github` directory as a substitute for the organization `.github` repository.
- Inspect `git status`, the current branch, `origin/develop`, and existing pull requests before changing Git history or GitHub state.

## Branches and pull requests

- Create every ordinary work branch from the latest `origin/develop` and open every ordinary pull request with `develop` as its base.
- Never use another feature or chore branch as a pull request base unless the user explicitly requests stacked pull requests in the current conversation.
- If the user asks for multiple pull requests, create that exact number of independent branches from `origin/develop`. Give each branch one clear purpose and minimize overlapping files.
- Keep a strict one-to-one relationship between issues and pull requests. One issue must be closed by exactly one pull request, and one pull request must close exactly one issue.
- When splitting work into multiple pull requests, create or update the same number of independently scoped issues before editing pull request bodies. Do not reuse a broad parent issue as the closing issue for multiple pull requests.
- Put `Closes #N` in the pull request body so GitHub adds the pull request to the issue's Development section. A plain issue URL, `Refs #N`, or a note in the issue body is not a substitute for this Development link.
- Use the branch name as the pull request title and follow the organization pull request template for the body.
- A dependency or preferred merge order does not change a pull request's base. Keep `develop` as the base and document the merge order when needed.

## Verify before and after mutation

Before each push or pull request mutation, verify:

1. `git status` contains only the intended files.
2. `git log origin/develop..HEAD` contains only the intended commits.
3. `git diff --stat origin/develop...HEAD` matches the pull request's stated purpose.
4. The branch does not contain commits assigned to another pull request.
5. The pull request body contains one `Closes #N`, and that issue is not closed by another open pull request.

After creating or editing each pull request, query GitHub and confirm that `baseRefName` is `develop`, `headRefName` is the intended branch, and the remote file list is scoped correctly. Query the pull request's GraphQL `closingIssuesReferences` and confirm it contains exactly the intended issue; this is the authoritative check for the Development connection.

Project status and Development connection are separate checks. If project fields cannot be read because the GitHub token lacks `read:project`, report that limitation instead of guessing, but still verify `closingIssuesReferences`. Do not report completion until every requested pull request passes the checks available with the current authorization.

## Correct a pushed mistake

- Stop and inspect before adding another commit.
- If an unmerged branch contains an accidental commit and the user wants it removed from history, preserve a local backup, reconstruct the branch from `origin/develop`, and update it with `--force-with-lease`. Do not add an inverse revert commit unless the user specifically wants history preserved.
- Force-push only when the user's request clearly authorizes rewriting the unmerged branch. Never rewrite `main` or `develop`.
- Recheck the remote pull request's commits and files after rewriting it. A clean local diff is not sufficient.
