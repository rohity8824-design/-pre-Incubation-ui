import "./styles.css";
import { useState, useEffect, useRef } from "react";
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
    // Applicant Details
    name: "",
    email: "",
    gender: "",
    dob: "",
    address: "",
    contactNumber: "",
    nativeState: "",
    highestQualification: "",
    professionalExperience: "",
    // Startup Details
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
    // Team Details
    founderName: "",
    coFounderName: "",
    teamEmails: "",
    teamContacts: "",
    linkedinProfiles: "",
    fullTimeEmployees: "",
    // Incubator Requirement
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
  });

  const [startups, setStartups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewingStartup, setViewingStartup] = useState(null);
  const [pitchingStartup, setPitchingStartup] = useState(null);
  const [pitchForm, setPitchForm] = useState({ pitch_date: "", pitch_time: "", pitch_link: "" });

  // --- REFS ---
  const reportRef = useRef(null);
  const modalBodyRef = useRef(null);

  // --- RE-AUTH & VIEW CHECK ON LOAD ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "form") {
      setIsFormOnly(true);
      setCheckingAuth(false);
    } else {
      setIsFormOnly(false);
      // Check if already logged in via Session Cookie
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

  // --- FETCH STARTUPS WITH CREDENTIALS ---
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

  // --- HANDLE LOGIN FUNCTION ---
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

  // --- UPDATE STATUS WITH CREDENTIALS ---
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

  // --- PDF EXPORT FUNCTION WITH MULTI-PAGE SPLITTING ---
  const handleSavePDF = async () => {
    const element = modalBodyRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
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

  // --- DOWNLOAD FOLDER WITH CREDENTIALS ---
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
    setFiles({ pitchDeck: null, resume: null, panCard: null, certificate: null, businessPlan: null, otherDocument: null });
  };

  // --- SUBMIT REGISTRATION WITH CREDENTIALS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

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

  // Calculate stats only when startup data is available (Admin view & Logged In)
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
      {/* 1. Sidebar: Visible only in admin layout when logged in */}
      {!isFormOnly && isLoggedIn && (
        <div className="sidebar">
          <div className="sidebar-brand">
            <img src="/aic-logo.png" alt="AIC MUJ" className="sidebar-logo"/>
            <div>AIC MUJ<small>Incubation Foundation</small></div>
          </div>
          <div className="nav-label">Overview</div>
          <div className="nav-item active">Pre Incubation</div>
          <div className="nav-item">Applications</div>
          <div className="nav-item">Startups</div>
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

        {/* 2. Stats & Analytics Grid: Visible only when admin is logged in */}
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
                    <text x="70" y="84" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#6B6B85">Total</text>
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

        {/* 3. Application Form: Visible to everyone for registration */}
        <div className="card">
          <div className="card-title">Pre-Incubation Application</div>

          {/* Section 1: Applicant's Details */}
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

          {/* Section 2: Startup Details */}
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

          {/* Section 3: Startup Team Details */}
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

          {/* Section 4: Requirement from the Incubator */}
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

          {/* Section 5: Upload Documents */}
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
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </button>
        </div>

        {/* 4. Admin Dashboard Table: Locked behind Auth Logic */}
        {!isFormOnly && (
          <div className="card">
            <div className="card-title">Admin Dashboard Dashboard</div>

            {checkingAuth ? (
              <p style={{ padding: "1rem", color: "#6B6B85" }}>Checking access...</p>
            ) : !isLoggedIn ? (
              // --- LOGIN FORM UI ---
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
              // --- APPLICATIONS LIST TABLE ---
              <div style={{ overflowX: "auto", width: "100%", marginTop: "1rem" }}>
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
                    {startups.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#6B6B85" }}>No applications found.</td>
                      </tr>
                    ) : startups.map((s) => (
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
                        <td style={{ padding: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                          <button onClick={() => setViewingStartup(s)} className="btn-small">View</button>
                          <button onClick={() => openPitchModal(s)} className="btn-small btn-pitch">Pitch</button>
                          <button onClick={() => downloadFolder(s.id)} className="btn-small btn-dl">Docs</button>
                          <button onClick={() => toggleCertificate(s.id)} className="btn-small">
                            {s.has_certificate ? "✓ Cert" : "No Cert"}
                          </button>
                          <button onClick={() => updateStatus(s.id, "Approved")} disabled={actionLoadingId === s.id} className="btn-small approved">Approve</button>
                          <button onClick={() => updateStatus(s.id, "Rejected")} disabled={actionLoadingId === s.id} className="btn-small rejected">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- MODAL 1: VIEWING DETAILED APPLICATION REPORT --- */}
       {viewingStartup && (
  <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
    <div className="modal-content" style={{ background: "#FFF", borderRadius: "12px", padding: "2rem", width: "80%", maxHeight: "88vh", overflowY: "auto", position: "relative" }}>
      
     {/* ===== BRANDING LOGOS (Print aur PDF dono me dikhenge) ===== */}
<div className="modal-branding-header" style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #6C5CE7",
    paddingBottom: "16px",
    marginBottom: "20px"
}}>
    {/* Left Logo: AIC MUJ */}
    <img 
        src={`${window.location.origin}/aic-logo.png`} 
        alt="AIC MUJ" 
        style={{ height: "65px", width: "auto", objectFit: "contain" }} 
    />
    
    {/* Right Logo: Manipal University */}
    <img 
        src={`${window.location.origin}/manipal-logo.png`} 
        alt="Manipal University Jaipur" 
        style={{ height: "55px", width: "auto", objectFit: "contain" }} 
    />
</div>

      {/* ===== MODAL HEADER ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
        <h2>Application Deep-Dive Report</h2>
        <div className="no-print">
          <button className="btn-print" onClick={() => window.print()} style={{ marginRight: "8px" }}>Print</button>
          <button className="btn-print" onClick={handleSavePDF} style={{ marginRight: "8px" }}>Save PDF</button>
          <button className="btn-close" onClick={() => setViewingStartup(null)}>✕</button>
        </div>
      </div>

      {/* ===== MODAL BODY CONTENT ===== */}
      <div className="modal-body" ref={modalBodyRef} style={{ padding: "16px", color: "#16162a" }}>
        
        {/* 1. Founder & Personal Profile */}
        <h3 style={{ color: "#6C5CE7", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>1. Founder & Personal Profile</h3>
        <div className="view-grid">
          <p><strong>Full Name: </strong>{viewingStartup.name} ({viewingStartup.gender})</p>
          <p><strong>Email & Contact: </strong>{viewingStartup.email} | {viewingStartup.contact_number}</p>
          <p><strong>Date of Birth: </strong>{viewingStartup.dob}</p>
          <p><strong>Native State & Address: </strong>{viewingStartup.nativeState} | {viewingStartup.address}</p>
          <p className="full"><strong>Qualifications & Experience: </strong>{viewingStartup.highestQualification} | {viewingStartup.professionalExperience || "None Specified"}</p>
        </div>

        {/* 2. Core Venture Parameters */}
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

        {/* 3. Strategic Team Dynamic */}
        <h3 style={{ color: "#00B894", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>3. Strategic Team Dynamic</h3>
        <div className="view-grid">
          <p><strong>Founder & Co-Founder Names: </strong>{viewingStartup.coFounderNames || "None"}</p>
          <p><strong>Team Communication Matrices: </strong>Emails: {viewingStartup.teamEmails} | Phone channels: {viewingStartup.teamContacts}</p>
          <p className="full"><strong>Human Capital Count: </strong>{viewingStartup.fullTimeEmployees} Full-Time workers managed.</p>
        </div>

        {/* 4. Incubation Allocation Expectation */}
        <h3 style={{ color: "#FF7675", borderBottom: "1px solid #EEE", paddingBottom: "8px", marginTop: "1.5rem" }}>4. Incubation Allocation Expectation</h3>
        <div className="view-grid">
          <p className="full"><strong>Motivation Context for Entry: </strong>{viewingStartup.whyApplying}</p>
          <p className="full"><strong>Top Requirements expected: </strong>{viewingStartup.expectations}</p>
          <p className="full"><strong>Capital Allocations requested: </strong>Quantum Needed: {viewingStartup.fundsRequired} | Specific Milestones Structure: {viewingStartup.fundingRequirements}</p>
        </div>

      </div>

    </div>
  </div>
)}

        {/* --- MODAL 2: SCHEDULING PITCH SESSIONS --- */}
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