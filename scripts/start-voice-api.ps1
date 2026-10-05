param([int]$Port = 8000)
$ErrorActionPreference = 'Stop'
$phase6Root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $phase6Root
$env:APP_ENV = 'demo'
$env:LOCAL_LLM_URL = 'http://127.0.0.1:8080/v1/chat/completions'
$env:LOCAL_LLM_MODEL = 'pasar-voice'
$env:LOCAL_LLM_KEY = [System.IO.File]::ReadAllText((Join-Path $phase6Root '.local-voice/runtime-key.env')).Trim()
$env:ALLOWED_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5177'
$env:UV_CACHE_DIR = Join-Path $phase6Root '.uv-cache'
uv run --project apps/api uvicorn app.main:app --app-dir apps/api --host 127.0.0.1 --port $Port
exit $LASTEXITCODE
