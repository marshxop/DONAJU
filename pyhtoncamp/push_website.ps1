Param(
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl = ""
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH. Please install Git and re-run this script." -ForegroundColor Red
    Exit 1
}

if (-not (Test-Path .git)) {
    git init
}

git add .
try {
    git commit -m "Add website files" -q
} catch {
    # commit may fail if nothing to commit; ignore
}

if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
    Write-Host "Repository URL not provided. To push, run:`n  .\push_website.ps1 -RepoUrl 'https://github.com/USER/REPO.git'" -ForegroundColor Yellow
    Exit 0
}

$remotes = git remote
if ($remotes -match "origin") {
    git remote remove origin
}
git remote add origin $RepoUrl
git branch -M main
git push -u origin main
