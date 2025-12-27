$path = "c:\Users\marou\OneDrive - ROC Alfa-college\Bureaublad\BELANGRIJJK C#\modules\*.html"
$files = Get-ChildItem $path
$oldCSP = 'content="default-src ''self'' https://translate.googleapis.com; style-src ''self'' ''unsafe-inline'' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://translate.googleapis.com; font-src ''self'' https://fonts.gstatic.com; script-src ''self'' ''unsafe-inline'' https://cdnjs.cloudflare.com https://translate.google.com https://translate.googleapis.com; img-src ''self'' data: blob: file: https://translate.googleapis.com https://www.gstatic.com;">'
$newCSP = 'content="default-src ''self'' https://translate.googleapis.com; style-src ''self'' ''unsafe-inline'' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://translate.googleapis.com; font-src ''self'' https://fonts.gstatic.com; script-src ''self'' ''unsafe-inline'' https://cdnjs.cloudflare.com https://translate.google.com https://translate.googleapis.com https://unpkg.com; connect-src ''self'' https://unpkg.com https://*.peerjs.com wss://*.peerjs.com; img-src ''self'' data: blob: file: https://translate.googleapis.com https://www.gstatic.com;">'

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    if ($content.Contains($oldCSP)) {
         $newContent = $content.Replace($oldCSP, $newCSP)
         Set-Content -LiteralPath $file.FullName -Value $newContent -Encoding UTF8
         Write-Host "Updated $($file.Name)"
    } else {
         Write-Host "Skipped $($file.Name) (CSP not found or already updated)"
    }
}
