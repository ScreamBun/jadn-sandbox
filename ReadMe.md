<a href="https://openc2.org/" target="_blank">![OpenC2](https://github.com/ScreamBun/SB_Utils/blob/master/assets/images/openc2.png?raw=true)</a>

# JADN Sandbox

[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/downloads/release/python-3100/)
[![Open2C Lang Spec WD 17](https://img.shields.io/badge/Open2C%20Lang%20Spec-WD17-brightgreen)](https://github.com/dlemire60/openc2-oc2ls)

#### See readme in each folder for specific details

## Quick Start

*Note: This assumes you have [Git](https://git-scm.com/) and [Python](https://www.python.org/downloads/release/python-3100/) installed and an active [GitHub](https://github.com/ScreamBun/jadn-sandbox) account.*

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

* React single page application

## Server

* Flask restful server with react app as GUI

### Serving the client via the server

1. Build the client as specified in the client readme
2. Copy the contents of `client/build/assets` directory to `server/webApp/static`

* Merge the folders and replace what is currently in the folders
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

3. Move the index file that was copied to the server templates directory

* Server: `server/webApp/templates/`

4. Start the server and navigate to the web browser page to verify the client is server correctly
