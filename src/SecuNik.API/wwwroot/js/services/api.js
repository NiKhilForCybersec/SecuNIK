export async function uploadFile(file, settings, endpoints) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(settings));

    const response = await fetch(endpoints.upload, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function checkHealth(endpoints) {
    const response = await fetch(endpoints.health, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });
    return response.ok;
}
