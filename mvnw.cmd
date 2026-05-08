@echo off
setlocal

set BASE_DIR=%~dp0
set BASE_DIR=%BASE_DIR:~0,-1%
set WRAPPER_DIR=%BASE_DIR%\.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties

if not exist "%WRAPPER_JAR%" (
  echo Downloading Maven Wrapper...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$properties = @{}; Get-Content '%WRAPPER_PROPERTIES%' | Where-Object { $_ -match '=' } | ForEach-Object { $key, $value = $_ -split '=', 2; $properties[$key] = $value }; Invoke-WebRequest -Uri $properties['wrapperUrl'] -OutFile '%WRAPPER_JAR%'"
  if errorlevel 1 (
    echo Failed to download Maven Wrapper.
    exit /b 1
  )
)

java "-Dmaven.multiModuleProjectDirectory=%BASE_DIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
