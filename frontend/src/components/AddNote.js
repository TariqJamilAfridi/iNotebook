import React, { useState, useContext, useCallback } from 'react';
import noteContext from '../context/notes/noteContext';
import useVoice from '../hooks/useVoice';

/* ── Mic button + waveform bars ─────────────── */
function MicButton({ field, activeField, onToggle, listening }) {
    const isActive = activeField === field && listening;
    return (
        <button
            type="button"
            className={`mic-btn ${isActive ? 'mic-btn--active' : ''}`}
            onClick={() => onToggle(field)}
            title={isActive ? 'Stop recording' : 'Speak to fill this field'}
            aria-label={isActive ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={isActive}
        >
            {isActive ? (
                /* animated waveform while recording */
                <span className="mic-wave" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                </span>
            ) : (
                <i className="fa-solid fa-microphone"></i>
            )}
        </button>
    );
}

/* ── Unsupported browser notice ─────────────── */
function VoiceUnsupported() {
    return (
        <p className="voice-unsupported">
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            Voice input is not supported in this browser. Use Chrome or Edge.
        </p>
    );
}

function AddNote({ showAlert }) {
    const context = useContext(noteContext);
    const { addNote } = context;

    const [note,       setNote]       = useState({ title: '', description: '', tag: '' });
    const [isOpen,     setIsOpen]     = useState(false);
    const [activeField, setActiveField] = useState(null); // 'title' | 'description' | null

    /* ── voice hook: title ───────────────────── */
    const onTitleResult = useCallback((updater) => {
        setNote(prev => ({ ...prev, title: typeof updater === 'function' ? updater(prev.title) : updater }));
    }, []);

    const titleVoice = useVoice({ onResult: onTitleResult });

    /* ── voice hook: description ─────────────── */
    const onDescResult = useCallback((updater) => {
        setNote(prev => ({ ...prev, description: typeof updater === 'function' ? updater(prev.description) : updater }));
    }, []);

    const descVoice = useVoice({ onResult: onDescResult });

    /* ── show alert when voice errors occur ──── */
    React.useEffect(() => {
        if (titleVoice.error) showAlert(titleVoice.error, 'danger');
    }, [titleVoice.error]); // eslint-disable-line

    React.useEffect(() => {
        if (descVoice.error) showAlert(descVoice.error, 'danger');
    }, [descVoice.error]); // eslint-disable-line

    /* ── toggle mic for a field ──────────────── */
    const handleMicToggle = (field) => {
        // stop the OTHER field if it's recording
        if (field === 'title') {
            if (descVoice.listening)  descVoice.stopListening();
            titleVoice.toggleListening();
            setActiveField(titleVoice.listening ? null : 'title');
        } else {
            if (titleVoice.listening) titleVoice.stopListening();
            descVoice.toggleListening();
            setActiveField(descVoice.listening ? null : 'description');
        }
    };

    /* keep activeField in sync when recognition auto-stops */
    React.useEffect(() => {
        if (!titleVoice.listening && activeField === 'title')       setActiveField(null);
    }, [titleVoice.listening]); // eslint-disable-line

    React.useEffect(() => {
        if (!descVoice.listening && activeField === 'description')  setActiveField(null);
    }, [descVoice.listening]); // eslint-disable-line

    /* ── stop all voice when form closes ─────── */
    const handleClose = () => {
        titleVoice.stopListening();
        descVoice.stopListening();
        setIsOpen(false);
        setActiveField(null);
        setNote({ title: '', description: '', tag: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        titleVoice.stopListening();
        descVoice.stopListening();
        addNote(note, showAlert);
        setNote({ title: '', description: '', tag: '' });
        setIsOpen(false);
        setActiveField(null);
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const isValid = note.title.length >= 5 && note.description.length >= 5;

    /* interim preview: append italic grey text inline */
    const titleDisplay       = note.title;
    const descDisplay        = note.description;
    const titleInterimText   = activeField === 'title'       ? titleVoice.interim : '';
    const descInterimText    = activeField === 'description' ? descVoice.interim  : '';

    const isRecording = titleVoice.listening || descVoice.listening;

    return (
        <div className="add-note-section">
            {!isOpen ? (
                <button
                    className="btn add-note-trigger w-100"
                    onClick={() => setIsOpen(true)}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    Add a new note...
                </button>
            ) : (
                <div className="add-note-card">
                    {/* Header */}
                    <div className="add-note-header">
                        <h5>
                            <i className="fa-solid fa-plus-circle me-2 text-accent"></i>
                            New Note
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            {/* Global recording status badge */}
                            {isRecording && (
                                <span className="voice-status-badge">
                                    <span className="voice-status-dot" aria-hidden="true"></span>
                                    Listening…
                                </span>
                            )}
                            <button
                                className="btn-close-note"
                                onClick={handleClose}
                                aria-label="Close"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    {/* Unsupported notice */}
                    {!titleVoice.isSupported && <VoiceUnsupported />}

                    <form onSubmit={handleSubmit}>

                        {/* ── Title ── */}
                        <div className="mb-3">
                            <label htmlFor="title" className="note-label">
                                Title <span className="required">*</span>
                            </label>
                            <div className="voice-input-row">
                                <div className="voice-input-wrap">
                                    <input
                                        type="text"
                                        className={`note-input ${activeField === 'title' && titleVoice.listening ? 'note-input--recording' : ''}`}
                                        id="title"
                                        name="title"
                                        placeholder={activeField === 'title' && titleVoice.listening ? 'Listening…' : 'Give your note a title...'}
                                        value={titleDisplay}
                                        onChange={onChange}
                                        minLength={5}
                                        required
                                    />
                                    {/* live interim preview */}
                                    {titleInterimText && (
                                        <span className="voice-interim">{titleInterimText}</span>
                                    )}
                                </div>
                                {titleVoice.isSupported && (
                                    <MicButton
                                        field="title"
                                        activeField={activeField}
                                        onToggle={handleMicToggle}
                                        listening={titleVoice.listening}
                                    />
                                )}
                            </div>
                            {note.title.length > 0 && note.title.length < 5 && (
                                <small className="field-hint">Minimum 5 characters</small>
                            )}
                        </div>

                        {/* ── Description ── */}
                        <div className="mb-3">
                            <label htmlFor="description" className="note-label">
                                Description <span className="required">*</span>
                            </label>
                            <div className="voice-input-row voice-input-row--textarea">
                                <div className="voice-input-wrap">
                                    <textarea
                                        className={`note-input note-textarea ${activeField === 'description' && descVoice.listening ? 'note-input--recording' : ''}`}
                                        id="description"
                                        name="description"
                                        placeholder={activeField === 'description' && descVoice.listening ? 'Listening — speak now…' : 'Write your note here...'}
                                        value={descDisplay}
                                        onChange={onChange}
                                        rows={4}
                                        minLength={5}
                                        required
                                    />
                                    {descInterimText && (
                                        <span className="voice-interim voice-interim--textarea">{descInterimText}</span>
                                    )}
                                </div>
                                {descVoice.isSupported && (
                                    <MicButton
                                        field="description"
                                        activeField={activeField}
                                        onToggle={handleMicToggle}
                                        listening={descVoice.listening}
                                    />
                                )}
                            </div>
                            {note.description.length > 0 && note.description.length < 5 && (
                                <small className="field-hint">Minimum 5 characters</small>
                            )}
                        </div>

                        {/* ── Tag ── */}
                        <div className="mb-4">
                            <label htmlFor="tag" className="note-label">
                                Tag <span className="optional">(optional)</span>
                            </label>
                            <input
                                type="text"
                                className="note-input"
                                id="tag"
                                name="tag"
                                placeholder="e.g. Work, Personal, Ideas..."
                                value={note.tag}
                                onChange={onChange}
                            />
                        </div>

                        <div className="d-flex gap-2 align-items-center flex-wrap">
                            <button
                                type="submit"
                                className="btn btn-primary note-submit-btn"
                                disabled={!isValid}
                            >
                                <i className="fa-solid fa-floppy-disk me-2"></i>Save Note
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            {titleVoice.isSupported && (
                                <span className="voice-tip">
                                    <i className="fa-solid fa-microphone me-1"></i>
                                    Click the mic icon next to any field to dictate
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddNote;
