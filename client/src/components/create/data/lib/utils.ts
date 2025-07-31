export const isOptional = (options: any[]): boolean => {
    for (const opt of options) {
        if (String(opt) === '[0') {
            return true;
        }
    }
    return false;
}