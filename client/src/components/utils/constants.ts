// eslint-disable-next-line import/prefer-default-export
export const LANG_JADN = 'jadn';
export const LANG_JADN_UPPER = 'JADN';
export const LANG_JSON = 'json';
export const LANG_JSON_UPPER = 'JSON';
export const LANG_HTML = 'html';
export const LANG_MARKDOWN = 'md';
export const LANG_GRAPHVIZ = 'gv';
export const LANG_PLANTUML = 'puml';
export const LANG_PLANTUML_2 = 'PlantUML';
export const LANG_CBOR = 'cbor'
export const LANG_CBOR_UPPER = 'CBOR'
export const LANG_ANNOTATED_HEX = 'anno_hex'
export const LANG_XML = 'xml';
export const LANG_XML_UPPER = 'XML';
export const LANG_XSD = 'xsd';
export const LANG_XSD_UPPER = 'XSD';
export const COMPACT_CONST = 'compact';
export const CONCISE_CONST = 'concise';

export const LANG_JIDL = 'jidl';
export const FILE_TYPE_PDF = 'pdf';
export const FILE_TYPE_PNG = 'png';
export const FILE_TYPE_SVG = 'svg';

export const FILENAME_RULE = new RegExp("^[a-zA-Z0-9-_]+$");

export const NAV_HOME = '/home';

export const NAV_CREATE_DATA = '/create/data';
export const NAV_CREATE_SCHEMA = '/create/schema';

export const NAV_CONVERT_SCHEMA = '/convert-schema';
export const NAV_TRANSLATE_SCHEMA = '/translate/translate-schema';
export const NAV_TRANSLATE_DATA = '/translate/translate-data';

export const NAV_TRANSFORM = '/transform-schema';

export const NAV_VALIDATE_MESSAGE = '/validate-message';
export const NAV_GENERATE = '/generate-message';

export const NAV_ABOUT = '/about';

export const NAV_EXTERNAL_OASIS_OPEN = 'https://www.oasis-open.org/';
export const NAV_EXTERNAL_OPENC2 = 'https://openc2.org/';
export const NAV_EXTERNAL_OPENC2_FAQ = 'https://openc2.org/faqs.html';
export const NAV_EXTERNAL_OPENC2_JADN_INFO_MODELING = 'https://github.com/oasis-tcs/openc2-jadn-im/blob/working/imjadn-v1.0-cn01.md';
export const NAV_EXTERNAL_OPENC2_JADN_PYPI = 'https://pypi.org/project/jadn/';
export const NAV_EXTERNAL_OPENC2_JADN_SRC = 'https://github.com/oasis-open/openc2-jadn/';
export const NAV_EXTERNAL_OPENC2_JADN_SPEC = 'https://docs.oasis-open.org/openc2/jadn/v1.0/jadn-v1.0.html';
export const NAV_EXTERNAL_GH_README = 'https://github.com/ScreamBun/jadn-sandbox/blob/develop/ReadMe.md';
export const NAV_EXTERNAL_MANUAL_PPTX = 'https://github.com/ScreamBun/jadn-sandbox/blob/develop/documentation/JADNSandboxInfo.pptx';
export const NAV_EXTERNAL_MANUAL_PDF = 'https://github.com/ScreamBun/jadn-sandbox/blob/develop/documentation/JADNSandboxInfo.pdf';

export const PLANTUML_RENDER_LIMIT = 8000

export const exampleToSchemaMappings = {
    "music-database.jadn": 
        ["music_library.json", "music_library.xml", "music_library.cbor"],
    "oc2ls-v1.0.1-resolved.jadn": 
        ["openc2_command_deny.json", "openc2_command_deny.cbor",  "openc2_command_deny.xml",
        "openc2_command_query.json", "openc2_command_query.cbor", "openc2_command_query.xml",
        "openc2_command_scan.json", "openc2_command_scan.cbor", "openc2_command_scan.xml",
        "openc2_v101_response.json", "openc2_v101_response.cbor", "openc2_v101_response.xml"],
    "oc2ls-v1.1.0-resolved.jadn":
        ["openc2_command_deny.json", "openc2_command_deny.cbor",  "openc2_command_deny.xml",
        "openc2_command_query.json", "openc2_command_query.cbor", "openc2_command_query.xml",
        "openc2_command_scan.json", "openc2_command_scan.cbor", "openc2_command_scan.xml",
        "openc2_v110_response.json", "openc2_v110_response.cbor", "openc2_v110_response.xml"],
    "oscal-assessment-plan.jadn":
        ["oscal_assessment_plan.json", "oscal_assessment_plan.cbor", "oscal_assessment_plan.xml"],
    "oscal-assessment-results.jadn":
        ["oscal_assessment_result.json", "oscal_assessment_result.cbor", "oscal_assessment_result.xml"],
    "oscal-catalog.jadn":
        ["oscal_catalog.json", "oscal_catalog.cbor", "oscal_catalog.xml"],
    "oscal-component.jadn":
        ["oscal_component.json", "oscal_component.cbor", "oscal_component.xml"],
    "oscal-poam.jadn":
        ["oscal_poam.json", "oscal_poam.cbor", "oscal_poam.xml"],
    "oscal-profile.jadn":
        ["oscal_profile.json", "oscal_profile.cbor", "oscal_profile.xml"],
    "resolved-ap-hunt-v01.jadn":
        ["ap_hunt_command.json", "ap_hunt_command.cbor", "ap_hunt_command.xml",
        "ap_hunt_response.json", "ap_hunt_response.cbor", "ap_hunt_response.xml"],
    "unresolved-ap-hunt-v01.jadn":
        ["ap_hunt_command.json", "ap_hunt_command.cbor", "ap_hunt_command.xml",
        "ap_hunt_response.json", "ap_hunt_response.cbor", "ap_hunt_response.xml"],
}