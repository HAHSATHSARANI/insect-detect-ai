import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export const useTTS = () => {
    const [speakingId, setSpeakingId] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    const speak = async (text: string, id: string, language: 'en' | 'si' = 'en') => {
        try {
            const isSpeakingNow = await Speech.isSpeakingAsync();
            if (isSpeakingNow) {
                await Speech.stop();
                // If clicking the same button, just stop.
                if (speakingId === id) {
                    setSpeakingId(null);
                    return;
                }
            }

            setSpeakingId(id);

            const options: Speech.SpeechOptions = {
                language: language === 'si' ? 'si-LK' : 'en-US',
                pitch: 1.0,
                rate: 0.9,
                onDone: () => setSpeakingId(null),
                onStopped: () => setSpeakingId(null),
                onError: (e) => {
                    console.error("TTS Error:", e);
                    setSpeakingId(null);
                }
            };

            Speech.speak(text, options);
        } catch (error) {
            console.error("Error starting TTS:", error);
            setSpeakingId(null);
        }
    };

    const stop = async () => {
        try {
            await Speech.stop();
            setSpeakingId(null);
        } catch (error) {
            console.error("Error stopping TTS:", error);
        }
    };

    return {
        speak,
        stop,
        speakingId
    };
};
