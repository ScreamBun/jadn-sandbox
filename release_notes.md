# JADN Sandbox Release Notes
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
