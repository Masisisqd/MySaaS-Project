# Push Project to GitHub

**Goal:** Create a GitHub repository and push the current project code to it.

**Inputs:**

- `GITHUB_TOKEN` (env): Personal Access Token with `repo` scope.
- `GITHUB_USERNAME` (env): Your GitHub username.
- `REPO_NAME` (string, optional): Name of the repository to create. Defaults to current directory name.

**Tools/Scripts:**

- `execution/github_repo_manager.py`: Handles Git initialization, repository creation, and pushing.

**Outputs:**

- A new public/private repository on GitHub with the project code.

**SOP:**

1. Ensure Git is initialized locally (`git init`).
2. Verify all sensitive files are in `.gitignore`.
3. Commit all current changes.
4. Call `execution/github_repo_manager.py` to create the remote repository and push.

**Edge Cases:**

- Repository already exists on GitHub: Script should handle or warn.
- Invalid Token: Script will fail with 401 Unauthorized.
- Network Issues: Script will retry or fail gracefully.
