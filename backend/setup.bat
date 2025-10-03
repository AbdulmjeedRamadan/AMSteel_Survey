@echo off
echo =========================================
echo AMSteel Survey Backend - Setup Script
echo =========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [✓] npm is installed
npm --version
echo.

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL command not found in PATH
    echo Make sure PostgreSQL is installed and accessible
    echo.
)

echo =========================================
echo Step 1: Installing Dependencies
echo =========================================
echo.

npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [✓] Dependencies installed successfully
echo.

REM Check if .env exists
if not exist .env (
    echo =========================================
    echo Step 2: Setting up Environment Variables
    echo =========================================
    echo.

    if exist .env.example (
        copy .env.example .env
        echo [✓] Created .env file from .env.example
        echo.
        echo [IMPORTANT] Please edit .env file and configure:
        echo   - DB_PASSWORD (your PostgreSQL password)
        echo   - JWT_SECRET (generate a random secret key)
        echo.
        echo Press any key to open .env file in notepad...
        pause >nul
        notepad .env
    ) else (
        echo [ERROR] .env.example file not found
        pause
        exit /b 1
    )
) else (
    echo [✓] .env file already exists
)

echo.
echo =========================================
echo Step 3: Database Setup
echo =========================================
echo.

echo You need to create the PostgreSQL database manually.
echo.
echo Run this command in PostgreSQL:
echo   CREATE DATABASE amsteel_survey;
echo.
echo Options:
echo   1. Use psql command line
echo   2. Use pgAdmin GUI
echo.
echo Press any key when database is created...
pause >nul

echo.
echo =========================================
echo Step 4: Running Database Migrations
echo =========================================
echo.

call npm run migrate:up
if %errorlevel% neq 0 (
    echo [ERROR] Migration failed!
    echo Please check:
    echo   - PostgreSQL is running
    echo   - Database 'amsteel_survey' exists
    echo   - Database credentials in .env are correct
    pause
    exit /b 1
)

echo.
echo [✓] Database migrations completed successfully
echo.

echo =========================================
echo Step 5: Seeding Initial Data
echo =========================================
echo.

call npm run seed:initial
if %errorlevel% neq 0 (
    echo [ERROR] Seeding failed!
    pause
    exit /b 1
)

echo.
echo [✓] Initial data seeded successfully
echo.

echo =========================================
echo Setup Complete! 🎉
echo =========================================
echo.
echo Default credentials:
echo   Email: developer@amsteel.com
echo   Password: Developer@123
echo.
echo To start the development server:
echo   npm run dev
echo.
echo The API will be available at:
echo   http://localhost:5000
echo.
echo =========================================
echo.

pause
