$file = Join-Path $PSScriptRoot 'hub\index.html'
$lines = Get-Content $file -Encoding UTF8
$count = 0
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '--bg1') {
        $count++
        $trimmed = $lines[$i].Trim()
        if ($trimmed.Length -gt 120) { $trimmed = $trimmed.Substring(0, 120) }
        Write-Output ("{0}: {1}" -f ($i+1), $trimmed)
    }
}
Write-Output "--- Total: $count ---"
