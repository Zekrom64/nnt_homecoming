#!/bin/bash

if [ ! -d .venv-linux ]; then
	echo "||| Python - Create Virtual Environment"
	python3 -m venv .venv-linux
	source .venv-linux/bin/activate
	echo "||| Python - Update Pip"
	python3 -m pip install --upgrade pip
	echo "||| Python - Install Dependencies"
	python3 -m pip install -r requirements.txt
fi

source .venv-linux/bin/activate
python3 scripts/build.py