CONTAINER_NAME = "sb-ruby-container"
CONTAINER_JSON_FILE_PATH = '/opt/jadn_sandbox/value_json.json'
CONTAINER_JSON2CBOR_RB = '/usr/local/bin/json2cbor.rb'
CONTAINER_CBOR2PRETTY_RB = '/usr/local/bin/cbor2pretty.rb'
CONTAINER_CBOR2PRETTY_TXT = '/opt/jadn_sandbox/value_cbor_pretty.txt'

LOCAL_JSON_FILE_PATH = './server/cbor_files/value_json.json'
LOCAL_CBOR2PRETTY_FILE_PATH = './server/cbor_files/value_cbor_pretty.txt'

CBOR: str = "cbor"
GV: str = "gv"
HTML: str = "html"
JADN: str = "jadn"
JIDL: str = "jidl"
JSON: str = "json"
PUML: str = "puml"
XML: str = "xml"
XSD: str = "xsd"

APP_MODE_LOCAL = "local"
APP_MODE_CONTAINER = "container"