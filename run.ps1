# run.ps1 — PowerShell launcher for BidSentinel
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$VenvPython = Join-Path $ScriptDir "backend\.venv\Scripts\python.exe"

if (Test-Path $VenvPython) {
    & $VenvPython "run.py" $args
} else {
    python "run.py" $args
}
