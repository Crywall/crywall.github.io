# CryWall — builds the wallpaper catalog for the website (no server needed online).
# Runs every night on GitHub Actions (Linux, PowerShell 7) and also works on Windows PowerShell 5.1:
#   powershell -ExecutionPolicy Bypass -File tools\build-catalog.ps1
# Output: public/data/c/<category>.json, public/data/l/<live-category>.json, public/data/index.json
param([string]$Out = (Join-Path (Join-Path $PSScriptRoot '..') (Join-Path 'public' 'data')))

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 CryWallCatalog'
$Utf8 = New-Object Text.UTF8Encoding $false

function Get-Html([string]$url) {
    for ($try = 1; $try -le 3; $try++) {
        try { return (Invoke-WebRequest $url -Headers @{ 'User-Agent' = $UA } -UseBasicParsing -TimeoutSec 40).Content }
        catch { if ($try -eq 3) { throw }; Start-Sleep -Seconds (5 * $try) }
    }
}
. (Join-Path $PSScriptRoot 'sources.ps1')

function Save-Json([string]$path, $obj) {
    New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
    $json = ConvertTo-Json -InputObject $obj -Compress -Depth 5
    if (-not $json) { $json = '[]' }
    [IO.File]::WriteAllText($path, $json, $Utf8)
}

# Same categories as public/app.js (Keşfet is mixed from these on the site)
$Cats = @(
    @{ key = 'doga'; q = 'nature'; c = '100' }, @{ key = 'manzara'; q = 'landscape'; c = '100' }, @{ key = 'anime'; q = 'sky'; c = '010' },
    @{ key = 'japonya'; q = 'Japan'; c = '100' }, @{ key = 'uzay'; q = 'space'; c = '100' }, @{ key = 'siberpunk'; q = 'cyberpunk'; c = '100' },
    @{ key = 'fantastik'; q = 'fantasy art'; c = '100' }, @{ key = 'dijital'; q = 'digital art'; c = '100' }, @{ key = 'araba'; q = 'cars'; c = '100' },
    @{ key = 'sehir'; q = 'city'; c = '100' }, @{ key = 'hayvan'; q = 'animals'; c = '100' }, @{ key = 'minimal'; q = 'minimalism'; c = '100' },
    @{ key = 'soyut'; q = 'abstract'; c = '100' }, @{ key = 'karanlik'; q = 'dark'; c = '100' }
)
$AnimeExtra = ' -"Makoto Shinkai" -"Studio Ghibli" -"Kimi no Na Wa" -"Genshin Impact" -"Honkai: Star Rail" -"Hatsune Miku"'

function Get-Wallhaven($cat, [string]$ratios, [int]$page, [string]$range) {
    $q = ($cat.q + $WhExclude + $(if ($cat.c -eq '010') { $AnimeExtra } else { '' })).Trim()
    $url = 'https://wallhaven.cc/api/v1/search?purity=100&sorting=toplist&atleast=1920x1080' +
        "&topRange=$range&categories=$($cat.c)&ratios=$ratios&page=$page&q=" + [uri]::EscapeDataString($q)
    for ($try = 1; $try -le 4; $try++) {
        try {
            Start-Sleep -Milliseconds 1500          # Wallhaven allows 45 requests / minute
            return (Invoke-RestMethod $url -Headers @{ 'User-Agent' = $UA } -TimeoutSec 40)
        } catch { Write-Host "  retry $try ($($_.Exception.Message))"; Start-Sleep -Seconds (20 * $try) }
    }
    return $null
}

$total = 0
foreach ($cat in $Cats) {
    $items = New-Object System.Collections.ArrayList
    $seen = @{}
    # desktop (landscape) pages, then phone (portrait) pages
    $plan = @(@('landscape', 1, '1y'), @('landscape', 2, '1y'), @('landscape', 3, '1y'), @('landscape', 1, 'all'), @('landscape', 2, 'all'), @('portrait', 1, '1y'), @('portrait', 1, 'all'))
    foreach ($p in $plan) {
        $r = Get-Wallhaven $cat $p[0] $p[1] $p[2]
        if (-not $r) { continue }
        foreach ($w in @($r.data)) {
            if (-not $w -or $seen[$w.id]) { continue }; $seen[$w.id] = 1
            [void]$items.Add([ordered]@{
                id = $w.id; t = $w.thumbs.large; f = $w.path; w = [int]$w.dimension_x; h = [int]$w.dimension_y
                r = [double]$w.ratio; s = [int]$w.file_size; v = [int]$w.views; fv = [int]$w.favorites
                c = @($w.colors); d = ([string]$w.created_at).Substring(0, [Math]::Min(10, ([string]$w.created_at).Length)); u = $w.url
            })
        }
    }
    Save-Json (Join-Path $Out (Join-Path 'c' "$($cat.key).json")) @($items)
    Write-Host ("{0,-10} {1} wallpapers" -f $cat.key, $items.Count)
    $total += $items.Count
}

# Live wallpapers (same list as LIVE_CATS in public/app.js)
$Live = @('mb:anime-nature', 'mb:japan', 'mb:samurai', 'mb:fantasy', 'mb:dragon', 'mb:knight', 'mb:cyberpunk', 'mb:dark', 'mb:technology',
    'mb:space', 'mb:astronaut', 'mb:black-hole', 'mb:rain', 'mb:night', 'mb:sunset', 'mb:forest', 'mb:winter', 'mb:mountain', 'mb:autumn-leaves', 'mb:water',
    'mb:car', 'mb:sports-cars', 'mb:animal', 'mb:cat', 'mx:nature', 'mx:galaxy', 'mx:sea', 'mx:forest', 'mx:city', 'mx:neon', 'mx:fire')
$liveTotal = 0
foreach ($lc in $Live) {
    $items = New-Object System.Collections.ArrayList
    $seen = @{}
    foreach ($page in 1, 2, 3) {
        try { $r = Get-LiveList $lc $page } catch { Write-Host "  $lc p$page failed: $($_.Exception.Message)"; break }
        foreach ($it in @($r.data)) { if ($it -and -not $seen[$it.id]) { $seen[$it.id] = 1; [void]$items.Add($it) } }
        if (-not $r.more) { break }
        Start-Sleep -Milliseconds 800
    }
    Save-Json (Join-Path $Out (Join-Path 'l' (($lc -replace ':', '-') + '.json'))) @($items)
    Write-Host ("{0,-18} {1} videos" -f $lc, $items.Count)
    $liveTotal += $items.Count
}

Save-Json (Join-Path $Out 'index.json') ([ordered]@{ updated = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'); wallpapers = $total; videos = $liveTotal })
Write-Host "Done: $total wallpapers, $liveTotal live videos -> $Out"
