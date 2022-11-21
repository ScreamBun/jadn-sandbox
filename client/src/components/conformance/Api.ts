export async function getAllConformanceTests() {

    try{
        const response = await fetch('/api/conformance');
        return await response.json();
    }catch(error) {
        return [];
    }

}