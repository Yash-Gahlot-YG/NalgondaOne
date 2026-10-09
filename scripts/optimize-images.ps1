Add-Type -AssemblyName System.Drawing

function Optimize-Image($sourcePath, $destPath, $maxWidth, $quality) {
    if (-not (Test-Path $sourcePath)) {
        Write-Error "Source not found: $sourcePath"
        return
    }
    $bytes = [System.IO.File]::ReadAllBytes($sourcePath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $src = [System.Drawing.Image]::FromStream($ms)
    $origW = $src.Width
    $origH = $src.Height
    
    if ($origW -gt $maxWidth) {
        $newW = $maxWidth
        $newH = [int]($origH * ($maxWidth / $origW))
    } else {
        $newW = $origW
        $newH = $origH
    }
    
    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($src, 0, 0, $newW, $newH)
    $g.Dispose()
    $src.Dispose()
    $ms.Dispose()
    
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    
    $bmp.Save($destPath, $codec, $encoderParams)
    $bmp.Dispose()
    
    $size = (Get-Item $destPath).Length
    Write-Host "$destPath -> $([math]::Round($size/1024, 1)) KB (${newW}x${newH})"
}

$brainDir = "C:\Users\yashg\.gemini\antigravity-ide\brain\d2d59d4a-081d-44d4-9bec-37ddb5b9ffe6"
$assetsDir = "c:\GSR\NalgondaOne\assets\images"

Optimize-Image "$brainDir\nalgonda_fort_1789817970799.jpg" "$assetsDir\nalgonda-fort.jpg" 800 84
Optimize-Image "$brainDir\nagarjuna_sagar_1789804374539.jpg" "$assetsDir\nagarjuna-sagar.jpg" 800 84
Optimize-Image "$brainDir\deverakonda_fort_1789804400059.jpg" "$assetsDir\deverakonda-fort.jpg" 800 84
Optimize-Image "$brainDir\chaya_someshwara_1789804439518.jpg" "$assetsDir\chaya-someshwara.jpg" 800 84
