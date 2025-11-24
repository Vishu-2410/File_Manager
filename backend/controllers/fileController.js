import fs from 'fs';
import path from 'path';
import File from '../models/File.js';
import User from '../models/User.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileDoc = new File({
    originalName: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    owner: req.user._id
  });
  await fileDoc.save();
  res.json({ message: 'Uploaded', file: fileDoc });
};

export const listFiles = async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  if (req.user.role === 'admin') {
    const query = search ? { originalName: { $regex: search, $options: 'i' } } : {};
    const files = await File.find(query).populate('owner', 'username').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    return res.json({ files });
  }
  const userId = req.user._id;
  const files = await File.find({
    $and: [
      search ? { originalName: { $regex: search, $options: 'i' } } : {},
      { $or: [{ owner: userId }, { sharedWith: userId }] }
    ]
  }).populate('owner', 'username').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ files });
};

export const downloadFile = async (req, res) => {
  const { id } = req.params;
  const file = await File.findById(id);
  if (!file) return res.status(404).json({ message: 'File not found' });
  const userId = req.user._id.toString();
  if (file.owner.toString() !== userId && !file.sharedWith.map(String).includes(userId) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const filePath = path.join(process.cwd(), UPLOAD_DIR, file.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });
  res.download(filePath, file.originalName);
};

export const shareFile = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Provide username to share with' });
  const file = await File.findById(id);
  if (!file) return res.status(404).json({ message: 'File not found' });
  const userId = req.user._id.toString();
  if (file.owner.toString() !== userId && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to share' });
  const toUser = await User.findOne({ username });
  if (!toUser) return res.status(404).json({ message: 'User to share with not found' });
  if (file.sharedWith.map(String).includes(toUser._id.toString())) return res.json({ message: 'Already shared' });
  file.sharedWith.push(toUser._id);
  await file.save();
  res.json({ message: 'Shared', file });
};

export const deleteFile = async (req, res) => {
  const { id } = req.params;
  const file = await File.findById(id);
  if (!file) return res.status(404).json({ message: 'File not found' });
  const userId = req.user._id.toString();
  if (file.owner.toString() !== userId && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to delete' });
  const filePath = path.join(process.cwd(), UPLOAD_DIR, file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await file.deleteOne();
  res.json({ message: 'Deleted' });
};
