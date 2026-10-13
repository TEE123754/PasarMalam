$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskPython = Join-Path $taskRoot '.local-voice/asr-venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $taskPython)) {
    throw 'Prepare the optional speech runtime and pinned model using docs/VOICE_ACCURACY_IMPROVEMENTS.md first.'
}
Set-Location -LiteralPath $taskRoot
& $taskPython (Join-Path $PSScriptRoot 'local_speech_helper.py')
