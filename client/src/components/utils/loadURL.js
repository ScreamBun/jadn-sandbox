import React from 'react'

import {
    cbor2escaped,
    dehexify,
    escaped2cbor,
    hexify
} from '.'

/* Async load of a file from a generic url */
const readAllChunks = (stream) => {
    const reader = stream.getReader()
    const chunks = []

    const pump = () => {
        return reader.read().then(({ value, done }) => {
            if (done) {
                return chunks
            }
            chunks.push(value)
            return pump()
        })
    }
    return pump();
}

const chunk2str = (chunks) => {
    if (chunks.length == 1) {
        let rtn_arr = Array.from(chunks[0])
        rtn_arr = rtn_arr.map((c) => c > 128 ? "\\x"+c.toString(16) : String.fromCharCode(c))
        return rtn_arr.join('')
    } else {
        return ''
    }
}

export const validURL = (url) => url.match(/^(https?:\/\/)?(www\.)?[0-9a-z]+([\-\.]{1}[0-9a-z]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/)


export const loadURL = (url) => {
    if (!validURL(url)) {
	    return new Promise((resolve, reject) => {
	        reject({
	            error: 'invalid url'
	        })
	    })
    }

    let rtn_arr = {
        data: '',
        file: url.substring(url.lastIndexOf("/") + 1)
    }
    rtn_arr.fileName = rtn_arr.file.substring(0, rtn_arr.file.lastIndexOf("."))
    rtn_arr.fileExt = rtn_arr.file.substring(rtn_arr.file.lastIndexOf(".") + 1)

    const jsonParser = (key, val) => {
        return typeof(val) === 'string' ? val.replace(/\\/g, "\\\\") : val;
    }

	return fetch(url).then(
	    (rsp) => {
	        switch (rtn_arr.fileExt) {
                case 'jadn':
                case 'json':
                    console.log('JADN/JSON')
                    try {
                        let tmp = rsp.text().then(txt => JSON.parse(txt, jsonParser))
                        console.log(tmp)
                        return tmp
                    } catch (err) {
                        return {error: err.message}
                    }
                case 'cbor':
                    console.log('CBOR')
                    return readAllChunks(rsp.body).then(chunks => chunk2str(chunks))
                case 'xml':
                    console.log('XML')
                    return rsp.text()
                default:
                    console.log('UNKNOWN')
                    return rsp.blob()
            }

	    }
    ).then(rsp => {
        console.log(rsp)
        rtn_arr.data = rsp
        return rtn_arr
    }).catch((err) => {
        console.log("failed to load ", url, err.stack)
        rtn_arr.data = {
            error: 'cannot load url'
        }
        return rtn_arr
    })
}