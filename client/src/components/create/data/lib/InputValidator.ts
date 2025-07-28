export const validate = (input: string, type: string, options: string[]): string => {
    if (options.length === 0) {
        return ""; // No options means generic typed input is valid
    }

    // Handle minv and maxv and remove those options from array. Then check options length again to see if check needed

    // Delegate to individual type validator
    switch (type) {
        case "Binary":
            return validateBinaryInput(input, options);
        default: 
            return `No validator found for input ${input} of type ${type}.`
    }
}

const validateBinaryInput = (input: string, options: string[]): string => {
    let m: string = "";

    for (const option of options) {
        switch(option) {
            case "/b64":
                const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                if (!base64Regex.test(input)) {
                    m = `Input ${input} is not a valid Base64 string.`;
                }
                break;
            case "/eui":
                const eui64Regex = /^[0-9A-Fa-f]{16}$/;
                const eui64ColonRegex = /^([0-9A-Fa-f]{2}:){7}[0-9A-Fa-f]{2}$/;
                const eui48Regex = /^[0-9A-Fa-f]{12}$/;
                const eui48ColonRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
                if (!eui64Regex.test(input) && !eui64ColonRegex.test(input) && !eui48Regex.test(input) && !eui48ColonRegex.test(input)) {
                    m = `Input ${input} is not a valid EUI-64 or EUI-48 string.`;
                }
                break;
            case "/ipv4-addr":
                const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                if (!ipv4Regex.test(input)) {
                    m = `Input ${input} is not a valid IPv4 address.`;
                }
                break;
            case "/ipv6-addr":
                const ipv6Regex = /^((?=.*::)(?!.*::.+::)(::)?([\dA-Fa-f]{1,4}:(:|\b)|){5}|([\dA-Fa-f]{1,4}:){6})((([\dA-Fa-f]{1,4}((?!\3)::|:\b|(?![\dA-Fa-f])))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/;
                if (!ipv6Regex.test(input)) {
                    m = `Input ${input} is not a valid IPv6 address.`;
                }
                break;
            case "/hex":
                const hexRegex = /^[0-9A-Fa-f]+$/;
                if (!hexRegex.test(input)) {
                    m = `Input ${input} is not a valid hexadecimal string.`;
                }
                break;
            default:
                continue;
        }
    }

    return m;
}