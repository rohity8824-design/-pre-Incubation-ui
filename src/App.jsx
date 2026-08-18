import "./styles.css";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BASE_URL = "https://pre-incubation-backend.onrender.com";

export default function App() {
  // State to check URL parameter: detects ?view=form
  const [isFormOnly, setIsFormOnly] = useState(false);

  // --- AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    address: "",
    contactNumber: "",
    nativeState: "",
    highestQualification: "",
    professionalExperience: "",
    startupName: "",
    companyType: "",
    incorporationDate: "",
    cin: "",
    officeAddress: "",
    gstNumber: "",
    dpiitNumber: "",
    sector: "",
    startupStage: "",
    problemStatement: "",
    valueProposition: "",
    usp: "",
    targetCustomer: "",
    competitors: "",
    scaleUpPlan: "",
    revenueModel: "",
    marketSize: "",
    websiteUrl: "",
    socialMediaLinks: "",
    videoUrl: "",
    govtSupport: "",
    seedSupport: "",
    founderName: "",
    coFounderName: "",
    teamEmails: "",
    teamContacts: "",
    linkedinProfiles: "",
    fullTimeEmployees: "",
    whyApplying: "",
    expectations: "",
    fundsRequired: "",
    fundingRequirement: "",
  });

  const [files, setFiles] = useState({
    pitchDeck: null,
    resume: null,
    panCard: null,
    certificate: null,
    businessPlan: null,
    otherDocument: null,
    passportPhoto: null,
  });

  // Draft auto-save: load any saved draft once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("preIncubationDraftV1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {}
  }, []);

  // Draft auto-save: save formData to localStorage as the person types
  useEffect(() => {
    try {
      localStorage.setItem("preIncubationDraftV1", JSON.stringify(formData));
    } catch (e) {}
  }, [formData]);

  const [startups, setStartups] = useState([]);
  const [startupSearch, setStartupSearch] = useState("");
  const [startupSectorFilter, setStartupSectorFilter] = useState("");
  const [startupStatusFilter, setStartupStatusFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewingStartup, setViewingStartup] = useState(null);
  const [pitchingStartup, setPitchingStartup] = useState(null);
  const [pitchForm, setPitchForm] = useState({ pitch_date: "", pitch_time: "", pitch_link: "" });
  const [activeView, setActiveView] = useState("preincubation");
  const [incubationForm, setIncubationForm] = useState({
    startupName: "", email: "", mobileNo: "", state: "", city: "",
    sector: "", incubateeLevel: "", typeOfProgram: [], operationalModel: "",
    govtProgramme: "", msmeRegistered: "", dippRegistered: "", sdgGoals: "", description: "",
  });
  const [incubationPPT, setIncubationPPT] = useState(null);
  const [isSubmittingIncubation, setIsSubmittingIncubation] = useState(false);
  const [incubationApplications, setIncubationApplications] = useState([]);
  const [incubationSearch, setIncubationSearch] = useState("");
  const [incubationSectorFilter, setIncubationSectorFilter] = useState("");
  const [incubationLevelFilter, setIncubationLevelFilter] = useState("");
  const [showIncubationEvalSheet, setShowIncubationEvalSheet] = useState(false);
  const [showEvaluatorsListModal, setShowEvaluatorsListModal] = useState(false);
  const [showCombinedReport, setShowCombinedReport] = useState(false);
  const combinedReportPrintRef = useRef(null);
  const [evaluatorsListApp, setEvaluatorsListApp] = useState(null);
  const [evaluatorsList, setEvaluatorsList] = useState([]);
  const [loadingEvaluators, setLoadingEvaluators] = useState(false);

  // --- INCUBATED STARTUPS RECORDS: unified Startup Detail form + Documents ---
  const [startupCrmList, setStartupCrmList] = useState([]);
  const [documentRepoList, setDocumentRepoList] = useState([]);
  const [isSavingCrmRecord, setIsSavingCrmRecord] = useState(false);

  const blankIncubatedForm = {
    startupId: "", startupName: "", founder: "", coFounder: "", email: "",
    phone: "", website: "", linkedin: "", startupIndiaNumber: "", dpiitNumber: "", cin: "",
    pan: "", sector: "", subSector: "", technology: "", trlLevel: "",
    incubationStage: "", currentStatus: "", revenue: "", valuation: "", investmentRaised: "",
    assignedMentor: "", assignedRm: "", currentMilestone: "", riskScore: "", city: "", address: "", remarks: "",
  };
  const [incubatedForm, setIncubatedForm] = useState(blankIncubatedForm);
  const [startupPhotoFile, setStartupPhotoFile] = useState(null);

  const blankDocumentRepoFiles = {
    pitchDeck: null, pan: null, gst: null, mou: null, aoa: null, startupIndia: null,
    bankStatement: null, ip: null, agreements: null, reports: null, funding: null,
    investorDeck: null, meetingMinutes: null,
  };
  const [documentRepoFiles, setDocumentRepoFiles] = useState(blankDocumentRepoFiles);
  const [viewingStartupCrmRecord, setViewingStartupCrmRecord] = useState(null);

  const [incubationEvalId, setIncubationEvalId] = useState(null);
  const [incubationEvalForm, setIncubationEvalForm] = useState({
    companyName: "", date: "", evaluatorName: "", industry: "", stage: "", ask: "", briefDescription: "",
    scores: {
      targetMarket: "", problemNeed: "", solution: "", team: "", traction: "",
      competition: "", revenueModel: "", strategy: "", financialProjections: "",
      exitOpportunity: "", investmentTerms: "", overallPresentation: "",
    },
    comments: {
      targetMarket: "", problemNeed: "", solution: "", team: "", traction: "",
      competition: "", revenueModel: "", strategy: "", financialProjections: "",
      exitOpportunity: "", investmentTerms: "", overallPresentation: "",
    },
    nextSteps: "", nameDesignation: "", evaluatorSignature: "",
  });
  const [evaluatingStartup, setEvaluatingStartup] = useState(null);
  const [evalForm, setEvalForm] = useState({
    founderNames: "", date: "",
    scores: { businessPlan: "", mvp: "", marketResearch: "", innovation: "", investmentStrategy: "", scalability: "", technicalFeasibility: "", revenueStrategy: "", skillsOfTeam: "" },
    observations: { businessPlan: "", mvp: "", marketResearch: "", innovation: "", investmentStrategy: "", scalability: "", technicalFeasibility: "", revenueStrategy: "", skillsOfTeam: "" },
    finalRecommendation: "", reasons: "", evaluatorName: "", evaluatorSignature: "",
  });
  const evalPrintRef = useRef(null);
  const reportRef = useRef(null);
  const modalBodyRef = useRef(null);
  const printRef = useRef(null);
  const incubationEvalPrintRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "form") {
      setIsFormOnly(true);
      setCheckingAuth(false);
    } else {
      setIsFormOnly(false);
      fetch(`${BASE_URL}/check-auth`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setIsLoggedIn(data.logged_in);
          setCheckingAuth(false);
          if (data.logged_in) {
            fetchStartups();
          }
        })
        .catch(() => setCheckingAuth(false));
    }
  }, []);

  const fetchStartups = async () => {
    try {
      const response = await fetch(`${BASE_URL}/startups`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setStartups(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("Connecting to server...");

    const tryLogin = async (attempt = 1) => {
      try {
        const res = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginForm),
        });
        const result = await res.json();
        if (res.ok) {
          setIsLoggedIn(true);
          setLoginError("");
          fetchStartups();
        } else {
          setLoginError(result.error || "Login failed");
        }
      } catch (err) {
        if (attempt < 3) {
          setLoginError(`Server is waking up, retrying... (${attempt}/3)`);
          setTimeout(() => tryLogin(attempt + 1), 4000);
        } else {
          setLoginError("Connection error. Please try again in a moment.");
        }
      }
    };

    tryLogin();
  };

  const updateStatus = async (id, status) => {
    setActionLoadingId(id);
    try {
      const response = await fetch(`${BASE_URL}/update-status/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status }),
      });
      if (!response.ok) {
        const errData = await response.json();
        alert(errData.error || "Status Update Failed");
      }
      await fetchStartups();
    } catch (error) {
      console.log(error);
      alert("Status Update Failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSavePDF = async () => {
    const element = printRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      ignoreElements: (el) => el.classList && el.classList.contains('no-print')
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${viewingStartup.startupName || "startup"}_application.pdf`);
  };

  const fetchIncubationApplications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/incubation-applications`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setIncubationApplications(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // --- INCUBATED STARTUPS RECORDS ---
  const fetchStartupCrm = async () => {
    try {
      const response = await fetch(`${BASE_URL}/startup-crm`, { credentials: "include" });
      if (response.ok) setStartupCrmList(await response.json());
    } catch (error) { console.log(error); }
  };

  const fetchDocumentRepo = async () => {
    try {
      const response = await fetch(`${BASE_URL}/document-repository`, { credentials: "include" });
      if (response.ok) setDocumentRepoList(await response.json());
    } catch (error) { console.log(error); }
  };

  const fetchAllIncubatedRecords = async () => {
    await Promise.all([fetchStartupCrm(), fetchDocumentRepo()]);
  };

  const saveIncubatedRecord = async () => {
    if (isSavingCrmRecord) return;
    if (!incubatedForm.startupName.trim()) {
      alert("Please enter the Startup Name before saving.");
      return;
    }
    setIsSavingCrmRecord(true);
    try {
      // Save Startup Detail record (multipart, includes optional photo)
      const startupData = new FormData();
      Object.keys(incubatedForm).forEach((key) => startupData.append(key, incubatedForm[key]));
      if (startupPhotoFile) startupData.append("logo", startupPhotoFile);
      await fetch(`${BASE_URL}/startup-crm`, {
        method: "POST", credentials: "include", body: startupData,
      });

      // Save Document Repository record only if at least one file was chosen
      const hasAnyFile = Object.values(documentRepoFiles).some((f) => f);
      if (hasAnyFile) {
        const data = new FormData();
        data.append("startup", incubatedForm.startupName);
        Object.keys(documentRepoFiles).forEach((key) => {
          if (documentRepoFiles[key]) data.append(key, documentRepoFiles[key]);
        });
        await fetch(`${BASE_URL}/document-repository`, {
          method: "POST", credentials: "include", body: data,
        });
      }

      alert("Record saved successfully!");
      setIncubatedForm(blankIncubatedForm);
      setStartupPhotoFile(null);
      setDocumentRepoFiles(blankDocumentRepoFiles);
      await fetchAllIncubatedRecords();
    } catch (error) {
      alert("Connection error while saving record");
    } finally {
      setIsSavingCrmRecord(false);
    }
  };

  const handleIncubationChange = (e) => {
    setIncubationForm({ ...incubationForm, [e.target.name]: e.target.value });
  };

  const handleIncubationCheckbox = (value) => {
    setIncubationForm((prev) => {
      const exists = prev.typeOfProgram.includes(value);
      const updated = exists ? prev.typeOfProgram.filter((v) => v !== value) : [...prev.typeOfProgram, value];
      return { ...prev, typeOfProgram: updated };
    });
  };

  const handleIncubationSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingIncubation) return;

    if (incubationForm.email) {
      try {
        const dupCheck = await fetch(`${BASE_URL}/check-duplicate/incubation?email=${encodeURIComponent(incubationForm.email)}`);
        const dupResult = await dupCheck.json();
        if (dupResult.exists) {
          const proceed = window.confirm("This email has already submitted an Incubation application. Submit another one anyway?");
          if (!proceed) return;
        }
      } catch (e) {}
    }

    setIsSubmittingIncubation(true);
    try {
      const data = new FormData();
      Object.keys(incubationForm).forEach((key) => {
        if (key === "typeOfProgram") {
          data.append(key, incubationForm.typeOfProgram.join(", "));
        } else {
          data.append(key, incubationForm[key]);
        }
      });
      if (incubationPPT) data.append("pptFile", incubationPPT);

      const response = await fetch(`${BASE_URL}/register-incubation`, {
        method: "POST",
        credentials: "include",
        body: data,
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setIncubationEvalId(result.id || null);
        setIncubationForm({
          startupName: "", email: "", mobileNo: "", state: "", city: "",
          sector: "", incubateeLevel: "", typeOfProgram: [], operationalModel: "",
          govtProgramme: "", msmeRegistered: "", dippRegistered: "", sdgGoals: "", description: "",
        });
        setIncubationPPT(null);
        if (isLoggedIn) await fetchIncubationApplications();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Backend Connection Error");
    } finally {
      setIsSubmittingIncubation(false);
    }
  };

  const blankIncubationEvalForm = (app) => ({
    companyName: app?.startupName || "", date: new Date().toISOString().split("T")[0],
    evaluatorName: "", industry: app?.sector || "", stage: app?.incubateeLevel || "",
    ask: "", briefDescription: app?.description || "",
    scores: {
      targetMarket: "", problemNeed: "", solution: "", team: "", traction: "",
      competition: "", revenueModel: "", strategy: "", financialProjections: "",
      exitOpportunity: "", investmentTerms: "", overallPresentation: "",
    },
    comments: {
      targetMarket: "", problemNeed: "", solution: "", team: "", traction: "",
      competition: "", revenueModel: "", strategy: "", financialProjections: "",
      exitOpportunity: "", investmentTerms: "", overallPresentation: "",
    },
    nextSteps: "", nameDesignation: "", evaluatorSignature: "",
  });

  const fetchEvaluatorsForApp = async (appId) => {
    setLoadingEvaluators(true);
    try {
      const response = await fetch(`${BASE_URL}/incubation-evaluations/${appId}`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setEvaluatorsList(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEvaluators(false);
    }
  };

  const openEvaluatorsList = async (app) => {
    setEvaluatorsListApp(app);
    setShowEvaluatorsListModal(true);
    await fetchEvaluatorsForApp(app.id);
  };

  const startNewEvaluation = () => {
    setIncubationEvalForm(blankIncubationEvalForm(evaluatorsListApp));
    setIncubationEvalId(evaluatorsListApp.id);
    setShowEvaluatorsListModal(false);
    setShowIncubationEvalSheet(true);
  };

  const editEvaluatorEntry = (entry) => {
    let parsed = null;
    try { parsed = JSON.parse(entry.evaluation_data); } catch (e) { parsed = null; }
    setIncubationEvalForm(parsed || blankIncubationEvalForm(evaluatorsListApp));
    setIncubationEvalId(evaluatorsListApp.id);
    setShowEvaluatorsListModal(false);
    setShowIncubationEvalSheet(true);
  };

  const deleteEvaluatorEntry = async (entry) => {
    if (!window.confirm(`Delete ${entry.evaluator_name}'s evaluation? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${BASE_URL}/delete-incubation-evaluation/${entry.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        await fetchEvaluatorsForApp(evaluatorsListApp.id);
        if (isLoggedIn) await fetchIncubationApplications();
      } else {
        alert("Failed to delete evaluation");
      }
    } catch (error) {
      alert("Connection error");
    }
  };

  const getEntryScore = (entry) => {
    try {
      const parsed = JSON.parse(entry.evaluation_data);
      return Object.values(parsed.scores || {}).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
    } catch (e) {
      return 0;
    }
  };

  const getIncubationAppScoreDisplay = (app) => {
    if (!app.eval_count) return "—";
    return `${app.eval_avg} / 60 (${app.eval_count})`;
  };

  const startupCrmLabels = [
    ["startup_id", "Startup ID"], ["startup_name", "Startup Name"],
    ["founder", "Founder Name"], ["co_founder", "Co-Founder Name"], ["email", "Email"],
    ["phone", "Phone"], ["website", "Website"], ["linkedin", "LinkedIn"],
    ["startup_india_number", "Startup India Number"], ["dpiit_number", "DPIIT Number"], ["cin", "CIN"],
    ["pan", "PAN"], ["sector", "Sector"],
    ["sub_sector", "Sub Sector"], ["technology", "Technology"], ["trl_level", "TRL Level"],
    ["incubation_stage", "Incubation Stage"], ["current_status", "Number of Employees"], ["revenue", "Revenue"],
    ["valuation", "Valuation"], ["investment_raised", "Investment Raised"],
    ["assigned_mentor", "Assigned Mentor"], ["assigned_rm", "Stage"], ["current_milestone", "Success Story"],
    ["risk_score", "Risk Score"], ["city", "City"], ["address", "Address"],
    ["remarks", "Remarks"], ["created_at", "Added On"],
  ];

  const documentRepoColumns = [
    { key: "pitch_deck", label: "Pitch Deck" },
    { key: "pan", label: "PAN" },
    { key: "gst", label: "GST" },
    { key: "mou", label: "MOU" },
    { key: "aoa", label: "Product Pick" },
    { key: "startup_india", label: "Startup India" },
    { key: "bank_statement", label: "Bank Statement" },
    { key: "ip", label: "IP" },
    { key: "agreements", label: "Agreements" },
    { key: "reports", label: "Reports" },
    { key: "funding", label: "Funding" },
    { key: "investor_deck", label: "Investor Deck" },
    { key: "meeting_minutes", label: "Meeting Minutes" },
  ];

  const exportStartupCrmToExcel = () => {
    if (startupCrmList.length === 0) {
      alert("No records to export yet.");
      return;
    }
    const headers = startupCrmLabels.map(([, label]) => label);
    const keys = startupCrmLabels.map(([key]) => key);
    const csvRows = [headers.join(",")];
    startupCrmList.forEach((record) => {
      const row = keys.map((key) => {
        const val = (record[key] || "").toString().replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(row.join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `startup_detail_records_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const combinedReportCriteria = [
    { key: "targetMarket", label: "Target Market" },
    { key: "problemNeed", label: "Problem/Need" },
    { key: "solution", label: "Solution" },
    { key: "team", label: "Team" },
    { key: "traction", label: "Traction" },
    { key: "competition", label: "Competition" },
    { key: "revenueModel", label: "Revenue Model" },
    { key: "strategy", label: "Strategy" },
    { key: "financialProjections", label: "Financials" },
    { key: "exitOpportunity", label: "Exit Opp." },
    { key: "investmentTerms", label: "Inv. Terms" },
    { key: "overallPresentation", label: "Presentation" },
  ];

  const getParsedEvaluators = () => {
    return evaluatorsList.map((entry) => {
      let parsed = null;
      try { parsed = JSON.parse(entry.evaluation_data); } catch (e) { parsed = null; }
      const scores = (parsed && parsed.scores) || {};
      const total = combinedReportCriteria.reduce((sum, c) => sum + (parseInt(scores[c.key]) || 0), 0);
      return { evaluatorName: entry.evaluator_name, scores, total, updatedAt: entry.updated_at };
    });
  };

  const renderRadarChart = () => {
    const evals = getParsedEvaluators();
    if (evals.length === 0) return null;

    const avgScores = combinedReportCriteria.map((c) => {
      const vals = evals.map((ev) => parseInt(ev.scores[c.key]) || 0).filter((v, idx) => evals[idx].scores[c.key]);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });

    const numAxes = combinedReportCriteria.length;
    const center = 150;
    const maxRadius = 100;
    const angleStep = (2 * Math.PI) / numAxes;

    const pointFor = (val, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (val / 5) * maxRadius;
      return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    };

    const polygonPoints = avgScores.map((val, i) => pointFor(val, i).join(",")).join(" ");

    const rings = [1, 2, 3, 4, 5].map((level) =>
      combinedReportCriteria.map((c, i) => pointFor(level, i).join(",")).join(" ")
    );

    const axisLines = combinedReportCriteria.map((c, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x2 = center + maxRadius * Math.cos(angle);
      const y2 = center + maxRadius * Math.sin(angle);
      const labelX = center + (maxRadius + 26) * Math.cos(angle);
      const labelY = center + (maxRadius + 26) * Math.sin(angle);
      return { x2, y2, labelX, labelY, label: c.label };
    });

    return (
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ display: "block", margin: "0 auto" }}>
        {rings.map((ring, i) => (
          <polygon key={i} points={ring} fill="none" stroke="#E5E5F0" strokeWidth="1" />
        ))}
        {axisLines.map((a, i) => (
          <line key={i} x1={center} y1={center} x2={a.x2} y2={a.y2} stroke="#E5E5F0" strokeWidth="1" />
        ))}
        <polygon points={polygonPoints} fill="#6C5CE7" fillOpacity="0.35" stroke="#6C5CE7" strokeWidth="2" />
        {axisLines.map((a, i) => (
          <text key={i} x={a.labelX} y={a.labelY} fontSize="8" fill="#686B85" textAnchor="middle" dominantBaseline="middle">{a.label}</text>
        ))}
      </svg>
    );
  };

  const handleSaveCombinedReportPDF = async () => {
    const element = combinedReportPrintRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, ignoreElements: (el) => el.classList && el.classList.contains('no-print') });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${evaluatorsListApp?.startupName || "startup"}_combined_report.pdf`);
  };

  const handleIncubationEvalScoreChange = (param, value) => {
    setIncubationEvalForm({ ...incubationEvalForm, scores: { ...incubationEvalForm.scores, [param]: value } });
  };

  const handleIncubationEvalCommentChange = (param, value) => {
    setIncubationEvalForm({ ...incubationEvalForm, comments: { ...incubationEvalForm.comments, [param]: value } });
  };

  const getIncubationEvalTotal = () => {
    return Object.values(incubationEvalForm.scores).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
  };

  const saveIncubationEvaluation = async () => {
    if (!incubationEvalId) {
      alert("No application linked to this evaluation sheet — open it via the Evaluations button on a specific application.");
      return;
    }
    if (!incubationEvalForm.evaluatorName || !incubationEvalForm.evaluatorName.trim()) {
      alert("Please enter your name in 'Evaluator Name' before saving — this is how each evaluator's entry is kept separate.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/save-incubation-evaluation/${incubationEvalId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incubationEvalForm),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Evaluation saved successfully!");
        if (isLoggedIn) await fetchIncubationApplications();
      } else {
        alert(result.error || "Failed to save evaluation");
      }
    } catch (error) {
      alert("Connection error");
    }
  };

  const handleSaveIncubationEvalPDF = async () => {
    const element = incubationEvalPrintRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      ignoreElements: (el) => el.classList && el.classList.contains('no-print'),
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${incubationEvalForm.companyName || "evaluation"}_evaluation_sheet.pdf`);
  };

  const openPitchModal = (startup) => {
    setPitchingStartup(startup);
    setPitchForm({
      pitch_date: startup.pitch_date || "",
      pitch_time: startup.pitch_time || "",
      pitch_link: startup.pitch_link || "",
    });
  };

  const savePitchDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/update-pitching/${pitchingStartup.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pitchForm),
      });
      if (response.ok) {
        setPitchingStartup(null);
        await fetchStartups();
      } else {
        alert("Failed to save pitching details");
      }
    } catch (error) {
      alert("Connection error");
    }
  };

  const openEvaluationModal = (startup) => {
    setEvaluatingStartup(startup);
    let existing = null;
    if (startup.evaluation_data) {
      try { existing = JSON.parse(startup.evaluation_data); } catch (e) { existing = null; }
    }
    if (existing) {
      setEvalForm(existing);
    } else {
      setEvalForm({
        founderNames: startup.founderName || startup.name || "",
        date: new Date().toISOString().split("T")[0],
        scores: { businessPlan: "", mvp: "", marketResearch: "", innovation: "", investmentStrategy: "", scalability: "", technicalFeasibility: "", revenueStrategy: "", skillsOfTeam: "" },
        observations: { businessPlan: "", mvp: "", marketResearch: "", innovation: "", investmentStrategy: "", scalability: "", technicalFeasibility: "", revenueStrategy: "", skillsOfTeam: "" },
        finalRecommendation: "", reasons: "", evaluatorName: "", evaluatorSignature: "",
      });
    }
  };

  const handleScoreChange = (param, value) => {
    setEvalForm({ ...evalForm, scores: { ...evalForm.scores, [param]: value } });
  };

  const handleObservationChange = (param, value) => {
    setEvalForm({ ...evalForm, observations: { ...evalForm.observations, [param]: value } });
  };

  const saveEvaluation = async () => {
    try {
      const response = await fetch(`${BASE_URL}/save-evaluation/${evaluatingStartup.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalForm),
      });
      if (response.ok) {
        alert("Evaluation saved successfully!");
        await fetchStartups();
      } else {
        alert("Failed to save evaluation");
      }
    } catch (error) {
      alert("Connection error");
    }
  };

  const handleSaveEvaluationPDF = async () => {
    const element = evalPrintRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      ignoreElements: (el) => el.classList && el.classList.contains('no-print'),
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          if (cb.checked) cb.setAttribute('checked', 'checked');
        });
        clonedDoc.querySelectorAll('input[type="text"], input[type="date"]').forEach((inp) => {
          inp.setAttribute('value', inp.value);
        });
        clonedDoc.querySelectorAll('textarea').forEach((ta) => {
          ta.textContent = ta.value;
        });
      }
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${evaluatingStartup.startupName || "startup"}_evaluation.pdf`);
  };

  const toggleCertificate = async (id) => {
    setActionLoadingId(id);
    try {
      const response = await fetch(`${BASE_URL}/update-certificate/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        await fetchStartups();
      } else {
        alert("Failed to update certificate status");
      }
    } catch (error) {
      alert("Connection error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const downloadFolder = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/download-folder/${id}`, { credentials: "include" });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `application_${id}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Download failed!');
      }
    } catch (error) {
      console.log(error);
      alert('Download Error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", gender: "", dob: "", address: "", contactNumber: "",
      nativeState: "", highestQualification: "", professionalExperience: "",
      startupName: "", companyType: "", incorporationDate: "", cin: "", officeAddress: "",
      gstNumber: "", dpiitNumber: "", sector: "", startupStage: "", problemStatement: "",
      valueProposition: "", usp: "", targetCustomer: "", competitors: "", scaleUpPlan: "",
      revenueModel: "", marketSize: "", websiteUrl: "", socialMediaLinks: "", videoUrl: "",
      govtSupport: "", seedSupport: "", founderName: "", coFounderName: "", teamEmails: "",
      teamContacts: "", linkedinProfiles: "", fullTimeEmployees: "", whyApplying: "",
      expectations: "", fundsRequired: "", fundingRequirement: "",
    });
    setFiles({ pitchDeck: null, resume: null, panCard: null, certificate: null, businessPlan: null, otherDocument: null, passportPhoto: null });
    try { localStorage.removeItem("preIncubationDraftV1"); } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.email) {
      try {
        const dupCheck = await fetch(`${BASE_URL}/check-duplicate/pre-incubation?email=${encodeURIComponent(formData.email)}`);
        const dupResult = await dupCheck.json();
        if (dupResult.exists) {
          const proceed = window.confirm("This email has already submitted a Pre-Incubation application. Submit another one anyway?");
          if (!proceed) return;
        }
      } catch (e) {}
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append("pitchDeck", files.pitchDeck);
      data.append("resume", files.resume);
      data.append("panCard", files.panCard);
      data.append("certificate", files.certificate);
      data.append("businessPlan", files.businessPlan);
      if (files.otherDocument) data.append("otherDocument", files.otherDocument);
      if (files.passportPhoto) data.append("passportPhoto", files.passportPhoto);

      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        resetForm();
        if (!isFormOnly && isLoggedIn) await fetchStartups();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.log(error);
      alert("Backend Connection Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectorCounts = startups.reduce((acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1;
    return acc;
  }, {});
  const sectorColors = { Agritech: "#6C5CE7", Healthtech: "#FF6B35", Edtech: "#00B894", Fintech: "#FF4D8D" };
  const maxSectorCount = Math.max(1, ...Object.values(sectorCounts), 1);

  const pendingCount = startups.filter(s => s.status === "Pending").length;
  const approvedCount = startups.filter(s => s.status === "Approved").length;
  const rejectedCount = startups.filter(s => s.status === "Rejected").length;
  const totalCount = startups.length || 1;
  const circumference = 345;
  let cumulative = 0;
  const donutSegments = [
    { label: "Pending", value: pendingCount, color: "#FF6B35" },
    { label: "Approved", value: approvedCount, color: "#00B894" },
    { label: "Rejected", value: rejectedCount, color: "#FF4D8D" },
  ].map(seg => {
    const dash = (seg.value / totalCount) * circumference;
    const withOffset = { ...seg, dash, offset: cumulative };
    cumulative += dash;
    return withOffset;
  });

  return (
    <div className={`layout ${isFormOnly ? "form-only-layout" : ""}`}>
      {!isFormOnly && isLoggedIn && (
        <div className="sidebar">
          <div className="sidebar-brand">
            <img src="/aic-logo.png" alt="AIC MUJ" className="sidebar-logo"/>
            <div>AIC MUJ<small>Incubation Foundation</small></div>
          </div>
          <div className="nav-label">Overview</div>
          <div className={`nav-item ${activeView === "preincubation" ? "active" : ""}`} onClick={() => setActiveView("preincubation")}>Pre Incubation</div>
          <div className={`nav-item ${activeView === "incubation" ? "active" : ""}`} onClick={() => { setActiveView("incubation"); if (isLoggedIn) fetchIncubationApplications(); }}>Incubation</div>
          <div className={`nav-item ${activeView === "leaderboard" ? "active" : ""}`} onClick={() => { setActiveView("leaderboard"); if (isLoggedIn) fetchIncubationApplications(); }}>🏆 Leaderboard</div>
          <div className="nav-item">Startups</div>
          <div className="nav-label">Records</div>
          <div className={`nav-item ${activeView === "incubatedStartups" ? "active" : ""}`} onClick={() => { setActiveView("incubatedStartups"); if (isLoggedIn) fetchAllIncubatedRecords(); }}>Incubated Startups</div>
          <div className={`nav-item ${activeView === "preIncubatedStartups" ? "active" : ""}`} onClick={() => { setActiveView("preIncubatedStartups"); if (isLoggedIn) fetchStartups(); }}>Pre Incubated Startups</div>
          <div className="nav-label">Review</div>
          <div className="nav-item">Pending Review</div>
          <div className="nav-item">Approved</div>
          <div className="nav-item">Rejected</div>
          <div className="nav-item">Documents</div>
          <div className="nav-label">Settings</div>
          <div className="nav-item">Team</div>
          <div className="nav-item">Settings</div>
          <div className="sidebar-footer">AIC · Manipal University Jaipur<br/>© 2026 Pre-Incubation Cell</div>
        </div>
      )}

      <div className={`app ${isFormOnly || !isLoggedIn ? "form-only" : ""}`}>
        <div className="header">
          <div className="logo-pill">
            <img src="/aic-logo.png" alt="AIC MUJ" className="logo-aic"/>
            <span className="logo-divider"></span>
            <img src="/manipal-logo.png" alt="Manipal University Jaipur" className="logo-manipal"/>
          </div>
          <h1>Automated Pre-Incubation Management System</h1>
          <p>{isFormOnly ? "Student / Employee Application Portal" : "AIC Startup Portal — Application & Review Dashboard"}</p>
        </div>

        {activeView === "preincubation" && (
          <>
          {!isFormOnly && isLoggedIn && (
            <>
              <div className="stats">
                <div className="stat">
                  <div className="stat-num">{startups.length}</div>
                  <div className="stat-label">Total Applications</div>
                </div>
                <div className="stat">
                  <div className="stat-num" style={{color:"#F57F17"}}>
                    {startups.filter(s => s.status === "Pending").length}
                  </div>
                  <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat">
                  <div className="stat-num" style={{color:"#2E7D32"}}>
                    {startups.filter(s => s.status === "Approved").length}
                  </div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat">
                  <div className="stat-num" style={{color:"#C62828"}}>
                    {startups.filter(s => s.status === "Rejected").length}
                  </div>
                  <div className="stat-label">Rejected</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h3>Applications by Sector</h3></div>
                  <div className="bars">
                    {Object.keys(sectorCounts).length === 0 ? (
                      <p style={{color:"#9797B5",fontSize:"12px"}}>No applications yet</p>
                    ) : Object.entries(sectorCounts).map(([sector, count]) => (
                      <div className="bar-col" key={sector}>
                        <div className="bar" style={{height: `${(count/maxSectorCount)*140}px`, background: sectorColors[sector] || "#6C5CE7"}}></div>
                        <span>{sector}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h3>Status Split</h3></div>
                  <div className="donut-wrap">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="55" fill="none" stroke="#F1F1F8" strokeWidth="16"/>
                      {donutSegments.map((seg,i) => seg.value > 0 && (
                        <circle key={i} cx="70" cy="70" r="55" fill="none" stroke={seg.color} strokeWidth="16"
                          strokeDasharray={`${seg.dash} ${345-seg.dash}`} strokeDashoffset={-seg.offset} strokeLinecap="round"
                          transform="rotate(-90 70 70)"/>
                      ))}
                      <text x="70" y="66" textAnchor="middle" fontFamily="Sora" fontSize="22" fontWeight="800" fill="#161629">{startups.length}</text>
                      <text x="70" y="84" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#686B85">Total</text>
                    </svg>
                    <div className="donut-legend">
                      {donutSegments.map((seg,i) => (
                        <div className="legend-row" key={i}><span><span className="dot" style={{background:seg.color}}></span>{seg.label}</span><span>{seg.value}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="card">
            <div className="card-title">Pre-Incubation Application</div>

            <div className="card-head">
              <div className="num" style={{background:"#6C5CE7"}}>1</div>
              <div><h3>Applicant's Details</h3><p>Basic details about you</p></div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Address for Correspondence</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Native State</label>
                <input type="text" name="nativeState" value={formData.nativeState} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Highest Qualification</label>
                <input type="text" name="highestQualification" value={formData.highestQualification} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field" style={{gridColumn:"span 2"}}>
                <label>Professional Experience (if any)</label>
                <input type="text" name="professionalExperience" value={formData.professionalExperience} onChange={handleChange} disabled={isSubmitting}/>
              </div>
            </div>

            <div className="card-head">
              <div className="num" style={{background:"#FF6B35"}}>2</div>
              <div><h3>Startup Details</h3><p>Your economic model and funding requirement</p></div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Name of your Startup/Brand</label>
                <input type="text" name="startupName" value={formData.startupName} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Type of the Company</label>
                <select name="companyType" value={formData.companyType} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Select Type</option>
                  <option>Proprietorship</option>
                  <option>Partnership</option>
                  <option>Private Limited</option>
                  <option>LLP</option>
                  <option>Not Registered</option>
                </select>
              </div>
              <div className="form-field">
                <label>Date of Incorporation/Registration</label>
                <input type="date" name="incorporationDate" value={formData.incorporationDate} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Corporate Identification Number</label>
                <input type="text" name="cin" value={formData.cin} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Registered/Corporate Office Address</label>
                <input type="text" name="officeAddress" value={formData.officeAddress} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>GST Number (if registered)</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>DPIIT Recognition Number (if received)</label>
                <input type="text" name="dpiitNumber" value={formData.dpiitNumber} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Choose your Sector</label>
                <select name="sector" value={formData.sector} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Select Sector</option>
                  <option>Agritech</option>
                  <option>Healthtech</option>
                  <option>Edtech</option>
                  <option>Fintech</option>
                </select>
              </div>
              <div className="form-field">
                <label>Stage of Startup</label>
                <select name="startupStage" value={formData.startupStage} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Select Stage</option>
                  <option>Idea</option>
                  <option>Prototype</option>
                  <option>MVP</option>
                  <option>Early Revenue</option>
                  <option>Growth</option>
                </select>
              </div>
              <div className="form-field" style={{gridColumn:"span 2"}}>
                <label>What is the problem you are solving?</label>
                <input type="text" name="problemStatement" value={formData.problemStatement} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>What is your value proposition for this problem?</label>
                <input type="text" name="valueProposition" value={formData.valueProposition} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>What is your unique selling point?</label>
                <input type="text" name="usp" value={formData.usp} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>What is your target customer segment?</label>
                <input type="text" name="targetCustomer" value={formData.targetCustomer} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Who are your key competitors?</label>
                <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>How do you aim to scale-up?</label>
                <input type="text" name="scaleUpPlan" value={formData.scaleUpPlan} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>What will be the revenue model?</label>
                <input type="text" name="revenueModel" value={formData.revenueModel} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>What is the market size of the opportunity?</label>
                <input type="text" name="marketSize" value={formData.marketSize} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Website URL</label>
                <input type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Social Media Links</label>
                <input type="text" name="socialMediaLinks" value={formData.socialMediaLinks} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Video URL showcasing product/business model</label>
                <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Received monetary support under Central/State scheme?</label>
                <select name="govtSupport" value={formData.govtSupport} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div className="form-field">
                <label>Received seed support from any Incubator in the past?</label>
                <select name="seedSupport" value={formData.seedSupport} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            <div className="card-head">
              <div className="num" style={{background:"#00B894"}}>3</div>
              <div><h3>Startup Team Details</h3><p>Contact and social media details</p></div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Name of the Founder</label>
                <input type="text" name="founderName" value={formData.founderName} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Name of the Co-founders (if any)</label>
                <input type="text" name="coFounderName" value={formData.coFounderName} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Email ID of both founder and co-founder(s)</label>
                <input type="text" name="teamEmails" value={formData.teamEmails} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Contact No. of both founder and co-founder(s)</label>
                <input type="text" name="teamContacts" value={formData.teamContacts} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>LinkedIn Profile of all core team members</label>
                <input type="text" name="linkedinProfiles" value={formData.linkedinProfiles} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>No. of full-time employees</label>
                <input type="text" name="fullTimeEmployees" value={formData.fullTimeEmployees} onChange={handleChange} disabled={isSubmitting}/>
              </div>
            </div>

            <div className="card-head">
              <div className="num" style={{background:"#FF4D8D"}}>4</div>
              <div><h3>Requirement from the Incubator</h3><p>List out your expectations from AIC GVRAMAN</p></div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Why are you applying for this Program?</label>
                <input type="text" name="whyApplying" value={formData.whyApplying} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Top three expectations from this program</label>
                <input type="text" name="expectations" value={formData.expectations} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Quantum of Funds Required</label>
                <input type="text" name="fundsRequired" value={formData.fundsRequired} onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="form-field">
                <label>Current Funding Requirement</label>
                <input type="text" name="fundingRequirement" value={formData.fundingRequirement} onChange={handleChange} disabled={isSubmitting}/>
              </div>
            </div>

            <div className="card-head">
              <div className="num" style={{background:"#6C5CE7"}}>5</div>
              <div><h3>Upload Documents</h3><p>PDF or image files</p></div>
            </div>
            <div className="file-grid">
              <div className="file-upload">
                <label>Pitch Deck (PDF)</label>
                <input type="file" accept=".pdf" disabled={isSubmitting}
                  onChange={(e) => setFiles({...files, pitchDeck: e.target.files[0]})}/>
              </div>
              <div className="file-upload">
                <label>Resume / CV (PDF)</label>
                <input type="file" accept=".pdf" disabled={isSubmitting}
                  onChange={(e) => setFiles({...files, resume: e.target.files[0]})}/>
              </div>
              <div className="file-upload">
                <label>PAN Card (PDF/Image)</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={isSubmitting}
                  onChange={(e) => setFiles({...files, panCard: e.target.files[0]})}/>
              </div>
              <div className="file-upload">
                <label>Registration Certificate</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={isSubmitting}
                  onChange={(e) => setFiles({...files, certificate: e.target.files[0]})}/>
              </div>
              <div className="file-upload">
                <label>Business Plan (PDF)</label>
                <input type="file" accept=".pdf" disabled={isSubmitting}
                  onChange={(e) => setFiles({...files, businessPlan: e.target.files[0]})}/>
              </div>
              <div className="file-upload">
                <label>Any other relevant document</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={isSubmitting}
                  onChange={(e) => setFiles({...files, otherDocument: e.target.files[0]})}/>
              </div>
              <div className="file-upload">
                <label>Upload Passport Size Photo</label>
                <input type="file" accept=".png,.jpg,.jpeg" disabled={isSubmitting} onChange={(e) => setFiles({...files, passportPhoto: e.target.files[0]})}/>
              </div>
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </button>
          </div>

          {!isFormOnly && (
            <div className="card">
              <div className="card-title">Admin Dashboard Dashboard</div>

              {checkingAuth ? (
                <p style={{ padding: "1rem", color: "#6B6B85" }}>Checking access...</p>
              ) : !isLoggedIn ? (
                <form onSubmit={handleLogin} style={{maxWidth: "320px", display: "flex", flexDirection: "column", gap: "12px", padding: "1rem"}}>
                  <div className="form-field">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="Enter admin username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                    />
                  </div>
                  {loginError && <p style={{ fontSize: "12px", color: "#FF4D8D" }}>{loginError}</p>}
                  <button type="submit" className="submit-btn" style={{ marginTop: "6px" }}>Login as Admin</button>
                </form>
              ) : (
                <div style={{ width: "100%", marginTop: "1rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "1rem" }}>
                    <input
                      type="text"
                      placeholder="Search by startup name, founder, or email..."
                      value={startupSearch}
                      onChange={(e) => setStartupSearch(e.target.value)}
                      style={{ flex: "1", minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                    />
                    <select
                      value={startupSectorFilter}
                      onChange={(e) => setStartupSectorFilter(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                    >
                      <option value="">All Sectors</option>
                      <option>Agritech</option>
                      <option>Healthtech</option>
                      <option>Edtech</option>
                      <option>Fintech</option>
                    </select>
                    <select
                      value={startupStatusFilter}
                      onChange={(e) => setStartupStatusFilter(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    {(startupSearch || startupSectorFilter || startupStatusFilter) && (
                      <button
                        onClick={() => { setStartupSearch(""); setStartupSectorFilter(""); setStartupStatusFilter(""); }}
                        className="btn-small"
                        style={{ background: "#EFEFEF", color: "#161629", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                  <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#F1F1F8", borderBottom: "2px solid #DCDCE7" }}>
                        <th style={{ padding: "12px" }}>ID</th>
                        <th style={{ padding: "12px" }}>Startup Name</th>
                        <th style={{ padding: "12px" }}>Founder</th>
                        <th style={{ padding: "12px" }}>Sector</th>
                        <th style={{ padding: "12px" }}>Stage</th>
                        <th style={{ padding: "12px" }}>Status</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredStartups = startups.filter((s) => {
                          const q = startupSearch.trim().toLowerCase();
                          const matchesSearch = q === "" ||
                            (s.startupName || "").toLowerCase().includes(q) ||
                            (s.name || "").toLowerCase().includes(q) ||
                            (s.email || "").toLowerCase().includes(q);
                          const matchesSector = startupSectorFilter === "" || s.sector === startupSectorFilter;
                          const matchesStatus = startupStatusFilter === "" || (s.status || "Pending") === startupStatusFilter;
                          return matchesSearch && matchesSector && matchesStatus;
                        });
                        if (filteredStartups.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#6B6B85" }}>
                                {startups.length === 0 ? "No applications found." : "No applications match your search/filters."}
                              </td>
                            </tr>
                          );
                        }
                        return filteredStartups.map((s) => (
                        <tr key={s.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                          <td style={{ padding: "12px" }}>{s.id}</td>
                          <td style={{ padding: "12px", fontWeight: "bold" }}>{s.startupName}</td>
                          <td style={{ padding: "12px" }}>{s.name}</td>
                          <td style={{ padding: "12px" }}><span className="badge-sector">{s.sector}</span></td>
                          <td style={{ padding: "12px" }}>{s.startupStage}</td>
                          <td style={{ padding: "12px" }}>
                            <span className={`status-pill ${s.status?.toLowerCase()}`} style={{
                              padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold",
                              color: s.status === "Approved" ? "#2E7D32" : s.status === "Rejected" ? "#C62828" : "#F57F17",
                              background: s.status === "Approved" ? "#E8F5E9" : s.status === "Rejected" ? "#FFEBEE" : "#FFF3E0"
                            }}>{s.status || "Pending"}</span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div className="actions-cell">
                              <button onClick={() => setViewingStartup(s)} className="big-action-btn view">
                                <span className="btn-label">View</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                                </span>
                              </button>
                              <button onClick={() => openPitchModal(s)} className="big-action-btn pitch">
                                <span className="btn-label">Pitch</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                                </span>
                              </button>
                              <button onClick={() => downloadFolder(s.id)} className="big-action-btn docs">
                                <span className="btn-label">Docs</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                </span>
                              </button>
                              <button onClick={() => openEvaluationModal(s)} className="big-action-btn evaluate">
                                <span className="btn-label">Evaluate</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                </span>
                              </button>
                              <button onClick={() => toggleCertificate(s.id)} className="big-action-btn cert">
                                <span className="btn-label">{s.has_certificate ? "Cert ✓" : "No Cert"}</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
                                </span>
                              </button>
                              <button onClick={() => updateStatus(s.id, "Approved")} disabled={actionLoadingId === s.id} className="big-action-btn approve">
                                <span className="btn-label">Approve</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                </span>
                              </button>
                              <button onClick={() => updateStatus(s.id, "Rejected")} disabled={actionLoadingId === s.id} className="big-action-btn reject">
                                <span className="btn-label">Reject</span>
                                <span className="btn-icon">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
          )}
          </>
        )}

        {activeView === "incubation" && (
          <div className="card">
            <div className="logo-pill" style={{ marginBottom: "1rem" }}>
              <img src="/aic-logo.png" alt="AIC MUJ" className="logo-aic"/>
              <span className="logo-divider"></span>
              <img src="/manipal-logo.png" alt="Manipal University Jaipur" className="logo-manipal"/>
            </div>
            <div className="card-title">AIC MUJ Startup Incubation Form</div>

            <div className="form-grid">
              <div className="form-field">
                <label>Startup Name</label>
                <input type="text" name="startupName" value={incubationForm.startupName} onChange={handleIncubationChange} disabled={isSubmittingIncubation}/>
              </div>
              <div className="form-field">
                <label>Email Id</label>
                <input type="email" name="email" value={incubationForm.email} onChange={handleIncubationChange} disabled={isSubmittingIncubation}/>
              </div>
              <div className="form-field">
                <label>Mobile No</label>
                <input type="text" name="mobileNo" value={incubationForm.mobileNo} onChange={handleIncubationChange} disabled={isSubmittingIncubation}/>
              </div>
              <div className="form-field">
                <label>State</label>
                <input type="text" name="state" value={incubationForm.state} onChange={handleIncubationChange} disabled={isSubmittingIncubation}/>
              </div>
              <div className="form-field">
                <label>City</label>
                <input type="text" name="city" value={incubationForm.city} onChange={handleIncubationChange} disabled={isSubmittingIncubation}/>
              </div>
              <div className="form-field">
                <label>Sector of Startup</label>
                <select name="sector" value={incubationForm.sector} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select Sector</option>
                  <option>Agriculture and Allied Fields</option>
                  <option>AI / ML / Big Data Analytics</option>
                  <option>Drones</option>
                  <option>Education</option>
                  <option>Health and Pharmaceuticals</option>
                  <option>Metaverse / Immersive Technology</option>
                  <option>Sustainability / Recycling</option>
                  <option>Textile & Apparels</option>
                  <option>Toys & Games</option>
                  <option>IoT and Information & Communication Technology (ICT)</option>
                  <option>Manufacturing and Engineering</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Current Level of Incubatee</label>
                <select name="incubateeLevel" value={incubationForm.incubateeLevel} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select Level</option>
                  <option>Ideation</option>
                  <option>Proof of Concept (PoC)</option>
                  <option>Prototype</option>
                  <option>Minimum Viable Product (MVP)</option>
                  <option>Commercialized</option>
                </select>
              </div>
              <div className="form-field">
                <label>Operational Model</label>
                <select name="operationalModel" value={incubationForm.operationalModel} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select Model</option>
                  <option>Product Manufacturing</option>
                  <option>Service Delivery</option>
                  <option>Aggregation Platform</option>
                </select>
              </div>
              <div className="form-field">
                <label>Flagship Government Programme</label>
                <select name="govtProgramme" value={incubationForm.govtProgramme} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select (optional)</option>
                  <option>Women Empowerment</option>
                  <option>Make in India</option>
                  <option>Swachh Bharat</option>
                  <option>Startup India Stand Up India</option>
                  <option>Beti Bachao Beti Padhao</option>
                  <option>None of the above</option>
                </select>
              </div>
              <div className="form-field">
                <label>MSME Registered</label>
                <select name="msmeRegistered" value={incubationForm.msmeRegistered} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div className="form-field">
                <label>DIPP Registered</label>
                <select name="dippRegistered" value={incubationForm.dippRegistered} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div className="form-field">
                <label>SDG Goal</label>
                <select name="sdgGoals" value={incubationForm.sdgGoals} onChange={handleIncubationChange} disabled={isSubmittingIncubation}>
                  <option value="">Select (optional)</option>
                  <option>No poverty</option>
                  <option>Zero hunger</option>
                  <option>Good health and well-being</option>
                  <option>Quality education</option>
                  <option>Gender Equality</option>
                  <option>Clean water and sanitation</option>
                  <option>Affordable and clean energy</option>
                  <option>Decent work and economic growth</option>
                  <option>Industry, innovation, and infrastructure</option>
                  <option>Sustainable cities and communities</option>
                  <option>Reduced inequality</option>
                  <option>Responsible consumption and production</option>
                  <option>Climate action</option>
                  <option>Life below water</option>
                  <option>Life on land</option>
                  <option>Peace, justice, and strong institutions</option>
                  <option>Partnership for the goals</option>
                </select>
              </div>
              <div className="form-field" style={{gridColumn:"span 2"}}>
                <label>Description of the Startup</label>
                <input type="text" name="description" value={incubationForm.description} onChange={handleIncubationChange} disabled={isSubmittingIncubation}/>
              </div>
            </div>

            <div style={{ margin: "1rem 0" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Type of Program</label>
              {["Incubation support", "Fundraising support", "Networking support", "Mentorship support"].map((opt) => (
                <label key={opt} style={{ marginRight: "16px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <input type="checkbox" checked={incubationForm.typeOfProgram.includes(opt)} onChange={() => handleIncubationCheckbox(opt)} disabled={isSubmittingIncubation}/>
                  {opt}
                </label>
              ))}
            </div>

            <div className="file-upload" style={{ maxWidth: "400px", marginBottom: "1.5rem" }}>
              <label>PPT Upload (PDF, Max 100MB)</label>
              <input type="file" accept=".pdf" disabled={isSubmittingIncubation}
                onChange={(e) => setIncubationPPT(e.target.files[0])}/>
            </div>

            <button className="submit-btn" onClick={handleIncubationSubmit} disabled={isSubmittingIncubation} style={{ opacity: isSubmittingIncubation ? 0.7 : 1 }}>
              {isSubmittingIncubation ? "Submitting..." : "Submit Application"}
            </button>

            {isLoggedIn && (
              <div style={{ marginTop: "2rem" }}>
                <div className="card-title">Submitted Incubation Applications</div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", margin: "1rem 0" }}>
                  <input
                    type="text"
                    placeholder="Search by startup name or email..."
                    value={incubationSearch}
                    onChange={(e) => setIncubationSearch(e.target.value)}
                    style={{ flex: "1", minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                  />
                  <select
                    value={incubationSectorFilter}
                    onChange={(e) => setIncubationSectorFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                  >
                    <option value="">All Sectors</option>
                    <option>Agriculture and Allied Fields</option>
                    <option>AI / ML / Big Data Analytics</option>
                    <option>Drones</option>
                    <option>Education</option>
                    <option>Health and Pharmaceuticals</option>
                    <option>Metaverse / Immersive Technology</option>
                    <option>Sustainability / Recycling</option>
                    <option>Textile & Apparels</option>
                    <option>Toys & Games</option>
                    <option>IoT and Information & Communication Technology (ICT)</option>
                    <option>Manufacturing and Engineering</option>
                    <option>Other</option>
                  </select>
                  <select
                    value={incubationLevelFilter}
                    onChange={(e) => setIncubationLevelFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DCDCE7" }}
                  >
                    <option value="">All Levels</option>
                    <option>Ideation</option>
                    <option>Proof of Concept (PoC)</option>
                    <option>Prototype</option>
                    <option>Minimum Viable Product (MVP)</option>
                    <option>Commercialized</option>
                  </select>
                  {(incubationSearch || incubationSectorFilter || incubationLevelFilter) && (
                    <button
                      onClick={() => { setIncubationSearch(""); setIncubationSectorFilter(""); setIncubationLevelFilter(""); }}
                      className="btn-small"
                      style={{ background: "#EFEFEF", color: "#161629", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div style={{ overflowX: "auto", width: "100%", marginTop: "1rem" }}>
                  <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#F1F1F8", borderBottom: "2px solid #DCDCE7" }}>
                        <th style={{ padding: "12px" }}>ID</th>
                        <th style={{ padding: "12px" }}>Startup Name</th>
                        <th style={{ padding: "12px" }}>Email</th>
                        <th style={{ padding: "12px" }}>Sector</th>
                        <th style={{ padding: "12px" }}>Level</th>
                        <th style={{ padding: "12px" }}>Submitted</th>
                        <th style={{ padding: "12px" }}>PPT</th>
                        <th style={{ padding: "12px" }}>Score</th>
                        <th style={{ padding: "12px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = incubationApplications.filter((a) => {
                          const q = incubationSearch.trim().toLowerCase();
                          const matchesSearch = q === "" || (a.startupName || "").toLowerCase().includes(q) || (a.email || "").toLowerCase().includes(q);
                          const matchesSector = incubationSectorFilter === "" || a.sector === incubationSectorFilter;
                          const matchesLevel = incubationLevelFilter === "" || a.incubateeLevel === incubationLevelFilter;
                          return matchesSearch && matchesSector && matchesLevel;
                        });
                        if (filtered.length === 0) {
                          return <tr><td colSpan="9" style={{ padding: "20px", textAlign: "center", color: "#6B6B85" }}>
                            {incubationApplications.length === 0 ? "No incubation applications yet." : "No applications match your search/filters."}
                          </td></tr>;
                        }
                        return filtered.map((a) => (
                          <tr key={a.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                            <td style={{ padding: "12px" }}>{a.id}</td>
                            <td style={{ padding: "12px", fontWeight: "bold" }}>{a.startupName}</td>
                            <td style={{ padding: "12px" }}>{a.email}</td>
                            <td style={{ padding: "12px" }}>{a.sector}</td>
                            <td style={{ padding: "12px" }}>{a.incubateeLevel}</td>
                            <td style={{ padding: "12px" }}>{a.submitted_at}</td>
                            <td style={{ padding: "12px" }}>
                              {a.pptFilename ? (
                                <a href={`${BASE_URL}/download-incubation-ppt/${a.id}`} target="_blank" rel="noreferrer">Download</a>
                              ) : "—"}
                            </td>
                            <td style={{ padding: "12px", fontWeight: "bold" }}>{getIncubationAppScoreDisplay(a)}</td>
                            <td style={{ padding: "12px" }}>
                              <button
                                onClick={() => openEvaluatorsList(a)}
                                className="btn-small"
                                style={{ background: "#6C5CE7", color: "#FFF", padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                              >
                                Evaluations {a.eval_count ? `(${a.eval_count})` : ""}
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "leaderboard" && (
          <div className="card">
            <div className="card-title">🏆 Startup Leaderboard</div>
            <p style={{ fontSize: "13px", color: "#6B6B85", marginBottom: "1.5rem" }}>
              Ranked by average evaluation score across all evaluators.
            </p>

            {(() => {
              const ranked = [...incubationApplications]
                .filter((a) => a.eval_count > 0)
                .sort((a, b) => b.eval_avg - a.eval_avg);
              const notEvaluated = incubationApplications.filter((a) => !a.eval_count);

              const rankIcon = (i) => {
                if (i === 0) return "🥇";
                if (i === 1) return "🥈";
                if (i === 2) return "🥉";
                return `#${i + 1}`;
              };

              return (
                <>
                  {ranked.length === 0 ? (
                    <p style={{ color: "#6B6B85", padding: "12px 0" }}>No applications have been evaluated yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {ranked.map((a, i) => (
                        <div key={a.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          border: i < 3 ? "2px solid #6C5CE7" : "1px solid #EFEFEF",
                          borderRadius: "10px", padding: "14px 18px",
                          background: i < 3 ? "#F8F7FE" : "#FFF"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{ fontSize: i < 3 ? "26px" : "16px", fontWeight: "bold", minWidth: "40px", textAlign: "center", color: "#6C5CE7" }}>
                              {rankIcon(i)}
                            </div>
                            <div>
                              <div style={{ fontWeight: "bold", fontSize: "15px" }}>{a.startupName}</div>
                              <div style={{ fontSize: "12px", color: "#6B6B85" }}>{a.sector} · {a.incubateeLevel}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: "bold", fontSize: "16px" }}>{a.eval_avg} / 60</div>
                              <div style={{ fontSize: "11px", color: "#6B6B85" }}>{a.eval_count} evaluator{a.eval_count > 1 ? "s" : ""}</div>
                            </div>
                            <button
                              onClick={() => openEvaluatorsList(a)}
                              className="btn-small"
                              style={{ background: "#6C5CE7", color: "#FFF", padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notEvaluated.length > 0 && (
                    <div style={{ marginTop: "2rem" }}>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#6B6B85", marginBottom: "8px" }}>Not Yet Evaluated</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {notEvaluated.map((a) => (
                          <span key={a.id} style={{ background: "#F1F1F8", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", color: "#686B85" }}>
                            {a.startupName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {activeView === "incubatedStartups" && (
          <div className="card">
            <div className="card-title">Incubated Startups — Records</div>
            <p style={{ fontSize: "13px", color: "#6B6B85", marginBottom: "1.5rem" }}>
              Add and manage detailed records for startups that have graduated into incubation.
            </p>

            <div className="card-head">
              <div className="num" style={{ background: "#6C5CE7" }}>1</div>
              <div><h3>Startup Details</h3><p>Core information about the startup</p></div>
            </div>
            <div className="form-grid">
              {[
                ["startupId", "Startup ID"], ["startupName", "Startup Name"],
              ].map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input type="text" value={incubatedForm[key]} onChange={(e) => setIncubatedForm({ ...incubatedForm, [key]: e.target.value })} />
                </div>
              ))}

              <div className="form-field">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setStartupPhotoFile(e.target.files[0])} />
                {startupPhotoFile && <div style={{ fontSize: "11px", color: "#00B894", marginTop: "4px" }}>✓ {startupPhotoFile.name}</div>}
              </div>

              {[
                ["founder", "Founder Name"], ["coFounder", "Co-Founder Name"], ["email", "Email"],
                ["phone", "Phone"], ["website", "Website"], ["linkedin", "LinkedIn"],
                ["startupIndiaNumber", "Startup India Number"], ["dpiitNumber", "DPIIT Number"], ["cin", "CIN"],
                ["pan", "PAN"], ["sector", "Sector"],
                ["subSector", "Sub Sector"], ["technology", "Technology"], ["trlLevel", "TRL Level"],
                ["incubationStage", "Incubation Stage"], ["currentStatus", "Number of Employees"], ["revenue", "Revenue"],
                ["valuation", "Valuation"], ["investmentRaised", "Investment Raised"],
                ["assignedMentor", "Assigned Mentor"],
              ].map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input type="text" value={incubatedForm[key]} onChange={(e) => setIncubatedForm({ ...incubatedForm, [key]: e.target.value })} />
                </div>
              ))}

              <div className="form-field">
                <label>Stage</label>
                <select value={incubatedForm.assignedRm} onChange={(e) => setIncubatedForm({ ...incubatedForm, assignedRm: e.target.value })}>
                  <option value="">Select Stage</option>
                  <option>Ideation Stage</option>
                  <option>Pre-Seed Stage</option>
                  <option>Seed Stage</option>
                  <option>Early Growth (Series A and B)</option>
                  <option>Scaling</option>
                </select>
              </div>

              {[
                ["currentMilestone", "Success Story"], ["riskScore", "Risk Score"],
              ].map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input type="text" value={incubatedForm[key]} onChange={(e) => setIncubatedForm({ ...incubatedForm, [key]: e.target.value })} />
                </div>
              ))}

              <div className="form-field">
                <label>City</label>
                <input type="text" value={incubatedForm.city} onChange={(e) => setIncubatedForm({ ...incubatedForm, city: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Address</label>
                <input type="text" value={incubatedForm.address} onChange={(e) => setIncubatedForm({ ...incubatedForm, address: e.target.value })} />
              </div>

              <div className="form-field">
                <label>Remarks</label>
                <input type="text" value={incubatedForm.remarks} onChange={(e) => setIncubatedForm({ ...incubatedForm, remarks: e.target.value })} />
              </div>
            </div>

            <div className="card-head">
              <div className="num" style={{ background: "#FF6B35" }}>2</div>
              <div><h3>Documents</h3><p>Upload relevant documents (optional)</p></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "1.5rem" }}>
              {[
                ["pitchDeck", "Pitch Deck"], ["pan", "PAN"], ["gst", "GST"], ["mou", "MOU"], ["aoa", "Product Pick"],
                ["startupIndia", "Startup India"], ["bankStatement", "Bank Statement"], ["ip", "IP"],
                ["agreements", "Agreements"], ["reports", "Reports"], ["funding", "Funding"],
                ["investorDeck", "Investor Deck"], ["meetingMinutes", "Meeting Minutes"],
              ].map(([key, label]) => (
                <div key={key} style={{ border: "1px solid #EFEFEF", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>{label}</div>
                  <input
                    type="file"
                    onChange={(e) => setDocumentRepoFiles({ ...documentRepoFiles, [key]: e.target.files[0] })}
                    style={{ fontSize: "11px", width: "100%" }}
                  />
                  {documentRepoFiles[key] && (
                    <div style={{ fontSize: "11px", color: "#00B894", marginTop: "4px" }}>✓ {documentRepoFiles[key].name}</div>
                  )}
                </div>
              ))}
            </div>

            <button className="submit-btn" onClick={saveIncubatedRecord} disabled={isSavingCrmRecord} style={{ opacity: isSavingCrmRecord ? 0.7 : 1 }}>
              {isSavingCrmRecord ? "Saving..." : "Save Record"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem", marginBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Startup Detail</h3>
              <button
                onClick={exportStartupCrmToExcel}
                className="btn-small"
                style={{ background: "#00B894", color: "#FFF", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}
              >
                📊 Export to Excel
              </button>
            </div>
            <div style={{ overflowX: "auto", marginBottom: "2.5rem" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F1F1F8", borderBottom: "2px solid #DCDCE7" }}>
                    <th style={{ padding: "12px" }}>Startup Name</th>
                    <th style={{ padding: "12px" }}>Founder</th>
                    <th style={{ padding: "12px" }}>Sector</th>
                    <th style={{ padding: "12px" }}>Incubation Stage</th>
                    <th style={{ padding: "12px" }}>Employees</th>
                    <th style={{ padding: "12px" }}>Mentor</th>
                    <th style={{ padding: "12px" }}>Program Stage</th>
                    <th style={{ padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {startupCrmList.length === 0 ? (
                    <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center", color: "#6B6B85" }}>No startup records yet.</td></tr>
                  ) : startupCrmList.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>{s.startup_name}</td>
                      <td style={{ padding: "12px" }}>{s.founder}</td>
                      <td style={{ padding: "12px" }}>{s.sector}</td>
                      <td style={{ padding: "12px" }}>{s.incubation_stage}</td>
                      <td style={{ padding: "12px" }}>{s.current_status}</td>
                      <td style={{ padding: "12px" }}>{s.assigned_mentor}</td>
                      <td style={{ padding: "12px" }}>{s.assigned_rm}</td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => setViewingStartupCrmRecord(s)}
                          className="btn-small"
                          style={{ background: "#6C5CE7", color: "#FFF", padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ marginBottom: "10px" }}>Document Repository</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F1F1F8", borderBottom: "2px solid #DCDCE7" }}>
                    <th style={{ padding: "12px" }}>Startup</th>
                    {documentRepoColumns.map((c) => (
                      <th key={c.key} style={{ padding: "12px", whiteSpace: "nowrap" }}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documentRepoList.length === 0 ? (
                    <tr><td colSpan={documentRepoColumns.length + 1} style={{ padding: "20px", textAlign: "center", color: "#6B6B85" }}>No documents uploaded yet.</td></tr>
                  ) : documentRepoList.map((d) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>{d.startup}</td>
                      {documentRepoColumns.map((c) => (
                        <td key={c.key} style={{ padding: "12px" }}>
                          {d[c.key] ? (
                            <a href={`${BASE_URL}/download-document/${d.id}/${c.key}`} target="_blank" rel="noreferrer">Download</a>
                          ) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === "preIncubatedStartups" && (
          <div className="card">
            <div className="card-title">Pre Incubated Startups — Records</div>
            <p style={{ fontSize: "13px", color: "#6B6B85", marginBottom: "1.5rem" }}>
              All applicants currently in the Pre-Incubation pipeline.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F1F1F8", borderBottom: "2px solid #DCDCE7" }}>
                    <th style={{ padding: "12px" }}>Startup Name</th>
                    <th style={{ padding: "12px" }}>Founder</th>
                    <th style={{ padding: "12px" }}>Sector</th>
                    <th style={{ padding: "12px" }}>Stage</th>
                    <th style={{ padding: "12px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {startups.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#6B6B85" }}>No pre-incubation applications found.</td></tr>
                  ) : startups.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>{s.startupName}</td>
                      <td style={{ padding: "12px" }}>{s.name}</td>
                      <td style={{ padding: "12px" }}><span className="badge-sector">{s.sector}</span></td>
                      <td style={{ padding: "12px" }}>{s.startupStage}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold",
                          color: s.status === "Approved" ? "#2E7D32" : s.status === "Rejected" ? "#C62828" : "#F57F17",
                          background: s.status === "Approved" ? "#E8F5E9" : s.status === "Rejected" ? "#FFEBEE" : "#FFF3E0"
                        }}>{s.status || "Pending"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewingStartup && createPortal(
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" ref={printRef} style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "80%", maxHeight: "88vh", overflowY: "auto", position: "relative" }}>

              <div className="modal-branding-header" style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "2px solid #6C5CE7",
                  paddingBottom: "16px",
                  marginBottom: "20px"
              }}>
                  <img
                      src={`${window.location.origin}/aic-logo.png`}
                      alt="AIC MUJ"
                      style={{ height: "65px", width: "auto", objectFit: "contain" }}
                  />
                  <img
                      src={`${window.location.origin}/manipal-logo.png`}
                      alt="Manipal University Jaipur"
                      style={{ height: "55px", width: "auto", objectFit: "contain" }}
                  />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
                <h2>Application Deep-Dive Report</h2>
                <div className="no-print">
                  <button className="btn-print" onClick={() => window.print()} style={{ marginRight: "8px" }}>Print</button>
                  <button className="btn-print" onClick={handleSavePDF} style={{ marginRight: "8px" }}>Save PDF</button>
                  <button className="btn-close" onClick={() => setViewingStartup(null)}>✕</button>
                </div>
              </div>

              <div className="modal-body" ref={modalBodyRef} style={{ padding: "16px", color: "#16162a" }}>

                <h3 style={{ color: "#6C5CE7", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>1. Founder & Personal Profile</h3>
                <div className="view-grid">
                  <p><strong>Full Name: </strong>{viewingStartup.name} ({viewingStartup.gender})</p>
                  <p><strong>Email & Contact: </strong>{viewingStartup.email} | {viewingStartup.contact_number}</p>
                  <p><strong>Date of Birth: </strong>{viewingStartup.dob}</p>
                  <p><strong>Native State & Address: </strong>{viewingStartup.nativeState} | {viewingStartup.address}</p>
                  <p className="full"><strong>Qualifications & Experience: </strong>{viewingStartup.highestQualification} | {viewingStartup.professionalExperience || "None Specified"}</p>
                </div>

                <h3 style={{ color: "#FF6B35", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>2. Core Venture Parameters</h3>
                <div className="view-grid">
                  <p><strong>Startup Entity Name: </strong>{viewingStartup.startupName || "None Specified"}</p>
                  <p><strong>Sector Focus & Lifecycle Stage: </strong>{viewingStartup.sector} — <span style={{ fontWeight: "bold" }}>{viewingStartup.startupStage}</span></p>
                  <p><strong>Incorporation details: </strong>Date: {viewingStartup.incorporationDate || "N/A"} | CIN: {viewingStartup.cin || "N/A"}</p>
                  <p><strong>Compliance Registration: </strong>GST: {viewingStartup.gstNumber || "N/A"} | DPIIT No: {viewingStartup.dpiitNumber || "N/A"}</p>
                  <p className="full"><strong>Problem Statement Explicitly Tackled: </strong></p>
                  <blockquote style={{ background: "#F8F9FA", padding: "10px", borderLeft: "4px solid #FF6B35" }}>{viewingStartup.problemStatement}</blockquote>
                  <p className="full"><strong>Value Proposition & Core USP: </strong>{viewingStartup.valueProposition} | <span>{viewingStartup.usp}</span></p>
                  <p className="full"><strong>Target Customer Demographics & Market Sizing: </strong>Segment: {viewingStartup.targetCustomers} | Tam/Sam/Som Market Size: {viewingStartup.marketSize}</p>
                  <p className="full"><strong>Competitive Layout & Scale Up Architecture: </strong>Competitors: {viewingStartup.competitors} | Expansion Blueprint: {viewingStartup.scaleUpPlan}</p>
                  <p><strong>Monetization Mechanics (Revenue Model): </strong>{viewingStartup.revenueModel}</p>
                  <p><strong>External Web Footprint: </strong><a href={viewingStartup.websiteUrl} target="_blank" rel="noreferrer">{viewingStartup.websiteUrl || "No Website Linked"}</a></p>
                </div>

                <h3 style={{ color: "#00B894", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>3. Strategic Team Dynamic</h3>
                <div className="view-grid">
                  <p><strong>Founder & Co-Founder Names: </strong>{viewingStartup.coFounderNames || "None"}</p>
                  <p><strong>Team Communication Matrices: </strong>Emails: {viewingStartup.teamEmails} | Phone channels: {viewingStartup.teamContacts}</p>
                  <p className="full"><strong>Human Capital Count: </strong>{viewingStartup.fullTimeEmployees} Full-Time workers managed.</p>
                </div>

                <h3 style={{ color: "#FF7675", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>4. Incubation Allocation Expectation</h3>
                <div className="view-grid">
                  <p className="full"><strong>Motivation Context for Entry: </strong>{viewingStartup.whyApplying}</p>
                  <p className="full"><strong>Top Requirements expected: </strong>{viewingStartup.expectations}</p>
                  <p className="full"><strong>Capital Allocations requested: </strong>Quantum Needed: {viewingStartup.fundsRequired} | Specific Milestones Structure: {viewingStartup.fundingRequirements}</p>
                </div>

              </div>

            </div>
          </div>
          , document.body
        )}

        {evaluatingStartup && createPortal(
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" ref={evalPrintRef} style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "85%", maxWidth: "900px", maxHeight: "88vh", overflowY: "auto", position: "relative" }}>

              <div className="modal-branding-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #6C5CE7", paddingBottom: "16px", marginBottom: "20px" }}>
                <img src={`${window.location.origin}/aic-logo.png`} alt="AIC MUJ" style={{ height: "65px", width: "auto", objectFit: "contain" }} />
                <img src={`${window.location.origin}/manipal-logo.png`} alt="Manipal University Jaipur" style={{ height: "55px", width: "auto", objectFit: "contain" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                <h2>Startup Incubation Evaluation</h2>
                <div className="no-print">
                  <button className="btn-print" onClick={() => window.print()} style={{ marginRight: "8px" }}>Print</button>
                  <button className="btn-print" onClick={handleSaveEvaluationPDF} style={{ marginRight: "8px" }}>Save PDF</button>
                  <button className="btn-print" onClick={saveEvaluation} style={{ marginRight: "8px", background: "#00B894" }}>Save</button>
                  <button className="btn-close" onClick={() => setEvaluatingStartup(null)}>✕</button>
                </div>
              </div>

              <div className="view-grid" style={{ marginBottom: "1rem" }}>
                <p><strong>Startup Name: </strong>{evaluatingStartup.startupName}</p>
                <p><strong>Founder Names: </strong>
                  <input type="text" value={evalForm.founderNames} onChange={(e) => setEvalForm({...evalForm, founderNames: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Date: </strong>
                  <input type="date" value={evalForm.date} onChange={(e) => setEvalForm({...evalForm, date: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
              </div>

              <table className="eval-table" style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "35%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#F1F1F8" }}>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px", wordBreak: "break-word", lineHeight: "1.2" }}>Sr No</th>
                    <th style={{ padding: "4px 6px", border: "1px solid #DCDCE7", textAlign: "left", fontSize: "11px", wordBreak: "break-word", lineHeight: "1.2" }}>Parameters</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px", wordBreak: "break-word", lineHeight: "1.2" }}>Poor<br/>(1)</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px", wordBreak: "break-word", lineHeight: "1.2" }}>Average<br/>(2)</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px", wordBreak: "break-word", lineHeight: "1.2" }}>Good<br/>(3)</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px", wordBreak: "break-word", lineHeight: "1.2" }}>Excellent<br/>(4)</th>
                    <th style={{ padding: "4px 6px", border: "1px solid #DCDCE7", textAlign: "left", fontSize: "11px", wordBreak: "break-word", lineHeight: "1.2" }}>Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "businessPlan", num: 1, label: "Business Plan (Value proposition, Market potential, Industry attractiveness, Potential social and strategic national impact and ethical)" },
                    { key: "mvp", num: 2, label: "Minimum Viable Product" },
                    { key: "marketResearch", num: 3, label: "Depth and Width of Market Research" },
                    { key: "innovation", num: 4, label: "Innovation / Competitive Advantage" },
                    { key: "investmentStrategy", num: 5, label: "Investment Strategy / Status" },
                    { key: "scalability", num: 6, label: "Scalability" },
                    { key: "technicalFeasibility", num: 7, label: "Technical Feasibility" },
                    { key: "revenueStrategy", num: 8, label: "Revenue Strategy" },
                    { key: "skillsOfTeam", num: 9, label: "Skills of team" },
                  ].map((param) => (
                    <tr key={param.key}>
                      <td style={{ padding: "6px", border: "1px solid #DCDCE7", textAlign: "center", fontSize: "12px" }}>{param.num}</td>
                      <td style={{ padding: "6px", border: "1px solid #DCDCE7", fontSize: "12px", wordBreak: "break-word", whiteSpace: "normal" }}>{param.label}</td>
                      {["1","2","3","4"].map((val) => (
                        <td key={val} style={{ padding: "6px", border: "1px solid #DCDCE7", textAlign: "center" }}>
                          <input type="checkbox" checked={evalForm.scores[param.key] === val} onChange={() => handleScoreChange(param.key, val)} style={{ width: "16px", height: "16px", cursor: "pointer" }}/>
                        </td>
                      ))}
                      <td style={{ padding: "6px", border: "1px solid #DCDCE7" }}>
                        <input type="text" value={evalForm.observations[param.key]} onChange={(e) => handleObservationChange(param.key, e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px", fontSize: "12px" }}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginBottom: "1rem" }}>
                <strong>Final Recommendation: </strong>
                <label style={{ marginLeft: "12px" }}><input type="checkbox" checked={evalForm.finalRecommendation === "Pre-Incubation"} onChange={() => setEvalForm({...evalForm, finalRecommendation: "Pre-Incubation"})}/> Pre-Incubation</label>
                <label style={{ marginLeft: "12px" }}><input type="checkbox" checked={evalForm.finalRecommendation === "Incubation"} onChange={() => setEvalForm({...evalForm, finalRecommendation: "Incubation"})}/> Incubation</label>
                <label style={{ marginLeft: "12px" }}><input type="checkbox" checked={evalForm.finalRecommendation === "On Hold"} onChange={() => setEvalForm({...evalForm, finalRecommendation: "On Hold"})}/> On Hold</label>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong>Reasons: </strong>
                <textarea value={evalForm.reasons} onChange={(e) => setEvalForm({...evalForm, reasons: e.target.value})} style={{ width: "100%", minHeight: "60px", border: "1px solid #DCDCE7", borderRadius: "4px", padding: "8px", marginTop: "6px" }}/>
              </div>

              <div className="view-grid">
                <p><strong>Evaluator Name: </strong>
                  <input type="text" value={evalForm.evaluatorName} onChange={(e) => setEvalForm({...evalForm, evaluatorName: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Evaluator Signature: </strong>
                  <input type="text" value={evalForm.evaluatorSignature} onChange={(e) => setEvalForm({...evalForm, evaluatorSignature: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
              </div>

            </div>
          </div>
          , document.body
        )}

        {showIncubationEvalSheet && createPortal(
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" ref={incubationEvalPrintRef} style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "85%", maxWidth: "950px", maxHeight: "88vh", overflowY: "auto", position: "relative" }}>

              <div className="modal-branding-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #6C5CE7", paddingBottom: "16px", marginBottom: "20px" }}>
                <img src={`${window.location.origin}/aic-logo.png`} alt="AIC MUJ" style={{ height: "65px", width: "auto", objectFit: "contain" }} />
                <img src={`${window.location.origin}/manipal-logo.png`} alt="Manipal University Jaipur" style={{ height: "55px", width: "auto", objectFit: "contain" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                <h2>Startup Pitch / Incubation Evaluation Sheet</h2>
                <div className="no-print">
                  <button className="btn-print" onClick={() => window.print()} style={{ marginRight: "8px" }}>Print</button>
                  <button className="btn-print" onClick={handleSaveIncubationEvalPDF} style={{ marginRight: "8px" }}>Save PDF</button>
                  <button className="btn-print" onClick={saveIncubationEvaluation} style={{ marginRight: "8px", background: "#00B894" }}>Save</button>
                  <button className="btn-close" onClick={() => setShowIncubationEvalSheet(false)}>✕</button>
                </div>
              </div>

              <div className="view-grid" style={{ marginBottom: "1rem" }}>
                <p><strong>Company Name: </strong>
                  <input type="text" value={incubationEvalForm.companyName} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, companyName: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Date: </strong>
                  <input type="date" value={incubationEvalForm.date} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, date: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Evaluator Name: </strong>
                  <input type="text" value={incubationEvalForm.evaluatorName} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, evaluatorName: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Industry: </strong>
                  <input type="text" value={incubationEvalForm.industry} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, industry: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Stage: </strong>
                  <input type="text" value={incubationEvalForm.stage} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, stage: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Ask (₹): </strong>
                  <input type="text" value={incubationEvalForm.ask} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, ask: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p className="full"><strong>Brief Description: </strong>
                  <input type="text" value={incubationEvalForm.briefDescription} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, briefDescription: e.target.value})} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
              </div>

              <table className="eval-table" style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginBottom: "1rem" }}>
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "37%" }} />
                  <col style={{ width: "6%" }} /><col style={{ width: "6%" }} /><col style={{ width: "6%" }} /><col style={{ width: "6%" }} /><col style={{ width: "6%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#F1F1F8" }}>
                    <th style={{ padding: "4px 6px", border: "1px solid #DCDCE7", fontSize: "11px", textAlign: "left" }}>Criteria</th>
                    <th style={{ padding: "4px 6px", border: "1px solid #DCDCE7", fontSize: "11px", textAlign: "left" }}>Description</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px" }}>1<br/>Low</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px" }}>2</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px" }}>3<br/>Avg</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px" }}>4</th>
                    <th style={{ padding: "4px 2px", border: "1px solid #DCDCE7", fontSize: "10px" }}>5<br/>High</th>
                    <th style={{ padding: "4px 6px", border: "1px solid #DCDCE7", fontSize: "11px", textAlign: "left" }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "targetMarket", label: "Target Market", desc: "Addressable market large/growing or high-priced niche. Customer well defined." },
                    { key: "problemNeed", label: "Problem or Need", desc: "Problem is real; customer has significant pain or unfulfilled needs." },
                    { key: "solution", label: "Solution", desc: "Better, Faster, Cheaper, Simple vs Complex, Quality, Efficient, Focused." },
                    { key: "team", label: "Team, Board & Advisors", desc: "Relevant industry knowledge, skills, leadership, key relationships." },
                    { key: "traction", label: "Traction", desc: "Planned milestones, MVP built, market validation, user/revenue growth." },
                    { key: "competition", label: "Competition vs Competitive Advantages", desc: "Direct vs indirect competition, barriers to entry, proprietary tech." },
                    { key: "revenueModel", label: "Revenue Model", desc: "Clear revenue model, sales cycle, ARPU, LTV, recurring or one-time." },
                    { key: "strategy", label: "Strategy: Key Expenses / Time Efforts", desc: "Marketing strategy, cost to acquire/maintain customers, partnerships." },
                    { key: "financialProjections", label: "Financial Projections", desc: "Logical, reasonable margins, realistic penetration, shows scalability." },
                    { key: "exitOpportunity", label: "Exit Opportunity", desc: "Acquirers identified, financial buyer, IPO, short vs long term exit." },
                    { key: "investmentTerms", label: "Investment Terms", desc: "Reasonable given stage, size of capital raise, prior investments." },
                    { key: "overallPresentation", label: "Overall Presentation / Q&A", desc: "Clear, convincing, engaging, handled Q&A effectively, honest." },
                  ].map((c) => (
                    <tr key={c.key}>
                      <td style={{ padding: "6px", border: "1px solid #DCDCE7", fontSize: "12px", fontWeight: "bold", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>{c.label}</td>
                      <td style={{ padding: "6px", border: "1px solid #DCDCE7", fontSize: "11px", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>{c.desc}</td>
                      {["1","2","3","4","5"].map((val) => (
                        <td key={val} style={{ padding: "6px", border: "1px solid #DCDCE7", textAlign: "center" }}>
                          <input type="checkbox" checked={incubationEvalForm.scores[c.key] === val} onChange={() => handleIncubationEvalScoreChange(c.key, val)} style={{ width: "16px", height: "16px", cursor: "pointer" }}/>
                        </td>
                      ))}
                      <td style={{ padding: "6px", border: "1px solid #DCDCE7" }}>
                        <input type="text" value={incubationEvalForm.comments[c.key]} onChange={(e) => handleIncubationEvalCommentChange(c.key, e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px", fontSize: "12px" }}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
                Total Score: {getIncubationEvalTotal()} / 60
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong>Next Steps / Advice: </strong>
                <textarea value={incubationEvalForm.nextSteps} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, nextSteps: e.target.value})} style={{ width: "100%", minHeight: "60px", border: "1px solid #DCDCE7", borderRadius: "4px", padding: "8px", marginTop: "6px" }}/>
              </div>

              <div className="view-grid">
                <p><strong>Name & Designation: </strong>
                  <input type="text" value={incubationEvalForm.nameDesignation} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, nameDesignation: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
                <p><strong>Evaluator Signature: </strong>
                  <input type="text" value={incubationEvalForm.evaluatorSignature} onChange={(e) => setIncubationEvalForm({...incubationEvalForm, evaluatorSignature: e.target.value})} style={{ border: "1px solid #DCDCE7", borderRadius: "4px", padding: "4px 8px" }}/>
                </p>
              </div>

            </div>
          </div>
          , document.body
        )}

        {showEvaluatorsListModal && evaluatorsListApp && createPortal(
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "90%", maxWidth: "550px", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>Evaluations — {evaluatorsListApp.startupName}</h3>
                <button className="btn-close" onClick={() => setShowEvaluatorsListModal(false)}>✕</button>
              </div>
              <p style={{ fontSize: "13px", color: "#6B6B85", marginBottom: "1rem" }}>Each evaluator's score is kept as a separate entry. Click a name to edit it, or add a new evaluation.</p>

              {evaluatorsList.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "12px", color: "#6B6B85", textAlign: "center", marginBottom: "4px" }}>Average Score Profile</div>
                  {renderRadarChart()}
                </div>
              )}

              {loadingEvaluators ? (
                <p style={{ color: "#6B6B85" }}>Loading...</p>
              ) : evaluatorsList.length === 0 ? (
                <p style={{ color: "#6B6B85", padding: "12px 0" }}>No evaluations yet for this application.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
                  {evaluatorsList.map((entry) => (
                    <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #EFEFEF", borderRadius: "8px", padding: "10px 14px" }}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{entry.evaluator_name}</div>
                        <div style={{ fontSize: "12px", color: "#6B6B85" }}>Score: {getEntryScore(entry)} / 60 · Updated {entry.updated_at}</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => editEvaluatorEntry(entry)}
                          className="btn-small"
                          style={{ background: "#EFEFEF", color: "#161629", padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEvaluatorEntry(entry)}
                          className="btn-small"
                          style={{ background: "#FFEBEE", color: "#C62828", padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {evaluatorsList.length > 1 && (
                <button
                  onClick={() => { setShowEvaluatorsListModal(false); setShowCombinedReport(true); }}
                  className="btn-print"
                  style={{ width: "100%", marginBottom: "10px" }}
                >
                  View Combined Report ({evaluatorsList.length} evaluators)
                </button>
              )}

              <button onClick={startNewEvaluation} className="submit-btn" style={{ margin: 0, width: "100%" }}>
                + Add New Evaluation
              </button>
            </div>
          </div>
          , document.body
        )}

        {showCombinedReport && evaluatorsListApp && createPortal(
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" ref={combinedReportPrintRef} style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "95%", maxWidth: "1100px", maxHeight: "88vh", overflowY: "auto", position: "relative" }}>

              <div className="modal-branding-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #6C5CE7", paddingBottom: "16px", marginBottom: "20px" }}>
                <img src={`${window.location.origin}/aic-logo.png`} alt="AIC MUJ" style={{ height: "65px", width: "auto", objectFit: "contain" }} />
                <img src={`${window.location.origin}/manipal-logo.png`} alt="Manipal University Jaipur" style={{ height: "55px", width: "auto", objectFit: "contain" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                <h2>Combined Evaluation Report — {evaluatorsListApp.startupName}</h2>
                <div className="no-print">
                  <button className="btn-print" onClick={() => window.print()} style={{ marginRight: "8px" }}>Print</button>
                  <button className="btn-print" onClick={handleSaveCombinedReportPDF} style={{ marginRight: "8px" }}>Save PDF</button>
                  <button className="btn-close" onClick={() => { setShowCombinedReport(false); setShowEvaluatorsListModal(true); }}>✕</button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                  <thead>
                    <tr style={{ background: "#F1F1F8" }}>
                      <th style={{ padding: "8px 6px", border: "1px solid #DCDCE7", fontSize: "11px", textAlign: "left", whiteSpace: "nowrap" }}>Evaluator</th>
                      {combinedReportCriteria.map((c) => (
                        <th key={c.key} style={{ padding: "8px 4px", border: "1px solid #DCDCE7", fontSize: "10px", textAlign: "center" }}>{c.label}</th>
                      ))}
                      <th style={{ padding: "8px 6px", border: "1px solid #DCDCE7", fontSize: "11px", textAlign: "center", background: "#E9E6FB" }}>Total / 60</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getParsedEvaluators().map((ev, i) => (
                      <tr key={i}>
                        <td style={{ padding: "8px 6px", border: "1px solid #DCDCE7", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>{ev.evaluatorName}</td>
                        {combinedReportCriteria.map((c) => (
                          <td key={c.key} style={{ padding: "8px 4px", border: "1px solid #DCDCE7", fontSize: "12px", textAlign: "center" }}>{ev.scores[c.key] || "-"}</td>
                        ))}
                        <td style={{ padding: "8px 6px", border: "1px solid #DCDCE7", fontSize: "13px", textAlign: "center", fontWeight: "bold", background: "#F8F7FE" }}>{ev.total}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: "8px 6px", border: "1px solid #DCDCE7", fontSize: "12px", fontWeight: "bold" }}>Average</td>
                      {combinedReportCriteria.map((c) => {
                        const evals = getParsedEvaluators();
                        const vals = evals.map((ev) => parseInt(ev.scores[c.key]) || 0).filter((v, idx) => evals[idx].scores[c.key]);
                        const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "-";
                        return <td key={c.key} style={{ padding: "8px 4px", border: "1px solid #DCDCE7", fontSize: "12px", textAlign: "center", fontStyle: "italic" }}>{avg}</td>;
                      })}
                      <td style={{ padding: "8px 6px", border: "1px solid #DCDCE7", fontSize: "13px", textAlign: "center", fontWeight: "bold", background: "#F8F7FE" }}>
                        {(() => {
                          const evals = getParsedEvaluators();
                          const avg = evals.length ? (evals.reduce((sum, ev) => sum + ev.total, 0) / evals.length).toFixed(1) : "-";
                          return avg;
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          , document.body
        )}

        {viewingStartupCrmRecord && createPortal(
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0 }}>{viewingStartupCrmRecord.startup_name || "Startup Detail Record"}</h2>
                <button className="btn-close" onClick={() => setViewingStartupCrmRecord(null)}>✕</button>
              </div>
              {viewingStartupCrmRecord.logo && (
                <p style={{ marginBottom: "1rem" }}>
                  <strong>Photo: </strong>
                  <a href={`${BASE_URL}/download-startup-photo/${viewingStartupCrmRecord.id}`} target="_blank" rel="noreferrer">View Photo</a>
                </p>
              )}
              <div className="view-grid">
                {startupCrmLabels.map(([key, label]) => (
                  <p key={key}><strong>{label}: </strong>{viewingStartupCrmRecord[key] || "—"}</p>
                ))}
              </div>
            </div>
          </div>
          , document.body
        )}

        {pitchingStartup && (
          <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="modal-content" style={{ background: "#FFF", padding: "2rem", borderRadius: "12px", maxWidth: "450px", width: "90%" }}>
              <h3>Schedule Evaluation Pitch</h3>
              <p style={{ fontSize: "14px", color: "#6B6B85", marginBottom: "1rem" }}>Setting target schedule parameters for <strong>{pitchingStartup.startupName}</strong>.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-field">
                  <label>Evaluation Date</label>
                  <input type="date" value={pitchForm.pitch_date} onChange={(e) => setPitchForm({...pitchForm, pitch_date: e.target.value})} />
                </div>
                <div className="form-field">
                  <label>Evaluation Time Slot</label>
                  <input type="time" value={pitchForm.pitch_time} onChange={(e) => setPitchForm({...pitchForm, pitch_time: e.target.value})} />
                </div>
                <div className="form-field">
                  <label>Virtual Room Url (Meet/Zoom)</label>
                  <input type="text" placeholder="https://meet.google.com/..." value={pitchForm.pitch_link} onChange={(e) => setPitchForm({...pitchForm, pitch_link: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.5rem" }}>
                <button onClick={() => setPitchingStartup(null)} className="btn-small" style={{ background: "#EFEFEF", color: "#161629" }}>Cancel</button>
                <button onClick={savePitchDetails} className="submit-btn" style={{ margin: 0, padding: "6px 16px" }}>Save Evaluation Slot</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
