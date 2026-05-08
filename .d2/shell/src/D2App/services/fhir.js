export async function searchPatient({ baseUrl, system, value, username, password }) {
    const url = `${baseUrl}/Patient?identifier=${encodeURIComponent(system + '|' + value)}`;

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/fhir+json',
            Authorization: 'Basic ' + btoa(username + ':' + password)
        }
    });

    if (!res.ok) {
        throw new Error('FHIR request failed');
    }

    const data = await res.json();
    return data.entry?.[0]?.resource || null;
}
