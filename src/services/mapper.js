export function mapFhirToTei(patient) {
    if (!patient) return {};

    return {
        firstName: patient?.name?.[0]?.given?.[0] || '',
        lastName: patient?.name?.[0]?.family || '',
        gender: patient?.gender || '',
        dob: patient?.birthDate || ''
    };
}
