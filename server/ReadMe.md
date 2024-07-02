# JADN Sandbox - Server

## Running Server

### Config/General

1. Install Python3.10 and pip

- Install varies based on the system...

2. Install the required packages

 ```bash
    pip install -r requirements.txt
    ```

## Flask Server (development)

- Linux

    ```bash
    start.sh
 ```

- Windows

 ```cmd
 start.bat
 ```

#### Notes

- Recommended use of virtualenv, if not currently, while on a development system
- Not validated for use with python3
- Gunicorn is the prod server like Apache, Flask is only for development purposes
