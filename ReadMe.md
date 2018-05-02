# ScreamingBunny (OpenC2) Web Message Validator
## Running Server (developement)
1. Install Python3 and pip3
	- Install varies based on the system...

2. Install the python packages from the requirements.txt file
	
	```bash
	pip3 install -r requirements.txt
	```
	
3. Run the server
	
	```bash
	python3 -m webApp
	```
	
#### Notes
- Recomended to use virtualenv, if not currently, while on a delvelopement system
- Not validated for use with python2.7

## Running Gunicorn Server (production)
- Standalone
	1. Install Python3 and pip3
	- Install varies based on the system...

	2. Install the python packages from the requirements.txt file
	
		```bash
		pip3 install -r requirements.txt
		```
	
	3. Run the server
	
		```bash
		cd (OpenC2 directory)
		gunicorn --config gunicorn/gunicorn.conf --log-config gunicorn/logging.conf webApp:app
		```

		
## Google App Engine
TODO: Fill in info based on [simple flask app](https://cloud.google.com/appengine/docs/standard/python/getting-started/python-standard-env)
		
		
#### Gunicorn Note
- Valid settings can be found on the [Docs page](http://docs.gunicorn.org/en/latest/settings.html)

#### General Notes
- Install oc2 whl using local install

    ```bash
    pip install ./oc2-0.0.1-py2-none-any.whl
    ```
