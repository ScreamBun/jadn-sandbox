# JADN Sandbox

[![OpenC2](https://github.com/ScreamBun/SB_Utils/blob/master/assets/images/openc2.png?raw=true)](https://openc2.org/)
[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/downloads/release/python-3100/)
[![Open2C Lang Spec WD 17](https://img.shields.io/badge/Open2C%20Lang%20Spec-WD17-brightgreen)](https://github.com/dlemire60/openc2-oc2ls)

## Background

The JADN Sandbox provides the ability to create, convert, translate, transform, and validate JADN compliant schemas. In addition, for applications that communicate via messaging, the app provides the ability to create and validate messages against a schema, as well as, generate test messages based on the provided schema. Within JADN Sandbox users can interact with the JADN information modeling tools and create schemas or messages based on their application or systems needs or just to learn more about JADN with a hands on approach.
[JADN Sandbox Walkthrough PDF](https://github.com/ScreamBun/jadn-sandbox/blob/develop/documentation/JADNSandboxInfo.pdf).

## Quick Startup

1. Install [Docker](https://docs.docker.com/get-docker/)

2. Pull the latest JADN Sandbox Docker Image (Note: this is needed each time to ensure you are using the very latest version of the JADN Sandbox)

  ```bash
  docker pull screambunn/jadn_sandbox
  ```

3. Run the docker image

  ```bash
  docker run --rm -p 8082:8082 screambunn/jadn_sandbox:latest
  ```

4. Enter the url below in your browser

  <http://localhost:8082/>

5. To stop your image, just hit `ctrl+c` in your terminal or via your docker software.

## Kubernetes Deployment

### Prerequisites

Install the following tools based on your operating system:

#### kubectl

**Linux:**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

**macOS:**
```bash
brew install kubectl
# Or using curl:
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

**Windows:**
```powershell
# Using winget (recommended, pre-installed on Windows 10/11):
winget install Kubernetes.kubectl

# Or using Chocolatey:
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
```

Verify installation: `kubectl version --client`

#### minikube (for local development)

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**macOS:**
```bash
brew install minikube
# Or using curl:
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

**Windows:**
```powershell
# Using winget (recommended, pre-installed on Windows 10/11):
winget install Kubernetes.minikube

# Or using Chocolatey:
choco install minikube

# Or download installer from: https://minikube.sigs.k8s.io/docs/start/
```

Start minikube: `minikube start`

Verify installation: `minikube status`

#### Helm (optional, for Helm deployment)

**Linux:**
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**macOS:**
```bash
brew install helm
```

**Windows:**
```powershell
# Using winget (recommended, pre-installed on Windows 10/11):
winget install Helm.Helm

# Or using Chocolatey:
choco install kubernetes-helm
```

Verify installation: `helm version`

For detailed installation instructions, visit:
- kubectl: https://kubernetes.io/docs/tasks/tools/
- minikube: https://minikube.sigs.k8s.io/docs/start/
- Helm: https://helm.sh/docs/intro/install/

### Plain Kubernetes Deployment (k8_start.py)

Deploys JADN Sandbox using plain Kubernetes manifests.

**Usage:**

```bash
# Fresh install with default/latest image
python3 k8_start.py

# Use custom image
python3 k8_start.py -i screambunn/jadn_sandbox:v2.0

# Skip image load (for remote clusters)
python3 k8_start.py --skip-load
```

**Options:**
- `-i, --image`: Docker image to deploy (default: `screambunn/jadn_sandbox:latest`)
- `--skip-load`: Skip loading image into minikube (use for remote clusters)

**What it does:**
- Loads the Docker image into minikube (unless `--skip-load` is specified)
- Deletes and recreates the `jadn-sandbox` namespace
- Generates and applies Kubernetes manifests (ConfigMap, Deployment, Service, Ingress)
- Waits for pods to be ready
- Starts port-forward to `localhost:8080`

### Helm Deployment (helm_start.py)

Deploys JADN Sandbox using Helm charts for easier management and upgrades.

**Usage:**

```bash
# Fresh install with default/latest image
python3 helm_start.py

# Upgrade existing deployment
python3 helm_start.py --upgrade

# Use custom image
python3 helm_start.py -i screambunn/jadn_sandbox:v2.0

# Skip image load (for remote clusters)
python3 helm_start.py --skip-load

# Combine options
python3 helm_start.py --upgrade --skip-load
```

**Options:**
- `-i, --image`: Docker image to deploy (default: `screambunn/jadn_sandbox:latest`)
- `--upgrade`: Upgrade existing release without deleting namespace
- `--skip-load`: Skip loading image into minikube (use for remote clusters)

**What it does:**
- Loads the Docker image into minikube (unless `--skip-load` is specified)
- For fresh install: Deletes namespace and installs new Helm release
- For upgrade: Updates existing Helm release in-place
- Waits for pods to be ready
- Starts port-forward to `localhost:8080`

**Accessing the Application:**

After deployment, access JADN Sandbox at:
- Port-forward: `http://localhost:8080`
- Ingress (if configured): `http://jadn-sandbox.local`

Press `Ctrl+C` to stop the port-forward.

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

### Alternate Startup

1. Fire up server

  ```bash
  cd server
  ./start.sh
  ```

2. In another terminal, fire up the client

yarn build
yarn start

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
* When you run docker_push.py it will ask for the version # (v[Major].[Minor].[Bug])

1. Run this command once to build the image and push to DockerHub:

  ```bash
  python ./docker_push.py
  ```

2. To start your image, enter the following, this will start the image without rebuilding

  ```bash
  ./docker_run.sh
  ```

3. If the latest tag is not updating in Docker Hub, take the following steps to realign the tag

  ```bash
    docker tag screambunn/jadn_sandbox:<version> screambunn/jadn_sandbox:latest
    docker push screambunn/jadn_sandbox:latest
    ```

Or run the following, you can replace 'latest' with a specific version if you have previously built it or pulled it (see quick start).

  ```bash
  docker run --rm -p 8082:8082 screambunn/jadn_sandbox:latest --no-cache
  ```

3. Once the build is complete go to here in your browser to verify and run smoke tests

  <http://localhost:8082/>

### Create a jadnschema Wheel

* See readme under the jadnschema repo

### Build Ruby Image and Container and use locally

Need to start Ruby Container when you are developing and want CBOR conversion logic

1. In a terminal window, from the JADN Sandbox root directory, build the image:

    ```bash
    docker build -t sb-ruby-image -f Dockerfile_sb_ruby .
    ```

2. Next, build the container (/bin/bash is optional this allows you to immediately investigate the contents of the container)

    ```bash
    docker run -it --name=sb-ruby-container sb-ruby-image /bin/bash
    ```

3. Go to server / webApp / data / version.toml and change the app_mode to "local".  

4. Your ruby docker container is now ready to be used.

### Develop and Test JADN Schema on the Fly

* When developing and testing JADN Schema, you can link it directly to your virtual environment to avoid recreating wheels.
  * Within your virtual environment view the python dependencies:
    * `pip freeze`
  * Remove the jadnschema wheel:
    * `pip uninstall jadnschema`
  * Add the jadnschema git repo source to the python dependencies:
    * cd to jadnschema
    * `python setup.py develop`
    * `pip freeze`
    * You should see something similar to this:
      -e git+ssh://git@ccoe-gitlab.hii-tsd.com/screamingbunny/schema/jadnschema.git@16ac517baa1499014ba221b7d1b7ffb3cef20ebe#egg=jadnschema
  * Go back to the Web Validator and start the server:
    * `./start.sh`
  * Remember when you are finished, make sure to:
    * recreate the jadnschema wheel, which contains the updated code
    * uninstall the direct link, simply `pip uninstall jadnschema`
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

5. Start the server and navigate to the web browser page to verify the client is served correctly.
