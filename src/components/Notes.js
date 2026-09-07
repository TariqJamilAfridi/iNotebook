import { useContext, useEffect, useRef, useState } from 'react';
import noteContext from '../context/notes/noteContext';
import Noteitem from './Noteitem';
import AddNote from './AddNote';

function Notes({ showAlert }) {
    const context = useContext(noteContext);
    const { notes, getNotes, editNote } = context;

    const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '' });
    const [loading, setLoading] = useState(true);
    const ref = useRef(null);

    useEffect(() => {
        getNotes().finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateNote = (currentNote) => {
        ref.current.click();
        setNote({
            id: currentNote._id,
            etitle: currentNote.title,
            edescription: currentNote.description,
            etag: currentNote.tag
        });
    };

    const handleUpdate = () => {
        editNote(note.id, note.etitle, note.edescription, note.etag, showAlert);
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const isEditValid = note.etitle.length >= 5 && note.edescription.length >= 5;

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

            {/* Edit Modal */}
            <div className="modal fade" id="editNoteModal" tabIndex="-1" aria-labelledby="editNoteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content note-modal">
                        <div className="modal-header note-modal-header">
                            <h5 className="modal-title" id="editNoteModalLabel">
                                <i className="fa-solid fa-pen-to-square me-2 text-accent"></i>Edit Note
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body note-modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="etitle" className="note-label">Title</label>
                                    <input
                                        type="text"
                                        className="note-input"
                                        id="etitle"
                                        name="etitle"
                                        value={note.etitle}
                                        onChange={onChange}
                                        minLength={5}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="edescription" className="note-label">Description</label>
                                    <textarea
                                        className="note-input note-textarea"
                                        id="edescription"
                                        name="edescription"
                                        value={note.edescription}
                                        onChange={onChange}
                                        rows={4}
                                        minLength={5}
                                        required
                                    />
                                </div>
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
                            </form>
                        </div>
                        <div className="modal-footer note-modal-footer">
                            <button type="button" className="btn btn-ghost" data-bs-dismiss="modal">Cancel</button>
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

            {/* Notes Grid */}
            <div className="notes-section">
                <div className="notes-header">
                    <h4 className="notes-title">
                        <i className="fa-solid fa-layer-group me-2 text-accent"></i>
                        Your Notes
                    </h4>
                    <span className="notes-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
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
                            <Noteitem key={note._id} note={note} updateNote={updateNote} showAlert={showAlert} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Notes;
