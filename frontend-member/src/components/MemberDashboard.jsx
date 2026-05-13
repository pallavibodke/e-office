import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function MemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showKpi, setShowKpi] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [evidence, setEvidence] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("member"));
  const memberName = localStorage.getItem("userName");
  const [theme, setTheme] = useState(() => localStorage.getItem('memberTheme') || 'light');
  const [data, setData] = useState({
    member: {},
    tasks: [],
    evidences: [],
    stats: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, avgProgress: 0 }
  });
  
  const [evidenceForm, setEvidenceForm] = useState({
    taskId: '',
    title: '',
    notes: '',
    fileUrl: '',
    fileName: '',
    fileType: ''
  });

  const [form, setForm] = useState({
    taskTitle: "",
    description: "",
    progress: 0,
    startDate: "",
    endDate: "",
    hoursWorked: 0,
  });

const [kpiForm, setKpiForm] = useState({
  taskTitle: "",
  description: "",
  progress: 0,
  startDate: "",
  endDate: "",
  hoursWorked: 0,


  category: "",

  // HQ KPI
  fileDisposalRate: "",
  turnaroundTime: "",
  draftingQuality: "",
  responsiveness: "",
  digitalAdoption: "",

  // FIELD KPI
  dprTimeliness: "",
  surveyAccuracy: "",
  timelineAdherence: "",
  financialTargets: "",
  physicalProgress: "",
  technicalCompliance: "",

  remarks: "",

});

