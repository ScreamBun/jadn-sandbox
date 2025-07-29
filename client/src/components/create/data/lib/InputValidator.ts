export const validate = (input: any, type: string, options: string[]): string => {
    if (options.length === 0) {
        return ""; // No options means generic typed input is valid
    }

    // Handle minv and maxv and remove those options from array. Then check options length again to see if check needed

    // Delegate to individual type validator
    switch (type) {
        case "Binary":
            return validateBinaryInput(input, options);
        case "Integer":
            return validateIntegerInput(input, options);
        case "Number":
            return validateNumberInput(input, options);
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
                break;
        }
    }

    return m;
}

const validateIntegerInput = (input: number, options: string[]): string => {
    let m: string = "";

    for (const option of options) {
        switch (option) {
            case "/i8":
                if (input <= -128 || input >= 127) m = `Input ${input} is not a valid i8 integer.`;
                break;
            case "/i16":
                if (input <= -32768 || input >= 32767) m = `Input ${input} is not a valid i16 integer.`;
                break;
            case "/i32":
                if (input <= -2147483648 || input >= 2147483647) m = `Input ${input} is not a valid i32 integer.`;
                break;
            case "/i64":
                if (input <= -9223372036854775808 || input >= 9223372036854775807) m = `Input ${input} is not a valid i64 integer.`;
                break;
            case "u<n>":
                const n = String(input).substring(1);
                if (0 >= input && input >= (2 ** (parseInt(n) - 1))) {
                    m = `Input ${input} is not a valid u${n} integer.`;
                }
                break;
            case "/nonNegativeInteger":
                if (input < 0) m = `Input ${input} is not a valid non-negative integer.`;
                break;
            case "/nonPositiveInteger":
                if (input > 0) m = `Input ${input} is not a valid non-positive integer.`;
                break;
            case "/positiveInteger":
                if (input <= 0) m = `Input ${input} is not a valid positive integer.`;
                break;
            case "/negativeInteger":
                if (input >= 0) m = `Input ${input} is not a valid negative integer.`;
                break;
            case "/duration":
                break;
            case "/date":
                // any integer - posix time
                break;
            case "/dateTime":
                // any integer - posix time
                break;
            case "/time":
                // any integer - posix time
                break;
            case "/dayTimeDuration":
                const dayTimeDurationRegex = /^-?P(([0-9]+D)?T?([0-9]+H)?([0-9]+M)?([0-9]+S)?)$/;
                if (!dayTimeDurationRegex.test(String(input))) {
                    m = `Input ${input} is not a valid day-time duration.`;
                }
                break;
            case "/yearMonthDuration":
                const yearMonthDurationRegex = /^-?P((([0-9]+Y)([0-9]+M)?)|([0-9]+M))$/;
                if (!yearMonthDurationRegex.test(String(input))) {
                    m = `Input ${input} is not a valid year-month duration.`;
                }
                break;
            case "/gYear":
                const gYearRegex = /^-?([1-9][0-9]{3,}|0[0-9]{3})(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/;
                if (!gYearRegex.test(String(input))) {
                    m = `Input ${input} is not a valid gYear format (e.g., 2023, -0999, 2023Z, 2023+01:00).`;
                }
                break;
            case "/gYearMonth":
                const gYearMonthRegex = /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/;
                if (!gYearMonthRegex.test(String(input))) {
                    m = `Input ${input} is not a valid gYearMonth format (e.g., 2023-01, -0999-12, 2023-01Z, 2023-01+01:00).`;
                }
                break;
            case "/gMonthDay":
                const gMonthDayRegex = /^--(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/;
                if (!gMonthDayRegex.test(String(input))) {
                    m = `Input ${input} is not a valid gMonthDay format (e.g., --01-01, --12-31, --01-01Z, --12-31+01:00).`;
                }
                break;
            default:
                break;
        }
    }

    return m;
}

const validateNumberInput = (input: number, options: string[]): string => {
    let m: string = "";

    for (const option of options) {
        switch (option) {
            case "/f16":
                const F16_MIN = -65504.0;
                const F16_MAX = 65504.0;
                if (input < F16_MIN || input > F16_MAX) {
                    m = `Input ${input} is not a valid f16 float.`;
                }
                break;
            case "/f32":
                const F32_MIN = -3.402823466e+38;
                const F32_MAX = 3.402823466e+38;
                if (input < F32_MIN || input > F32_MAX) {
                    m = `Input ${input} is not a valid f32 float.`;
                }
                break;
            case "/f64":
                const F64_MIN = -1.7976931348623157e+308;
                const F64_MAX = 1.7976931348623157e+308;
                if (input < F64_MIN || input > F64_MAX) {
                    m = `Input ${input} is not a valid f64 float.`;
                }
                break;
            default:
                break;
        }
    }

    return m;
}