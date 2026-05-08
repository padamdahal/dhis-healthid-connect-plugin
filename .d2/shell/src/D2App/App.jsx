import React from 'react';
import Plugin from './components/Plugin';

export default {
    registerPlugin: ({ api, onValueChange }) => ({
        component: () => (
            <Plugin api={api} onValueChange={onValueChange} />
        )
    })
};
