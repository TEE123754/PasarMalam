$ErrorActionPreference = 'Stop'
$pasarRoot = Split-Path -Parent $PSScriptRoot
$pasarTools = Join-Path $pasarRoot '.local-tools/ffmpeg'
New-Item -ItemType Directory -Path $pasarTools -Force | Out-Null
# Windows binary provider linked from https://ffmpeg.org/download.html.
$pasarSource = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
$pasarZip = Join-Path $pasarTools 'release.zip'
$pasarExpected = ((Invoke-WebRequest -Uri ($pasarSource + '.sha256')).Content.Trim() -split '\s+')[0].ToLowerInvariant()
if ($pasarExpected -notmatch '^[0-9a-f]{64}$') { throw 'Invalid provider SHA256' }
if (-not (Test-Path -LiteralPath $pasarZip)) { Invoke-WebRequest -Uri $pasarSource -OutFile $pasarZip }
if ((Get-FileHash -LiteralPath $pasarZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pasarExpected) { throw 'FFmpeg checksum mismatch; not executing or extracting the archive' }
Expand-Archive -LiteralPath $pasarZip -DestinationPath $pasarTools -Force
$pasarProbe = Get-ChildItem -LiteralPath $pasarTools -Filter ffprobe.exe -Recurse | Select-Object -First 1
if (-not $pasarProbe) { throw 'ffprobe is missing from verified archive' }
Write-Output 'Verified FFmpeg/ffprobe installed privately; start-local.ps1 adds them to that process PATH.'
