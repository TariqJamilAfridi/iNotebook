import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import noteContext from '../context/notes/noteContext';
import Noteitem from './Noteitem';
import AddNote from './AddNote';
import useVoice from '../hooks/useVoice';

/* ── Shared mic button (same design as AddNote) ─ */
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
                <span className="mic-wave" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                </span>
            ) : (
                <i className="fa-solid fa-microphone"></i>
            )}
        </button>
    );
}

function Notes({ showAlert }) {
    const context = useContext(noteContext);
    const { notes, getNotes, editNote } = context;

    const [note, setNote]     = useState({ id: '', etitle: '', edescription: '', etag: '' });
    const [loading, setLoading] = useState(true);
    const [activeField, setActiveField] = useState(null); // 'etitle' | 'edescription' | null
    const ref = useRef(null);

    useEffect(() => {
        getNotes().finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── voice: etitle ───────────────────────── */
    const onTitleResult = useCallback((updater) => {
        setNote(prev => ({
            ...prev,
            etitle: typeof updater === 'function' ? updater(prev.etitle) : updater
        }));
    }, []);
    const titleVoice = useVoice({ onResult: onTitleResult });

    /* ── voice: edescription ─────────────────── */
    const onDescResult = useCallback((updater) => {
        setNote(prev => ({
            ...prev,
            edescription: typeof updater === 'function' ? updater(prev.edescription) : updater
        }));
    }, []);
    const descVoice = useVoice({ onResult: onDescResult });

    /* forward voice errors to global alert */
    useEffect(() => {
        if (titleVoice.error) showAlert(titleVoice.error, 'danger');
    }, [titleVoice.error]); // eslint-disable-line

    useEffect(() => {
        if (descVoice.error) showAlert(descVoice.error, 'danger');
    }, [descVoice.error]); // eslint-disable-line

    /* keep activeField in sync when recognition auto-stops */
    useEffect(() => {
        if (!titleVoice.listening && activeField === 'etitle') setActiveField(null);
    }, [titleVoice.listening]); // eslint-disable-line

    useEffect(() => {
        if (!descVoice.listening && activeField === 'edescription') setActiveField(null);
    }, [descVoice.listening]); // eslint-disable-line

    /* ── toggle mic (mutual exclusion) ──────── */
    const handleMicToggle = (field) => {
        if (field === 'etitle') {
            if (descVoice.listening) descVoice.stopListening();
            titleVoice.toggleListening();
            setActiveField(titleVoice.listening ? null : 'etitle');
        } else {
            if (titleVoice.listening) titleVoice.stopListening();
            descVoice.toggleListening();
            setActiveField(descVoice.listening ? null : 'edescription');
        }
    };

    /* stop voice when modal closes */
    const stopAllVoice = useCallback(() => {
        titleVoice.stopListening();
        descVoice.stopListening();
        setActiveField(null);
    }, [titleVoice, descVoice]);

    /* ── open edit modal ─────────────────────── */
    const updateNote = (currentNote) => {
        stopAllVoice();
        ref.current.click();
        setNote({
            id:           currentNote._id,
            etitle:       currentNote.title,
            edescription: currentNote.description,
            etag:         currentNote.tag
        });
    };

    const handleUpdate = () => {
        stopAllVoice();
        editNote(note.id, note.etitle, note.edescription, note.etag, showAlert);
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const isEditValid = note.etitle.length >= 5 && note.edescription.length >= 5;

    const isRecording = titleVoice.listening || descVoice.listening;

    /* interim text helpers */
    const titleInterim = activeField === 'etitle'       ? titleVoice.interim : '';
    const descInterim  = activeField === 'edescription' ? descVoice.interim  : '';

    return (
        <>
            <AddNote showAlert={showAlert} />

            {/* Hidden modal trigger */}
            <button
                ref={ref}
                type="button"
                className="d-none"
                data-bs-toggle="modal"
                data-bs-target="#editNoteModal"
            >
                Edit
            </button>

            {/* ── Edit Modal ─────────────────────────── */}
            <div
                className="modal fade"
                id="editNoteModal"
                tabIndex="-1"
                aria-labelledby="editNoteModalLabel"
                aria-hidden="true"
                /* stop voice if Bootstrap closes modal via backdrop/Esc */
                onHide={stopAllVoice}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content note-modal">

                        {/* Modal header */}
                        <div className="modal-header note-modal-header">
                            <h5 className="modal-title" id="editNoteModalLabel">
                                <i className="fa-solid fa-pen-to-square me-2 text-accent"></i>
                                Edit Note
                            </h5>
                            <div className="d-flex align-items-center gap-2">
                                {isRecording && (
                                    <span className="voice-status-badge">
                                        <span className="voice-status-dot" aria-hidden="true"></span>
                                        Listening…
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={stopAllVoice}
                                />
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="modal-body note-modal-body">
                            {/* Browser unsupported notice */}
                            {!titleVoice.isSupported && (
                                <p className="voice-unsupported">
                                    <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                    Voice input requires Chrome or Edge.
                                </p>
                            )}

                            <form>
                                {/* ── Title ── */}
                                <div className="mb-3">
                                    <label htmlFor="etitle" className="note-label">Title</label>
                                    <div className="voice-input-row">
                                        <div className="voice-input-wrap">
                                            <input
                                                type="text"
                                                className={`note-input ${activeField === 'etitle' && titleVoice.listening ? 'note-input--recording' : ''}`}
                                                id="etitle"
                                                name="etitle"
                                                placeholder={activeField === 'etitle' && titleVoice.listening ? 'Listening…' : ''}
                                                value={note.etitle}
                                                onChange={onChange}
                                                minLength={5}
                                                required
                                            />
                                            {titleInterim && (
                                                <span className="voice-interim">{titleInterim}</span>
                                            )}
                                        </div>
                                        {titleVoice.isSupported && (
                                            <MicButton
                                                field="etitle"
                                                activeField={activeField}
                                                onToggle={handleMicToggle}
                                                listening={titleVoice.listening}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* ── Description ── */}
                                <div className="mb-3">
                                    <label htmlFor="edescription" className="note-label">Description</label>
                                    <div className="voice-input-row voice-input-row--textarea">
                                        <div className="voice-input-wrap">
                                            <textarea
                                                className={`note-input note-textarea ${activeField === 'edescription' && descVoice.listening ? 'note-input--recording' : ''}`}
                                                id="edescription"
                                                name="edescription"
                                                placeholder={activeField === 'edescription' && descVoice.listening ? 'Listening — speak now…' : ''}
                                                value={note.edescription}
                                                onChange={onChange}
                                                rows={4}
                                                minLength={5}
                                                required
                                            />
                                            {descInterim && (
                                                <span className="voice-interim voice-interim--textarea">{descInterim}</span>
                                            )}
                                        </div>
                                        {descVoice.isSupported && (
                                            <MicButton
                                                field="edescription"
                                                activeField={activeField}
                                                onToggle={handleMicToggle}
                                                listening={descVoice.listening}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* ── Tag ── */}
                                <div className="mb-3">
                                    <label htmlFor="etag" className="note-label">Tag</label>
                                    <input
                                        type="text"
                                        className="note-input"
                                        id="etag"
                                        name="etag"
                                        value={note.etag}
                                        onChange={onChange}
                                        placeholder="e.g. Work, Personal..."
                                    />
                                </div>

                                {/* Voice tip */}
                                {titleVoice.isSupported && (
                                    <p className="voice-tip mb-0">
                                        <i className="fa-solid fa-microphone me-1"></i>
                                        Click the mic icon next to any field to dictate
                                    </p>
                                )}
                            </form>
                        </div>

                        {/* Modal footer */}
                        <div className="modal-footer note-modal-footer">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                data-bs-dismiss="modal"
                                onClick={stopAllVoice}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={handleUpdate}
                                disabled={!isEditValid}
                            >
                                <i className="fa-solid fa-floppy-disk me-2"></i>Save Changes
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Notes Grid ─────────────────────────── */}
            <div className="notes-section">
                <div className="notes-header">
                    <h4 className="notes-title">
                        <i className="fa-solid fa-layer-group me-2 text-accent"></i>
                        Your Notes
                    </h4>
                    <span className="notes-count">
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </span>
                </div>

                {loading ? (
                    <div className="notes-loading">
                        <div className="spinner-border text-accent" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Fetching your notes...</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="notes-empty">
                        <i className="fa-solid fa-note-sticky notes-empty-icon"></i>
                        <h5>No notes yet</h5>
                        <p>Click "Add a new note" above to get started.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {notes.map((note) => (
                            <Noteitem
                                key={note._id}
                                note={note}
                                updateNote={updateNote}
                                showAlert={showAlert}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Notes;
