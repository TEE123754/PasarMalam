$ErrorActionPreference = 'Stop'
$phase6Root = Split-Path -Parent $PSScriptRoot
$phase6Path = Join-Path $phase6Root '.local-voice/synthetic-english.wav'
$phase6Voice = New-Object -ComObject SAPI.SpVoice
$phase6Stream = New-Object -ComObject SAPI.SpFileStream
$phase6Stream.Open($phase6Path, 3)
try {
    $phase6Voice.AudioOutputStream = $phase6Stream
    [void]$phase6Voice.Speak('Chicken satay. Twenty sticks, six ringgit. Ingredients chicken, peanuts. Cooked at five P M.')
} finally {
    $phase6Stream.Close()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($phase6Stream)
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($phase6Voice)
}
Write-Output 'Synthetic English WAV created locally. This is not a human or microphone evaluation.'
