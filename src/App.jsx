import "./styles.css";
import { useState, useEffect } from "react";

const BASE_URL = "https://pre-incubation-backend.onrender.com";

export default function App() {
  // URL check karne ke liye state: ?view=form parameter detect karega
  const [isFormOnly, setIsFormOnly] = useState(false);

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

  // URL parameters detect karne ke liye useEffect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "form") {
      setIsFormOnly(true);
    } else {
      setIsFormOnly(false);
      // Agar admin view hai, tabhi startups fetch karenge
      fetchStartups();
    }
  }, []);

  const fetchStartups = async () => {
    try {
      const response = await fetch(`${BASE_URL}/startups`);
      const data = await response.json();
      setStartups(data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    setActionLoadingId(id);
    try {
      const response = await fetch(`${BASE_URL}/update-status/${id}`, {
        method: "POST",
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

  const downloadFolder = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/download-folder/${id}`);
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
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        resetForm();
        if (!isFormOnly) await fetchStartups();
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

  // Stats calculation sirf tabhi ho jab startups data available ho (Admin view)
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
      {/* 1. Sidebar: Sirf admin view mein dikhega */}
      {!isFormOnly && (
        <div className="sidebar">
          <div className="sidebar-brand">
            <img src="/aic-logo.png" alt="AIC MUJ" className="sidebar-logo"/>
            <div>AIC MUJ<small>Incubation Foundation</small></div>
          </div>
          <div className="nav-label">Overview</div>
          <div className="nav-item active">Dashboard</div>
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

      <div className="app">
        <div className="header">
          <div className="logo-pill">
            <img src="/aic-logo.png" alt="AIC MUJ" className="logo-aic"/>
            <span className="logo-divider"></span>
            <img src="/manipal-logo.png" alt="Manipal University Jaipur" className="logo-manipal"/>
          </div>
          <h1>Automated Pre-Incubation Management System</h1>
          <p>{isFormOnly ? "Student / Employee Application Portal" : "AIC Startup Portal — Application & Review Dashboard"}</p>
        </div>

        {/* 2. Stats & Analytics Grid: Sirf admin view mein dikhega */}
        {!isFormOnly && (
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

        {/* 3. Application Form: Dono views mein dikhega */}
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

        {/* 4. Admin Dashboard Table: Sirf admin view mein dikhega */}
        {!isFormOnly && (
          <div className="card">
            <div className="card-title">Admin Dashboard</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Startup</th><th>Founder</th><th>Email</th><th>Sector</th>
                    <th>Pitch</th><th>Resume</th><th>PAN</th><th>Certificate</th><th>Business Plan</th>
                    <th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {startups.length === 0 ? (
                    <tr><td colSpan="12" style={{textAlign:"center",padding:"2rem",color:"#888"}}>
                      No applications found
                    </td></tr>
                  ) : (
                    startups.map((startup) => (
                      <tr key={startup.id}>
                        <td>{startup.id}</td>
                        <td><strong>{startup.startup_name}</strong></td>
                        <td>{startup.founder_name}</td>
                        <td>{startup.email}</td>
                        <td>{startup.sector}</td>
                        <td><a className="dl-link" href={`${BASE_URL}/download/${startup.pitch_deck}`} target="_blank" rel="noreferrer">Download</a></td>
                        <td><a className="dl-link" href={`${BASE_URL}/download/${startup.resume}`} target="_blank" rel="noreferrer">Download</a></td>
                        <td><a className="dl-link" href={`${BASE_URL}/download/${startup.pan_card}`} target="_blank" rel="noreferrer">Download</a></td>
                        <td><a className="dl-link" href={`${BASE_URL}/download/${startup.certificate}`} target="_blank" rel="noreferrer">Download</a></td>
                        <td><a className="dl-link" href={`${BASE_URL}/download/${startup.business_plan}`} target="_blank" rel="noreferrer">Download</a></td>
                        <td>
                          <span className={`badge ${
                            startup.status === "Approved" ? "badge-approved" :
                            startup.status === "Rejected" ? "badge-rejected" : "badge-pending"
                          }`}>
                            {startup.status}
                          </span>
                        </td>
                        <td>
                          {actionLoadingId === startup.id ? (
                            <span style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Updating...</span>
                          ) : (
                            <>
                              <button
                                className="btn-view"
                                onClick={() => setViewingStartup(startup)}
                                style={{background:'#6C5CE7',color:'white',marginRight:'6px',padding:'6px 10px',border:'none',borderRadius:'4px',cursor:'pointer',fontSize:'12px'}}
                              >
                                View Form
                              </button>
                              <button
                                className="btn-download"
                                onClick={() => downloadFolder(startup.id)}
                                style={{background: '#4CAF50', color: 'white', marginRight: '6px', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                              >
                                Download Folder
                              </button>
                              <button className="btn-approve" onClick={() => updateStatus(startup.id, "Approved")}>Approve</button>
                              <button className="btn-reject" onClick={() => updateStatus(startup.id, "Rejected")}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal View for Admin (Injected properties fix applied) */}
      {viewingStartup && (
        <div className="modal-overlay" onClick={() => setViewingStartup(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2>{viewingStartup.startup_name} — Application</h2>
              <div>
                <button className="btn-print" onClick={() => window.print()}>🖨 Print / Save PDF</button>
                <button className="btn-close" onClick={() => setViewingStartup(null)}>✕</button>
              </div>
            </div>

            <div className="view-section">
              <h3>1. Applicant's Details</h3>
              <div className="view-grid">
                <div><label>Name</label><p>{viewingStartup.name || "—"}</p></div>
                <div><label>Email</label><p>{viewingStartup.email || "—"}</p></div>
                <div><label>Gender</label><p>{viewingStartup.gender || "—"}</p></div>
                <div><label>Date of Birth</label><p>{viewingStartup.dob || "—"}</p></div>
                <div className="full"><label>Address</label><p>{viewingStartup.address || "—"}</p></div>
                <div><label>Contact Number</label><p>{viewingStartup.contact_number || "—"}</p></div>
                <div><label>Native State</label><p>{viewingStartup.native_state || "—"}</p></div>
                <div><label>Highest Qualification</label><p>{viewingStartup.highest_qualification || "—"}</p></div>
                <div className="full"><label>Professional Experience</label><p>{viewingStartup.professional_experience || "—"}</p></div>
              </div>
            </div>

            <div className="view-section">
              <h3>2. Startup Details</h3>
              <div className="view-grid">
                <div><label>Startup/Brand Name</label><p>{viewingStartup.startup_name || "—"}</p></div>
                <div><label>Type of Company</label><p>{viewingStartup.company_type || "—"}</p></div>
                <div><label>Date of Incorporation</label><p>{viewingStartup.incorporation_date || "—"}</p></div>
                <div><label>CIN</label><p>{viewingStartup.cin || "—"}</p></div>
                <div className="full"><label>Office Address</label><p>{viewingStartup.office_address || "—"}</p></div>
                <div><label>GST Number</label><p>{viewingStartup.gst_number || "—"}</p></div>
                <div><label>DPIIT Number</label><p>{viewingStartup.dpiit_number || "—"}</p></div>
                <div><label>Sector</label><p>{viewingStartup.sector || "—"}</p></div>
                <div><label>Stage</label><p>{viewingStartup.startup_stage || "—"}</p></div>
                <div className="full"><label>Problem Statement</label><p>{viewingStartup.problem_statement || "—"}</p></div>
                <div className="full"><label>Value Proposition</label><p>{viewingStartup.value_proposition || "—"}</p></div>
                <div className="full"><label>USP</label><p>{viewingStartup.usp || "—"}</p></div>
                <div className="full"><label>Target Customer</label><p>{viewingStartup.target_customer || "—"}</p></div>
                <div className="full"><label>Competitors</label><p>{viewingStartup.competitors || "—"}</p></div>
                <div className="full"><label>Scale Up Plan</label><p>{viewingStartup.scale_up_plan || "—"}</p></div>
                <div className="full"><label>Revenue Model</label><p>{viewingStartup.revenue_model || "—"}</p></div>
                <div><label>Market Size</label><p>{viewingStartup.market_size || "—"}</p></div>
                <div><label>Website URL</label><p>{viewingStartup.website_url || "—"}</p></div>
                <div><label>Social Media Links</label><p>{viewingStartup.social_media_links || "—"}</p></div>
                <div><label>Video URL</label><p>{viewingStartup.video_url || "—"}</p></div>
                <div><label>Govt Support</label><p>{viewingStartup.govt_support || "—"}</p></div>
                <div><label>Seed Support</label><p>{viewingStartup.seed_support || "—"}</p></div>
              </div>
            </div>

            <div className="view-section">
              <h3>3. Team Details</h3>
              <div className="view-grid">
                <div><label>Founder Name</label><p>{viewingStartup.founder_name || "—"}</p></div>
                <div><label>Co-Founder Name</label><p>{viewingStartup.co_founder_name || "—"}</p></div>
                <div><label>Team Emails</label><p>{viewingStartup.team_emails || "—"}</p></div>
                <div><label>Team Contacts</label><p>{viewingStartup.team_contacts || "—"}</p></div>
                <div className="full"><label>LinkedIn Profiles</label><p>{viewingStartup.linkedin_profiles || "—"}</p></div>
                <div><label>Full Time Employees</label><p>{viewingStartup.full_time_employees || "—"}</p></div>
              </div>
            </div>

            <div className="view-section">
              <h3>4. Incubator Requirements</h3>
              <div className="view-grid">
                <div className="full"><label>Why Applying</label><p>{viewingStartup.why_applying || "—"}</p></div>
                <div className="full"><label>Expectations</label><p>{viewingStartup.expectations || "—"}</p></div>
                <div><label>Funds Required</label><p>{viewingStartup.funds_required || "—"}</p></div>
                <div><label>Funding Requirement</label><p>{viewingStartup.funding_requirement || "—"}</p></div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}