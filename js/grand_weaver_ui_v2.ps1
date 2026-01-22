Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ============================================
#  GRAND WEAVER v2 – SAFE, MODULAR, HARDENED
# ============================================

# --- Identity & Paths ---
$script:WeaverName = "Grand Weaver v2"
$script:BasePath   = "F:\IMPA_OS\LOOM"
$script:SelfPath   = Join-Path $script:BasePath "grand_weaver_ui_v2.ps1"

# --- Logging ---
function Add-Log {
    param([string]$Message)
    if (-not $script:txtLog) { return }
    $timestamp = (Get-Date).ToString("HH:mm:ss")
    $script:txtLog.AppendText("[$timestamp] $Message`r`n")
}

# --- Safety: prevent self-write ---
function Test-CanWriteTarget {
    param([string]$TargetPath)

    if (-not $TargetPath) {
        Add-Log "ERROR: No target path provided."
        return $false
    }

    $fullTarget = [IO.Path]::GetFullPath($TargetPath)
    $fullSelf   = [IO.Path]::GetFullPath($script:SelfPath)

    if ($fullTarget -eq $fullSelf) {
        Add-Log "ERROR: Refusing to overwrite Weaver itself: $fullTarget"
        return $false
    }

    return $true
}

# --- Safety: async process wrapper ---
function Invoke-Async {
    param(
        [string]$File,
        [string[]]$Args
    )

    Start-Process powershell -ArgumentList @(
        "-NoLogo","-NoProfile","-ExecutionPolicy","Bypass",
        "-File", $File
    ) + $Args -WindowStyle Hidden
}

# =========================
#  FORM & CORE UI LAYOUT
# =========================

$form = New-Object System.Windows.Forms.Form
$form.Text = $script:WeaverName
$form.Size = New-Object System.Drawing.Size(950,720)
$form.StartPosition = "CenterScreen"

# --- Output Path Row ---
$lblPath = New-Object System.Windows.Forms.Label
$lblPath.Text = "Output Path:"
$lblPath.Location = New-Object System.Drawing.Point(10,10)
$lblPath.AutoSize = $true

$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Location = New-Object System.Drawing.Point(90,8)
$txtPath.Size = New-Object System.Drawing.Size(720,20)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "Browse"
$btnBrowse.Location = New-Object System.Drawing.Point(820,6)
$btnBrowse.Size = New-Object System.Drawing.Size(80,24)

$btnBrowse.Add_Click({
    $dlg = New-Object System.Windows.Forms.SaveFileDialog
    $dlg.Filter = "All Files (*.*)|*.*"
    if ($dlg.ShowDialog() -eq "OK") {
        $txtPath.Text = $dlg.FileName
        Add-Log "Output path set to: $($dlg.FileName)"
    }
})

# --- Editor Panel ---
$grpEditor = New-Object System.Windows.Forms.GroupBox
$grpEditor.Text = "Code"
$grpEditor.Location = New-Object System.Drawing.Point(10,40)
$grpEditor.Size = New-Object System.Drawing.Size(890,360)

$txtCode = New-Object System.Windows.Forms.TextBox
$txtCode.Multiline = $true
$txtCode.ScrollBars = "Both"
$txtCode.WordWrap = $false
$txtCode.Location = New-Object System.Drawing.Point(10,20)
$txtCode.Size = New-Object System.Drawing.Size(870,330)
$txtCode.Font = New-Object System.Drawing.Font("Consolas",10)

$grpEditor.Controls.Add($txtCode)

# --- Weave Button ---
$btnWeave = New-Object System.Windows.Forms.Button
$btnWeave.Text = "WEAVE"
$btnWeave.Location = New-Object System.Drawing.Point(10,405)
$btnWeave.Size = New-Object System.Drawing.Size(100,32)

# =========================
#  HOTPATCH PANEL
# =========================

$grpHotpatch = New-Object System.Windows.Forms.GroupBox
$grpHotpatch.Text = "Hotpatch Module"
$grpHotpatch.Location = New-Object System.Drawing.Point(10,445)
$grpHotpatch.Size = New-Object System.Drawing.Size(890,140)

$lblPatchTarget = New-Object System.Windows.Forms.Label
$lblPatchTarget.Text = "Target File:"
$lblPatchTarget.Location = New-Object System.Drawing.Point(10,25)
$lblPatchTarget.AutoSize = $true

