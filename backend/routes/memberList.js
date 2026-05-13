const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const MemberList = require('../models/Memberlist');


// STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/memberlist');
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


// FILE FILTER
const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};


const upload = multer({
  storage,
  fileFilter
});


// ================= UPLOAD MEMBER LIST =================

router.post(
  '/upload',
  upload.single('file'),
  async (req, res) => {

    try {

      const { projectId } = req.body;

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const newFile = new MemberList({
        projectId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype
      });

      await newFile.save();

      res.status(201).json({
        message: 'File uploaded successfully',
        data: newFile
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });
    }
  }
);


// ================= GET ALL FILES =================

router.get('/member-list', async (req, res) => {

  try {

    const files = await MemberList.find()
      .populate('projectId');

    res.json(files);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;