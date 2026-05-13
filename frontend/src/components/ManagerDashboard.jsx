import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ManagerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [data, setData] = useState({ projects: [], teamMembers: [], stats: {}, manager: {} });
  const [users, setUsers] = useState([]);
  const [reviewData, setReviewData] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLists, setMemberLists] = useState([]);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'employee',
    unit: '',
    departmentId: '',
    projectId: '',
    phone: '',
    progress: 0,
    suggestion: ''
  });
  const [allKpis, setAllKpis] = useState([]);
  
  const [form, setForm] = useState({
  employeeId: '',
  name: '',
  email: '',
  mobile: '',
  address: '',
  role: ''
});
const [kpiFormData, setKpiFormData] = useState({
  fileDisposalRate: 0,
  physicalProgress: 0,
  suggestion: ''
});  const [submittedKPIs, setSubmittedKPIs] = useState([]);
  const [kpiStats, setKpiStats] = useState({});
  const [activeView, setActiveView] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    weekStart: '',
    weekEnd: '',
    memberId: ''
  });

const [selectedKPI, setSelectedKPI] = useState(null);
const [showReviewModal, setShowReviewModal] = useState(false);
// const [managerReview, setManagerReview] = useState({
//   workQuality: 0,
//   disciplineRating: 0,
//   technicalSkillRating: 0,
//   teamworkRating: 0,
//   managerRemarks: '',
//   finalRecommendation: '',
//   reviewStatus: 'Approved'
// });
const [managerReview, setManagerReview] =
useState({

  workQuality: "",

  disciplineRating: "",

  technicalSkillRating: "",

  teamworkRating: "",

  managerRemarks: "",

  recommendation: "",

  innovation: "",

  teamwork: "",

  initiative: "",

  qualitativeScore: ""
});

const [kpiForm, setKpiForm] = useState({
  category: "",

  // Headquarters KPIs
  fileDisposalRate: "",
  turnaroundTime: "",
  draftingQuality: "",
  responsiveness: "",
  digitalAdoption: "",

  // Field KPIs
  dprTimeliness: "",
  surveyAccuracy: "",
  timelineAdherence: "",
  financialTargets: "",
  physicalProgress: "",
  technicalCompliance: "",

  // Common
  remarks: "",
});
  
  const [taskData, setTaskData] = useState({ tasks: [], summary: {} });

  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);
  const [memberDetailsLoading, setMemberDetailsLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState({
    member: null,
    tasks: [],
    evidences: [],
    avgProgress: 0
  });

const fetchKpiStats = async () => {

  try {

    const res = await axios.get(
      "http://localhost:5000/api/kpi/manager/kpi-stats"
    );

    setKpiStats(res.data);

  } catch (err) {
    console.log(err);
  }

};


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/manager/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        alert('Access denied. Please login as manager.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
const fetchSubmittedKPIs = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/manager/pending-kpis");
    setSubmittedKPIs(res.data);
  } catch (err) {
    console.log(err);
  }
};
const fetchKpis = async () => {

  try {

    const res = await axios.get(
      "http://localhost:5000/api/kpi/manager/all-kpis"
    );

    setAllKpis(res.data);

  } catch (err) {
    console.log(err);
  }

};
useEffect(() => {

  fetchKpiStats();
  fetchKpis();

}, []);

// useEffect(() => {
//   fetchKpis();
// }, []);

  const fetchTaskData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tasks/manager', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskData(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const fetchMemberDetails = async (memberId) => {
    try {
      setMemberDetailsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/manager/teammembers/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberDetails(res.data);
      setMemberDetailsOpen(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load member details');
    } finally {
      setMemberDetailsLoading(false);
    }
  };

const fetchMemberLists = async () => {

  try {

    const res = await axios.get(
      'http://localhost:5000/api/admin/member-list'
    );

    console.log("FILES:", res.data);

    setMemberLists(res.data);

  } catch (err) {

    console.log(err);
  }
};


useEffect(() => {
  fetchMemberLists();

}, []);

useEffect(() => {
  fetchDashboardData();
  fetchTaskData();
  fetchSubmittedKPIs();

  const token = localStorage.getItem('token');

  axios.get('http://localhost:5000/api/users', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => setUsers(res.data))
  .catch(err => console.log(err));

}, [refreshKey]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/manager/add-member', newMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefreshKey((prev) => prev + 1);
      setNewMember({
        name: '',
        email: '',
        role: 'hq',
        unit: '',
        departmentId: '',
        projectId: '',
        phone: '',
        progress: 0,
        suggestion: ''
      });
      document.getElementById('add-member-modal').close();
      alert('✅ Member added successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to add member'));
    }
  };

