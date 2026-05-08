import React, { useState, useEffect } from 'react'
import {
    Button,
    InputField,
    SingleSelectField,
    SingleSelectOption,
    NoticeBox,
    CircularLoader
} from '@dhis2/ui'

export default function HealthIdPlugin(props) {
    const [idType, setIdType] = useState('national-id')
    const [idValue, setIdValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [patient, setPatient] = useState(null)
    const [config, setConfig] = useState(null)
    const [configLoading, setConfigLoading] = useState(true)

    const DATASTORE_NAMESPACE = 'healthidconnect'
    const DATASTORE_KEY = 'config'

    // ---------------------------
    // Load config from DHIS2 DataStore
    // ---------------------------
    useEffect(() => {
        const loadConfig = async () => {
            try {
                setConfigLoading(true)

                const res = await fetch(
                    `/ephc/api/dataStore/${DATASTORE_NAMESPACE}/${DATASTORE_KEY}`
                )

                if (!res.ok) {
                    throw new Error('Config not found in DataStore')
                }

                const data = await res.json()

                setConfig(data)
            } catch (e) {
                console.warn('Using fallback config:', e.message)

                // fallback config (important for dev/testing)
                setConfig({
                    fhirBaseUrl: 'https://api.amakomaya.com'
                })
            } finally {
                setConfigLoading(false)
            }
        }

        loadConfig()
    }, [])

    // ---------------------------
    // Search patient
    // ---------------------------
    const searchPatient = async () => {
        setError('')
        setPatient(null)

        if (!idValue) {
            setError('Please enter ID value')
            return
        }

        if (!config?.fhirBaseUrl) {
            setError('FHIR configuration not loaded')
            return
        }

        try {
            setLoading(true)

            const response = await fetch(
                `${config.fhirBaseUrl}/Patient?identifier=${idValue}`
            )

            if (!response.ok) {
                throw new Error('FHIR request failed')
            }

            const data = await response.json()

            if (!data.entry?.length) {
                setError('Patient not found')
                return
            }

            const resource = data.entry[0].resource
            setPatient(resource)

        } catch (e) {
            setError(e.message || 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    if (configLoading) {
        return <CircularLoader />
    }

    return (
        <div style={{ padding: 16 }}>
            <h3>Health ID Lookup</h3>

            <SingleSelectField
                label="ID Type"
                selected={idType}
                onChange={({ selected }) => setIdType(selected)}
            >
                <SingleSelectOption label="National ID" value="national-id" />
                <SingleSelectOption label="Health ID" value="health-id" />
                <SingleSelectOption label="Passport" value="passport" />
            </SingleSelectField>

            <InputField
                label="ID Value"
                value={idValue}
                onChange={({ value }) => setIdValue(value)}
            />

            <Button primary onClick={searchPatient}>
                Search
            </Button>

            {error && (
                <NoticeBox error title="Error">
                    {error}
                </NoticeBox>
            )}

            {patient && (
                <div style={{ marginTop: 16 }}>
                    <h4>Patient</h4>

                    <p>
                        Name: {patient?.name?.[0]?.given?.join(' ')}{' '}
                        {patient?.name?.[0]?.family}
                    </p>

                    <p>Gender: {patient?.gender}</p>
                    <p>DOB: {patient?.birthDate}</p>
                </div>
            )}
        </div>
    )
}