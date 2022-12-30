# JADN Sandbox - Server

## Running Server
### Config/General
1. Install Python3.10 and pip
	- Install varies based on the system...
	
2. Install OpenC2 JADN whl using local install
    - Can be downloaded from the ScreamingBunny/JAND/Python project on GitLab

    ```bash
    pip install OpenC2-*.whl
    ```
3. Install the required packages

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

		
## Google App Engine (development & production)
### Config/Install
1. Download and install Python 2.7 on system on in virtual env
	- Note: MUST USE PYTHON 2.7

2. Download and install [Google Cloud SDK](https://cloud.google.com/sdk/docs/)
3. Install the app engine
	
	```bash
	gcloud components install app-engine-python
	```

4. install virtual env

	```bash
	pip install virtualenv
	```

5. Optionally
	- Install git
	- Install Google cloud Extras Library
		
		```bash
		gcloud components install app-engine-python-extras
		```

### Getting Started
	- The following are to be done within the project folder
	- All should aleady exist except the virtual environment

1. Create a 'appengine_config.py' file with the following contents
	- This is used to import required third-libraries
	
	```python
	from google.appengine.ext import vendor

	# Add any libraries installed in the "lib" folder.
	vendor.add('lib')
	```
	
2. Create a requirements.txt file, if not already

3. Install project requirements
	
	```bash
	pip install -t lib -r requirements.txt
	```
	
	- This includes non-distributed libraries such as the OpenC2 package, these are included as well
	
	```bash
	pip install -t lib INSTALL_FILE
	```
	
4. Create an app.yaml file with the following contents
	- The libraries are for third-party package dependencies such as openssl for pyssl and lxml for xml parsing
	
	```yaml
	runtime: python27
	api_version: 1
	threadsafe: true
	
	libraries:
	- name: ssl
	  version: latest
	- name: lxml
	  version: "3.7.3"
	
	handlers:
	- url: /static
	  static_dir: webApp/static
	- url: /.*
  	script: webApp.app
	```
	
### Dev Use
1. Create app Flask application as if without Google App Engine
	- This is already completed

2. Install required libraries, see Google App Engine - Getting Started - #3

3. Start a local developement server
	- Note: May require the full path instead of `.`, use `$PWD` or equilivant instead

	```bash
	dev_appserver.py .
	```

### Uploading to Google
1. Create app Flask application as if without Google App Engine
	- This is already completed

2. Install required libraries, see Google App Engine - Getting Started - #3
	- This is already completed if prior developement has been done

3. Upload the application
	- This may require permission on Google App Engine
	- Optional: `-v` can be used to specify a version for the project
	
	```bash
	gcloud app deploy --project jadn-validator
	```
	
4. View the application as http://[YOUR_PROJECT_ID].appspot.com
	- http://jadn-validator.appspot.com/

		
### Notes
- Using Git flow for developement - maybe...

#### General
- Using [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/) for simple feature intigration
