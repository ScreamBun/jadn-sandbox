import {
    cbor2escaped,
    dehexify,
    escaped2cbor,
    hexify
} from './'

const vkbeautify = require('vkbeautify')

/* General Utils */
export const format = (msg, fmt, ind) => {
    ind = ind ? ind : 2
    let rtn_msg = ''
    try {
        switch (fmt) {
            case "cbor":
                rtn_msg = cbor2escaped(msg)
                break
            case "json":
                rtn_msg = vkbeautify.json(msg, ' '.repeat(ind))
                break
            case "xml":
                rtn_msg = vkbeautify.xml(msg, ' '.repeat(ind))
                break
            default:
                rtn_msg = "Error, cannot format " + fmt + " message"
        }
    } catch (e) {
        console.log(e)
        rtn_msg = "Error, cannot format: " + e.message
    }
    return rtn_msg
}

export const minify = (msg, fmt) => {
    let rtn_msg = ''
    try {
        switch (fmt) {
            case "cbor":
                rtn_msg = escaped2cbor(msg)
                break
            case "json":
                rtn_msg = vkbeautify.jsonmin(msg)
                break
            case "xml":
                rtn_msg = vkbeautify.xmlmin(msg)
                break
            default:
                rtn_msg = "Error, cannot minify " + fmt + " message"
        }
    } catch(e) {
        rtn_msg = "Error, cannot minify: " + e.message
    }
    return rtn_msg
}

/* Schema Utils */

/* Message Utils */