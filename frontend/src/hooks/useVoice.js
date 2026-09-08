import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useVoice — Browser-native voice input via Web Speech API.
 *
 * Features:
 *  - Appends transcribed speech to existing text (doesn't overwrite)
 *  - Interim results shown live while speaking
 *  - Noise tolerance: ignores empty/single-char transcripts
 *  - Auto-stop after configurable silence timeout
 *  - Graceful degradation when browser doesn't support the API
 *  - Exposes listening state, interim text, error, and support flag
 */

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

const SILENCE_TIMEOUT_MS = 3000; // stop after 3 s of silence

export default function useVoice({ onResult, lang = 'en-US' }) {
    const [listening,   setListening]   = useState(false);
    const [interim,     setInterim]     = useState('');
    const [error,       setError]       = useState(null);
    const isSupported = !!SpeechRecognition;

    const recognitionRef = useRef(null);
    const silenceTimer   = useRef(null);

    /* ── clean up on unmount ─────────────────── */
    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
            clearTimeout(silenceTimer.current);
        };
    }, []);

    /* ── reset silence timer on each result ──── */
    const resetSilenceTimer = useCallback((rec) => {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
            rec.stop();
        }, SILENCE_TIMEOUT_MS);
    }, []);

    /* ── start listening ─────────────────────── */
    const startListening = useCallback(() => {
        if (!isSupported || listening) return;
        setError(null);
        setInterim('');

        const rec = new SpeechRecognition();
        rec.lang              = lang;
        rec.continuous        = true;   // keep listening until we stop
        rec.interimResults    = true;   // show words as they're spoken
        rec.maxAlternatives   = 1;

        rec.onstart = () => {
            setListening(true);
            resetSilenceTimer(rec);
        };

        rec.onresult = (event) => {
            resetSilenceTimer(rec);     // reset silence window on each word
            let interimTranscript = '';
            let finalTranscript   = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    // noise filter: ignore blips shorter than 2 chars
                    if (transcript.trim().length > 1) {
                        finalTranscript += transcript;
                    }
                } else {
                    interimTranscript += transcript;
                }
            }

            setInterim(interimTranscript);

            if (finalTranscript) {
                // append to whatever is already in the field
                onResult(prev => {
                    const base = prev ? prev.trimEnd() + ' ' : '';
                    return base + finalTranscript.trim();
                });
            }
        };

        rec.onerror = (event) => {
            // 'no-speech' is just silence — not a real error, ignore it
            if (event.error === 'no-speech') return;
            // 'aborted' happens when we call stop() ourselves — ignore it
            if (event.error === 'aborted') return;

            const messages = {
                'not-allowed':      'Microphone permission denied. Please allow mic access.',
                'audio-capture':    'No microphone found. Please connect one and try again.',
                'network':          'Network error during voice recognition.',
                'service-not-allowed': 'Speech service not allowed. Try using HTTPS.',
            };
            setError(messages[event.error] || `Voice error: ${event.error}`);
        };

        rec.onend = () => {
            setListening(false);
            setInterim('');
            clearTimeout(silenceTimer.current);
        };

        recognitionRef.current = rec;
        rec.start();
    }, [isSupported, listening, lang, onResult, resetSilenceTimer]);

    /* ── stop listening ──────────────────────── */
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        clearTimeout(silenceTimer.current);
    }, []);

    /* ── toggle ──────────────────────────────── */
    const toggleListening = useCallback(() => {
        if (listening) stopListening();
        else           startListening();
    }, [listening, startListening, stopListening]);

    return {
        isSupported,
        listening,
        interim,
        error,
        startListening,
        stopListening,
        toggleListening,
    };
}
