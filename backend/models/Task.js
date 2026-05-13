

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedBy: { type: String },    
    submittedAt: { type: Date },
    evidence: { type: String, default: '' },
    completedAt: { type: Date, default: null }
  },
  {
title: String,
  description: String,
  progress: Number,
  startDate: Date,
  endDate: Date,
  totalHours: Number,

  submittedBy: String,
  submittedAt: Date,

  status: String,
  managerRemarks: String,
  priority: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);