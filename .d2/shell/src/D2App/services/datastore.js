export async function getConfig(api) {
    const res = await api.get('/dataStore/healthid-connect/config');
    return await res.json();
}