$txtPatchTarget = New-Object System.Windows.Forms.TextBox
$txtPatchTarget.Location = New-Object System.Drawing.Point(90,22)
$txtPatchTarget.Size = New-Object System.Drawing.Size(700,20)

$btnBrowsePatchTarget = New-Object System.Windows.Forms.Button
$btnBrowsePatchTarget.Text = "Browse"
$btnBrowsePatchTarget.Location = New-Object System.Drawing.Point(800,20)
$btnBrowsePatchTarget.Size = New-Object System.Drawing.Size(75,24)

$btnBrowsePatchTarget.Add_Click({
    $dlg = New-Object System.Windows.Forms.OpenFileDialog
    $dlg.Filter = "All Files (*.*)|*.*"
    if ($dlg.ShowDialog() -eq "OK") {
        $txtPatchTarget.Text = $dlg.FileName
        Add-Log "Selected patch target: $($dlg.FileName)"
    }
})

$lblPatchCode = New-Object System.Windows.Forms.Label
$lblPatchCode.Text = "Patch Code:"
$lblPatchCode.Location = New-Object System.Drawing.Point(10,55)
$lblPatchCode.AutoSize = $true

$txtPatchCode = New-Object System.Windows.Forms.TextBox
$txtPatchCode.Location = New-Object System.Drawing.Point(10,75)
$txtPatchCode.Size = New-Object System.Drawing.Size(870,50)
$txtPatchCode.Multiline = $true
$txtPatchCode.ScrollBars = "Vertical"
$txtPatchCode.Font = New-Object System.Drawing.Font("Consolas",9)

$btnApplyPatch = New-Object System.Windows.Forms.Button
$btnApplyPatch.Text = "Apply Patch"
$btnApplyPatch.Location = New-Object System.Drawing.Point(800,45)
$btnApplyPatch.Size = New-Object System.Drawing.Size(80,24)

$btnApplyPatch.Add_Click({
    $target = $txtPatchTarget.Text.Trim()
    $patch  = $txtPatchCode.Text

    if (-not (Test-CanWriteTarget -TargetPath $target)) { return }

    if (-not $patch) {
        Add-Log "ERROR: No patch code provided."
        return
    }

    try {
        Set-Content -Path $target -Value $patch -Encoding UTF8
        Add-Log "Hotpatch applied to: $target"
    }
    catch {
        Add-Log "ERROR applying hotpatch: $($_.Exception.Message)"
    }
})

$grpHotpatch.Controls.AddRange(@(
    $lblPatchTarget, $txtPatchTarget, $btnBrowsePatchTarget,
    $lblPatchCode, $txtPatchCode,
    $btnApplyPatch
))

# =========================
#  LOG PANEL
# =========================

$grpLog = New-Object System.Windows.Forms.GroupBox
$grpLog.Text = "Log"
$grpLog.Location = New-Object System.Drawing.Point(10,590)
$grpLog.Size = New-Object System.Drawing.Size(890,90)

$txtLog = New-Object System.Windows.Forms.TextBox
$txtLog.Multiline = $true
$txtLog.ScrollBars = "Vertical"
$txtLog.ReadOnly = $true
$txtLog.Location = New-Object System.Drawing.Point(10,20)
$txtLog.Size = New-Object System.Drawing.Size(870,60)
$txtLog.Font = New-Object System.Drawing.Font("Consolas",9)

$grpLog.Controls.Add($txtLog)
$script:txtLog = $txtLog

# =========================
#  CORE ACTIONS
# =========================

function Invoke-Weave {
    $target = $txtPath.Text.Trim()
    $code   = $txtCode.Text

    if (-not (Test-CanWriteTarget -TargetPath $target)) { return }

    try {
        $dir = Split-Path $target -Parent
        if ($dir -and -not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Add-Log "Created directory: $dir"
        }

        Set-Content -Path $target -Value $code -Encoding UTF8
        Add-Log "Wrote file: $target"
    }
    catch {
        Add-Log "ERROR writing file: $($_.Exception.Message)"
    }
}

$btnWeave.Add_Click({ Invoke-Weave })

# =========================
#  ADD CONTROLS & RUN
# =========================

$form.Controls.AddRange(@(
    $lblPath, $txtPath, $btnBrowse,
    $grpEditor,
    $btnWeave,
    $grpHotpatch,
    $grpLog
))

[void]$form.ShowDialog()
