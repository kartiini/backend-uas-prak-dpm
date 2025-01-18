import express, { Request, Response } from 'express';
import { Item } from '../models/Item';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const items = await Item.find({ userId });
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  const userId = req.userId;

  console.log('Request Body:', req.body);
  console.log('User ID:', userId);

  if (!name || !description) {
    res.status(400).json({ error: 'Name and description are required' });
    return;
  }

  try {
    const newItem = new Item({ name, description, userId });
    console.log('New Item to Save:', newItem);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.userId;

  if (!name || !description) {
    res.status(400).json({ error: 'Name and description are required' });
    return;
  }

  try {
    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId },
      { name, description },
      { new: true }
    );

    if (!updatedItem) {
      res.status(404).json({ error: 'Item not found or unauthorized' });
      return;
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const item = await Item.findOneAndDelete({ _id: id, userId });
    if (!item) {
      res.status(404).json({ error: 'Item not found or unauthorized' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
