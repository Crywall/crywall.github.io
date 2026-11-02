// VexWalls desktop app — one small .exe (built with app\build.ps1, no extra runtime needed).
//
//  * First run (from Downloads etc.): installs itself to %LOCALAPPDATA%\Programs\VexWalls together
//    with the PC helper scripts (embedded), adds Start menu + desktop shortcuts, starts the helper
//    with Windows (hidden), registers an uninstall entry, then opens the app.
//  * Normal run: makes sure the helper is running and opens VexWalls in its own window
//    (Microsoft Edge app mode: no address bar, own taskbar icon).
//  * --uninstall: stops the helper, removes shortcuts, the uninstall entry and the files.
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("VexWalls")]
[assembly: AssemblyProduct("VexWalls")]
[assembly: AssemblyDescription("VexWalls — ücretsiz 4K ve hareketli duvar kağıtları")]
[assembly: AssemblyCompany("VexWalls")]
[assembly: AssemblyCopyright("© 2026 VexWalls")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

static class VexWallsApp
{
    const string SiteUrl = "https://vexwalls.github.io/?source=desktop";
    const string AppName = "VexWalls";
    const string UninstallKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\VexWalls";
    static readonly string InstallDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\VexWalls");
    static readonly string[] Payload = { "server.ps1", "live.ps1", "rotate.ps1", @"tools\sources.ps1" };

    [STAThread]
    static int Main(string[] args)
    {
        try
        {
            string exe = Assembly.GetExecutingAssembly().Location;
            if (args.Length > 0 && args[0] == "--uninstall") { Uninstall(); return 0; }
            if (args.Length > 0 && args[0] == "--version") { Console.WriteLine("VexWalls 1.0"); return 0; }

            bool installed = string.Equals(Path.GetDirectoryName(exe), InstallDir, StringComparison.OrdinalIgnoreCase);
            if (!installed)
            {
                Install(exe);
                MessageBox.Show(
                    "VexWalls kuruldu! 🎉\n\nBaşlat menüsünde ve masaüstünde \"VexWalls\" simgesi var.\n" +
                    "Duvar kağıtlarını tek tıkla uygulayabilir, hareketli duvar kağıtlarını ve otomatik değiştirmeyi kullanabilirsin.\n\n" +
                    "Kaldırmak için: Ayarlar › Uygulamalar › VexWalls › Kaldır.",
                    AppName, MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            EnsureHelper();
            OpenWindow();
            return 0;
        }
        catch (Exception ex)
        {
            MessageBox.Show("VexWalls açılamadı:\n" + ex.Message, AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    // ---------- install ----------
    static void Install(string exe)
    {
        Directory.CreateDirectory(Path.Combine(InstallDir, "tools"));
        foreach (string f in Payload) WriteResource(f, Path.Combine(InstallDir, f));
        WriteResource("vexwalls.ico", Path.Combine(InstallDir, "vexwalls.ico"));
        string target = Path.Combine(InstallDir, "VexWalls.exe");
        StopHelper();
        File.Copy(exe, target, true);

        string ico = Path.Combine(InstallDir, "vexwalls.ico");
        string startMenu = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
        string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
        string startup = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
        Shortcut(Path.Combine(startMenu, "VexWalls.lnk"), target, "", ico, "VexWalls duvar kağıtları");
        Shortcut(Path.Combine(desktop, "VexWalls.lnk"), target, "", ico, "VexWalls duvar kağıtları");
        Shortcut(Path.Combine(startup, "VexWalls Yardimci.lnk"), PowerShell(), HelperArgs(), ico, "VexWalls yardımcısı (arka planda)");

        using (RegistryKey k = Registry.CurrentUser.CreateSubKey(UninstallKey))
        {
            k.SetValue("DisplayName", "VexWalls");
            k.SetValue("DisplayVersion", "1.0");
            k.SetValue("Publisher", "VexWalls");
            k.SetValue("DisplayIcon", ico);
            k.SetValue("InstallLocation", InstallDir);
            k.SetValue("URLInfoAbout", "https://vexwalls.github.io/");
            k.SetValue("UninstallString", "\"" + target + "\" --uninstall");
            k.SetValue("NoModify", 1, RegistryValueKind.DWord);
            k.SetValue("NoRepair", 1, RegistryValueKind.DWord);
        }
    }

    static void WriteResource(string name, string dest)
    {
        string res = name.Replace('\\', '.');
        using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream(res))
        {
            if (s == null) throw new Exception("Eksik dosya: " + name);
            Directory.CreateDirectory(Path.GetDirectoryName(dest));
            using (FileStream f = File.Create(dest)) s.CopyTo(f);
        }
    }

    static void Shortcut(string lnk, string target, string arguments, string icon, string description)
    {
        Type t = Type.GetTypeFromProgID("WScript.Shell");
        dynamic shell = Activator.CreateInstance(t);
        dynamic sc = shell.CreateShortcut(lnk);
        sc.TargetPath = target;
        sc.Arguments = arguments;
        sc.WorkingDirectory = InstallDir;
        sc.IconLocation = icon;
        sc.Description = description;
        if (target.EndsWith("powershell.exe", StringComparison.OrdinalIgnoreCase)) sc.WindowStyle = 7;
        sc.Save();
    }

    // ---------- helper (PowerShell server on localhost:8790) ----------
    static string PowerShell() { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), @"WindowsPowerShell\v1.0\powershell.exe"); }
    static string HelperArgs() { return "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \"" + Path.Combine(InstallDir, "server.ps1") + "\" -NoBrowser"; }

    static bool HelperUp()
    {
        try
        {
            HttpWebRequest r = (HttpWebRequest)WebRequest.Create("http://localhost:8790/api/status");
            r.Timeout = 1500;
            using (HttpWebResponse resp = (HttpWebResponse)r.GetResponse()) return resp.StatusCode == HttpStatusCode.OK;
        }
        catch { return false; }
    }

    static void EnsureHelper()
    {
        if (HelperUp()) return;
        ProcessStartInfo psi = new ProcessStartInfo(PowerShell(), HelperArgs());
        psi.WindowStyle = ProcessWindowStyle.Hidden; psi.CreateNoWindow = true; psi.UseShellExecute = false;
        psi.WorkingDirectory = InstallDir;
        Process.Start(psi);
        for (int i = 0; i < 20 && !HelperUp(); i++) Thread.Sleep(300);
    }

    static void StopHelper()
    {
        foreach (Process p in Process.GetProcessesByName("powershell"))
        {
            try
            {
                string cmd = CommandLine(p.Id);
                if (cmd != null && cmd.IndexOf(@"Programs\VexWalls", StringComparison.OrdinalIgnoreCase) >= 0) p.Kill();
            }
            catch { }
        }
    }

    static string CommandLine(int pid)
    {
        using (var s = new System.Management.ManagementObjectSearcher("SELECT CommandLine FROM Win32_Process WHERE ProcessId = " + pid))
            foreach (System.Management.ManagementObject o in s.Get()) return o["CommandLine"] as string;
        return null;
    }

    // ---------- window ----------
    static void OpenWindow()
    {
        string edge = EdgePath();
        if (edge != null) Process.Start(edge, "--app=\"" + SiteUrl + "\" --window-size=1400,900");
        else Process.Start(SiteUrl);
    }

    static string EdgePath()
    {
        foreach (RegistryKey root in new[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            using (RegistryKey k = root.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"))
            {
                string p = k == null ? null : k.GetValue("") as string;
                if (!string.IsNullOrEmpty(p) && File.Exists(p)) return p;
            }
        }
        string[] guesses = {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe") };
        foreach (string g in guesses) if (File.Exists(g)) return g;
        return null;
    }

    // ---------- uninstall ----------
    static void Uninstall()
    {
        if (MessageBox.Show("VexWalls bilgisayarından kaldırılsın mı?\n(İndirdiğin duvar kağıtları Resimler klasöründe kalır.)",
                AppName, MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
        StopHelper();
        foreach (string lnk in new[] {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "VexWalls.lnk"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "VexWalls.lnk"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Startup), "VexWalls Yardimci.lnk") })
            try { File.Delete(lnk); } catch { }
        try { Registry.CurrentUser.DeleteSubKeyTree(UninstallKey, false); } catch { }
        // the running exe can't delete itself: let cmd remove the folder a moment later
        ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c timeout /t 2 >nul & rmdir /s /q \"" + InstallDir + "\"");
        psi.WindowStyle = ProcessWindowStyle.Hidden; psi.CreateNoWindow = true;
        Process.Start(psi);
        MessageBox.Show("VexWalls kaldırıldı.", AppName, MessageBoxButtons.OK, MessageBoxIcon.Information);
    }
}
