import NoteContext from './noteContext';
import { useState } from 'react';

const NoteState = (props) => {

    const host = "http://localhost:5000";
    const [notes, setNotes] = useState([]);

    // Get all notes
    const getNotes = async () => {
        try {
            const response = await fetch(`${host}/api/notes/fetchallnotes`, {
                method: 'GET',
                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            });
            const json = await response.json();
            setNotes(json);
        } catch (err) {
            console.error("Failed to fetch notes:", err);
        }
    };

    // Add a note
    const addNote = async (note, showAlert) => {
        try {
            const response = await fetch(`${host}/api/notes/addnote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    title: note.title,
                    description: note.description,
                    tag: note.tag || "General"
                })
            });
            const json = await response.json();
            if (response.ok) {
                setNotes(prevNotes => [...prevNotes, json]);
                if (showAlert) showAlert('Note added successfully!', 'success');
            } else {
                const msg = (json.errors && json.errors[0]?.msg) || json.error || 'Failed to add note.';
                if (showAlert) showAlert(msg, 'danger');
            }
        } catch (err) {
            if (showAlert) showAlert('Server error. Could not add note.', 'danger');
        }
    };

    // Delete a note
    const deleteNote = async (id, showAlert) => {
        try {
            const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
                method: 'DELETE',
                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            });
            if (response.ok) {
                setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
                if (showAlert) showAlert('Note deleted.', 'warning');
            }
        } catch (err) {
            if (showAlert) showAlert('Server error. Could not delete note.', 'danger');
        }
    };

    // Edit a note
    const editNote = async (id, title, description, tag, showAlert) => {
        try {
            const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ title, description, tag })
            });
            if (response.ok) {
                setNotes(prevNotes =>
                    prevNotes.map(note =>
                        note._id === id ? { ...note, title, description, tag } : note
                    )
                );
                if (showAlert) showAlert('Note updated successfully!', 'success');
            }
        } catch (err) {
            if (showAlert) showAlert('Server error. Could not update note.', 'danger');
        }
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;
