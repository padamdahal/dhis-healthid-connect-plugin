import React, { useState } from 'react'
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

    const FHIR_BASE_URL = 'https://your-fhir-server/fhir'

    const searchPatient = async () => {
        setError('')
        setPatient(null)

        if (!idValue) {
            setError('Please enter ID value')
            return
        }

        try {
            setLoading(true)

            const response = await fetch(
                `${FHIR_BASE_URL}/Patient?identifier=${idValue}`
            )

            if (!response.ok) {
                throw new Error('FHIR request failed')
            }

            const data = await response.json()

            if (
                !data.entry ||
                !Array.isArray(data.entry) ||
                data.entry.length === 0
            ) {
                setError('Patient not found')
                return
            }

            const resource = data.entry[0].resource

            setPatient(resource)

            /*
             * OPTIONAL:
             * Auto-fill Tracker fields here
             *
             * Example:
             *
             * if (props.onChange) {
             *     props.onChange({
             *         firstName: resource?.name?.[0]?.given?.[0] || '',
             *         lastName: resource?.name?.[0]?.family || ''
             *     })
             * }
             */
            console.log('FHIR Patient:', resource)
        } catch (e) {
            console.error(e)
            setError(e.message || 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const firstName =
        patient?.name?.[0]?.given?.join(' ') || ''

    const lastName =
        patient?.name?.[0]?.family || ''

    const gender =
        patient?.gender || ''

    const birthDate =
        patient?.birthDate || ''

    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid #d5dde5',
                borderRadius: '6px',
                background: '#fff',
                marginBottom: '16px'
            }}
        >
            <h3 style={{ marginTop: 0 }}>
                Health ID Lookup
            </h3>

            <div style={{ marginBottom: '16px' }}>
                <SingleSelectField
                    label="ID Type"
                    selected={idType}
                    onChange={({ selected }) =>
                        setIdType(selected)
                    }
                >
                    <SingleSelectOption
                        label="National ID"
                        value="national-id"
                    />

                    <SingleSelectOption
                        label="Health ID"
                        value="health-id"
                    />

                    <SingleSelectOption
                        label="Passport"
                        value="passport"
                    />
                </SingleSelectField>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <InputField
                    label="ID Value"
                    value={idValue}
                    onChange={({ value }) =>
                        setIdValue(value)
                    }
                />
            </div>

            <Button
                primary
                onClick={searchPatient}
                disabled={loading}
            >
                Search
            </Button>

            {loading && (
                <div style={{ marginTop: '16px' }}>
                    <CircularLoader small />
                </div>
            )}

            {error && (
                <div style={{ marginTop: '16px' }}>
                    <NoticeBox error title="Error">
                        {error}
                    </NoticeBox>
                </div>
            )}

            {patient && (
                <div
                    style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: '#f8f9fa',
                        borderRadius: '4px'
                    }}
                >
                    <h4>Patient Information</h4>

                    <p>
                        <strong>First Name:</strong>{' '}
                        {firstName}
                    </p>

                    <p>
                        <strong>Last Name:</strong>{' '}
                        {lastName}
                    </p>

                    <p>
                        <strong>Gender:</strong>{' '}
                        {gender}
                    </p>

                    <p>
                        <strong>Date of Birth:</strong>{' '}
                        {birthDate}
                    </p>
                </div>
            )}
        </div>
    )
}