const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    localStorage.setItem('memberTheme', theme);
  }, [theme]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/member/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load member dashboard');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/member/login';
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tasks/member', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchTasks();
  }, [refreshKey]);

  const handleTaskUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tasks/${selectedTaskId}/status`,
        { status: taskStatus, progress, evidence },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTaskId('');
      setTaskStatus('pending');
      setProgress(0);
      setEvidence('');
      setRefreshKey((prev) => prev + 1);
      alert('✅ Task updated!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to update task'));
    }
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/member/evidence',
        evidenceForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvidenceForm({
        taskId: '',
        title: '',
        notes: '',
        fileUrl: '',
        fileName: '',
        fileType: ''
      });
      setRefreshKey((prev) => prev + 1);
      alert('✅ Evidence submitted!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save evidence');
    }
  };


  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/member/login';
  };
const handleKpiChange = (e) => {
  setKpiForm({ ...kpiForm, [e.target.name]: e.target.value });
};

const handleSubmit = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/kpi/member/submit-kpi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskTitle: kpiForm.taskTitle,
        description: kpiForm.description,
        progress: kpiForm.Progress,
        startDate: kpiForm.startDate,
        endDate: kpiForm.endDate,
        totalHours: kpiForm.totalHours,
        submittedBy: memberName,
        submittedAt: new Date(),
        status: "Pending Approval"
      }),
      
    });

    const text = await res.text(); 
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);

    if (!res.ok) {
      throw new Error(text);
    }

    alert("KPI Submitted Successfully");
  } catch (err) {
    console.error("FULL ERROR:", err);
    alert("Error Task Performance submitting");
  }
};



const submit = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("member"));

    console.log("USER:", user);
    console.log("FORM:", kpiForm);
    
    const formData = new FormData();
    
    // =========================
    // BASIC INFO
    // =========================

    formData.append("employeeId", user?.employeeId || "EMP001");
    formData.append("name", user?.name || "Unknown");
    
    
    // =========================
    // KPI FORM DATA
    // =========================

    Object.keys(kpiForm).forEach((key) => {
      formData.append(key, kpiForm[key]);
    });

    // =========================
    // FILE
    // =========================

    if (proofFile) {
      formData.append("proofFile", proofFile);
    }

    const res = await axios.post(
      "http://localhost:5000/api/kpi/member/submit-kpi",
      formData,
      {
        headers: {
          
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    console.log("SUCCESS:", res.data);

    alert("✅ Task Performance submitted successfully");

  } catch (err) {
    console.log("❌ FRONTEND ERROR:", err.response?.data); // 👈 IMPORTANT
    alert("Error Task Performance submitting");
  }
};


  const member = data.member || {};

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status?.toLowerCase() === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status?.toLowerCase() === 'pending').length;
  const avgProgress = totalTasks
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks)
    : 0;

  const isDark = theme === 'dark';

  const pageClass = isDark
    ? 'flex min-h-screen bg-slate-950 text-slate-100'
    : 'flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900';

  const cardClass = isDark
    ? 'bg-slate-900 border border-slate-800 text-slate-100'
    : 'bg-white text-gray-900';

  const mutedText = isDark ? 'text-slate-400' : 'text-gray-500';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={pageClass}>
      <aside className={isDark ? 'w-64 bg-slate-900 text-white border-r border-slate-800' : 'w-64 bg-gradient-to-b from-indigo-700 via-purple-800 to-indigo-900 text-white'}>
        <div className="h-16 flex items-center justify-center border-b border-white/20 font-bold">
          Member Portal
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          {['dashboard', 'tasks', 'evidence', 'profile'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                activeSection === item ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        {activeSection === 'dashboard' && (
  <div className="space-y-8">

    {/* DASHBOARD CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 shadow-xl">
        <p className="text-sm uppercase tracking-widest text-white/70">
          Total Tasks
        </p>

        <div className="mt-3 text-4xl font-bold">
          {totalTasks}
        </div>

        <div className="mt-4 h-2 rounded-full bg-white/20">
          <div
            className="h-2 rounded-full bg-white"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-xl">
        <p className="text-sm uppercase tracking-widest text-white/70">
          Completed
        </p>

        <div className="mt-3 text-4xl font-bold">
          {completedTasks}
        </div>

        <p className="mt-3 text-white/80">
          Tasks finished successfully
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 shadow-xl">
        <p className="text-sm uppercase tracking-widest text-white/70">
          Pending
        </p>

        <div className="mt-3 text-4xl font-bold">
          {pendingTasks}
        </div>

        <p className="mt-3 text-white/80">
          Waiting for update
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white p-6 shadow-xl">
        <p className="text-sm uppercase tracking-widest text-white/70">
          Avg Progress
        </p>

        <div className="mt-3 text-4xl font-bold">
          {avgProgress}%
        </div>

        <p className="mt-3 text-white/80">
          Overall completion
        </p>
      </div>

    </div>

    {/* KPI BUTTON */}
    <div className="flex justify-end">

      <button
        onClick={() => setShowKpi(!showKpi)}
        className={`px-8 py-4 rounded-xl font-semibold text-white shadow-xl transition ${
          showKpi
            ? "bg-red-600 hover:bg-red-700"
            : "bg-slate-800 hover:bg-black"
        }`}
      >
        {showKpi ? "Close KPI Form" : "Open KPI Submission"}
      </button>

    </div>

    {/* FULL WIDTH KPI FORM */}
    {/* FULL WIDTH KPI FORM */}
{showKpi && (

  <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700">

    {/* HEADER */}
    <div className="bg-slate-800 text-white px-10 py-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold">
            Key Performance Indicator (KPI)
          </h2>

          <p className="text-slate-300 mt-2">
            Government Employee Performance Evaluation Portal
          </p>
        </div>

        <div className="bg-white/10 px-6 py-3 rounded-xl">
          <p className="text-sm text-slate-300">
            Approval Status
          </p>

          <p className="text-xl font-bold text-yellow-400">
            Pending Approval
          </p>
        </div>

      </div>

    </div>

    {/* FORM BODY */}
    <div className="p-10">

      {/* EMPLOYEE INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Employee Name
          </p>

          <p className="text-xl font-bold mt-2">
            {memberName || "N/A"}
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Submission Date
          </p>

          <p className="text-xl font-bold mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Evaluation Cycle
          </p>

          <p className="text-xl font-bold mt-2">
            Monthly KPI Review
          </p>
        </div>

      </div>

<div>

  <label className="block mb-2 font-semibold">
    Task Title
  </label>

  <input
    type="text"
    name="taskTitle"
    value={kpiForm.taskTitle}
    onChange={handleKpiChange}
    placeholder="Enter Task Title"
    className="w-full p-4 border rounded-2xl bg-transparent"
  />

</div>
      {/* STAFF CATEGORY */}
      <div className="mb-10">

        <label className="block mb-3 text-lg font-bold">
          Staff Category
        </label>

        <select
          name="category"
          value={kpiForm.category}
          onChange={handleKpiChange}
          className="w-full md:w-1/2 p-4 border rounded-2xl bg-transparent"
        >
          <option value="">Select Category</option>

          <option value="hq_staff">
            Headquarters Staff
          </option>

          <option value="field_engineer">
            Field Engineer
          </option>
        </select>

      </div>

      {/* ================= HEADQUARTERS KPI ================= */}
      {kpiForm.category === "hq_staff" && (

        <div className="space-y-8">

          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold">
              Headquarters Staff KPI Assessment
            </h2>

            <p className="text-gray-500 mt-2">
              Administrative performance evaluation indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div>
              <label className="block mb-2 font-semibold">
                File Disposal Rate (%)
              </label>

              <input
                type="number"
                name="fileDisposalRate"
                value={kpiForm.fileDisposalRate || ""}
                onChange={handleKpiChange}
                placeholder="Enter disposal rate"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Turnaround Time (Days)
              </label>

              <input
                type="number"
                name="turnaroundTime"
                value={kpiForm.turnaroundTime || ""}
                onChange={handleKpiChange}
                placeholder="Average turnaround time"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Quality of Drafting (%)
              </label>

              <input
                type="number"
                name="draftingQuality"
                value={kpiForm.draftingQuality || ""}
                onChange={handleKpiChange}
                placeholder="Drafting quality score"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Responsiveness Score (%)
              </label>

              <input
                type="number"
                name="responsiveness"
                value={kpiForm.responsiveness || ""}
                onChange={handleKpiChange}
                placeholder="Responsiveness score"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Digital Adoption (%)
              </label>

              <input
                type="number"
                name="digitalAdoption"
                value={kpiForm.digitalAdoption || ""}
                onChange={handleKpiChange}
                placeholder="Digital adoption percentage"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

          </div>

        </div>
      )}

      {/* ================= FIELD UNIT KPI ================= */}
      {kpiForm.category === "field_engineer" && (

        <div className="space-y-8">

          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold">
              Field Unit KPI Assessment
            </h2>

            <p className="text-gray-500 mt-2">
              Field project execution and monitoring indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div>
              <label className="block mb-2 font-semibold">
                DPR Preparation Timeliness (%)
              </label>

              <input
                type="number"
                name="dprTimeliness"
                value={kpiForm.dprTimeliness || ""}
                onChange={handleKpiChange}
                placeholder="DPR preparation timeliness"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Survey Accuracy (%)
              </label>

              <input
                type="number"
                name="surveyAccuracy"
                value={kpiForm.surveyAccuracy || ""}
                onChange={handleKpiChange}
                placeholder="Survey accuracy"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Adherence to Project Timelines (%)
              </label>

              <input
                type="number"
                name="timelineAdherence"
                value={kpiForm.timelineAdherence || ""}
                onChange={handleKpiChange}
                placeholder="Timeline adherence"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Expenditure vs Financial Targets (%)
              </label>

              <input
                type="number"
                name="financialTargets"
                value={kpiForm.financialTargets || ""}
                onChange={handleKpiChange}
                placeholder="Financial targets achievement"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Physical Progress of Works (%)
              </label>

              <input
                type="number"
                name="physicalProgress"
                value={kpiForm.physicalProgress || ""}
                onChange={handleKpiChange}
                placeholder="Physical progress"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Compliance with Technical Standards (%)
              </label>

              <input
                type="number"
                name="technicalCompliance"
                value={kpiForm.technicalCompliance || ""}
                onChange={handleKpiChange}
                placeholder="Technical compliance"
                className="w-full p-4 border rounded-2xl bg-transparent"
              />
            </div>

          </div>

        </div>
      )}

      {/* GENERAL REMARKS */}
      <div className="mt-10">

        <label className="block mb-3 text-lg font-bold">
          General Remarks / Notes
        </label>

        <textarea
          name="remarks"
          value={kpiForm.remarks || ""}
          onChange={handleKpiChange}
          rows="5"
          placeholder="Enter remarks or supporting notes..."
          className="w-full p-4 border rounded-2xl bg-transparent"
        />

              {/* FILE UPLOAD */}

          <div className="mt-8">

              <label className="block mb-3 text-lg font-bold">
                Upload Work Proof
              </label>

              <input
                type="file"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="w-full p-4 border rounded-2xl bg-transparent"
              />

              <p className="text-sm text-gray-500 mt-2">
                Upload PDF, Image, Excel, DPR Report, Site Photo etc.
              </p>

          </div>
        </div>
      
      {/* ACTION BUTTON */}
      <div className="mt-10 flex justify-end">

        <button
          onClick={submit}
          className="bg-slate-800 hover:bg-black text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl transition"
        >
          Submit KPI Assessment
        </button>

      </div>

    </div>

  </div>
)}

  </div>
)}
          

        {activeSection === 'tasks' && (
          <div className="space-y-6">
            <div className={`${cardClass} rounded-2xl p-6 shadow`}>
              <h2 className="text-2xl font-bold mb-4">Update Task Status</h2>
              <form onSubmit={handleTaskUpdate} className="space-y-4">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-transparent"
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </select>

                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl bg-transparent"
                  placeholder="Progress %"
                />

                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-transparent"
                  placeholder="Evidence / remarks"
                />

                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl">
                  Save Task Update
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className={`${cardClass} rounded-2xl p-6 shadow`}>
                    <h4 className="text-xl font-semibold">{task.title}</h4>
                    <p className={mutedText}>{task.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <p className={mutedText}>Project</p>
                        <p className="font-semibold">{task.projectId?.name || 'NA'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <p className={mutedText}>Department</p>
                        <p className="font-semibold">{task.departmentId?.name || 'NA'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <p className="font-medium">Status: {task.status}</p>
                      <p>{task.progress || 0}% complete</p>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 my-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${cardClass} rounded-2xl p-6 shadow col-span-full`}>
                  No tasks assigned yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'evidence' && (
  <div className={`${cardClass} rounded-2xl p-6 shadow`}>

    <h2 className="text-2xl font-bold mb-4">Evidence</h2>

    {/* ================= EVIDENCE FORM ================= */}
    <form onSubmit={handleEvidenceSubmit} className="space-y-4">

      {/* Task Select */}
      <select
        value={evidenceForm.taskId}
        onChange={(e) =>
          setEvidenceForm({ ...evidenceForm, taskId: e.target.value })
        }
        className="w-full p-3 border rounded-xl bg-transparent"
        required
      >
        <option value="">Select Task</option>
        {tasks.map((task) => (
          <option key={task._id} value={task._id}>
            {task.title}
          </option>
        ))}
      </select>

      {/* Title */}
      <input
        type="text"
        placeholder="Evidence Title"
        value={evidenceForm.title}
        onChange={(e) =>
          setEvidenceForm({ ...evidenceForm, title: e.target.value })
        }
        className="w-full p-3 border rounded-xl bg-transparent"
      />

      {/* Notes */}
      <textarea
        placeholder="Notes"
        value={evidenceForm.notes}
        onChange={(e) =>
          setEvidenceForm({ ...evidenceForm, notes: e.target.value })
        }
        className="w-full p-3 border rounded-xl bg-transparent"
      />

      {/* ✅ FILE UPLOAD (REPLACED URL INPUTS) */}
      <input
        type="file"
        onChange={(e) =>
          setEvidenceForm({ ...evidenceForm, file: e.target.files[0] })
        }
        className="w-full p-3 border rounded-xl bg-transparent"
      />

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition"
      >
        Submit Evidence
      </button>
    </form>

    {/* 🔽 SPACE BETWEEN SECTIONS */}
    <div className="my-8 border-t border-gray-300 dark:border-gray-700"></div>

    {/* ================= KPI FORM ================= */}
    <div className="p-6 bg-white/70 dark:bg-slate-900/60 rounded-xl shadow backdrop-blur-md">

      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Task Performance Submission
      </h2>

      {/* Task Title */}
      <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
        Task Title
      </label>
      <input
        name="taskTitle"
        value={kpiForm.taskTitle}
        placeholder="Task Title"
        onChange={handleKpiChange}
        className="w-full p-2 mb-2 border rounded bg-transparent text-black dark:text-white"
      />

      {/* Description */}
      <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
        Task Description
      </label>
      <input
        name="description"
        value={kpiForm.description}
        placeholder="Description"
        onChange={handleKpiChange}
        className="w-full p-2 mb-2 border rounded bg-transparent text-black dark:text-white"
      />

      {/* Progress */}
      <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
        Work Progress (%)
      </label>
      <input
        name="progress"
        type="number"
        value={kpiForm.progress}
        placeholder="Progress %"
        onChange={handleKpiChange}
        className="w-full p-2 mb-2 border rounded bg-transparent text-black dark:text-white"
      />

      {/* Dates */}
      <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
        Start Date
      </label>
      <input
        name="startDate"
        type="date"
        value={kpiForm.startDate}
        onChange={handleKpiChange}
        className="w-full p-2 mb-2 border rounded bg-transparent text-black dark:text-white"
      />

      <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
        End Date
      </label>
      <input
        name="endDate"
        type="date"
        value={kpiForm.endDate}
        onChange={handleKpiChange}
        className="w-full p-2 mb-2 border rounded bg-transparent text-black dark:text-white"
      />

      {/* Hours */}
      <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
        Total Hours Worked
      </label>
      <input
        name="hoursWorked"
        type="number"
        value={kpiForm.hoursWorked}
        placeholder="Hours Worked"
        onChange={handleKpiChange}
        className="w-full p-2 mb-4 border rounded bg-transparent text-black dark:text-white"
      />

      <button
        onClick={submit}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
      >
        Submit KPI
      </button>

    </div>

  </div>
)}
          


        {activeSection === 'profile' && (
          <div className={`${cardClass} rounded-3xl p-8 shadow-2xl max-w-5xl`}>
            <h3 className="text-2xl font-bold mb-6">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Name</p>
                <p className="font-semibold">{member.name || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Email</p>
                <p className="font-semibold">{member.email || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Department</p>
                <p className="font-semibold">{member.departmentId?.name || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Project</p>
                <p className="font-semibold">{member.projectId?.name || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Role</p>
                <p className="font-semibold">{member.role || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Current Progress</p>
                <p className="font-semibold">{avgProgress}%</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}