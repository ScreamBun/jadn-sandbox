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
		cd (OpenC2 app directory)
		gunicorn --config gunicorn/gunicorn.conf --log-config gunicorn/logging.conf webApp:app
		```
		
- Docker
	1. Install docker
	- Install varies based on the system...

	2. Build/Pull the container
		- Build
		
		```bash
		docker build -t open_c2 -f Dockerfile .
		```
		
		- Pull
			- If on Docker Hub
		
			```bash
			docker pull open_c2/open_c2
			```
			
			- If not on Docker Hub
		
			```bash
			docker pull REPO_NAME_TO_CONTAINER
			```
	
	3. Run the server
	
		```bash
		docker run --name open_c2_validator -p 80:80 -v $(pwd)/data:/data open_c2 -b
		```
		
		
#### Gunicorn Note
- Valid settings can be found on the [Docs page](http://docs.gunicorn.org/en/latest/settings.html)
- Settings are passed as environment variables with docker run (-e VAR VAL) in the format of GUNICORN_(VAR)
	- Ex) changing the number of workers
		
		```bash
		docker run -e GUNICORN_WORKERS=8 --name open_c2_validator -p 80:80 -v $(pwd)/data:/data open_c2 -b
		```

#### General Notes
- If using docker and command line is not preferred, install [Portainer](https://portainer.io/) (web gui management for docker)