useEffect(() => {
  fetch("http://localhost:5000/api/kpi/submitted")
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched KPIs:", data); // 👈 DEBUG
      // setSubmittedKPIs(data);
    })
    .catch((err) => console.error(err));
}, []);

  const handleUpdateKPI = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/manager/teammembers/${selectedMember._id}`,
        { ...kpiFormData },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRefreshKey((prev) => prev + 1);
      setKpiModalOpen(false);
      setKpiFormData({ fileDisposalRate: 0, physicalProgress: 0, suggestion: '' });
      alert('✅ KPI updated successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to update KPI'));
    }
  };

  const handleSubmitReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/manager/reports',
        {
          kpiFormData,
          date: new Date().toISOString().split('T')[0],
          managerId: data.manager?._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('✅ Report submitted successfully!');
      setKpiFormData({ fileDisposalRate: 0, physicalProgress: 0, suggestion: '' });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to submit report'));
    }
  };

const handleReview = async (id) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/kpi/${id}`
    );

    console.log("Fetched KPI:", response.data);

    setSelectedKPI(response.data);
  
    setShowReviewModal(true);

  } catch (error) {
    console.log(error);
  }
};

const updateSubmittedKPI = async (id) => {
  try {
    const data = reviewData[id];

    await axios.put(
      `http://localhost:5000/api/kpi/review-kpi/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    alert("KPI Reviewed Successfully");
    setReviewData((prev) => {
      const newData = { ...prev };
      delete newData[id];   
      return newData;
    });

  } catch (err) {
    console.log(err);
  }
};

// const approveKPI = async () => {
//   try {

//     const manager = JSON.parse(localStorage.getItem("user"));

//     await axios.put(
//       `http://localhost:5000/api/kpi/review-kpi/${selectedKPI._id}`,
//       {
//         reviewStatus: "Approved",
//         managerRemarks: "Approved by manager",

//         approvedBy: manager.name,
//         managerId: manager._id,

//         approvedAt: new Date()
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`
//         }
//       }
//     );

//     alert("KPI Approved Successfully");

//     setShowReviewModal(false);

//     fetchKpis();
//     fetchSubmittedKPIs();

//   } catch (err) {
//     console.log(err);
//   }
// };

const approveKPI = async () => {

  try {

    const manager =
      JSON.parse(localStorage.getItem("user"));

    if (!selectedKPI?._id) {
      alert("No KPI selected");
      return;
    }

    await axios.put(
  `http://localhost:5000/api/kpi/manager/review-kpi/${selectedKPI._id}`,
      {
        workQuality:
          managerReview.workQuality,

        disciplineRating:
          managerReview.disciplineRating,

        technicalSkillRating:
          managerReview.technicalSkillRating,

        teamworkRating:
          managerReview.teamworkRating,

        managerRemarks:
          managerReview.managerRemarks,

        recommendation:
          managerReview.recommendation,

        innovation:
          managerReview.innovation,

        teamwork:
          managerReview.teamwork,

        initiative:
          managerReview.initiative,

        qualitativeScore:
          managerReview.qualitativeScore,

        totalScore:
          calculateTotalPercentage(),

        performanceGrade:
          calculateGrade(),

        reviewStatus: "Approved",

        approvedBy: manager.name,

        managerId: manager._id,

        approvedAt: new Date()
      },

      {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("KPI Approved Successfully");

    setShowReviewModal(false);

    fetchKpis();

    fetchSubmittedKPIs();

  } catch (err) {

    console.log(
      err.response?.data || err.message
    );

    alert("Approval Failed");
  }
};
const submitManagerReview = async (status) => {

  try {

    await axios.put(

  `http://localhost:5000/api/kpi/manager/review-kpi/${selectedKPI._id}`,

      {
        ...managerReview,

        totalPercentage: calculateTotalPercentage(),

        performanceGrade: calculateGrade(),

        reviewStatus: status
      },

      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Review Submitted Successfully");

    setShowReviewModal(false);

    fetchKpis();

  } catch (error) {

    console.log(error);
  }
};

const handleKPIChange = (e, id) => {
  const { name, value } = e.target;

  setReviewData((prev) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [name]: value
    }
  }));
};

const calculateTotalPercentage = () => {

  const total =
    Number(managerReview.workQuality || 0) +
    Number(managerReview.disciplineRating || 0) +
    Number(managerReview.technicalSkillRating || 0) +
    Number(managerReview.teamworkRating || 0);

  return (total / 20) * 100;
};

