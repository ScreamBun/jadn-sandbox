# ScreamingBunny (OpenC2) Web Message Validator
## Running Server (General)
1. Install Python and pip
	- Install varies based on the system...
2. Install OpenC2 JADN whl using local install

    ```bash
    pip install OpenC2-*.whl
    ```

## Flask Server (developement)
1. Install the python packages from the requirements.txt file
	
	```bash
	pip install -r requirements.txt
   	```
	
2. Run the server
	- Linux
		
		```bash
		start.sh
		```
	
	- Windows
	
		```cmd
		start.bat
		```
	
#### Notes
- Recomended to use virtualenv, if not currently, while on a delvelopement system
- Not validated for use with python2.7

## Gunicorn Server (production)
- Standalone
	1. Install the python packages from the requirements.txt file
	
		```bash
		pip install -r requirements.txt
		```
	
	2. Run the server
	
		```bash
		cd (OpenC2 directory)
		gunicorn --config gunicorn/gunicorn.conf --log-config gunicorn/logging.conf webApp:app
		```

		
## Google App Engine (developement & production)
### Install
1. Download and install Python 2.7 on system on in virtual env
	- Note: must use python 2.7
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
	- This is the required libraries of the project
	- line separeated and version specific if necessary

3. Create an isolated virtual env for the project
	- Linux/Mac
		
		```bash
		virtualenv env 
		source env/bin/activate
		```
	- Windows
	
		```cmd
		virtualenv env 
		env\scripts\activate
		```

4. Install project requirements
	
	```bash
	pip install -t lib -r requirements.txt
	```
	
	- This includes non-distributed libraries such as the OpenC2 package at the moment, these are installed as well
	
	```bash
	pip install -t lib INSTALL_FILE
	```
	
5. Create an app.yaml file with the following contents
	- The libraries are for third-party package dependencies such as openssl for pyssl
	
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

2. Install required libraries, see Google App Engine - Getting Started - #4

3. Start local developement server

	```bash
	dev_appserver.py .
	```

### Uploading to Google
1. Create app Flask application as if without Google App Engine
	- This is already completed

2. Install required libraries, see Google App Engine - Getting Started - #4
	- This is already completed if prior developement has been done

3. Upload the application
	- This may require permission on Google App Engine
	-  Optional: `-v` can be used to specify a version for the project
	
	```bash
	gcloud app deploy --project jadn-validator
	```
	
4. View the application as http://[YOUR_PROJECT_ID].appspot.com
	- http://jadn-validator.appspot.com/


TODO: Fill in info based on [simple flask app](https://cloud.google.com/appengine/docs/standard/python/getting-started/python-standard-env)
		
### Notes
- Using Git flow for developement

#### Gunicorn
- Valid settings can be found on the [Docs page](http://docs.gunicorn.org/en/latest/settings.html)

#### General
- Using [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/) for simple feature intigration
