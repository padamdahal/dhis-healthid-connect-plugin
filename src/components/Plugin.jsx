import React, { useEffect, useState } from 'react';
import { getConfig } from '../services/datastore';
import { searchPatient } from '../services/fhir';
import { mapFhirToTei } from '../services/mapper';

export default function Plugin({ api, onValueChange }) {

    const [config, setConfig] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            const cfg = await getConfig(api);
            setConfig(cfg);
        }
        load();
    }, [api]);

    const handleSearch = async () => {
        if (!selectedType || !value) return;

        setLoading(true);
        setError('');

        try {
            const idConfig = config.identifiers[selectedType];

            const patient = await searchPatient({
                baseUrl: config.url,
                system: idConfig.system,
                value,
                username: config.username,
                password: config.password
            });

            if (!patient) {
                setError('No patient found');
                return;
            }

            const mapped = mapFhirToTei(patient);

            Object.keys(mapped).forEach(k => {
                onValueChange(k, mapped[k]);
            });

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!config) return <div>Loading...</div>;

    return (
        <div style={{ padding: 10 }}>
            <h3>FHIR Lookup</h3>

            {Object.entries(config.identifiers).map(([key, obj]) => (
                <label key={key} style={{ display: 'block' }}>
                    <input
                        type="radio"
                        name="idtype"
                        value={key}
                        onChange={() => setSelectedType(key)}
                    />
                    {obj.label}
                </label>
            ))}

            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter ID"
                style={{ width: '100%', marginTop: 10 }}
            />

            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>

            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
}
