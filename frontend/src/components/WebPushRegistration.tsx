"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const PUBLIC_VAPID_KEY = "BBzdZHSw8oDv5J--SszOnXldDM8rMI0SNCR7614fUuzE6AH7dffZFsZmCEQwyE6kTjJpdycsYefnB9RM88_iEZ8";

export default function WebPushRegistration() {
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermissionStatus(Notification.permission);
        }

        const userData = localStorage.getItem('user');
        if (!userData) return;

        try {
            const user = JSON.parse(userData);
            if (user.id && 'serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'granted') {
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

            // Request permission (or re-verify)
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);

            if (permission === 'granted') {
                // CLEAR OLD SUBSCRIPTIONS (This fixes the 'AbortError' often)
                const oldSubscription = await registration.pushManager.getSubscription();
                if (oldSubscription) {
                    await oldSubscription.unsubscribe();
                    console.log('Cleared old subscription');
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });

                // Send subscription to backend using shared API client
                await api.post('/webpush/save_information/', {
                    subscription: subscription.toJSON(),
                    group: `user_${userId}`,
                    status_type: 'subscribe',
                    browser: navigator.userAgent.includes("Chrome") ? "Chrome" : "Firefox",
                    user_agent: navigator.userAgent
                });

                console.log('Push Subscription saved to backend');
            }
        } catch (error) {
            console.error('Push registration failed:', error);
        }
    };

    const handleEnableVoice = async () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            toast.error("Please log in to enable voice alerts");
            return;
        }
        const user = JSON.parse(userData);
        await registerServiceWorker(user.id);

        // Satisfy browser auto-play policy by speaking a silent or test message once
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("Voice alerts enabled");
            utterance.volume = 0.1; // Quiet test
            window.speechSynthesis.speak(utterance);
        }

        toast.success("Voice alerts enabled successfully!");
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    if (permissionStatus === 'granted') return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={handleEnableVoice}
                className="shadow-lg animate-pulse hover:animate-none"
                variant="default"
            >
                <Volume2 className="mr-2 h-4 w-4" />
                Enable Voice Alerts
            </Button>
        </div>
    );
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
