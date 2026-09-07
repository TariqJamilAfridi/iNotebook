import { useContext, useState } from 'react';
import noteContext from '../context/notes/noteContext';

const TAG_COLORS = [
    '#6c63ff', '#f7b731', '#20bf6b', '#eb3b5a',
    '#2d98da', '#fd9644', '#8854d0', '#0fb9b1'
];

function getTagColor(tag) {
    if (!tag) return TAG_COLORS[0];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash += tag.charCodeAt(i);
    return TAG_COLORS[hash % TAG_COLORS.length];
}

function timeAgo(dateStr) {
    const now  = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        weekday: 'short', year: 'numeric',
        month:   'short',  day: 'numeric',
        hour:    '2-digit', minute: '2-digit'
    });
}

/* ── Slide-in View Panel ──────────────────────────────────────── */
function NoteViewPanel({ note, tagColor, onClose, onEdit, onDelete, confirmDelete }) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="note-panel-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <aside className="note-panel" role="dialog" aria-modal="true" aria-label="Note details">
                {/* Coloured top bar */}
                <div className="note-panel-bar" style={{ background: tagColor }} />

                {/* Header */}
                <div className="note-panel-header">
                    <span className="note-panel-label">Note</span>
                    <div className="note-panel-header-actions">
                        <button
                            className="note-action-btn edit-btn"
                            onClick={onEdit}
                            title="Edit note"
                            aria-label="Edit note"
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                            className={`note-action-btn delete-btn ${confirmDelete ? 'confirm' : ''}`}
                            onClick={onDelete}
                            title={confirmDelete ? 'Click again to confirm delete' : 'Delete note'}
                            aria-label="Delete note"
                        >
                            <i className={`fa-solid ${confirmDelete ? 'fa-circle-exclamation' : 'fa-trash'}`}></i>
                        </button>
                        <button
                            className="note-action-btn note-panel-close"
                            onClick={onClose}
                            title="Close"
                            aria-label="Close panel"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="note-panel-body">
                    <h2 className="note-panel-title">{note.title}</h2>

                    {note.tag && (
                        <span
                            className="note-tag-badge note-panel-tag"
                            style={{
                                background: `${tagColor}22`,
                                color:       tagColor,
                                border:      `1px solid ${tagColor}55`
                            }}
                        >
                            <i className="fa-solid fa-tag me-1" style={{ fontSize: '0.65rem' }}></i>
                            {note.tag}
                        </span>
                    )}

                    {note.date && (
                        <p className="note-panel-date">
                            <i className="fa-regular fa-clock me-1"></i>
                            {formatDate(note.date)}
                        </p>
                    )}

                    <div className="note-panel-divider" />

                    <p className="note-panel-desc">{note.description}</p>
                </div>
            </aside>
        </>
    );
}

/* ── Main Noteitem ────────────────────────────────────────────── */
const Noteitem = ({ note, updateNote, showAlert }) => {
    const context = useContext(noteContext);
    const { deleteNote } = context;

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [panelOpen,     setPanelOpen]     = useState(false);

    const tagColor = getTagColor(note.tag);

    const handleDelete = () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        } else {
            setPanelOpen(false);
            deleteNote(note._id, showAlert);
        }
    };

    const handleEditFromPanel = () => {
        setPanelOpen(false);
        // small delay so panel closes before modal opens
        setTimeout(() => updateNote(note), 120);
    };

    return (
        <>
            <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="note-card">
                    {/* Coloured top stripe */}
                    <div className="note-tag-stripe" style={{ background: tagColor }} />

                    <div className="note-card-body">
                        {/* Top row: title + action icons */}
                        <div className="note-card-top">
                            {/* Clicking the title opens the view panel */}
                            <h5
                                className="note-card-title note-card-title-clickable"
                                onClick={() => setPanelOpen(true)}
                                title="Click to read full note"
                            >
                                {note.title}
                            </h5>
                            <div className="note-card-actions">
                                <button
                                    className="note-action-btn view-btn"
                                    onClick={() => setPanelOpen(true)}
                                    title="View full note"
                                    aria-label="View full note"
                                >
                                    <i className="fa-solid fa-eye"></i>
                                </button>
                                <button
                                    className="note-action-btn edit-btn"
                                    onClick={() => updateNote(note)}
                                    title="Edit note"
                                    aria-label="Edit note"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button
                                    className={`note-action-btn delete-btn ${confirmDelete ? 'confirm' : ''}`}
                                    onClick={handleDelete}
                                    title={confirmDelete ? 'Click again to confirm delete' : 'Delete note'}
                                    aria-label="Delete note"
                                >
                                    <i className={`fa-solid ${confirmDelete ? 'fa-circle-exclamation' : 'fa-trash'}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Truncated preview */}
                        <p className="note-card-desc">{note.description}</p>

                        {/* Footer: tag + time */}
                        <div className="note-card-footer">
                            {note.tag && (
                                <span
                                    className="note-tag-badge"
                                    style={{
                                        background: `${tagColor}22`,
                                        color:       tagColor,
                                        border:      `1px solid ${tagColor}55`
                                    }}
                                >
                                    <i className="fa-solid fa-tag me-1" style={{ fontSize: '0.65rem' }}></i>
                                    {note.tag}
                                </span>
                            )}
                            {note.date && (
                                <span className="note-time">
                                    <i className="fa-regular fa-clock me-1"></i>
                                    {timeAgo(note.date)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* View panel — rendered outside card so it covers full viewport */}
            {panelOpen && (
                <NoteViewPanel
                    note={note}
                    tagColor={tagColor}
                    onClose={() => { setPanelOpen(false); setConfirmDelete(false); }}
                    onEdit={handleEditFromPanel}
                    onDelete={handleDelete}
                    confirmDelete={confirmDelete}
                />
            )}
        </>
    );
};

export default Noteitem;
