@echo off
if not exist .venv-windows (
	echo ^|^|^| Python - Create Virtual Environment
	py -m venv .venv-windows
	call .venv-windows/Scripts/Activate.bat
	echo ^|^|^| Python - Update Pip
	py -m pip install --upgrade pip
	echo ^|^|^| Python - Install Dependencies
	py -m pip install -r requirements.txt
)
call .venv-windows/Scripts/Activate.bat
py scripts/build.py