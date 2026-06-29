import { Router, Request, Response } from 'express';
import Project from '../models/Project';

const router = Router();

// GET all projects
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
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

// DELETE project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
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
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    Object.assign(project.pricing, req.body);
    await project.save();
    res.json(project);
  } catch (err) {
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
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update hourly payment' });
  }
});

export default router;
