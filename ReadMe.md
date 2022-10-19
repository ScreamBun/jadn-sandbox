<a href="https://openc2.org/" target="_blank">![OpenC2](https://github.com/ScreamBun/SB_Utils/blob/master/assets/images/openc2.png?raw=true)</a>
# JADN Lint

[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/downloads/release/python-3100/)
[![Open2C Lang Spec WD 17](https://img.shields.io/badge/Open2C%20Lang%20Spec-WD17-brightgreen)](https://github.com/dlemire60/openc2-oc2ls)

#### See readme in each folder for specific details

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