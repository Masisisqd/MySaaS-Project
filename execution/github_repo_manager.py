import os
import subprocess
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
REPO_NAME = os.path.basename(os.getcwd())

def run_git_command(command):
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    return result.returncode == 0, result.stdout

def create_github_repo(repo_name):
    print(f"Creating repository '{repo_name}' on GitHub...")
    url = "https://api.github.com/user/repos"
    data = json.dumps({
        "name": repo_name,
        "private": False,
        "auto_init": False
    }).encode("utf-8")
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print(f"Successfully created repository: {res_data['html_url']}")
            return True, res_data['clone_url']
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print(f"Repository '{repo_name}' already exists or name is invalid.")
            return True, f"https://github.com/{GITHUB_USERNAME}/{repo_name}.git"
        else:
            print(f"Failed to create repository: {e.reason}")
            return False, None

def main():
    if not GITHUB_TOKEN or not GITHUB_USERNAME:
        print("Error: GITHUB_TOKEN and GITHUB_USERNAME must be set in .env file.")
        return

    # 1. Check git status
    success, _ = run_git_command(["git", "status"])
    if not success:
        print("Initializing git...")
        run_git_command(["git", "init"])

    # 2. Add and commit
    run_git_command(["git", "add", "."])
    run_git_command(["git", "commit", "-m", "Initial commit from Antigravity"])

    # 3. Create repo on GitHub
    success, clone_url = create_github_repo(REPO_NAME)
    if not success:
        return

    # 4. Add remote with token for authentication
    auth_url = clone_url.replace("https://", f"https://{GITHUB_TOKEN}@")
    run_git_command(["git", "remote", "remove", "origin"]) # Clean up if exists
    run_git_command(["git", "remote", "add", "origin", auth_url])

    # 5. Push
    print("Pushing to GitHub...")
    run_git_command(["git", "branch", "-M", "main"])
    success, _ = run_git_command(["git", "push", "-u", "origin", "main"])
    
    if success:
        print("\nSUCCESS: Project pushed to GitHub!")
        print(f"Repository URL: https://github.com/{GITHUB_USERNAME}/{REPO_NAME}")
    else:
        print("\nFAILED: Could not push to GitHub. Check your credentials and network.")

if __name__ == "__main__":
    main()
