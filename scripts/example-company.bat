cd %cd%
cd | findstr /C "scripts"
IF %ERRORLEVEL% EQU 0 (cd ..)

cd examples
cd company

node index.js
cmd
