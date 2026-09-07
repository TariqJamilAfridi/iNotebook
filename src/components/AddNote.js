import React, { useState, useContext } from 'react';
import noteContext from '../context/notes/noteContext';

function AddNote({ showAlert }) {
    const context = useContext(noteContext);
    const { addNote } = context;

    const [note, setNote] = useState({ title: '', description: '', tag: '' });
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        addNote(note, showAlert);
        setNote({ title: '', description: '', tag: '' });
        setIsOpen(false);
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const isValid = note.title.length >= 5 && note.description.length >= 5;

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
                    <div className="add-note-header">
                        <h5>
                            <i className="fa-solid fa-plus-circle me-2 text-accent"></i>
                            New Note
                        </h5>
                        <button
                            className="btn-close-note"
                            onClick={() => { setIsOpen(false); setNote({ title: '', description: '', tag: '' }); }}
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="note-label">
                                Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="note-input"
                                id="title"
                                name="title"
                                placeholder="Give your note a title..."
                                value={note.title}
                                onChange={onChange}
                                minLength={5}
                                required
                            />
                            {note.title.length > 0 && note.title.length < 5 && (
                                <small className="field-hint">Minimum 5 characters</small>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="note-label">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                className="note-input note-textarea"
                                id="description"
                                name="description"
                                placeholder="Write your note here..."
                                value={note.description}
                                onChange={onChange}
                                rows={4}
                                minLength={5}
                                required
                            />
                            {note.description.length > 0 && note.description.length < 5 && (
                                <small className="field-hint">Minimum 5 characters</small>
                            )}
                        </div>

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

                        <div className="d-flex gap-2">
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
                                onClick={() => { setIsOpen(false); setNote({ title: '', description: '', tag: '' }); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddNote;
