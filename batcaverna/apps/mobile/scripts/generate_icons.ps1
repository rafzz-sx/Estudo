Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\perei\.gemini\antigravity-ide\brain\19d6e335-5fed-4a55-88a8-a42ccaa82ea9\.user_uploaded\media_1788300519084.png"
$resBase = "C:\Users\perei\OneDrive\Documentos\Estudo\batcaverna\apps\mobile\android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found: $sourcePath"
    exit 1
}

$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

$densities = @(
    @{ name = "mipmap-mdpi"; size = 48; fgSize = 108 },
    @{ name = "mipmap-hdpi"; size = 72; fgSize = 162 },
    @{ name = "mipmap-xhdpi"; size = 96; fgSize = 216 },
    @{ name = "mipmap-xxhdpi"; size = 144; fgSize = 324 },
    @{ name = "mipmap-xxxhdpi"; size = 192; fgSize = 432 }
)

function Create-AppIcon {
    param(
        [int]$size,
        [bool]$isRound,
        [string]$outputPath,
        [double]$scale = 0.82
    )

    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Dark background #0B0B0F
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 11, 15))
    
    if ($isRound) {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.FillEllipse($bgBrush, 0, 0, $size, $size)
        
        # Subtle gold tactical ring
        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 197, 24), [Math]::Max(1.0, $size * 0.025))
        $g.DrawEllipse($borderPen, 0, 0, $size - 1, $size - 1)
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    }

    # Calculate centered bat image size
    $targetW = [int]($size * $scale)
    $aspect = $sourceImg.Height / $sourceImg.Width
    $targetH = [int]($targetW * $aspect)

    $x = [int](($size - $targetW) / 2)
    $y = [int](($size - $targetH) / 2)

    $g.DrawImage($sourceImg, $x, $y, $targetW, $targetH)

    $g.Dispose()
    
    # Save PNG
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

function Create-ForegroundIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [double]$scale = 0.65
    )

    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.Clear([System.Drawing.Color]::Transparent)

    # Calculate centered bat image size within safe zone
    $targetW = [int]($size * $scale)
    $aspect = $sourceImg.Height / $sourceImg.Width
    $targetH = [int]($targetW * $aspect)

    $x = [int](($size - $targetW) / 2)
    $y = [int](($size - $targetH) / 2)

    $g.DrawImage($sourceImg, $x, $y, $targetW, $targetH)

    $g.Dispose()
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

foreach ($d in $densities) {
    $dir = Join-Path $resBase $d.name
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $squarePath = Join-Path $dir "ic_launcher.png"
    $roundPath = Join-Path $dir "ic_launcher_round.png"
    $fgPath = Join-Path $dir "ic_launcher_foreground.png"

    Create-AppIcon -size $d.size -isRound $false -outputPath $squarePath -scale 0.85
    Create-AppIcon -size $d.size -isRound $true -outputPath $roundPath -scale 0.78
    Create-ForegroundIcon -size $d.fgSize -outputPath $fgPath -scale 0.65
    
    Write-Host "Generated $($d.name): $($d.size)x$($d.size)"
}

# Adaptive icons config directory (mipmap-anydpi-v26)
$anyDpiDir = Join-Path $resBase "mipmap-anydpi-v26"
if (-not (Test-Path $anyDpiDir)) {
    New-Item -ItemType Directory -Path $anyDpiDir -Force | Out-Null
}

$icLauncherXml = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/splashscreen_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
"@
Set-Content -Path (Join-Path $anyDpiDir "ic_launcher.xml") -Value $icLauncherXml -Encoding UTF8
Set-Content -Path (Join-Path $anyDpiDir "ic_launcher_round.xml") -Value $icLauncherXml -Encoding UTF8

# Generate 1024x1024 master icon
$assetsDir = "C:\Users\perei\OneDrive\Documentos\Estudo\batcaverna\apps\mobile\assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}
Create-AppIcon -size 1024 -isRound $false -outputPath (Join-Path $assetsDir "icon.png") -scale 0.85
Create-AppIcon -size 1024 -isRound $false -outputPath (Join-Path $assetsDir "adaptive-icon.png") -scale 0.85
Write-Host "Generated Master Assets: 1024x1024"

$sourceImg.Dispose()
Write-Host "All Android launcher and adaptive icons generated successfully with high quality!"
