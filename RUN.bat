@ECHO OFF

@REM  ▄   ▄         ／／ｂａｎｅ
@REM ▄██▄▄██▄       ／／i　ｔｒｙ　ｔｏ　ｍａｋｅ　ｔｈｉｎｇｓ
@REM ███▀██▀██      ／／ｓｏｍｅｔｉｍｅｓ　i　ｓｕｃｃｅｄ
@REM ▀███████▀  
@REM  ▀███████▄▄  
@REM   ██████████▄

@REM Run a local HTTP server using http-server

WHERE http-server >NUL 2>NUL
IF %ERRORLEVEL% NEQ 0 (
    ECHO http-server not found. Please install it using:
    ECHO npm install -g http-server
    ECHO.
    ECHO For more information, visit: https://www.npmjs.com/package/http-server
    ECHO.
    PAUSE
    EXIT /B 1
)

START "" http://localhost:8080
http-server -p 8080 -c-1