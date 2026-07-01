import { Router, Request, Response } from 'express';
import Project from '../models/Project';

const router = Router();

// GET archived (soft-deleted) projects — must be before /:id
router.get('/archived', async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find({ deletedAt: { $exists: true } }).sort({ deletedAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch archived projects' });
  }
});

// PATCH restore a soft-deleted project
router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $unset: { deletedAt: '' } },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore project' });
  }
});

// GET all projects (excludes soft-deleted)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find({ deletedAt: { $exists: false } }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project (excludes soft-deleted)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, deletedAt: { $exists: false } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST create project
router.post('/', async (req: Request, res: Response) => {
  try {
    const project = new Project({ name: req.body.name, brief: req.body.brief });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

// PATCH update project (general fields)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update project' });
  }
});

// DELETE project (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- Timer routes ---
router.post('/:id/timer/start', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.timer.isRunning) {
      project.timer.isRunning = true;
      project.timer.lastStarted = new Date();
      await project.save();
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

router.post('/:id/timer/pause', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.timer.isRunning && project.timer.lastStarted) {
      const elapsed = Math.floor((Date.now() - new Date(project.timer.lastStarted).getTime()) / 1000);
      project.timer.totalSeconds += elapsed;
      project.timer.isRunning = false;
      project.timer.lastStarted = undefined;
      await project.save();
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to pause timer' });
  }
});

router.post('/:id/timer/stop', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.timer.isRunning && project.timer.lastStarted) {
      const elapsed = Math.floor((Date.now() - new Date(project.timer.lastStarted).getTime()) / 1000);
      project.timer.totalSeconds += elapsed;
    }
    project.timer.isRunning = false;
    project.timer.lastStarted = undefined;
    project.timer.totalSeconds = 0;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

// --- Config files ---
router.post('/:id/config-files', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.configFiles.push({ name: req.body.name, path: req.body.path, content: req.body.content, createdAt: new Date() });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add config file' });
  }
});

router.delete('/:id/config-files/:fileId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.configFiles = project.configFiles.filter(f => f._id?.toString() !== req.params.fileId);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete config file' });
  }
});

// --- Env variables ---
router.post('/:id/env-variables', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.envVariables.push({ key: req.body.key, value: req.body.value, scope: req.body.scope || 'all' });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add env variable' });
  }
});

router.delete('/:id/env-variables/:varId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.envVariables = project.envVariables.filter(v => v._id?.toString() !== req.params.varId);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete env variable' });
  }
});

// --- Pricing ---
router.patch('/:id/pricing', async (req: Request, res: Response) => {
  try {
    // Strip _id (immutable) and hourlyPayments (managed via dedicated routes).
    const { _id, hourlyPayments, ...pricingData } = req.body;
    const $set: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(pricingData)) {
      $set[`pricing.${key}`] = val;
    }
    const project = await Project.findByIdAndUpdate(req.params.id, { $set }, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('Pricing update error:', err);
    res.status(400).json({ error: 'Failed to update pricing' });
  }
});

router.post('/:id/pricing/hourly-payment', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.pricing.hourlyPayments.push({
      amount: req.body.amount,
      received: false,
      description: req.body.description,
    });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add hourly payment' });
  }
});

router.patch('/:id/pricing/hourly-payment/:payId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const payment = project.pricing.hourlyPayments.find(p => p._id?.toString() === req.params.payId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    Object.assign(payment, req.body);
    project.markModified('pricing.hourlyPayments');
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update hourly payment' });
  }
});

// --- Contacts ---
router.post('/:id/contacts', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.contacts.push({
      name: req.body.name,
      role: req.body.role,
      email: req.body.email,
      phone: req.body.phone,
      meetingLinks: req.body.meetingLinks || [],
      notes: req.body.notes,
      createdAt: new Date(),
    });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add contact' });
  }
});

router.patch('/:id/contacts/:contactId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const contact = project.contacts.find(c => c._id?.toString() === req.params.contactId);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    const { _id, ...contactData } = req.body;
    Object.assign(contact, contactData);
    project.markModified('contacts');
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update contact' });
  }
});

router.delete('/:id/contacts/:contactId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.contacts = project.contacts.filter(c => c._id?.toString() !== req.params.contactId);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete contact' });
  }
});

export default router;
