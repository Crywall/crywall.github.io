# VexWalls - automatic wallpaper changer (started/stopped by server.ps1).
# Settings live in %APPDATA%\VexWalls\rotate.json:
#   { on: true, source: 'favs' | 'cat', cat: 'dag', every: 60 (minutes), favs: [ "https://w.wallhaven.cc/full/..." ] }
# Changes the desktop wallpaper right away, then every N minutes, while "on" stays true.

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$CfgFile = Join-Path $env:APPDATA 'VexWalls\rotate.json'
$SaveDir = Join-Path ([Environment]::GetFolderPath('MyPictures')) 'VexWalls'
$Catalog = 'https://vexwalls.github.io/data/c/'
$UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
New-Item -ItemType Directory -Force $SaveDir | Out-Null

Add-Type @"
using System; using System.Runtime.InteropServices;
public static class VexRotate {
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern bool SystemParametersInfo(int a, int b, string c, int d);
}
"@

function Read-Cfg { try { return Get-Content $CfgFile -Raw -Encoding UTF8 | ConvertFrom-Json } catch { return $null } }
function Test-Url([string]$u) { return $u -match '^https://w\.wallhaven\.cc/full/[a-z0-9]{2}/wallhaven-[a-z0-9]+\.(jpg|png)$' }

function Get-Candidates($cfg) {
    if ($cfg.source -eq 'favs') { return @($cfg.favs | Where-Object { Test-Url $_ }) }
    $key = if ($cfg.cat -match '^[a-z]{2,20}$') { $cfg.cat } else { 'doga' }
    $list = Invoke-RestMethod "$Catalog$key.json" -Headers @{ 'User-Agent' = $UA } -TimeoutSec 40
    return @($list | Where-Object { $_.r -ge 1.2 -and $_.w -ge 1920 -and (Test-Url $_.f) } | ForEach-Object { $_.f })
}

$last = $null
while ($true) {
    $cfg = Read-Cfg
    if (-not $cfg -or -not $cfg.on) { break }
    try {
        $urls = @(Get-Candidates $cfg | Where-Object { $_ -ne $last })
        if ($urls.Count) {
            $url = $urls | Get-Random
            $file = Join-Path $SaveDir ([IO.Path]::GetFileName($url))
            if (-not (Test-Path $file)) {
                Invoke-WebRequest $url -Headers @{ 'User-Agent' = $UA } -UseBasicParsing -TimeoutSec 120 -OutFile "$file.part"
                Move-Item "$file.part" $file -Force
            }
            Set-ItemProperty 'HKCU:\Control Panel\Desktop' -Name WallpaperStyle -Value '10'
            Set-ItemProperty 'HKCU:\Control Panel\Desktop' -Name TileWallpaper -Value '0'
            [void][VexRotate]::SystemParametersInfo(20, 0, $file, 3)
            $last = $url
        }
    } catch { }
    # wait N minutes, but notice quickly if it was switched off or changed
    $every = [Math]::Max(15, [int]$cfg.every)
    $stamp = (Get-Item $CfgFile -ErrorAction SilentlyContinue).LastWriteTimeUtc
    for ($i = 0; $i -lt $every * 6; $i++) {
        Start-Sleep -Seconds 10
        $now = (Get-Item $CfgFile -ErrorAction SilentlyContinue).LastWriteTimeUtc
        if ($now -ne $stamp) { break }          # settings changed: apply at once
    }
}
