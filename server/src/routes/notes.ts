import { Router, Request, Response } from 'express';
import Note from '../models/Note';

const router = Router();

// GET notes by project
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET single note
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST create note
router.post('/', async (req: Request, res: Response) => {
  try {
    const note = new Note({ projectId: req.body.projectId, title: req.body.title, content: req.body.content || '' });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create note' });
  }
});

// PATCH update note
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update note' });
  }
});

// DELETE note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
