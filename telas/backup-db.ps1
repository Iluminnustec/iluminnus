param(
  [string]$Label = ""
)

$ErrorActionPreference = "Stop"
$root = "C:\Users\Bruno\dev\sistema-base"
$backupDir = Join-Path $root "db-backups"
$env:Path += ";C:\Program Files\nodejs"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$versionFile = Join-Path $root "src\lib\version.ts"
$version = "unknown"
if (Test-Path $versionFile) {
  $match = Select-String -Path $versionFile -Pattern 'APP_VERSION = "(.+?)"'
  if ($match) { $version = $match.Matches[0].Groups[1].Value }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$suffix = ""
if ($Label) { $suffix = "-$Label" }
$backupName = "postgres-v$version-$timestamp$suffix.json"
$backupPath = Join-Path $backupDir $backupName

Push-Location $root
try {
  npx tsx backup-postgres.ts $backupPath
} finally {
  Pop-Location
}

Get-ChildItem $backupDir -Filter "postgres-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 30 | Remove-Item -Force
