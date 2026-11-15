param([switch]$Strict)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$root    = Join-Path $appRoot 'release\win-unpacked'
$res     = Join-Path $root 'resources'
$fail = @()
$warn = @()

Write-Host "== ElecTranslator bundle check ==" -ForegroundColor Cyan

if (-not (Test-Path $res)) {
  Write-Host "FAIL  Not found: $res" -ForegroundColor Red
  Write-Host "Please run 'pnpm dist' or 'pnpm release' first." -ForegroundColor Yellow
  exit 1
}

# 1. Version in latest.yml must match package.json
$pkgVersion = (Get-Content (Join-Path $appRoot 'package.json') -Raw | ConvertFrom-Json).version
$yml = Join-Path $appRoot 'release\latest.yml'
if (Test-Path $yml) {
  $raw = Get-Content $yml -Raw
  if ($raw -match '(?m)^version:\s*(.+)$') {
    $ymlVersion = $Matches[1].Trim()
    if ($ymlVersion -ne $pkgVersion) {
      $fail += "latest.yml ($ymlVersion) != package.json ($pkgVersion)"
    } else {
      Write-Host "  version $pkgVersion : OK"
    }
  }
} else {
  $warn += "Not found release/latest.yml"
}

# 2. File .env must be excluded from bundle
$envFiles = @(Get-ChildItem $root -Recurse -Force -File -Include '.env','.env.*' -ErrorAction SilentlyContinue)
foreach ($f in $envFiles) { $fail += "Found secret file: $($f.FullName)" }

# 3. Private key (except CA bundle from certifi)
$keys = @(Get-ChildItem $root -Recurse -Force -File -Include '*.pem','*.key' -ErrorAction SilentlyContinue |
          Where-Object { $_.Name -ne 'cacert.pem' -and $_.FullName -notmatch 'certifi|\\ssl\\' })
foreach ($f in $keys) { $warn += "Found private key file: $($f.FullName)" }

# 4. app-update.yml
if (Test-Path (Join-Path $res 'app-update.yml')) {
  Write-Host "  app-update.yml : OK"
} elseif ($Strict) {
  $fail += "Not found resources/app-update.yml -> auto-update disabled."
} else {
  $warn += "Not found app-update.yml"
}

# 5. Resource bundle must be excluded from bundle
foreach ($d in @('backend', 'scripts', 'assets','screenshot')) {
  if (Test-Path (Join-Path $res $d)) { Write-Host "  resources/$d : OK" }
  else { $fail += "Not found resources/$d" }
}

# 6. Trash files in backend must be excluded from bundle
foreach ($p in @('backend\tests','backend\.pytest_cache')) {
  if (Test-Path (Join-Path $res $p)) { $fail += "Trash file: resources/$p" }
}
$backendDir = Join-Path $res 'backend'
if (Test-Path $backendDir) {
  $pyc = @(Get-ChildItem $backendDir -Recurse -Force -Directory -Filter '__pycache__' -ErrorAction SilentlyContinue)
  if ($pyc.Count) { $fail += "Found: resources/backend/__pycache__ - $($pyc.Count) directories" }
}

foreach ($w in $warn) { Write-Host "WARN  $w" -ForegroundColor Yellow }
foreach ($f in $fail) { Write-Host "FAIL  $f" -ForegroundColor Red }
if ($fail.Count -or ($Strict -and $warn.Count)) { exit 1 }
Write-Host "== bundle OK ==" -ForegroundColor Green