<#
.SYNOPSIS
    Automated Deployment Script for Staging Area
.DESCRIPTION
    Runs unit and integration tests first, builds the production bundle,
    and stages or pushes changes to the staging area or staging branch.
.PARAMETER Target
    Staging target: 'git' (stages changes into git index), 'branch' (pushes to staging branch), or 'all'.
.PARAMETER Branch
    Name of the remote staging branch (default: 'staging').
.PARAMETER Message
    Commit message if committing staged changes (optional).
#>
param (
    [ValidateSet('git', 'branch', 'all')]
    [string]$Target = 'git',

    [string]$Branch = 'staging',

    [string]$Message = 'release: deploy to staging'
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Text)
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host ">>> $Text" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "[SUCCESS] $Text" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Text)
    Write-Host "[ERROR] $Text" -ForegroundColor Red
}

try {
    # --------------------------------------------------------------------------
    # Step 1: Pre-flight Checks
    # --------------------------------------------------------------------------
    Write-Step "Step 1: Running Pre-flight Checks"
    if (-not (Test-Path "package.json")) {
        throw "package.json not found. Run this script from the project root."
    }
    Write-Success "Project root confirmed."

    # --------------------------------------------------------------------------
    # Step 2: Run All Tests First (Mandatory Gate)
    # --------------------------------------------------------------------------
    Write-Step "Step 2: Running All Tests"
    Write-Host "Executing: npm test" -ForegroundColor Yellow
    npm test
    if ($LASTEXITCODE -ne 0) {
        throw "Test suite failed with exit code $LASTEXITCODE. Deployment aborted."
    }
    Write-Success "All tests passed successfully."

    Write-Host "Executing: npm run lint" -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        throw "Lint checks failed with exit code $LASTEXITCODE. Deployment aborted."
    }
    Write-Success "Lint checks passed successfully."

    # --------------------------------------------------------------------------
    # Step 3: Build Production Bundle
    # --------------------------------------------------------------------------
    Write-Step "Step 3: Building Production Bundle"
    Write-Host "Executing: npm run build" -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Production build failed with exit code $LASTEXITCODE. Deployment aborted."
    }

    if (-not (Test-Path "dist/index.html")) {
        throw "Build output verification failed: 'dist/index.html' not found."
    }
    Write-Success "Production bundle built and verified in ./dist."

    # --------------------------------------------------------------------------
    # Step 4: Push to Staging Area
    # --------------------------------------------------------------------------
    Write-Step "Step 4: Pushing to Staging Area (Target: $Target)"

    if ($Target -eq 'git' -or $Target -eq 'all') {
        Write-Host "Adding changes to Git staging area (git add -A)..." -ForegroundColor Yellow
        git add -A
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to stage changes in git."
        }
        Write-Success "Changes successfully staged in the Git staging area."
        Write-Host "`nCurrently Staged Files:" -ForegroundColor White
        git status --short
    }

    if ($Target -eq 'branch' -or $Target -eq 'all') {
        Write-Host "Checking out staging branch: $Branch..." -ForegroundColor Yellow
        
        # Check if local changes need commit before branch switch
        $diffStatus = git status --porcelain
        if ($diffStatus) {
            Write-Host "Committing staged changes with message: '$Message'..." -ForegroundColor Yellow
            git commit -m "$Message"
        }

        # Check if staging branch exists locally
        $branchExists = git branch --list $Branch
        if ($branchExists) {
            git checkout $Branch
            git merge - --no-edit
        } else {
            git checkout -b $Branch
        }

        Write-Host "Pushing to remote branch '$Branch'..." -ForegroundColor Yellow
        git push origin $Branch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Warning: Remote push failed or no remote configured for '$Branch'." -ForegroundColor Yellow
        } else {
            Write-Success "Pushed successfully to remote branch '$Branch'."
        }
    }

    # --------------------------------------------------------------------------
    # Step 5: Summary
    # --------------------------------------------------------------------------
    Write-Step "Deployment Complete"
    Write-Success "Deployment pipeline completed successfully!"
    Write-Host "1. Tests: PASSED" -ForegroundColor Green
    Write-Host "2. Production Build: GENERATED (dist/)" -ForegroundColor Green
    Write-Host "3. Staging: UPDATED ($Target)" -ForegroundColor Green

} catch {
    Write-Failure $_.Exception.Message
    exit 1
}
