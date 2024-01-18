# JADN Sandbox Release Notes

## v0.10.0

* Schema Creation - Ability to search through Outline based on type name
* Schema Creation - Ability to add Exports to schema Types
* Schema Creation - Restrict user from including regex and pattern Type Options together
* Schema Creation - Improved drag and drop feature
* Translation - Improved XSD Array and Map translations
* Data Creation - Added data handling for dir field option
* Data Creation - Integer fields do not allow characters: "e", "E", "+", "-"
* Data Creation Bug Fix - Boolean type check
* JADN Schema Validation - Updated validation to check for valid Exports, ktype, and vtype
* Code Reduction - use of const and common components
* Changed Conversion labeling and text to Visualization
* Added informative text to guide user when drop downs have no options

## v0.9.1

* Changed Message labeling and text to Data
* Improved json vs jadn schema loader
* Removes redundant json validation
* Updated JADN to XSD logic

## v0.9.0

* Translation - Initial implementation of JADN to XSD Translation
* Translation - Introduced JSON Schema to JADN Translation
* Schema Creation - Lazy loading tied to scrolling
* Schema Creation - Clear All Toast button
* Schema Creation - Enhanced Fields Drag and Drop capabilities
* Schema Creation - Updated Enum Field Options to a Drop Down of Types
* Improved file load error handling

## v0.8.0

* Removed react-strap and installed bootstrap 5.3.2
* Various UI updates across the app to enhance usability
* Added various Modal Confirmations for deletions and resets
* Schema Creation - Introduced a Scroll Highlight on the Outline
* Schema Creation - Added a Clear Button to the Type and Field Option Modals
* Schema Creation - Fixed Info section unlocked from top of schema
* Transformation - Fixed schema deletion issue
* Generation - Prevent unresolved schemas from generating messages

## v0.7.1

* Fixed pydantic reserved word validation logic
* Updated translation error handling

## v0.7.0

