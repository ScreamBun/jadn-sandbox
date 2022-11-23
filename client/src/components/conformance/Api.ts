export async function getAllConformanceTests() {

    try{
        const response = await fetch('/api/conformance');
        return await response.json();
    }catch(error) {
        return [];
    }

}

export async function runConformanceTest(profileType: string, schema: any) {
    try{
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // body: schema
            body: JSON.stringify({ schema })
        };
        const response = await fetch('/api/conformance/' + profileType, requestOptions);
        return await response.json();
    }catch(error) {
        return [];
    }
}