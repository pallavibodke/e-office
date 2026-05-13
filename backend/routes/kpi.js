// const express = require('express');
// const KPI = require('../models/KPI');
// const router = express.Router();

// // Get user KPIs
// router.get('/my-kpis', async (req, res) => {
//   try {
//     const kpis = await KPI.find({ userId: req.userId }).sort({ updatedAt: -1 });
//     res.json(kpis);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update KPI (employee logs progress)
// router.post('/update-kpi', async (req, res) => {
//   try {
//     const { metrics, category } = req.body;
    
//     // Calculate weighted score (example weights)
//     const totalScore = metrics.reduce((sum, metric) => {
//       const weight = metric.name.includes('timeliness') ? 0.4 : 0.3;
//       return sum + (metric.score * weight);
//     }, 0) * 100;

//     const kpi = new KPI({
//       userId: req.userId,
//       category,
//       metrics,
//       totalScore: Math.round(totalScore)
//     });

//     await kpi.save();
//     res.json({ message: 'KPI updated', score: totalScore });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require('multer');
const mongoose = require("mongoose");
const path = require('path');

const KPI = require("../models/KPI");
const uploadPath = require("../uploads/proofs");




router.get("/submitted", async (req, res) => {
  try {
    const kpis = await KPI.find();
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ message: "Error fetching KPIs" });
  }
});



 // ======================================================
// MEMBER SUBMIT KPI + FILE UPLOAD + AUTO SCORE
// ======================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  }

});

const upload = multer({ storage });

router.post(
  "/member/submit-kpi",
  upload.single("proofFile"),
  async (req, res) => {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);   

    try {

      const data = req.body || {};

      let quantitativeScore = 0;

      // ==========================================
      // HEADQUARTERS STAFF KPI CALCULATION
      // ==========================================

      if (data.category === "hq_staff") {

        quantitativeScore =
          (
            Number(data.fileDisposalRate || 0) +
            Number(data.draftingQuality || 0) +
            Number(data.responsiveness || 0) +
            Number(data.digitalAdoption || 0)
          ) / 4;
      }

      // ==========================================
      // FIELD ENGINEER KPI CALCULATION
      // ==========================================

      else if (data.category === "field_engineer") {

        quantitativeScore =
          (
            Number(data.dprTimeliness || 0) +
            Number(data.timelineAdherence || 0) +
            Number(data.financialTarget || 0) +
            Number(data.technicalStandards || 0)
          ) / 4;
      }

      // ==========================================
      // GRADE CALCULATION
      // ==========================================

      let grade = "D";

      if (quantitativeScore >= 90) {
        grade = "A+";
      }
      else if (quantitativeScore >= 80) {
        grade = "A";
      }
      else if (quantitativeScore >= 70) {
        grade = "B";
      }
      else if (quantitativeScore >= 60) {
        grade = "C";
      }

      // ==========================================
      // SAVE KPI
      // ==========================================

      const newKpi = new KPI({
        

        name: data.name || "Unknown",

        employeeId:
          data.employeeId || "EMP001",

        category:
          data.category || "hq_staff",

  // ================= TASK =================

        taskTitle:
        data.taskTitle || "Default Task",

        remarks:
          data.remarks || "",

  // ================= FIELD KPI =================

        dprTimeliness: data.dprTimeliness,
        timelineAdherence: data.timelineAdherence,
        financialTarget: data.financialTarget,
        technicalStandards: data.technicalStandards,

        // ================= HQ KPI =================

        fileDisposalRate: data.fileDisposalRate,
        draftingQuality: data.draftingQuality,
        responsiveness: data.responsiveness,
        digitalAdoption: data.digitalAdoption,

        // ================= SCORES =================

        quantitativeScore,

        totalPercentage: quantitativeScore,

        totalScore: quantitativeScore,

        grade,

         performanceGrade: grade,

        // ================= FILE =================

        proofFile: req.file
          ? `uploads/proofs/${req.file.filename}`
          : "",

        // ================= STATUS =================

        status: "submitted",

        reviewStatus: "Pending",

        submittedBy:
          req.user?.id || "temp-user",
      });

      await newKpi.save();

      res.status(201).json({
        success: true,
        message: "KPI submitted successfully",
        data: newKpi,
      });

    } catch (err) {

      console.log("REAL ERROR:", err);

        res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });


