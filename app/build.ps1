# Builds app\dist\VexWalls.exe with the C# compiler that ships with Windows (.NET Framework 4).
#   powershell -ExecutionPolicy Bypass -File app\build.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$dist = Join-Path $PSScriptRoot 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null

# helper scripts are embedded in the exe and unpacked on install
$res = @(
    "/resource:$root\server.ps1,server.ps1",
    "/resource:$root\live.ps1,live.ps1",
    "/resource:$root\rotate.ps1,rotate.ps1",
    "/resource:$root\tools\sources.ps1,tools.sources.ps1",
    "/resource:$PSScriptRoot\vexwalls.ico,vexwalls.ico"
)
& $csc /nologo /codepage:65001 /target:winexe /optimize+ /platform:anycpu "/out:$dist\VexWalls.exe" "/win32icon:$PSScriptRoot\vexwalls.ico" `
    /r:System.Windows.Forms.dll /r:System.Management.dll /r:Microsoft.CSharp.dll /r:System.Core.dll @res "$PSScriptRoot\VexWalls.cs"
if ($LASTEXITCODE -ne 0) { throw "build failed" }
Get-Item "$dist\VexWalls.exe" | Select-Object Name, Length
