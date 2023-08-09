# JADN Sandbox Release Notes

## [v0.3.0_NNNNNNN](https://github.com/openservicebrokerapi/servicebroker/blob/v2.17/spec.md)

* Introduced the ability save Schemas and Messages.  The saved file will persist for the lifetime of the local docker image.  
* Implemented the Schema Tranformation logic, which will convert one or more JADN Schemas into a different but related Schema (resolve references, simplify by removing extensions, strip comments, etc).
* Implemented the Example Message Generation, which will generate various example messages based off of a Schema.
* Improved the drop down capability to include filtering and various usability improvements.
