const express = require('express');
const router = express.Router();

const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');

const { body, validationResult } = require('express-validator');


// Route 1: Get all notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});


// Route 2: Add a new note
router.post(
    '/addnote',
    fetchuser,
    [
        body('title', 'Enter a valid title').isLength({ min: 5 }),
        body(
            'description',
            'Description must be at least 5 characters'
        ).isLength({ min: 5 })
    ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;

            // Check validation errors
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }

            // Create new note
            const note = new Notes({
                title: title,
                description: description,
                tag: tag,
                user: req.user.id
            });

            // Save note to MongoDB
            const savedNote = await note.save();

            // Send saved note back to React
            res.json(savedNote);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
);


// Route 3: Update an existing note
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // Create object containing fields to update
        const newNote = {};

        if (title) {
            newNote.title = title;
        }

        if (description) {
            newNote.description = description;
        }

        if (tag) {
            newNote.tag = tag;
        }

        // Find the note
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.status(404).send("Not Found");
        }

        // Check ownership
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Update note
        note = await Notes.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true }
        );

        res.json(note);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});


// Route 4: Delete an existing note
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.status(404).send("Not Found");
        }

        // Check ownership
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Delete note
        note = await Notes.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Note has been deleted",
            note: note
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});


module.exports = router;
