$ErrorActionPreference = 'Stop'
$phase6Root = Split-Path -Parent $PSScriptRoot
$phase6Manifest = Get-Content (Join-Path $phase6Root 'contracts/local-llm-runtime.json') -Raw | ConvertFrom-Json
$phase6Model = Get-Content (Join-Path $phase6Root 'contracts/speech-model.json') -Raw | ConvertFrom-Json
$phase6Runtime = Join-Path $phase6Root ".local-voice/$($phase6Manifest.version)"
$phase6Server = Get-ChildItem -LiteralPath $phase6Runtime -Filter 'llama-server.exe' -Recurse | Select-Object -First 1
if (-not $phase6Server) { throw 'Run npm run phase6:model-setup first.' }
$phase6Weights = Join-Path $phase6Root ".local-voice/$($phase6Model.llm_file)"
if ((Get-FileHash -LiteralPath $phase6Weights -Algorithm SHA256).Hash.ToLower() -ne $phase6Manifest.model_sha256) { throw 'Model checksum mismatch.' }
$phase6KeyFile = Join-Path $phase6Root '.local-voice/runtime-key.env'
if (-not (Test-Path -LiteralPath $phase6KeyFile)) { [System.IO.File]::WriteAllText($phase6KeyFile, ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'))) }
$phase6Key = [System.IO.File]::ReadAllText($phase6KeyFile).Trim()
& $phase6Server.FullName -m $phase6Weights --host 127.0.0.1 --port 8080 --api-key $phase6Key --alias pasar-voice -c 4096 -t 4 -ngl 0 -np 1
exit $LASTEXITCODE
