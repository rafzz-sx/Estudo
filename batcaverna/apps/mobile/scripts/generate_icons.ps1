Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\perei\.gemini\antigravity-ide\brain\0b376f53-65d6-49f7-b2e4-b3b96137f884\.user_uploaded\media_1788008237219.png"
$resBase = "C:\Users\perei\OneDrive\Documentos\Estudo\batcaverna\apps\mobile\android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found: $sourcePath"
    exit 1
}

$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

$densities = @(
    @{ name = "mipmap-mdpi"; size = 48 },
    @{ name = "mipmap-hdpi"; size = 72 },
    @{ name = "mipmap-xhdpi"; size = 96 },
    @{ name = "mipmap-xxhdpi"; size = 144 },
    @{ name = "mipmap-xxxhdpi"; size = 192 }
)

function Create-AppIcon {
    param(
        [int]$size,
        [bool]$isRound,
        [string]$outputPath
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
        
        # Subtle gold/purple tactical border
        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 197, 24), [Math]::Max(1.0, $size * 0.03))
        $g.DrawEllipse($borderPen, 0, 0, $size - 1, $size - 1)
    } else {
        # Rounded rectangle for adaptive/square
        $g.Clear([System.Drawing.Color]::Transparent)
        $rectBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 11, 15))
        $g.FillRectangle($rectBrush, 0, 0, $size, $size)
    }

    # Calculate centered bat image size (75% of icon width)
    $targetW = [int]($size * 0.78)
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

foreach ($d in $densities) {
    $dir = Join-Path $resBase $d.name
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $squarePath = Join-Path $dir "ic_launcher.png"
    $roundPath = Join-Path $dir "ic_launcher_round.png"

    Create-AppIcon -size $d.size -isRound $false -outputPath $squarePath
    Create-AppIcon -size $d.size -isRound $true -outputPath $roundPath
    
    Write-Host "Generated $($d.name): $($d.size)x$($d.size)"
}

# Generate 1024x1024 master icon
$assetsDir = "C:\Users\perei\OneDrive\Documentos\Estudo\batcaverna\apps\mobile\assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}
Create-AppIcon -size 1024 -isRound $false -outputPath (Join-Path $assetsDir "icon.png")
Create-AppIcon -size 1024 -isRound $false -outputPath (Join-Path $assetsDir "adaptive-icon.png")
Write-Host "Generated Master Assets: 1024x1024"

$sourceImg.Dispose()
Write-Host "All Android launcher icons generated successfully!"