// =====================================================
// 2. MEMBER: View own KPIs
// =====================================================
router.get("/member/my-kpis/:employeeId", async (req, res) => {
  try {
    const kpis = await KPI.find({ employeeId: req.params.employeeId }).sort({
      createdAt: -1,
    });

    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// 3. EMPLOYEE: KPI weighted score update (your code)
// =====================================================
router.post("/update-kpi", async (req, res) => {
  try {
    const { metrics, category } = req.body;

    const totalScore =
      metrics.reduce((sum, metric) => {
        const weight = metric.name.includes("timeliness") ? 0.4 : 0.3;
        return sum + metric.score * weight;
      }, 0) * 100;

    const kpi = new KPI({
      userId: req.userId,
      category,
      metrics,
      totalScore: Math.round(totalScore),
    });

    await kpi.save();

    res.json({
      message: "KPI updated",
      score: totalScore,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// =====================================================
// 3. MANAGER: Get pending KPIs
// =====================================================
router.get('/pending-kpis', async (req, res) => {
  try {
    const kpis = await KPI.find({ status: 'pending' })
      .populate('submittedBy', 'name email');

    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/manager/pending-kpis", async (req, res) => {
  try {
    const kpis = await KPI.find({ status: "Submitted" })
      .sort({ createdAt: -1 });

    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const kpi = await KPI.findById(req.params.id);

    if (!kpi) {
      return res.status(404).json({
        message: "KPI not found",
      });
    }

    res.json(kpi);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================================================
// 4. MANAGER: Review KPI  (inside)
// =====================================================
router.put("/manager/review-kpi/:id", async (req, res) => {
  try {
    const {
      managerRemarks,
      rating,
      completionStatus,
      priorityLevel,
      verifiedProgress,
      reviewedBy,
    } = req.body;

    const updatedKPI = await KPI.findByIdAndUpdate(
      req.params.id,
      {
        managerRemarks,
        rating,
        completionStatus,
        priorityLevel,
        verifiedProgress, 
        reviewedBy,
        status: "Reviewed",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      message: "KPI reviewed successfully",
      updatedKPI,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// 5. MANAGER: Mark KPI Completed
// =====================================================
router.put("/manager/complete-kpi/:id", async (req, res) => {
  try {
    const kpi = await KPI.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    res.json({
      message: "KPI marked as completed",
      kpi,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// MANAGER GET ALL KPI
// ======================================================

router.get("/manager/all-kpis", async (req, res) => {
  try {

    const kpis = await KPI.find().sort({ createdAt: -1 });

    res.json(kpis);

  } catch (err) {

    res.status(500).json({
      error: "Failed to fetch KPIs",
    });

  }
});


// ======================================================
// MANAGER REVIEW KPI
// ======================================================

router.put(
  "/manager/review/:id",
  async (req, res) => {

    try {

      // const {

      //   workQuality,
      //   disciplineRating,
      //   technicalSkillRating,
      //   teamworkRating,

      //   managerRemarks,

      //   recommendation,

      //   innovation,
      //   teamwork,
      //   initiative,

      //   reviewStatus,

      // } = req.body;

      const {

  workQuality,
  disciplineRating,
  technicalSkillRating,
  teamworkRating,

  managerRemarks,

  recommendation,

  innovation,

  teamwork,

  initiative,

  qualitativeScore,

  totalScore,

  performanceGrade,

  reviewStatus,

  approvedBy,

  managerId,

  approvedAt

} = req.body;

      const kpi = await KPI.findById(req.params.id);

      if (!kpi) {

        return res.status(404).json({
          error: "KPI not found",
        });
      }

      // ==========================================
      // QUALITATIVE SCORE
      // ==========================================

      // const qualitativeScore =
      //   (
      //     Number(disciplineRating || 0) +
      //     Number(technicalSkillRating || 0) +
      //     Number(innovation || 0) +
      //     Number(teamwork || 0) +
      //     Number(initiative || 0)
      //   ) / 5;

      // ==========================================
      // FINAL SCORE
      // 80% Employee KPI
      // 20% Manager Review
      // ==========================================

      // const totalScore =
      //   (kpi.quantitativeScore * 0.8) +
      //   (qualitativeScore * 0.2);

      // ==========================================
      // FINAL GRADE
      // ==========================================

     performanceGrade = "Poor";

      if (totalScore >= 90) {
        performanceGrade = "Excellent";
      }
      else if (totalScore >= 75) {
        performanceGrade = "Very Good";
      }
      else if (totalScore >= 60) {
        performanceGrade = "Good";
      }
      else if (totalScore >= 40) {
        performanceGrade = "Average";
      }

      // ==========================================
      // SAVE MANAGER REVIEW
      // ==========================================

      // kpi.managerReview = {

      //   workQuality,
      //   disciplineRating,
      //   technicalSkillRating,
      //   teamworkRating,

      //   managerRemarks,

      //   recommendation,
      // };

      // kpi.innovation = innovation;

      // kpi.teamwork = teamwork;

      // kpi.initiative = initiative;

      // kpi.qualitativeScore =
      //   qualitativeScore;

      // kpi.totalScore =
      //   totalScore.toFixed(2);

      // kpi.performanceGrade =
      //   performanceGrade;

      // kpi.reviewStatus =
      //   reviewStatus || "Approved";

      // kpi.status = "approved";

      // kpi.reviewedAt = new Date();

      // kpi.isNew = false;

      // await kpi.save();

      kpi.managerReview = {

  workQuality,

  disciplineRating,

  technicalSkillRating,

  teamworkRating,

  managerRemarks,

  recommendation,
};

kpi.innovation = innovation;

kpi.teamwork = teamwork;

kpi.initiative = initiative;

kpi.qualitativeScore =
  qualitativeScore;

kpi.totalScore =
  totalScore;

kpi.performanceGrade =
  performanceGrade;

kpi.reviewStatus =
  reviewStatus || "Approved";

kpi.approvedBy =
  approvedBy;

kpi.managerId =
  managerId;

kpi.approvedAt =
  approvedAt || new Date();

kpi.status = "approved";

kpi.reviewedAt = new Date();

kpi.isNew = false;

await kpi.save();

      res.json({

        success: true,

        message:
          "KPI reviewed successfully",

        data: kpi,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        error:
          "Failed to review KPI",
      });
    }
  }
);

module.exports = router;