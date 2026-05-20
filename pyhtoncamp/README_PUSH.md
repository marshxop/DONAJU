Push helper

Steps to push this website to a remote repository:

1. Install Git for Windows: https://git-scm.com/download/win
2. Open a PowerShell or Git Bash terminal in this folder: `c:\Users\User\Desktop\pyhtoncamp`
3. Run one of the helper scripts below, passing your repository URL:

PowerShell:

  .\push_website.ps1 -RepoUrl 'https://github.com/USER/REPO.git'

POSIX / Git Bash:

  ./push_website.sh https://github.com/USER/REPO.git

Notes:
- The scripts will initialize a Git repository here if none exists, add all files, create a commit, set `origin`, and push to the `main` branch.
- If the remote already exists, the script will replace it with the provided URL.
