param(
  [Parameter(Mandatory=$true)][string]$Version,
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
Set-Location "C:\Users\Bruno\dev\sistema-base"

if (-not $Message) { $Message = "Release v$Version" }

powershell -File "backup-db.ps1" -Label "pre-v$Version"

git add -A
git commit -m $Message
git tag "v$Version"

Write-Output "Tagged v$Version."
Write-Output "To roll back code: git checkout v<versao-anterior> -- ."
Write-Output "To roll back the database: copy a file from db-backups\ over dev.db"
