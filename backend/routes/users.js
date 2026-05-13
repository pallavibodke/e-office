// const express = require('express');
// const User = require('../models/User');
// const auth = require('../middleware/auth');
// const router = express.Router();

// router.get('/', auth, async (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Admin access required' });
//   }
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.post('/', auth, async (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Admin access required' });
//   }
//   try {
//     const user = new User(req.body);
//     await user.save();
//     const userRes = await User.findById(user._id).select('-password');
//     res.status(201).json(userRes);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
// router.post('/self', async (req, res) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// module.exports = router;

const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();


// ✅ GET USERS (Admin + Manager ONLY)
router.get('/', auth, async (req, res) => {
  try {
    // 🔐 Check token exists
    if (!req.user) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // 🔐 Role check
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.find().select('-password');

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ ADD USER (Admin + Manager)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = new User(req.body);
    await user.save();

    const userRes = await User.findById(user._id).select('-password');

    res.status(201).json(userRes);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ PUBLIC SELF REGISTRATION
router.post('/self', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;