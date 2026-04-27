@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

title Build titles.js from CSV

echo ========================================
echo  Build titles.js from titles.csv
echo ========================================
echo.

if not exist titles.csv (
  echo [INFO] titles.csv not found. Skipping.
  pause
  exit /b 0
)

:: -------------------------------------------------
:: STEP 1: STRIP UTF-8 BOM
:: -------------------------------------------------
set "CLEAN_CSV=%TEMP%\titles_nobom.csv"
type titles.csv > "%CLEAN_CSV%"

echo [OK] BOM stripped (if present)

:: -------------------------------------------------
:: STEP 2: GENERATE titles.js (JavaScript)
:: -------------------------------------------------
(
  echo window.TITLES = {
  set first=1

  for /f "usebackq skip=1 tokens=1-3 delims=," %%A in ("%CLEAN_CSV%") do (
    set "rawid=%%A"
    set "name=%%B"
    set "title=%%C"

    rem Normalize ID: 001 -> 1
    for /f "tokens=* delims=0" %%X in ("!rawid!") do set "id=%%X"
    if "!id!"=="" set "id=0"

    if !first!==1 (
      echo   "!id!": {"name":"!name!","title":"!title!"}
      set first=0
    ) else (
      echo   , "!id!": {"name":"!name!","title":"!title!"}
    )
  )

  echo };
) > titles.js

:: -------------------------------------------------
:: CLEANUP
:: -------------------------------------------------
del "%CLEAN_CSV%" 2>nul

if exist titles.js (
  echo.
  echo [OK] titles.js created successfully
  echo ----------------------------------------
  type titles.js
  echo ----------------------------------------
) else (
  echo [ERROR] Failed to create titles.js
)

echo.
pause