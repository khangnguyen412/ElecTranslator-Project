$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$ver  = (Get-Content "$root\package.json" -Raw | ConvertFrom-Json).version
$zip  = "$root\release\runtime-win-$ver.zip"
New-Item -ItemType Directory -Force "$root\release" | Out-Null
Compress-Archive -Path "$root\resources\python", "$root\resources\wheels" -DestinationPath $zip -CompressionLevel Optimal
Write-Host "File : $zip"
Write-Host "Hash : $((Get-FileHash $zip -Algorithm SHA256).Hash)"