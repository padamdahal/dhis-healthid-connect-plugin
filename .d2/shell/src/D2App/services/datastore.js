export async function getConfig(api) {
    const res = await api.get('/dataStore/healthidconnect/config');
    return await res.json();
}
