param([switch]$Strict)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$root    = Join-Path $appRoot 'release\win-unpacked'
$res     = Join-Path $root 'resources'
$fail = @()
$warn = @()

Write-Host "== ElecTranslator bundle check ==" -ForegroundColor Cyan

if (-not (Test-Path $res)) {
  Write-Host "FAIL  Khong thay: $res" -ForegroundColor Red
  Write-Host "      Chay 'pnpm dist' hoac 'pnpm release' truoc." -ForegroundColor Yellow
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
      Write-Host "  version $pkgVersion : khop latest.yml"
    }
  }
} else {
  $warn += "Khong thay release/latest.yml"
}

# 2. File .env must be excluded from bundle
$envFiles = @(Get-ChildItem $root -Recurse -Force -File -Include '.env','.env.*' -ErrorAction SilentlyContinue)
foreach ($f in $envFiles) { $fail += "LO SECRET: $($f.FullName)" }

# 3. Private key (except CA bundle from certifi)
$keys = @(Get-ChildItem $root -Recurse -Force -File -Include '*.pem','*.key' -ErrorAction SilentlyContinue |
          Where-Object { $_.Name -ne 'cacert.pem' -and $_.FullName -notmatch 'certifi|\\ssl\\' })
foreach ($f in $keys) { $warn += "Nghi la key, xem thu: $($f.FullName)" }

# 4. app-update.yml
if (Test-Path (Join-Path $res 'app-update.yml')) {
  Write-Host "  app-update.yml : OK"
} elseif ($Strict) {
  $fail += "Thieu resources/app-update.yml -> auto-update khong chay"
} else {
  $warn += "Thieu app-update.yml - binh thuong voi 'pnpm dist', BAT BUOC co khi 'pnpm release'"
}

# 5. Resource bundle must be excluded from bundle
foreach ($d in @('backend', 'scripts', 'assets','screenshot')) {
  if (Test-Path (Join-Path $res $d)) { Write-Host "  resources/$d : OK" }
  else { $fail += "Thieu resources/$d" }
}

# 6. Rac in backend must be excluded from bundle
foreach ($p in @('backend\tests','backend\.pytest_cache')) {
  if (Test-Path (Join-Path $res $p)) { $fail += "Con rac: resources/$p" }
}
$backendDir = Join-Path $res 'backend'
if (Test-Path $backendDir) {
  $pyc = @(Get-ChildItem $backendDir -Recurse -Force -Directory -Filter '__pycache__' -ErrorAction SilentlyContinue)
  if ($pyc.Count) { $fail += "Con $($pyc.Count) thu muc __pycache__" }
}

foreach ($w in $warn) { Write-Host "WARN  $w" -ForegroundColor Yellow }
foreach ($f in $fail) { Write-Host "FAIL  $f" -ForegroundColor Red }
if ($fail.Count -or ($Strict -and $warn.Count)) { exit 1 }
Write-Host "== bundle OK ==" -ForegroundColor Green