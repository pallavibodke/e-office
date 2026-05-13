const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {

    // ======================
    // USER / MEMBER INFO
    // ======================
    userId: mongoose.Schema.Types.ObjectId,

    category: {
      type: String,
      enum: ["hq_staff", "field_engineer"],
      required: true,
    },

    employeeId: { type: String, required: true },
    name: { type: String, required: true },

    // ======================
    // TASK DETAILS (MEMBER FILLS)
    // ===============s=======
    taskTitle: { type: String, required: true },
    description: { type: String },

    progress: { type: Number, default: 0 },

    startDate: { type: Date },
    endDate: { type: Date },

    hoursWorked: { type: Number, default: 0 },

    attachments: [{ type: String }],

    // ======================
    // KPI METRICS (YOUR ADVANCED FEATURE)
    // ======================
    metrics: [
      {
        name: String,
        target: Number,
        achieved: Number,
        score: Number,
      },
    ],

    totalScore: { type: Number, default: 0 },
    period: { type: String, default: "Monthly" },

    // ======================
    // STATUS FLOW
    // ======================
    status: {
      type: String,
      enum: ["submitted", "reviewed", "completed", "rework"],
      default: "submitted",
    },

    // ======================
    // MANAGER FILLS
    // ======================
    managerRemarks: { type: String },

    rating: { type: Number, min: 1, max: 5 },

    completionStatus: {
      type: String,
      enum: ["Completed", "Pending", "Rework"],
    },

    priorityLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },

    verifiedProgress: { type: Number },

    reviewedBy: { type: String },

    reviewedAt: { type: Date },

  employeeId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

category: {
    type: String,
    enum: ['field_engineer', 'hq_staff'],
    required: true
  },

  taskTitle: {
    type: String,
    required: true
  },

  dprTimeliness: Number,
  timelineAdherence: Number,
  financialTarget: Number,
  technicalStandards: Number,
  

  totalPercentage: {
    type: Number,
    default: 0
  },

  grade: {
    type: String,
    default: 'N/A'
  },

  remarks: String,

  proofFile: String,

  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted'
  },

  managerReview: {
    workQuality: String,
    disciplineRating: Number,
    technicalSkillRating: Number,
    teamworkRating: String,
    managerRemarks: String,
    recommendation: String
  },
innovation: Number,

teamwork: Number,

initiative: Number,
  

    // ================= HQ KPI =================
    fileDisposalRate: Number,
    turnaroundTime: Number,
    draftingQuality: Number,
    responsiveness: Number,
    digitalAdoption: Number,

    // ================= FIELD KPI =================
    dprTimeliness: Number,
    surveyAccuracy: Number,
    timelineAdherence: Number,
    financialTargets: Number,
    physicalProgress: Number,
    technicalCompliance: Number,

    remarks: String,

    // ================= AUTO SCORE =================
    quantitativeScore: {
      type: Number,
      default: 0,
    },

    qualitativeScore: {
      type: Number,
      default: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    performanceGrade: {
      type: String,
      default: "Pending",
    },

    // ================= MANAGER REVIEW =================
    
    managerRemarks: {
      type: String,
      default: "",
    },

    managerRating: {
      type: Number,
      default: 0,
    },

    innovation: {
      type: Number,
      default: 0,
    },

    teamwork: {
      type: Number,
      default: 0,
    },

    initiative: {
      type: Number,
      default: 0,
    },

    reviewStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isNew: {
  type: Boolean,
  default: true,
},

managerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

managerName: {
  type: String
},

reviewedAt: {
  type: Date
},


    reviewedAt: Date,

  },
  {
    timestamps: true,  
  }
);

module.exports = mongoose.model("KPI", kpiSchema);