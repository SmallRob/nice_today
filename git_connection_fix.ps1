#Requires -Version 5.1
# Git Connection Fix Script
# Author: CodeBuddy
# Version: 2.0.0
# Description: This script diagnoses and fixes Git connection issues with GitHub.
# All prompts have been changed to English to ensure maximum compatibility.

# --- Initial Setup ---
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# --- Helper Functions ---
function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

# --- Diagnostic Functions ---

# 1. Test Network Connectivity
function Test-NetworkConnection {
    Write-ColorText "`n--- 1. Testing Network Connectivity ---" "Green"
    $isSuccess = $true
    
    try {
        $dnsResult = Resolve-DnsName -Name "github.com" -ErrorAction Stop
        Write-ColorText "[OK] DNS resolution successful: github.com -> $($dnsResult[0].IPAddress)" "Green"
    } catch {
        Write-ColorText "[FAIL] DNS resolution failed for github.com." "Red"
        Write-ColorText "  Suggestion: Check your DNS settings or try a public DNS like 8.8.8.8." "Yellow"
        $isSuccess = $false
    }
    
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    try {
        $connect = $tcpClient.BeginConnect("github.com", 443, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
        if ($wait -and $tcpClient.Connected) {
            Write-ColorText "[OK] HTTPS connection successful to github.com:443." "Green"
        } else {
            Write-ColorText "[FAIL] Failed to connect to github.com on port 443." "Red"
            $isSuccess = $false
        }
    } catch {
        Write-ColorText "[FAIL] Exception during TCP connection test: $($_.Exception.Message)" "Red"
        $isSuccess = $false
    } finally {
        $tcpClient.Close()
    }
    return $isSuccess
}

# 2. Check Git Proxy Settings
function Check-ProxySettings {
    Write-ColorText "`n--- 2. Checking Git Proxy Settings ---" "Green"
    $gitHttpProxy = git config --global http.proxy
    $gitHttpsProxy = git config --global https.proxy
    
    if ($gitHttpProxy -or $gitHttpsProxy) {
        Write-ColorText "[INFO] Git proxy is configured:" "Yellow"
        if ($gitHttpProxy) { Write-ColorText "  - http.proxy: $gitHttpProxy" "Yellow" }
        if ($gitHttpsProxy) { Write-ColorText "  - https.proxy: $gitHttpsProxy" "Yellow" }
    } else {
        Write-ColorText "[OK] Git proxy is not configured." "Green"
    }
}

# 3. Check Git SSL Verification
function Check-SSLSettings {
    Write-ColorText "`n--- 3. Checking Git SSL Verification ---" "Green"
    $sslVerify = git config --global http.sslVerify
    if ($sslVerify -eq "false") {
        Write-ColorText "[WARN] Git SSL verification is disabled. This is a security risk." "Yellow"
    } else {
        Write-ColorText "[OK] Git SSL verification is enabled (Recommended)." "Green"
    }
}

# --- Fix Functions ---
function Apply-Fixes {
    while ($true) {
        Write-ColorText "`n--- Apply a Fix ---" "Magenta"
        Write-ColorText "1. Set a proxy for Git" "White"
        Write-ColorText "2. Clear Git proxy settings" "White"
        Write-ColorText "3. Switch to SSH connection (Recommended)" "White"
        Write-ColorText "4. Configure Git Credential Manager" "White"
        Write-ColorText "5. Return to Main Menu" "White"
        
        $choice = Read-Host "Please enter an option (1-5)"
        
        switch ($choice) {
            "1" {
                $proxyAddress = Read-Host "Enter proxy address (e.g., http://127.0.0.1:7890)"
                if ($proxyAddress) {
                    git config --global http.proxy $proxyAddress
                    git config --global https.proxy $proxyAddress
                    Write-ColorText "[OK] Git proxy has been set to: $proxyAddress" "Green"
                } else {
                    Write-ColorText "[FAIL] Operation cancelled: No proxy address provided." "Red"
                }
            }
            "2" {
                git config --global --unset-all http.proxy
                git config --global --unset-all https.proxy
                Write-ColorText "[OK] All Git proxy settings have been cleared." "Green"
            }
            "3" {
                Write-ColorText "`nGuiding you to configure SSH..." "Yellow"
                if (-not (Test-Path "$HOME\.ssh\id_rsa.pub")) {
                    Write-ColorText "No existing SSH key found. Generating a new one..." "White"
                    $email = Read-Host "Please enter your GitHub email address"
                    if ($email) {
                        ssh-keygen -t rsa -b 4096 -C "$email"
                        Write-ColorText "[OK] New SSH key generated." "Green"
                    } else {
                        Write-ColorText "[FAIL] Operation cancelled: Email is required." "Red"
                        continue
                    }
                }
                $publicKey = Get-Content "$HOME\.ssh\id_rsa.pub"
                Write-ColorText "`nPlease add the following public key to your GitHub account under 'SSH and GPG keys':" "Yellow"
                Write-ColorText $publicKey "Cyan"
                Write-ColorText "`nAfter adding, use 'git remote set-url origin git@github.com:USERNAME/REPO.git' to update your repository." "Yellow"
            }
            "4" {
                git config --global credential.helper manager
                Write-ColorText "[OK] Git Credential Manager has been configured." "Green"
                Write-ColorText "  A login window will appear on your next push to save your credentials." "Yellow"
            }
            "5" {
                return
            }
            default {
                Write-ColorText "Invalid option. Please try again." "Red"
            }
        }
        Read-Host "`nPress Enter to continue..."
    }
}

# --- Main Program ---
Write-ColorText "==============================================" "Cyan"
Write-ColorText "        Git Connection Fix Tool v2.0          " "Cyan"
Write-ColorText "==============================================" "Cyan"

while ($true) {
    Write-ColorText "`n--- Main Menu ---" "Cyan"
    Write-ColorText "1. Run Full Diagnostics" "White"
    Write-ColorText "2. Apply a Fix" "White"
    Write-ColorText "3. Test Git Connection to Project" "White"
    Write-ColorText "4. Exit" "White"
    
    $choice = Read-Host "Please enter an option (1-4)"
    
    switch ($choice) {
        "1" {
            Test-NetworkConnection
            Check-ProxySettings
            Check-SSLSettings
            Write-ColorText "`nDiagnostics complete." "Cyan"
        }
        "2" {
            Apply-Fixes
        }
        "3" {
            Write-ColorText "`nTesting Git connection to repository..." "Green"
            git ls-remote --heads https://github.com/SmallRob/nice_today.git | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-ColorText "[OK] Git connection test successful!" "Green"
            } else {
                Write-ColorText "[FAIL] Git connection test failed. Please run diagnostics." "Red"
            }
        }
        "4" {
            Write-ColorText "Exiting script. Goodbye!" "Cyan"
            exit
        }
        default {
            Write-ColorText "Invalid option. Please try again." "Red"
        }
    }
    Write-ColorText "----------------------------------------------" "Gray"
}