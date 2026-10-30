# CryWall - live (video) wallpaper player.
# Plays a looping, muted video behind the desktop icons on the primary monitor.
# Started/stopped by server.ps1.
# -Monitor: 'all' or a monitor index (0-based, ordered left to right, same as server.ps1).
param([Parameter(Mandatory)][string]$Id, [string]$Monitor = 'all')

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if ($Id -notmatch '^(mb|mx)-(\d{1,8})$') { exit 1 }
$Src = $Matches[1]; $Num = $Matches[2]
if ($Monitor -notmatch '^(all|\d+)$') { $Monitor = 'all' }

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Windows.Forms
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class CryWallDesk {
    delegate bool EnumProc(IntPtr h, IntPtr l);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr l);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern IntPtr FindWindow(string c, string n);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern IntPtr FindWindowEx(IntPtr p, IntPtr after, string c, string n);
    [DllImport("user32.dll")] static extern IntPtr SendMessageTimeout(IntPtr h, uint msg, IntPtr w, IntPtr l, uint flags, uint timeout, out IntPtr r);
    [DllImport("user32.dll")] static extern IntPtr SetParent(IntPtr child, IntPtr parent);
    [DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint f);
    [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr h, int i);
    [DllImport("user32.dll")] static extern int SetWindowLong(IntPtr h, int i, int v);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr ctx);
    // Real pixel coordinates on every monitor, even with different scaling per monitor.
    public static void DpiAware() {
        try { if (SetProcessDpiAwarenessContext(new IntPtr(-4))) return; } catch { }
        SetProcessDPIAware();
    }

    public static string Attach(IntPtr hwnd, int x, int y, int w, int h) {
        IntPtr progman = FindWindow("Progman", null);
        IntPtr r;
        // Ask Explorer to create the WorkerW layer behind the icons.
        SendMessageTimeout(progman, 0x052C, new IntPtr(0xD), new IntPtr(1), 0, 1000, out r);
        SendMessageTimeout(progman, 0x052C, IntPtr.Zero, IntPtr.Zero, 0, 1000, out r);

        // Make it a child window (WS_CHILD, remove WS_POPUP).
        int style = GetWindowLong(hwnd, -16);
        SetWindowLong(hwnd, -16, (style | 0x40000000) & ~unchecked((int)0x80000000));

        IntPtr childWorker = FindWindowEx(progman, IntPtr.Zero, "WorkerW", null);
        if (childWorker != IntPtr.Zero) {
            // Windows 11 24H2+: icons (SHELLDLL_DefView) and WorkerW are children of Progman.
            IntPtr defView = FindWindowEx(progman, IntPtr.Zero, "SHELLDLL_DefView", null);
            SetParent(hwnd, progman);
            SetWindowPos(hwnd, defView, x, y, w, h, 0x0010 | 0x0040); // just below the icons
            return "progman";
        }
        // Older Windows: WorkerW is the top-level sibling after the window holding the icons.
        IntPtr worker = IntPtr.Zero;
        EnumWindows((top, l) => {
            if (FindWindowEx(top, IntPtr.Zero, "SHELLDLL_DefView", null) != IntPtr.Zero)
                worker = FindWindowEx(IntPtr.Zero, top, "WorkerW", null);
            return true;
        }, IntPtr.Zero);
        if (worker == IntPtr.Zero) worker = progman;
        SetParent(hwnd, worker);
        SetWindowPos(hwnd, IntPtr.Zero, x, y, w, h, 0x0004 | 0x0010 | 0x0040);
        return "workerw";
    }
}
"@
[CryWallDesk]::DpiAware()

# Download the video once (1080p HD; Mixkit falls back to 720p).
$dir = Join-Path $env:LOCALAPPDATA 'CryWall\Hareketli'   # local, so big videos don't sync to OneDrive
New-Item -ItemType Directory -Force $dir | Out-Null
$file = Join-Path $dir "$Id.mp4"
if (-not (Test-Path $file)) {
    $urls = if ($Src -eq 'mb') { @("https://motionbgs.com/dl/hd/$Num/") }
            else { @("https://assets.mixkit.co/videos/$Num/$Num-1080.mp4", "https://assets.mixkit.co/videos/$Num/$Num-720.mp4") }
    foreach ($u in $urls) {
        try {
            $wc = New-Object System.Net.WebClient
            $wc.Headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
            $wc.DownloadFile($u, "$file.part"); Move-Item "$file.part" $file -Force; break
        } catch {}
    }
    if (-not (Test-Path $file)) { exit 2 }
}

$virtual = [System.Windows.Forms.SystemInformation]::VirtualScreen
$screens = @([System.Windows.Forms.Screen]::AllScreens | Sort-Object { $_.Bounds.X }, { $_.Bounds.Y })
if ($Monitor -ne 'all') {
    $i = [int]$Monitor
    if ($i -ge $screens.Count) { exit 3 }
    $screens = @($screens[$i])
}

# One borderless window + video per monitor.
function New-Player($bounds) {
    $win = New-Object System.Windows.Window
    $win.WindowStyle = 'None'; $win.ResizeMode = 'NoResize'; $win.ShowInTaskbar = $false
    $win.Background = 'Black'; $win.Left = 0; $win.Top = 0; $win.Width = 400; $win.Height = 300
    $win.ShowActivated = $false

    $me = New-Object System.Windows.Controls.MediaElement
    $me.LoadedBehavior = 'Manual'; $me.UnloadedBehavior = 'Manual'
    $me.IsMuted = $true; $me.Stretch = 'UniformToFill'
    $me.Source = New-Object Uri($file)
    $me.Add_MediaEnded({ param($s) $s.Position = [TimeSpan]::Zero; $s.Play() })
    $win.Content = $me

    $x = $bounds.X - $virtual.X; $y = $bounds.Y - $virtual.Y; $w = $bounds.Width; $h = $bounds.Height
    $win.Add_Loaded({
        param($s)
        $hwnd = (New-Object System.Windows.Interop.WindowInteropHelper($s)).Handle
        [void][CryWallDesk]::Attach($hwnd, $x, $y, $w, $h)
        $s.Content.Play()
    }.GetNewClosure())
    return $win
}

$app = New-Object System.Windows.Application
$app.ShutdownMode = 'OnExplicitShutdown'
$windows = @($screens | ForEach-Object { New-Player $_.Bounds })
$windows | Select-Object -Skip 1 | ForEach-Object { $_.Show() }
[void]$app.Run($windows[0])
