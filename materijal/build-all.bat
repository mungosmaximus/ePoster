@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

title Build Material Application

echo ========================================
echo    Build Material Application
echo ========================================
echo.

echo [1/2] Generating manifest.json and manifest.js...

set "tempfile=%TEMP%\files_sorted.txt"

:: POUZDANO prikupljanje svih slika - JEDNA petlja
(
  for %%f in (*.jpg *.jpeg *.png) do echo %%f
) > "%tempfile%"

:: Provera da li ima fajlova
for %%a in ("%tempfile%") do if %%~za==0 (
  echo [ERROR] No image files found in current folder
  pause
  exit /b 1
)

:: =====================================================
:: manifest.json (sortirano)
:: =====================================================
set "json_content=["
set "first=1"

for /f "usebackq delims=" %%f in (`sort "%tempfile%"`) do (
  if !first!==1 (
    set "json_content=!json_content!"%%f""
    set first=0
  ) else (
    set "json_content=!json_content!, "%%f""
  )
)

set "json_content=!json_content!]"
echo !json_content! > manifest.json

:: =====================================================
:: manifest.js (sortirano)
:: =====================================================
(
  echo // Auto-generated - DO NOT EDIT MANUALLY
  echo.
  echo window.MATERIJALI = [
  set first=1
  for /f "usebackq delims=" %%f in (`sort "%tempfile%"`) do (
    if !first!==1 (
      echo   "%%f"
      set first=0
    ) else (
      echo   , "%%f"
    )
  )
  echo ];
) > manifest.js

del "%tempfile%" 2>nul

if exist manifest.js (
  echo [OK] manifest.json and manifest.js created
  echo.
  echo manifest.js content:
  echo ------------------------
  type manifest.js
  echo ------------------------
) else (
  echo [ERROR] Failed to create manifest.js
  pause
  exit /b 1
)

echo.
echo ========================================
echo    BUILD SUCCESSFUL!
echo ========================================
echo.
pause