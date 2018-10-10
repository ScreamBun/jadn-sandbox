# JADN Lint/WebValidate
#### See readme in each folder for specific details

## Client
- React single page application

## Server
- Flask restful server with react app as GUI

### Serving the client via the server
1. Build the client as specified in the client readme
2. Copy the contents of `client/build/assets` directory to `server/webApp/static`
	- Merge the folders and replace what is currently in the folders
	- Note: The following files are used by the routes page and should not be replaced (roboto-mono-v5-latin-regular is also used by the client application)
		- `server/webApp/static/css/styles.min.css`
		- `server/webApp/static/js/scripts.min.js`
		- `server/webApp/static/assets/fonts/roboto-mono-v5-latin-regular.eot`
		- `server/webApp/static/assets/fonts/roboto-mono-v5-latin-regular.svg`
		- `server/webApp/static/assets/fonts/roboto-mono-v5-latin-regular.ttf`
		- `server/webApp/static/assets/fonts/roboto-mono-v5-latin-regular.woff`
		- `server/webApp/static/assets/fonts/roboto-mono-v5-latin-regular.woff2`
3. Verify the index pages contain the correct file names
	- Client: `client/build/index.html`, Server: `server/webApp/templates/index.html`
	- The src and href attributes should match with the exceptions of
		- The server href/src should be `{{ url_for('static', filename='FILENAME') }}`

4. Start the server and navigate to the webpbrowser page to verify the client is server correctly