* Fixed arrayOf validation logic
* Fixed min/max length validation logic
* Create Schema: Allow the user to highlight or star the Type they are working on
* Dependencies updated
  * @‌babel/core ^7.21.4 → ^7.23.0
  * @‌babel/eslint-parser ^7.21.3 → ^7.22.15
  * @‌babel/plugin-proposal-decorators ^7.21.0 → ^7.23.0
  * @‌babel/plugin-proposal-do-expressions ^7.18.6 → ^7.22.5
  * @‌babel/plugin-proposal-export-default-from ^7.18.10 → ^7.22.17
  * @‌babel/plugin-proposal-function-bind ^7.18.9 → ^7.22.5
  * @‌babel/plugin-proposal-function-sent ^7.18.6 → ^7.22.5
  * @‌babel/plugin-proposal-pipeline-operator ^7.18.9 → ^7.22.15
  * @‌babel/plugin-proposal-throw-expressions ^7.18.6 → ^7.22.5
  * @‌babel/plugin-transform-react-constant-elements ^7.21.3 → ^7.22.5
  * @‌babel/plugin-transform-react-inline-elements ^7.21.0 → ^7.22.5
  * @‌babel/plugin-transform-runtime ^7.21.4 → ^7.22.15
  * @‌babel/preset-env ^7.21.4 → ^7.22.20
  * @‌babel/preset-react ^7.18.6 → ^7.22.15
  * @‌babel/preset-typescript ^7.21.4 → ^7.23.0
  * @‌babel/register ^7.21.0 → ^7.22.15
  * @‌babel/runtime ^7.21.0 → ^7.23.1
  * @‌fortawesome/fontawesome-svg-core ^6.4.0 → ^6.4.2
  * @‌fortawesome/free-solid-svg-icons ^6.4.0 → ^6.4.2
  * @‌types/d3-graphviz ^2.6.7 → ^2.6.8
  * @‌types/jest ^29.5.1 → ^29.5.5
  * @‌types/lodash ^4.14.194 → ^4.14.199
  * @‌types/node ^18.16.1 → ^20.8.4
  * @‌types/react ^18.2.0 → ^18.2.27
  * @‌types/react-dom ^18.2.1 → ^18.2.12
  * @‌types/react-redux ^7.1.25 → ^7.1.27
  * @‌types/redux-api-middleware ^3.2.3 → ^3.2.4
  * @‌types/redux-logger ^3.0.9 → ^3.0.10
  * @‌types/uuid ^9.0.1 → ^9.0.5
  * @‌types/webpack ^5.28.1 → ^5.28.3
  * @‌types/webpack-env ^1.18.0 → ^1.18.2
  * @‌typescript-eslint/eslint-plugin ^5.59.1 → ^6.7.5
  * @‌typescript-eslint/parser ^5.59.1 → ^6.7.5
  * @‌uiw/codemirror-extensions-langs ^4.19.16 → ^4.21.19
  * @‌uiw/codemirror-themes-all ^4.19.16 → ^4.21.19
  * @‌uiw/react-codemirror ^4.19.16 → ^4.21.19
  * babel-loader ^9.1.2 → ^9.1.3
  * css-loader ^6.7.3 → ^6.8.1
  * d3-graphviz ^5.0.2 → ^5.1.0
  * dayjs ^1.11.7 → ^1.11.10
  * eslint ^8.39.0 → ^8.51.0
  * eslint-config-prettier ^8.8.0 → ^9.0.0
  * eslint-import-resolver-typescript ^3.5.5 → ^3.6.1
  * eslint-import-resolver-webpack ^0.13.2 → ^0.13.7
  * eslint-plugin-compat ^4.1.4 → ^4.2.0
  * eslint-plugin-eslint-plugin ^5.0.8 → ^5.1.1
  * eslint-plugin-import ^2.27.5 → ^2.28.1
  * eslint-plugin-jest ^27.2.1 → ^27.4.2
  * eslint-plugin-prettier ^4.2.1 → ^5.0.0
  * eslint-plugin-react ^7.32.2 → ^7.33.2
  * html-react-parser ^3.0.16 → ^4.2.2
  * html-webpack-plugin ^5.5.1 → ^5.5.3
  * jest ^29.5.0 → ^29.7.0
  * marked ^4.3.0 → ^9.1.0
  * mini-css-extract-plugin ^2.7.5 → ^2.7.6
  * node-sass ^8.0.0 → ^9.0.0
  * prettier ^2.8.8 → ^3.0.3
  * react-redux ^8.0.5 → ^8.1.3
  * react-router-dom ^6.10.0 → ^6.16.0
  * react-select ^5.7.4 → ^5.7.7
  * react-toastify ^9.1.2 → ^9.1.3
  * react-zoom-pan-pinch ^3.0.7 → ^3.1.0
  * reactstrap ^9.1.9 → ^9.2.0
  * sass-loader ^13.2.2 → ^13.3.2
  * style-loader ^3.3.2 → ^3.3.3
  * terser-webpack-plugin ^5.3.7 → ^5.3.9
  * typescript ^4.9.5 → ^5.2.2
  * uuid ^9.0.0 → ^9.0.1
  * webpack ^5.81.0 → ^5.88.2
  * webpack-bundle-analyzer 4.8.0 → 4.9.1
  * webpack-cli ^5.0.2 → ^5.1.4
  * webpack-dev-server ^4.13.3 → ^4.15.1
  * webpack-merge ^5.8.0 → ^5.9.0
  * workbox-webpack-plugin ^6.5.4 → ^7.0.0


## v0.6.0

* Fixed field re-rendering issue
* Fixed multi schema uploading logic 
* Improved field UI design 
* Changed accordion logic to multicollapse
* Added insert at index Logic 
* Added button style outline
* Added logic to check for duplicate Type names


## v0.5.2

* Visually nested child input fields under parent input fields
* Fixed unwanted auto scroll up on Field Option modal save
* Fixed Field Option modal popup on Drag and Drop
* Fixed unwanted auto scroll up on Type Option modal save
* Fixed Field Option - Collection Option selection error handling
* Updated Scroll To functionality, improved placement and visual representation
* Improved visual consistency
* Improved logic for the drag and drop duplicate Type and Field names
* Improved field drag and drop logic
* Improved field ID logic for Record and Array Type
* Included Show/Hide buttons for Types and Fields
* Included improved Add/Remove buttons for Fields
* Added Scroll To Top button 
* Added ability to remove fields by index
* Added missing ArrayOf and MapOf fields
* Applied a fixed drag and drop scroll to

## v0.5.1

* Missing Field Options added
* Field Add auto scroll disabled
* Config label columns increased
* Input field size increased

## v0.5.0

* Introduced draggable types and fields
* Outline View for drag and drop reordering types
* Provided a non drag and drop option via button clicks
* General Schema Creation UI cleanup
* Expand or Collapse Info, Types and Fields
* Added scrollable inner sections for Schema Creation
* Improved color contrast

## v0.4.0

* Provided the ability to include namespaces and validate

## v0.3.0

* Introduced the ability to save Schemas and Messages.  The saved file will persist for the lifetime of the local docker image.  
* Implemented the Schema Transformation logic, which will convert one or more JADN Schemas into a different but related Schema (resolve references and strip comments).
* Implemented the Example Message Generation, which will generate various example messages based off of a Schema.
* Improved the drop down capability to include filtering and various usability improvements.
