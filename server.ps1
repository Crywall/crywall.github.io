# CryWall - local server
# Serves the website and applies wallpapers (desktop / lock screen / live video) on this PC.
# Start with Baslat.bat. Close this window to stop the server.
# -NoBrowser: run silently in the background (used by the Windows startup shortcut) so that
#  https://crywall.github.io can apply wallpapers on this PC.
param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Port    = 8790
$Root    = $PSScriptRoot
$Public  = Join-Path $Root 'public'
$SaveDir = Join-Path ([Environment]::GetFolderPath('MyPictures')) 'VexWalls'
$PidFile = Join-Path $env:TEMP 'crywall_live.json'
$UA      = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
New-Item -ItemType Directory -Force $SaveDir | Out-Null

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
public static class CryWallNative {
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
[StructLayout(LayoutKind.Sequential)] public struct WRect { public int Left, Top, Right, Bottom; }
[ComImport, Guid("B92B56A9-8B55-4E14-9A89-0199BBB6F93B"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IDesktopWallpaper {
    void SetWallpaper([MarshalAs(UnmanagedType.LPWStr)] string monitorID, [MarshalAs(UnmanagedType.LPWStr)] string wallpaper);
    [return: MarshalAs(UnmanagedType.LPWStr)] string GetWallpaper([MarshalAs(UnmanagedType.LPWStr)] string monitorID);
    [return: MarshalAs(UnmanagedType.LPWStr)] string GetMonitorDevicePathAt(uint index);
    uint GetMonitorDevicePathCount();
    WRect GetMonitorRECT([MarshalAs(UnmanagedType.LPWStr)] string monitorID);
    void SetBackgroundColor(uint color);
    uint GetBackgroundColor();
    void SetPosition(int position);
    int GetPosition();
}
[ComImport, Guid("C2CF3110-460E-4fc1-B9D0-8A1C0C9CC4BD")] public class DesktopWallpaperCo {}
public class CryWallMonitor { public string Id; public int X, Y, W, H; }
public static class CryWallDesktop {
    static IDesktopWallpaper Dw() { return (IDesktopWallpaper)new DesktopWallpaperCo(); }
    // Active monitors, ordered left-to-right (then top-to-bottom). live.ps1 uses the same order.
    public static List<CryWallMonitor> Monitors() {
        var dw = Dw(); var list = new List<CryWallMonitor>();
        uint n = dw.GetMonitorDevicePathCount();
        for (uint i = 0; i < n; i++) {
            try {
                string id = dw.GetMonitorDevicePathAt(i);
                WRect r = dw.GetMonitorRECT(id);
                if (r.Right - r.Left <= 0) continue;
                list.Add(new CryWallMonitor { Id = id, X = r.Left, Y = r.Top, W = r.Right - r.Left, H = r.Bottom - r.Top });
            } catch { } // disconnected monitor
        }
        list.Sort((a, b) => a.X != b.X ? a.X.CompareTo(b.X) : a.Y.CompareTo(b.Y));
        return list;
    }
    // position: 4 = fill, 5 = span. monitorId null = all monitors.
    public static void Set(string monitorId, string file, int position) {
        var dw = Dw(); dw.SetPosition(position); dw.SetWallpaper(monitorId, file);
    }
    // Repaint each monitor with its current wallpaper (after a live video closes).
    public static void Refresh() {
        var dw = Dw();
        foreach (var m in Monitors()) { try { string f = dw.GetWallpaper(m.Id); if (!string.IsNullOrEmpty(f)) dw.SetWallpaper(m.Id, f); } catch { } }
    }
}
"@

# ---------- helpers ----------
function New-Client {
    $wc = New-Object System.Net.WebClient
    $wc.Encoding = [Text.Encoding]::UTF8
    $wc.Headers['User-Agent'] = $UA
    return $wc
}

$Cache = @{}
function Get-Cached([string]$url, [int]$seconds = 600) {
    $now = Get-Date
    if ($Cache.ContainsKey($url) -and ($now - $Cache[$url].t).TotalSeconds -lt $seconds) { return $Cache[$url].v }
    # Wallhaven allows ~45 requests/minute: on "429 Too Many Requests" wait and retry,
    # and if it still fails, serve the older cached answer when there is one.
    for ($try = 1; $try -le 3; $try++) {
        try {
            $v = (New-Client).DownloadString($url)
            $Cache[$url] = @{ t = $now; v = $v }
            return $v
        } catch {
            $busy = $_.Exception.Message -match '429'
            if (-not $busy -or $try -eq 3) {
                if ($Cache.ContainsKey($url)) { return $Cache[$url].v }
                if ($busy) { throw 'busy' }
                throw
            }
            Start-Sleep -Seconds (2 * $try)
        }
    }
}

function Send($ctx, [int]$code, [string]$type, [byte[]]$bytes) {
    $res = $ctx.Response
    $res.StatusCode = $code
    $res.ContentType = $type
    $res.Headers['Cache-Control'] = 'no-store'
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.OutputStream.Close()
}
function Send-Json($ctx, $obj, [int]$code = 200) {
    $json = if ($obj -is [string]) { $obj } else { $obj | ConvertTo-Json -Depth 6 -Compress }
    Send $ctx $code 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes($json))
}
function Read-Body($ctx) {
    $sr = New-Object IO.StreamReader($ctx.Request.InputStream, [Text.Encoding]::UTF8)
    $t = $sr.ReadToEnd(); $sr.Close()
    if ($t) { return $t | ConvertFrom-Json } else { return $null }
}

function Test-AllowedImageUrl([string]$u) {
    return $u -match '^https://w\.wallhaven\.cc/full/[a-z0-9]{2}/wallhaven-[a-z0-9]+\.(jpg|png)$'
}

function Save-Image([string]$url) {
    if (-not (Test-AllowedImageUrl $url)) { throw 'bad_url' }
    $file = Join-Path $SaveDir ([IO.Path]::GetFileName($url))
    if (-not (Test-Path $file)) {
        $tmp = "$file.part"
        (New-Client).DownloadFile($url, $tmp)
        Move-Item $tmp $file -Force
    }
    return $file
}

# $monitor: 'all' | 'span' | monitor index (0-based, left to right)
function Set-Desktop([string]$file, [string]$monitor) {
    if ($monitor -eq 'span') { [CryWallDesktop]::Set($null, $file, 5); return }
    if ($monitor -match '^\d+$') {
        $mons = [CryWallDesktop]::Monitors()
        $i = [int]$monitor
        if ($i -ge $mons.Count) { throw 'monitor_not_found' }
        [CryWallDesktop]::Set($mons[$i].Id, $file, 4); return
    }
    try { [CryWallDesktop]::Set($null, $file, 4) }
    catch {
        # fallback: classic API
        Set-ItemProperty 'HKCU:\Control Panel\Desktop' -Name WallpaperStyle -Value '10'
        Set-ItemProperty 'HKCU:\Control Panel\Desktop' -Name TileWallpaper  -Value '0'
        [void][CryWallNative]::SystemParametersInfo(20, 0, $file, 3)
    }
}

function Get-MonitorList {
    $i = 0
    foreach ($m in [CryWallDesktop]::Monitors()) {
        @{ index = $i; x = $m.X; y = $m.Y; w = $m.W; h = $m.H; primary = ($m.X -eq 0 -and $m.Y -eq 0) }
        $i++
    }
}

function Set-LockScreen([string]$file) {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    [void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
    [void][Windows.System.UserProfile.LockScreen, Windows.System.UserProfile, ContentType = WindowsRuntime]
    $methods = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 }
    $asOp  = ($methods | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
    $asAct = ($methods | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]

    $t = $asOp.MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @([Windows.Storage.StorageFile]::GetFileFromPathAsync($file)))
    [void]$t.Wait(-1); $sf = $t.Result
    $t2 = $asAct.Invoke($null, @([Windows.System.UserProfile.LockScreen]::SetImageFileAsync($sf)))
    [void]$t2.Wait(-1)
}

# Live wallpapers: one player process per monitor ('all' = one process covering every monitor).
function Get-LiveStates {
    $list = @()
    if (Test-Path $PidFile) {
        try {
            foreach ($s in @(Get-Content $PidFile -Raw | ConvertFrom-Json)) {
                if ($s -and (Get-Process -Id $s.pid -ErrorAction SilentlyContinue)) { $list += $s }
            }
        } catch {}
    }
    return $list
}
function Save-LiveStates($list) {
    if ($list.Count) { ConvertTo-Json @($list) -Depth 3 | Set-Content $PidFile -Encoding UTF8 }
    else { Remove-Item $PidFile -ErrorAction SilentlyContinue }
}

# Stops live video on $monitor ('all' / 'span' = every monitor). A player covering all
# monitors is stopped whenever any monitor changes.
function Stop-Live([string]$monitor = 'all') {
    $keep = @(); $stopped = $false
    foreach ($s in @(Get-LiveStates)) {
        if ($monitor -in 'all', 'span' -or $s.monitor -eq 'all' -or [string]$s.monitor -eq $monitor) {
            Stop-Process -Id $s.pid -Force -ErrorAction SilentlyContinue; $stopped = $true
        } else { $keep += $s }
    }
    Save-LiveStates $keep
    if ($stopped) { try { [CryWallDesktop]::Refresh() } catch {} }
}

function Start-Live([string]$id, [string]$title, [string]$monitor) {
    if ($id -notmatch '^(mb|mx)-\d{1,8}$') { throw 'bad_id' }
    if ($monitor -notmatch '^(all|\d+)$') { $monitor = 'all' }
    Stop-Live $monitor
    $script = Join-Path $Root 'live.ps1'
    $p = Start-Process powershell.exe -WindowStyle Hidden -PassThru -ArgumentList @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', "`"$script`"", '-Id', $id, '-Monitor', $monitor)
    $list = @(Get-LiveStates) + @(@{ pid = $p.Id; id = $id; title = $title; monitor = $monitor })
    Save-LiveStates $list
}

# Copyright filter + live-wallpaper parsers (shared with the website catalog builder)
function Get-Html([string]$url) { Get-Cached $url 1800 }
. (Join-Path $Root 'tools\sources.ps1')


# ---------- server ----------
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() } catch {
    Write-Host "VexWalls zaten calisiyor olabilir. Tarayici aciliyor..."
    if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }
    exit
}
Write-Host ""
Write-Host "  VEXWALLS calisiyor:  http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "  Kapatmak icin bu pencereyi kapatin." -ForegroundColor DarkGray
Write-Host ""
if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }

