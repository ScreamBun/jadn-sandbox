<a href="https://openc2.org/" target="_blank">![OpenC2](https://github.com/ScreamBun/SB_Utils/blob/master/assets/images/openc2.png?raw=true)</a>
# JADN Sandbox

[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/downloads/release/python-3100/)
[![Open2C Lang Spec WD 17](https://img.shields.io/badge/Open2C%20Lang%20Spec-WD17-brightgreen)](https://github.com/dlemire60/openc2-oc2ls)

#### See readme in each folder for specific details

## Quick Start

1. Server Side
   1. Under WebValidator/server run: 
      1. pip install -r requirements.txt
      2. ./start.sh
2. Client Side
   1. Under WebValidator/client run: 
      1. yarn install
      2. yarn build
      2. yarn start or watch
3. In your browser go to: http://localhost:3000/

## How To
### Create a jadnschema wheel
* See readme under the jadnschema repo
### Develop and Test JADN Schema on the Fly
* When developing and testing JADN Schema, you can link it directly to your virtual environment to avoid recreating wheels.
  * Within your virtual environment view the python dependencies 
    * pip freeze
  * Remove the jadnschema wheel
    * pip uninstall jadnschema
  * Add the jadnschema git repo source to the python dependencies
    * cd to jadnschema
    * python setup.py develop
    * pip freeze
    * You should see this something similar to this
      * -e git+ssh://git@ccoe-gitlab.hii-tsd.com/screamingbunny/schema/jadnschema.git@16ac517baa1499014ba221b7d1b7ffb3cef20ebe#egg=jadnschema
  * Go back to the Web Validator and start the server
    * ./start.sh
  * Remember when you are finished, make sure to 
    * recreate the jadnschema wheel, which contains the updated code
    * uninstall the direct link, simple pip uninstall jadnschema
    * install the updated jadnschema wheel

## Notes
* Docker run coming soon

## Client
- React single page application

## Server
- Flask restful server with react app as GUI

### Serving the client via the server
1. Build the client as specified in the client readme
2. Copy the contents of `client/build/assets` directory to `server/webApp/static`
	- Merge the folders and replace what is currently in the folders
	- Note: The following files are used by the endpoints page and should not be replaced (Roboto & Lato fonts are also used by the client application)
		- `server/webApp/static/css/styles.min.css`
		- `server/webApp/static/js/scripts.min.js`
		- `server/webApp/static/assets/fonts/Lato-Bold.ttf`
		- `server/webApp/static/assets/fonts/Lato-Italic.ttf`
		- `server/webApp/static/assets/fonts/Lato-Light.ttf`
		- `server/webApp/static/assets/fonts/Lato-Regular.ttf`
		- `server/webApp/static/assets/fonts/Roboto-Bold.ttf`
		- `server/webApp/static/assets/fonts/Roboto-Light.ttf`
		- `server/webApp/static/assets/fonts/Roboto-Medium.ttf`
		- `server/webApp/static/assets/fonts/Roboto-Regular.ttf`
        
3. Move the index file that was copied to the server templates directory
	- Server: `server/webApp/templates/`

4. Start the server and navigate to the web browser page to verify the client is server correctly