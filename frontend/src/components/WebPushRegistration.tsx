"use client";

import { useEffect } from 'react';
import axios from 'axios';

const PUBLIC_VAPID_KEY = "BBzdZHSw8oDv5J--SszOnXldDM8rMI0SNCR7614fUuzE6AH7dffZFsZmCEQwyE6kTjJpdycsYefnB9RM88_iEZ8";

export default function WebPushRegistration() {

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        try {
            const user = JSON.parse(userData);
            if (user.id && 'serviceWorker' in navigator && 'PushManager' in window) {
                registerServiceWorker(user.id);
            }
        } catch (e) {
            console.error("Failed to parse user data for push registration");
        }
    }, []);

    const registerServiceWorker = async (userId: string | number) => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Check for message from SW to speak
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SPEAK_REMINDER' && event.data.text) {
                    speak(event.data.text);
                }
            });

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });

                // Send subscription to backend
                await axios.post('http://localhost:8002/webpush/save/', {
                    subscription: subscription,
                    group: `user_${userId}`
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });

                console.log('Push Subscription saved to backend');
            }
        } catch (error) {
            console.error('Push registration failed:', error);
        }
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return null; // Side-effect only component
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
