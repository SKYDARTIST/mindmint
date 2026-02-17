'use client';

import { useEffect } from 'react';

export function PWARegister() {
    useEffect(() => {
        // 🛡️ NO-OP in development to prevent asset interception
        if (process.env.NODE_ENV === 'development') return;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(() => {
                    // Service Worker registered
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}