const calculateGrade = () => {

  const percentage = calculateTotalPercentage();

  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  return "D";
};

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tasks/assign', taskForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskForm({ title: '', description: '', weekStart: '', weekEnd: '', memberId: '' });
      setShowTaskModal(false);
      setRefreshKey((prev) => prev + 1);
      alert('✅ Task assigned successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to assign task'));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };


  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const managerProject = data.manager?.projectId;
  const managerDepartment = data.manager?.departmentId;

  return (
    <div
      className={`flex min-h-screen transition-all duration-300 ${
        darkMode
          ? 'dark bg-gradient-to-br from-gray-900 to-indigo-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border hover:shadow-2xl transition-all"
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -10 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-2xl backdrop-blur-sm lg:translate-x-0 lg:static lg:w-64 transition-all duration-300 border-r ${
          darkMode
            ? 'bg-gradient-to-b from-purple-900/95 via-indigo-900/90 to-purple-800/95 border-purple-500/30 shadow-purple-500/20'
            : 'bg-gradient-to-b from-indigo-600/90 via-purple-700/90 to-indigo-700/90 border-white/20 shadow-indigo-500/20'
        }`}
      >
        <div
          className={`flex items-center justify-center h-16 border-b ${
            darkMode ? 'bg-white/5 border-purple-500/30' : 'bg-white/20 border-white/20'
          }`}
        >
          <h1
            className={`text-xl font-bold tracking-wide bg-clip-text text-transparent ${
              darkMode
                ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300'
                : 'bg-gradient-to-r from-white via-purple-100 to-indigo-100'
            }`}
          >
            Manager Portal
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-6 py-4 flex-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📈' },
            { id: 'projects', label: 'My Projects', icon: '📁' },
            { id: 'team', label: 'Team', icon: '👥' },
            { id: 'reports', label: 'Reports', icon: '📝' },
            { id: 'profile', label: 'Profile', icon: '👤' }
            
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === 'profile') setProfileOpen(true);
                else setProfileOpen(false);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all shadow-sm font-medium text-sm ${
                darkMode
                  ? 'bg-white/5 border border-white/10 text-gray-100 hover:bg-white/15 hover:border-white/30 hover:text-white'
                  : 'bg-white/5 border border-white/10 text-gray-100 hover:bg-white/15 hover:border-white/30 hover:text-white'
              } ${
                activeSection === item.id
                  ? darkMode
                    ? 'bg-white/20 ring-2 ring-white/30 scale-105'
                    : 'bg-white/20 ring-2 ring-white/30 scale-105'
                  : ''
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pb-6 pt-4">
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-3 rounded-2xl font-medium text-sm shadow-sm transition-all ${
              darkMode
                ? 'bg-red-600/20 border border-red-500/30 text-red-200 hover:bg-red-600/30 hover:border-red-500/50 hover:text-red-100'
                : 'bg-red-500/20 border border-red-400/30 text-red-100 hover:bg-red-500/30 hover:border-red-400 hover:text-red-50'
            }`}
          >
            Logout
          </button>
        </div>
      </motion.aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header
          className={`sticky top-0 z-10 border-b px-2 py-4 ${
            darkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-black/20' : 'bg-white shadow-sm border-b'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-3 rounded-xl shadow-lg ${
                darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              ☰
            </button>
            <h1 className={`text-2xl font-bold text-center flex-1 lg:text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeSection === 'dashboard'
                ? 'Dashboard'
                : activeSection === 'projects'
                ? 'My Projects'
                : activeSection === 'team'
                ? 'Team Management'
                : activeSection === 'reports'
                ? 'KPI Reports'
                : 'Profile'}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8">
          {activeSection === 'dashboard' && (

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8 max-w-7xl mx-auto"
  >

    {/* DASHBOARD STATS */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* PROJECTS */}
      <motion.div
        className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border hover:shadow-2xl
        ${darkMode
          ? 'bg-gray-800/50 border-gray-700/50'
          : 'bg-white/80 border'
        }`}
        whileHover={{ scale: 1.02 }}
      >

        <h3 className="text-4xl font-bold text-indigo-400">
          {data.stats?.projects || 0}
        </h3>

        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>
          My Projects
        </p>

      </motion.div>

      {/* TEAM MEMBERS */}
      <motion.div
        className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border hover:shadow-2xl
        ${darkMode
          ? 'bg-gray-800/50 border-gray-700/50'
          : 'bg-white/80 border'
        }`}
        whileHover={{ scale: 1.02 }}
      >

        <h3 className="text-4xl font-bold text-green-400">
          {data.stats?.teamMembers || 0}
        </h3>

        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>
          Team Members
        </p>

      </motion.div>

      {/* AVG PERFORMANCE */}
      <motion.div
        className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border hover:shadow-2xl
        ${darkMode
          ? 'bg-gray-800/50 border-gray-700/50'
          : 'bg-white/80 border'
        }`}
        whileHover={{ scale: 1.02 }}
      >

        <h3 className="text-4xl font-bold text-yellow-400">
          {data.stats?.avgProgress || 0}%
        </h3>

        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>
          Avg Performance
        </p>

      </motion.div>

      {/* KPI APPROVAL CARD */}
      <motion.div
        onClick={() => setActiveView("kpiReview")}
        whileHover={{ scale: 1.03 }}
        className={`relative cursor-pointer overflow-hidden rounded-2xl p-8 shadow-2xl transition
        ${
          kpiStats?.newApprovals > 0
            ? "bg-gradient-to-br from-red-600 to-rose-700 animate-pulse"
            : "bg-gradient-to-br from-indigo-600 to-purple-700"
        } text-white`}
      >

        {/* NEW APPROVAL BADGE */}
        {kpiStats?.newApprovals > 0 && (

          <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">

            NEW APPROVAL

          </div>
        )}

        <p className="text-sm uppercase tracking-widest text-white/70">
          KPI Reviews
        </p>

        <div className="mt-3 text-5xl font-bold">
          {kpiStats?.pending || 0}
        </div>

        <p className="mt-4 text-white/80 text-sm">
          Pending KPI submissions awaiting manager approval
        </p>

      </motion.div>

    </div>

    {/* KPI REVIEW PANEL */}
    {activeView === "kpiReview" && (

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-3xl shadow-2xl p-8 border
        ${
          darkMode
            ? 'bg-gray-900 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <h2 className="text-3xl font-bold">
              KPI Review & Approval Panel
            </h2>

            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Review submitted KPI reports and approve employee performance evaluations.
            </p>

          </div>

          <button
            onClick={() => setActiveView("dashboard")}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition"
          >
            Close Panel
          </button>

        </div>

        {/* KPI TABLE */}
        <div className="overflow-auto rounded-2xl border">

          <table className="w-full">

            <thead className="bg-slate-800 text-white">

              <tr>

                <th className="p-4 text-left">Employee</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Score</th>
                <th className="p-4 text-left">Grade</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>

              </tr>

            </thead>

            <tbody>

              {allKpis?.map((item) => (

                <tr
                  key={item._id}
                  className={`border-b transition hover:bg-slate-100 dark:hover:bg-slate-800
                  ${
                    item.isNew
                      ? "bg-yellow-100 dark:bg-yellow-900/20"
                      : ""
                  }`}
                >

                  {/* EMPLOYEE */}
                  <td className="p-4">

                    <div className="flex items-center gap-3">

                      {item.isNew && (

                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          NEW
                        </span>

                      )}

                      <span className="font-semibold">
                        {item.name}
                      </span>

                    </div>

                  </td>

                  {/* CATEGORY */}
                  <td className="p-4 capitalize">
                    {item.category}
                  </td>

                  {/* SCORE */}
                  <td className="p-4">
                    {item.totalScore || 0}
                  </td>

                  {/* GRADE */}
                  <td className="p-4">
                    {item.performanceGrade || "Pending"}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">

                    <span className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      item.reviewStatus === "Approved"
                        ? "bg-green-100 text-green-700"
                        : item.reviewStatus === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>

                      {item.reviewStatus}

                    </span>

                  </td>

                  {/* ACTION */}
                  <td className="p-4">

                    <button
                      onClick={() => handleReview(item._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition"
                      >
                      Review KPI
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {showReviewModal && selectedKPI && (

<div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

<div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl p-8">

<h2 className="text-3xl font-bold mb-6">
Manager KPI Review
</h2>

{/* EMPLOYEE DETAILS */}

<div className="grid grid-cols-2 gap-4 mb-6">

<div>
<label className="font-semibold">Employee</label>
<p>{selectedKPI.name}</p>
</div>

<div>
<label className="font-semibold">Category</label>
<p>{selectedKPI.category}</p>
</div>

<div>
<label className="font-semibold">Task</label>
<p>{selectedKPI.taskTitle}</p>
</div>

<div>
<label className="font-semibold">Status</label>
<p>{selectedKPI.status}</p>
</div>

</div>

{/* KPI SCORE DETAILS */}

<div className="bg-gray-100 p-5 rounded-xl mb-6">

<h3 className="font-bold text-xl mb-4">
KPI Scores
</h3>

<div className="grid grid-cols-2 gap-4">

<div>
<label>Work Quality (1-5)</label>

<input
type="number"
min="1"
max="5"
value={managerReview.workQuality}
onChange={(e) =>
setManagerReview({
...managerReview,
workQuality: e.target.value
})
}
className="w-full border p-2 rounded"
/>
</div>

<div>
<label>Discipline Rating (1-5)</label>

<input
type="number"
min="1"
max="5"
value={managerReview.disciplineRating}
onChange={(e) =>
setManagerReview({
...managerReview,
disciplineRating: e.target.value
})
}
className="w-full border p-2 rounded"
/>
</div>

<div>
<label>Technical Skill Rating (1-5)</label>

<input
type="number"
min="1"
max="5"
value={managerReview.technicalSkillRating}
onChange={(e) =>
setManagerReview({
...managerReview,
technicalSkillRating: e.target.value
})
}
className="w-full border p-2 rounded"
/>
</div>

<div>
<label>Teamwork Rating (1-5)</label>

<input
type="number"
min="1"
max="5"
value={managerReview.teamworkRating}
onChange={(e) =>
setManagerReview({
...managerReview,
teamworkRating: e.target.value
})
}
className="w-full border p-2 rounded"
/>
</div>

</div>

</div>

{/* AUTO TOTAL */}

<div className="grid grid-cols-2 gap-6 mb-6">

<div className="bg-blue-100 p-5 rounded-xl">
<h3 className="font-bold text-lg">Total Percentage</h3>

<p className="text-4xl font-bold text-blue-700">
{calculateTotalPercentage().toFixed(0)}%
</p>
</div>

<div className="bg-green-100 p-5 rounded-xl">
<h3 className="font-bold text-lg">Performance Grade</h3>

<p className="text-4xl font-bold text-green-700">
{calculateGrade()}
</p>
</div>

</div>

{/* FILE PREVIEW */}

{selectedKPI.proofFile && (

<div className="mb-6">

<h3 className="font-bold mb-2">
Uploaded File
</h3>

<div className="flex gap-4">

<a
href={`http://localhost:5000/${selectedKPI.proofFile}`}
target="_blank"
rel="noreferrer"
className="bg-indigo-600 text-white px-4 py-2 rounded"
>
Preview File
</a>

<a
href={`http://localhost:5000/uploads/${selectedKPI.proofFile}`}
download
className="bg-green-600 text-white px-4 py-2 rounded"
>
Download File
</a>

</div>

</div>

)}

{/* MANAGER REMARKS */}

<div className="mb-4">

<label className="font-semibold">
Manager Remarks
</label>

<textarea
value={managerReview.managerRemarks}
onChange={(e) =>
setManagerReview({
...managerReview,
managerRemarks: e.target.value
})
}
className="w-full border p-3 rounded mt-2"
rows="4"
/>

</div>

{/* FINAL RECOMMENDATION */}

<div className="mb-6">

<label className="font-semibold">
Final Recommendation
</label>

<select
value={managerReview.finalRecommendation}
onChange={(e) =>
setManagerReview({
...managerReview,
finalRecommendation: e.target.value
})
}
className="w-full border p-3 rounded mt-2"
>

<option value="">Select</option>
<option value="Promotion Recommended">
Promotion Recommended
</option>

<option value="Training Required">
Training Required
</option>

<option value="Excellent Performer">
Excellent Performer
</option>

<option value="Needs Improvement">
Needs Improvement
</option>

</select>

</div>

{/* ACTION BUTTONS */}

<div className="flex justify-end gap-4">

<button
onClick={() => setShowReviewModal(false)}
className="bg-gray-500 text-white px-5 py-2 rounded"
>
Close
</button>

<button
onClick={() => submitManagerReview("Rejected")}
className="bg-red-600 text-white px-5 py-2 rounded"
>
Reject
</button>

<button
onClick={() => submitManagerReview("Approved")}
className="bg-green-600 text-white px-5 py-2 rounded"
>
Approve
</button>

</div>

</div>

</div>

)}

      </motion.div>
    )}

  </motion.div>
)}

          {activeSection === 'projects' && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-6xl mx-auto"
  >

    <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      My Projects
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.projects && data.projects.length > 0 ? (
        data.projects.map((project) => (
          <motion.div
            key={project._id}
            className={`backdrop-blur-sm p-6 rounded-2xl shadow-xl border hover:shadow-2xl ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white/80 border'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {project.name}
            </h3>

            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {project.description || 'No description'}
            </p>

            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Department: {project.department?.name || 'NA'}
            </p>

            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Status: {project.status || 'Planning'}
            </p>

            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Budget: ₹{(project.budget || 0).toLocaleString()}
            </p>
          </motion.div>
        ))
      ) : (
        <div
          className={`backdrop-blur-sm p-12 rounded-2xl border text-center col-span-full ${
            darkMode
              ? 'bg-gray-800/50 border-gray-700/50'
              : 'bg-white/80'
          }`}
        >
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            No projects assigned yet. Contact admin.
          </p>
        </div>
      )}
    </div>


    {/* MEMBER LISTS SECTION START */}
    <div className="bg-white rounded-2xl p-6 shadow-xl mt-10">

      <h2 className="text-2xl font-bold mb-4">
        📄 Member Lists
      </h2>

      <div className="space-y-4">

        {memberLists.map((file) => (
          <div
            key={file._id}
            className="border rounded-xl p-4 flex items-center justify-between"
          >

            <div>
              <p className="font-semibold">
                {file.fileName}
              </p>

              <p className="text-sm text-gray-500">
                Project: {file.projectId?.name || 'NA'}
              </p>
            </div>


            <div className="flex gap-3">

              <a
                href={`http://localhost:5000/${file.filePath.replace(/\\/g, "/")}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                View
              </a>


              <a
                href={`http://localhost:5000/${file.filePath.replace(/\\/g, "/")}`}
                download
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Download
              </a>


              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
              >
                Self Review
              </button>

            </div>

          </div>
        )
        
      )}
        <p className="text-gray-500">
    No files found
  </p>

      </div>

    </div>
    {/* MEMBER LISTS SECTION END */}

  </motion.div>
)}

          {activeSection === 'team' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Team Management</h2>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
                  >
                    Assign Weekly Task
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={`px-6 py-3 rounded-xl font-semibold shadow-lg ${darkMode ? 'bg-indigo-600/90 text-white hover:bg-indigo-700/90' : 'bg-indigo-600 text-white'}`}
                    onClick={() => document.getElementById('add-member-modal').showModal()}
                  >
                    Add Member
                  </motion.button>
                  
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.teamMembers && data.teamMembers.length > 0 ? (
                  data.teamMembers.map((member) => (
                    <motion.div
                      key={member._id}
                      className={`backdrop-blur-sm p-6 rounded-2xl shadow-xl border hover:shadow-2xl cursor-pointer ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => fetchMemberDetails(member._id)}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-600/50 border-2 border-indigo-400/50' : 'bg-indigo-500/20'}`}>
                          <span className={`font-bold text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            {member.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</h3>
                          <p className={`capitalize text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{member.role?.replace('-', ' ')}</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${member.progress || 0}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>

                      <p className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {member.progress || 0}% Progress
                      </p>

                      {member.suggestion && (
                        <div className={`mt-3 p-3 rounded-xl text-xs ${darkMode ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-800/50' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                          {member.suggestion}
                        </div>
                      )}
                    </motion.div>
                    
                  ))
                ) : (
                  <div className={`backdrop-blur-sm col-span-full p-12 rounded-2xl border text-center ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No team members yet. Add your first member!</p>
                  </div>
                )}
              </div>


              
              <div className="bg-transparent p-4 rounded-xl shadow mb-6 text-black mt-8"></div>

              <div className="bg-white p-4 rounded-xl shadow mb-6 text-black">
  <h3 className="text-lg font-bold mb-3">Add Employee</h3>

  <form onSubmit={handleAddMember}>
    <input
      placeholder="Name"
      value={newMember.name}
      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
      className="border p-2 mr-2"
      required
    />

    <input
      placeholder="Email"
      value={newMember.email}
      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
      className="border p-2 mr-2"
      required
    />

    <input
      placeholder="Phone"
      value={newMember.phone}
      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
      className="border p-2 mr-2"
    />

    <select
      value={newMember.role}
      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
      className="border p-2 mr-2"
    >
      <option value="employee">Employee</option>
      <option value="hq">HQ</option>
      <option value="supervisor">Supervisor</option>
    </select>

    <button className="bg-blue-600 text-white px-4 py-2">
      Add
    </button>
  </form>
</div>



              <div className="mt-10 overflow-x-auto">
                <h3 className="text-xl font-bold mb-4">All Employees (Table View)</h3>

              <table className="min-w-full border bg-white text-black">
                <thead className="bg-gray-200">
                <tr>
                <th className="p-2 border">Employee ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mobile</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Role</th>
                </tr>
              </thead>

    <tbody>
      {users.length > 0 ? (
        users.map((u, index) => (
          <tr key={index}>
            <td className="p-2 border">{u.employeeId}</td>
            <td className="p-2 border">{u.name}</td>
            <td className="p-2 border">{u.email}</td>
            <td className="p-2 border">{u.mobile}</td>
            <td className="p-2 border">{u.address}</td>
            <td className="p-2 border">{u.role}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" className="text-center p-3">
            No Data Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
            </motion.div>
            
          )}

          {activeSection === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>KPI Reports</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>HQ Staff KPI</h3>
                  <div className="space-y-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>File Disposal Rate</label>
                    <input
                      type="number"
                      value={kpiFormData.fileDisposalRate}
                      onChange={(e) => setKpiFormData({ ...kpiFormData, fileDisposalRate: Number(e.target.value) })}
                      className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Field Unit KPI</h3>
                  <div className="space-y-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Physical Progress</label>
                    <input
                      type="number"
                      value={kpiFormData.physicalProgress}
                      onChange={(e) => setKpiFormData({ ...kpiFormData, physicalProgress: Number(e.target.value) })}
                      className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
              </div>
            
              <motion.button
                className="mx-auto block px-12 py-4 rounded-2xl text-lg font-bold shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                onClick={handleSubmitReport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Report
              </motion.button>
  <div className="mt-10">
  <h4 className="text-xl font-bold mb-4">Tasks Pending Approval</h4>

  {submittedKPIs.length === 0 ? (
    <p>All submissions have been reviewed</p>
  ) : (
    submittedKPIs.map((kpi) => (
      <div key={kpi._id} className="border p-4 mb-4 rounded bg-white text-black">
        <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md shadow">

  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
    {kpi.taskTitle || "No Title"}
  </h4>

  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
    {kpi.description || "No description provided"}
  </p>

<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">

  <div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      Submitted By:
    </span>
    <div className="text-gray-600 dark:text-gray-400">
      {kpi.submittedBy || "N/A"}
    </div>
  </div>

  <div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      Submission Date:
    </span>
    <div className="text-gray-600 dark:text-gray-400">
      {kpi.submittedAt
        ? new Date(kpi.submittedAt).toLocaleString()
        : "N/A"}
    </div>
  </div>

  <div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      Start Date:
    </span>
    <div className="text-gray-600 dark:text-gray-400">
      {kpi.startDate
        ? new Date(kpi.startDate).toLocaleDateString()
        : "N/A"}
    </div>
  </div>

  <div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      End Date:
    </span>
    <div className="text-gray-600 dark:text-gray-400">
      {kpi.endDate
        ? new Date(kpi.endDate).toLocaleDateString()
        : "N/A"}
    </div>
  </div>

  <div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      Total Hours Worked:
    </span>
    <div className="text-gray-600 dark:text-gray-400">
      {kpi.totalHours || "N/A"}
    </div>
  </div>

  <div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      Status:
    </span>
    <div className="text-blue-600 font-medium">
      {kpi.status || "Pending"}
    </div>
  </div>

</div>

  {/* Progress */}
  <div className="mt-3">
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
      <div
        className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
        style={{ width: `${kpi.progress || 0}%` }}
      />
    </div>

    <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
      {kpi.progress || 0}% Progress
    </p>
  </div>

</div>

<div className="mt-4 p-5 rounded-xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md shadow">

  {/* Section Title */}
  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b pb-2">
    Manager Review Section
  </h4>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Manager Remarks */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Manager Remarks
      </label>
      <input
        name="managerRemarks"
        placeholder="Enter remarks"
        value={reviewData[kpi._id]?.managerRemarks || ""}
        onChange={(e) => handleKPIChange(e, kpi._id)}
        className="w-full border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white p-2 rounded-md"
      />
    </div>

    {/* Rating */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Rating (1–5)
      </label>
      <input
        name="rating"
        type="number"
        min="1"
        max="5"
        value={reviewData[kpi._id]?.rating || ""}
        onChange={(e) => handleKPIChange(e, kpi._id)}
        className="w-full border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white p-2 rounded-md"
      />
    </div>

    {/* Approval Status */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Approval Status
      </label>
      <select
        name="completionStatus"
        value={reviewData[kpi._id]?.completionStatus || ""}
        onChange={(e) => handleKPIChange(e, kpi._id)}
        className="w-full border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white p-2 rounded-md"
      >
        <option value="">Select Status</option>
        <option value="Completed">Completed</option>
        <option value="Pending">Pending</option>
        <option value="Rework">Needs Revision</option>
      </select>
    </div>

    {/* Priority */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Priority Level
      </label>
      <select
        name="priorityLevel"
        value={reviewData[kpi._id]?.priorityLevel || ""}
        onChange={(e) => handleKPIChange(e, kpi._id)}
        className="w-full border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white p-2 rounded-md"
      >
        <option value="">Select Priority</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>

    {/* Verified Progress */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Verified Progress (%)
      </label>
      <input
        name="verifiedProgress"
        type="number"
        min="0"
        max="100"
        value={reviewData[kpi._id]?.verifiedProgress || ""}
        onChange={(e) => handleKPIChange(e, kpi._id)}
        className="w-full border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white p-2 rounded-md"
      />
    </div>

  </div>

  {/* Submit Button */}
  <div className="mt-4 text-right">
    <button
      onClick={() => updateSubmittedKPI(kpi._id)}
      className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md shadow"
    >
      Submit Review
    </button>
  </div>
</div>
      </div>
    ))
  )}
</div>
            </motion.div>
            
          )}

          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <div className={`backdrop-blur-sm rounded-3xl shadow-2xl border p-8 ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {data.manager?.name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {data.manager?.name || 'Manager'}
                    </h2>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{data.manager?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Department</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{managerDepartment?.name || 'NA'}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Project</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{managerProject?.name || 'NA'}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Team Size</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.stats?.teamMembers || 0}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Avg Progress</p>
                    <p className="font-bold text-green-400">{data.stats?.avgProgress || 0}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {memberDetailsOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{memberDetails.member?.name || 'Member Details'}</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{memberDetails.member?.email || ''}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedMember(memberDetails.member);
                    setKpiFormData({ fileDisposalRate: 0, physicalProgress: 0, suggestion: '' });
                    setKpiModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Add KPI
                </button>
                <button
                  onClick={() => setMemberDetailsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            {memberDetailsLoading ? (
              <div className="p-10 text-center">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                <div className={`rounded-2xl p-5 border ${darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-4">Member Info</h3>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-semibold">Role:</span> {memberDetails.member?.role || 'NA'}</p>
                    <p><span className="font-semibold">Department:</span> {memberDetails.member?.departmentId?.name || 'NA'}</p>
                    <p><span className="font-semibold">Project:</span> {memberDetails.member?.projectId?.name || 'NA'}</p>
                    <p><span className="font-semibold">Unit:</span> {memberDetails.member?.unit || 'NA'}</p>
                    <p><span className="font-semibold">Phone:</span> {memberDetails.member?.phone || 'NA'}</p>
                    <p><span className="font-semibold">Avg Performance:</span> {memberDetails.avgProgress || 0}%</p>
                  </div>
                </div>

                <div className={`lg:col-span-2 rounded-2xl p-5 border ${darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-4">Assigned Tasks</h3>
                  <div className="space-y-4">
                    {memberDetails.tasks?.length > 0 ? (
                      memberDetails.tasks.map((task) => (
                        <div key={task._id} className={`rounded-2xl p-4 border ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-lg">{task.title}</h4>
                              <p className="text-sm opacity-80">{task.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : task.status === 'in-progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-sm">
                            <p><span className="font-semibold">Progress:</span> {task.progress || 0}%</p>
                            <p>
                              <span className="font-semibold">Week:</span> {new Date(task.weekStart).toLocaleDateString()} - {new Date(task.weekEnd).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${task.progress || 0}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tasks found for this member.</p>
                    )}
                  </div>
                </div>

                <div className={`lg:col-span-3 rounded-2xl p-5 border ${darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className="text-lg font-semibold mb-4">Evidence Uploaded</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memberDetails.evidences?.length > 0 ? (
                      memberDetails.evidences.map((ev) => (
                        <div key={ev._id} className={`rounded-2xl p-4 border ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
                          <h4 className="font-bold">{ev.title}</h4>
                          <p className="text-sm opacity-80 mt-1">{ev.notes}</p>
                          <p className="text-sm mt-2"><span className="font-semibold">Task:</span> {ev.taskId?.title || 'NA'}</p>
                          <p className="text-sm"><span className="font-semibold">Status:</span> {ev.taskId?.status || 'NA'}</p>
                          {ev.fileUrl && (
                            <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-500 text-sm underline mt-2 inline-block">
                              View File
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No evidence uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <dialog id="add-member-modal" className={`p-0 ${darkMode ? 'bg-gray-900/90' : 'bg-white/95'} backdrop:bg-black/50`}>
        <div className={`p-8 rounded-3xl shadow-2xl max-w-md mx-auto mt-20 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Team Member</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <input type="text" placeholder="Full Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} required />
            <input type="email" placeholder="Email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} required />
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
              <option value="hq">HQ Staff</option>
              <option value="supervisor">Supervisor</option>
              <option value="field_engineer">Field Engineer</option>
              <option value="technician">Technician</option>
              <option value="employee">Employee</option>
            </select>
            <input type="number" placeholder="Initial Progress 0-100" value={newMember.progress} onChange={(e) => setNewMember({ ...newMember, progress: Number(e.target.value) })} className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} min="0" max="100" />
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => document.getElementById('add-member-modal').close()} className={`flex-1 py-3 rounded-xl font-medium shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}>
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 rounded-xl font-bold shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Add Member
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <dialog open={kpiModalOpen} className={`p-0 ${darkMode ? 'bg-gray-900/90' : 'bg-white/95'} backdrop:bg-black/50`}>
        <div className={`p-8 rounded-3xl shadow-2xl max-w-md mx-auto mt-20 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Update KPI for {selectedMember?.name}
          </h2>
          <form onSubmit={handleUpdateKPI} className="space-y-4">
            <input
              type="number"
              placeholder="File Disposal Rate"
              value={kpiFormData.fileDisposalRate}
              onChange={(e) => setKpiFormData({ ...kpiFormData, fileDisposalRate: Number(e.target.value) })}
              className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              required
            />
            <input
              type="number"
              placeholder="Physical Progress"
              value={kpiFormData.physicalProgress}
              onChange={(e) => setKpiFormData({ ...kpiFormData, physicalProgress: Number(e.target.value) })}
              className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              required
            />
            <textarea
              placeholder="Suggestion/Feedback"
              value={kpiFormData.suggestion}
              onChange={(e) => setKpiFormData({ ...kpiFormData, suggestion: e.target.value })}
              className={`w-full p-3 rounded-xl border shadow-sm h-24 resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setKpiModalOpen(false)}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold shadow-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              >
                Save KPI
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {showTaskModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-gray-900 dark:text-white">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Assign Weekly Task</h2>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAssignTask} className="space-y-4">
                <input type="text" placeholder="Task Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" required />
                <textarea placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" />
                <input type="date" value={taskForm.weekStart} onChange={(e) => setTaskForm({ ...taskForm, weekStart: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" required />
                <input type="date" value={taskForm.weekEnd} onChange={(e) => setTaskForm({ ...taskForm, weekEnd: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" required />
                <select value={taskForm.memberId} onChange={(e) => setTaskForm({ ...taskForm, memberId: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" required>
                  <option value="">Select Member</option>
                  {data.members?.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl">
                    Assign
                  </button>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 bg-gray-200 py-3 rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;