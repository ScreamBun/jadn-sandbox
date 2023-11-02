# JADN Sandbox

[![OpenC2](https://github.com/ScreamBun/SB_Utils/blob/master/assets/images/openc2.png?raw=true)](https://openc2.org/)
[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/downloads/release/python-3100/)
[![Open2C Lang Spec WD 17](https://img.shields.io/badge/Open2C%20Lang%20Spec-WD17-brightgreen)](https://github.com/dlemire60/openc2-oc2ls)

## Background

The JADN Sandbox provides the ability to create, convert, translate, transform, and validate JADN compliant schemas. In addition, for applications that communicate via messaging, the app provides the ability to create and validate messages against a schema, as well as, generate test messages based on the provided schema. Within JADN Sandbox users can interact with the JADN information modeling tools and create schemas or messages based on their application or systems needs or just to learn more about JADN with a hands on approach.

## Quick Startup

1. Install docker [Docker](https://docs.docker.com/get-docker/)

2. Pull the latest JADN Sandbox Docker Image (Note: this is needed each time to ensure you are using the very latest version of the JADN Sandbox)

```bash
docker pull screambunn/jadn_sandbox
```

3. Run the docker image

  ```bash
  docker run --rm -p 8082:8082 screambunn/jadn_sandbox:latest
  ```

4. Enter the url below in your browser

```bash
http://localhost:8082/
```  

5. To stop your image, just hit `ctrl+c` in your terminal or via your docker software

## Development Startup

Prerequisites:

* [Git](https://git-scm.com/) installed
* [Python](https://www.python.org/downloads/release/python-3100/) installed
* An active [GitHub](https://github.com/ScreamBun/jadn-sandbox) account

1. Clone the JADN Sandbox from GitHub to your local workstation

2. From commandline, go to the directory where you would like the application to live, here's an example:

  ```bash
  cd /home/username/workspace
  ```

3. Using git, clone the jadn-sandbox repo to your local directory

```bash
git clone https://github.com/ScreamBun/jadn-sandbox.git
```

4. (Optional, specific to Linux and Mac) Create a [virtual environment](https://www.freecodecamp.org/news/how-to-setup-virtual-environments-in-python/) for the app

5. Run the startup script to install the app's dependencies and fire up it's servers

```bash
./startup.sh
```

### Alternate startup

1. Fire up server  

```bash
cd server
./start.sh
```

2. In another terminal, fire up the client

```bash
cd client 
yarn 
yarn build
yarn start
```

## How To

### Build a Docker Image

Ref: [Docker Image on DockerHub](https://hub.docker.com/repository/docker/screambunn/jadn_sandbox/general)

Important Notes:

* You will need to know the screambunn DockerHub login in order to push a new image.
* A new version tag and image should be pushed after each docker build and push.  
* When you run docker_push.py it will askf for the version # (v[Major].[Minor].[Bug])

1. Run this command once to build the image and push to Dockhub/

```bash
./docker_push.py
```

2. To start your image, enter the following, this will start the image without rebuilding

```bash
./docker_run.sh
```

3. Once the build is complete go to here in your browser to verify and run smoke tests

```bash
http://localhost:8082/
```

### Create a jadnschema wheel

* See readme under the jadnschema repo

### Develop and Test JADN Schema on the Fly

* When developing and testing JADN Schema, you can link it directly to your virtual environment to avoid recreating wheels.
  * Within your virtual environment view the python dependencies
    * `pip freeze`
  * Remove the jadnschema wheel
    * `pip uninstall jadnschema`
  * Add the jadnschema git repo source to the python dependencies
    * cd to jadnschema
    * `python setup.py develop`
    * `pip freeze`
    * You should see this something similar to this:
      >-e git+ssh://git@ccoe-gitlab.hii-tsd.com/screamingbunny/schema/jadnschema.git@16ac517baa1499014ba221b7d1b7ffb3cef20ebe#egg=jadnschema
  * Go back to the Web Validator and start the server
    * `./start.sh`
  * Remember when you are finished, make sure to
    * recreate the jadnschema wheel, which contains the updated code
    * uninstall the direct link, simple pip uninstall jadnschema
    * install the updated jadnschema wheel

  Note: If you update the whl filename/version, then the Dockerfile will need to be updated to use this new filename as well.

## Client

* React single page application

## Server

* Flask restful server with react app as GUI

### Serving the client via the server

1. Build the client as specified in the client readme
2. Copy the contents of `client/build/assets` directory to `server/webApp/static`
3. Merge the folders and replace what is currently in the folders

* Note: The following files are used by the endpoints page and should not be replaced (Roboto & Lato fonts are also used by the client application)
* `server/webApp/static/css/styles.min.css`
* `server/webApp/static/js/scripts.min.js`
* `server/webApp/static/assets/fonts/Lato-Bold.ttf`
* `server/webApp/static/assets/fonts/Lato-Italic.ttf`
* `server/webApp/static/assets/fonts/Lato-Light.ttf`
* `server/webApp/static/assets/fonts/Lato-Regular.ttf`
* `server/webApp/static/assets/fonts/Roboto-Bold.ttf`
* `server/webApp/static/assets/fonts/Roboto-Light.ttf`
* `server/webApp/static/assets/fonts/Roboto-Medium.ttf`
* `server/webApp/static/assets/fonts/Roboto-Regular.ttf`

4. Move the index file that was copied to the server templates directory

* Server: `server/webApp/templates/`

5. Start the server and navigate to the web browser page to verify the client is server correctly
