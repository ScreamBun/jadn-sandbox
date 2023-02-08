import { sbToastError } from "./SBToast";

export async function runFormatData(schema: any) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: schema
        };
        const response = await fetch(`/api/format/`, requestOptions);
        return await response.json();
    } catch (error) {
        sbToastError(`Unable to format data: ${error}`);
        console.log(error);        
        return error;
    }
}
