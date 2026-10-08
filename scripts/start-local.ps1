param([ValidateSet('api','web','worker')][string]$Service='web')
$ErrorActionPreference = 'Stop'
$pasarRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $pasarRoot
$env:UV_CACHE_DIR = Join-Path $pasarRoot '.uv-cache'
$env:npm_config_cache = Join-Path $pasarRoot '.npm-cache'
$pasarBin = Get-ChildItem -LiteralPath (Join-Path $pasarRoot '.local-tools') -Filter ffprobe.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pasarBin) { $env:PATH = $pasarBin.DirectoryName + [IO.Path]::PathSeparator + $env:PATH }
switch ($Service) {
  'api' { uv run --project apps/api uvicorn app.main:app --app-dir apps/api --env-file apps/api/.env --host 127.0.0.1 --port 8010 }
  'web' { npm run preview -w @pasarmalam/web -- --port 5174 --strictPort }
  'worker' { uv run --project apps/api python scripts/local_worker.py }
}
exit $LASTEXITCODE