# Web pages allowed to talk to this PC helper. Any other website is refused, so a random
# site can't change your wallpaper.
$AllowedOrigins = @('https://vexwalls.github.io', 'https://crywall.github.io', "http://localhost:$Port", "http://127.0.0.1:$Port")

# ---------- automatic wallpaper changer (rotate.ps1) ----------
$RotDir  = Join-Path $env:APPDATA 'VexWalls'
$RotCfg  = Join-Path $RotDir 'rotate.json'
$RotPid  = Join-Path $env:TEMP 'vexwalls_rotate.pid'
New-Item -ItemType Directory -Force $RotDir | Out-Null
function Get-RotateCfg {
    try { return Get-Content $RotCfg -Raw -Encoding UTF8 | ConvertFrom-Json } catch { return [pscustomobject]@{ on = $false; source = 'cat'; cat = 'doga'; every = 1440; favs = @() } }
}
function Test-RotateRunning {
    try { $p = [int](Get-Content $RotPid -Raw); return [bool](Get-Process -Id $p -ErrorAction SilentlyContinue) } catch { return $false }
}
function Start-Rotate {
    if (Test-RotateRunning) { return }
    $p = Start-Process powershell.exe -WindowStyle Hidden -PassThru -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$(Join-Path $Root 'rotate.ps1')`"")
    Set-Content $RotPid $p.Id
}
function Stop-Rotate {
    try { Stop-Process -Id ([int](Get-Content $RotPid -Raw)) -Force -ErrorAction SilentlyContinue } catch {}
    Remove-Item $RotPid -ErrorAction SilentlyContinue
}
if ((Get-RotateCfg).on) { Start-Rotate }      # keep rotating after a restart / Windows login

$Mime = @{ '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
           '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.ico' = 'image/x-icon'; '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'; '.webp' = 'image/webp' }
$WhAllowed = 'q', 'categories', 'sorting', 'order', 'topRange', 'atleast', 'ratios', 'colors', 'page', 'seed'

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $path = $req.Url.AbsolutePath
    # Cross-site check: browsers always send Origin on cross-site requests.
    $origin = $req.Headers['Origin']
    if ($origin -and $origin -notin $AllowedOrigins) {
        try { Send-Json $ctx @{ ok = $false; error = 'origin_not_allowed' } 403 } catch {}
        continue
    }
    if ($origin) {
        $ctx.Response.Headers['Access-Control-Allow-Origin'] = $origin
        $ctx.Response.Headers['Vary'] = 'Origin'
    }
    if ($req.HttpMethod -eq 'OPTIONS') {
        # CORS / private-network preflight from https://crywall.github.io
        $ctx.Response.Headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        $ctx.Response.Headers['Access-Control-Allow-Headers'] = 'Content-Type'
        $ctx.Response.Headers['Access-Control-Allow-Private-Network'] = 'true'
        $ctx.Response.Headers['Access-Control-Max-Age'] = '600'
        try { $ctx.Response.StatusCode = 204; $ctx.Response.Close() } catch {}
        continue
    }
    # Changing THIS computer (apply / live / folder) is only allowed from this computer itself.
    $pcOnly = '/api/apply', '/api/save', '/api/open-folder', '/api/live/apply', '/api/live/stop', '/api/rotate'
    if ($path -in $pcOnly -and -not $req.IsLocal) {
        try { Send-Json $ctx @{ ok = $false; error = 'pc_only' } 403 } catch {}
        continue
    }
    try {
        if ($path -eq '/api/search') {
            $userQ = [string]$req.QueryString['q']
            if (Test-Blocked $userQ) {
                Send-Json $ctx @{ data = @(); blocked = $true; meta = @{ total = 0; last_page = 1; current_page = 1 } }
                continue
            }
            $qs = @()
            foreach ($k in $WhAllowed) {
                if ($k -in 'q', 'categories') { continue }
                $v = $req.QueryString[$k]; if ($v) { $qs += "$k=" + [uri]::EscapeDataString($v) }
            }
            $cat = if ($req.QueryString['categories'] -eq '010') { '010' } else { '100' }   # no 'people' (celebrities)
            $qs += "categories=$cat"
            $extra = if ($cat -eq '010') { ' -"Makoto Shinkai" -"Studio Ghibli" -"Kimi no Na Wa" -"Genshin Impact" -"Honkai: Star Rail" -"Hatsune Miku"' } else { '' }
            $qs += 'q=' + [uri]::EscapeDataString(($userQ + (Get-WhFilter $userQ) + $extra).Trim())
            $qs += 'purity=100'   # safe-for-work only
            Send-Json $ctx (Get-Cached ("https://wallhaven.cc/api/v1/search?" + ($qs -join '&')))
        }
        elseif ($path -match '^/api/w/([a-z0-9]{4,10})$') {
            Send-Json $ctx (Get-Cached "https://wallhaven.cc/api/v1/w/$($Matches[1])" 86400)
        }
        elseif ($path -eq '/api/live/list') {
            $page = [int]($req.QueryString['page']); if ($page -lt 1) { $page = 1 }
            Send-Json $ctx (Get-LiveList $req.QueryString['cat'] $page)
        }
        elseif ($path -eq '/api/apply' -and $req.HttpMethod -eq 'POST') {
            $b = Read-Body $ctx
            $file = Save-Image $b.url
            $out = @{ ok = $true; file = $file; desktop = $null; lock = $null }
            $mon = if ($b.monitor) { [string]$b.monitor } else { 'all' }
            if ($b.target -in 'desktop', 'both') { Stop-Live $mon; Set-Desktop $file $mon; $out.desktop = 'ok' }
            if ($b.target -in 'lock', 'both') {
                try { Set-LockScreen $file; $out.lock = 'ok' } catch { $out.lock = 'fail'; $out.lockError = $_.Exception.Message }
            }
            Send-Json $ctx $out
        }
        elseif ($path -eq '/api/save' -and $req.HttpMethod -eq 'POST') {
            $b = Read-Body $ctx
            Send-Json $ctx @{ ok = $true; file = (Save-Image $b.url) }
        }
        elseif ($path -eq '/api/img') {
            # phone download: the original image, served through this server
            $file = Save-Image ([string]$req.QueryString['u'])
            $ctx.Response.Headers['Content-Disposition'] = 'attachment; filename="' + [IO.Path]::GetFileName($file) + '"'
            $type = if ($file -like '*.png') { 'image/png' } else { 'image/jpeg' }
            Send $ctx 200 $type ([IO.File]::ReadAllBytes($file))
        }
        elseif ($path -eq '/api/open-folder') {
            Start-Process explorer.exe $SaveDir
            Send-Json $ctx @{ ok = $true }
        }
        elseif ($path -eq '/api/live/apply' -and $req.HttpMethod -eq 'POST') {
            $b = Read-Body $ctx
            $mon = if ($b.monitor) { [string]$b.monitor } else { 'all' }
            Start-Live ([string]$b.id) ([string]$b.title) $mon
            Send-Json $ctx @{ ok = $true }
        }
        elseif ($path -eq '/api/live/stop') {
            $mon = $req.QueryString['monitor']; if (-not $mon) { $mon = 'all' }
            Stop-Live $mon
            Send-Json $ctx @{ ok = $true }
        }
        elseif ($path -eq '/api/rotate' -and $req.HttpMethod -eq 'GET') {
            $c = Get-RotateCfg
            Send-Json $ctx @{ ok = $true; on = [bool]$c.on; source = [string]$c.source; cat = [string]$c.cat; every = [int]$c.every; favCount = @($c.favs | Where-Object { $_ -is [string] }).Count; running = (Test-RotateRunning) }
        }
        elseif ($path -eq '/api/rotate' -and $req.HttpMethod -eq 'POST') {
            $b = Read-Body $ctx
            $old = Get-RotateCfg
            $favs = if ($null -ne $b.favs) { @($b.favs | Where-Object { $_ -match '^https://w\.wallhaven\.cc/full/[a-z0-9]{2}/wallhaven-[a-z0-9]+\.(jpg|png)$' } | Select-Object -First 500) } else { @($old.favs | Where-Object { $_ -is [string] -and $_ -match "^https://" }) }
            $cfg = [ordered]@{
                on     = [bool]$(if ($null -ne $b.on) { $b.on } else { $old.on })
                source = $(if ($b.source -in 'favs', 'cat') { $b.source } else { $old.source })
                cat    = $(if ([string]$b.cat -match '^[a-z]{2,20}$') { $b.cat } else { $old.cat })
                every  = [int]$(if ($b.every) { [Math]::Max(15, [int]$b.every) } else { $old.every })
                favs   = @($favs | Where-Object { $_ })
                nudge  = (Get-Date).Ticks            # any save (incl. "change now") makes the changer act at once
            }
            [IO.File]::WriteAllText($RotCfg, ($cfg | ConvertTo-Json -Depth 3), (New-Object Text.UTF8Encoding $false))
            if ($cfg.on) { Start-Rotate } else { Stop-Rotate }
            Send-Json $ctx @{ ok = $true; on = $cfg.on }
        }
        elseif ($path -eq '/api/status') {
            $lives = @(Get-LiveStates | ForEach-Object { @{ id = $_.id; title = $_.title; monitor = [string]$_.monitor } })
            $mons = @()
            try { $mons = @(Get-MonitorList) } catch {}
            Send-Json $ctx @{ ok = $true; lives = $lives; monitors = $mons }
        }
        else {
            if ($path -eq '/') { $path = '/index.html' }
            $full = [IO.Path]::GetFullPath((Join-Path $Public ($path.TrimStart('/') -replace '/', '\')))
            if ($full.StartsWith($Public, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $full -PathType Leaf)) {
                $ext = [IO.Path]::GetExtension($full).ToLower()
                $type = $Mime[$ext]; if (-not $type) { $type = 'application/octet-stream' }
                Send $ctx 200 $type ([IO.File]::ReadAllBytes($full))
            } else {
                Send $ctx 404 'text/plain' ([Text.Encoding]::UTF8.GetBytes('Not found'))
            }
        }
    } catch {
        Write-Host ("[hata] $path : " + $_.Exception.Message) -ForegroundColor Red
        try { Send-Json $ctx @{ ok = $false; error = $_.Exception.Message } 500 } catch {}
    }
}
