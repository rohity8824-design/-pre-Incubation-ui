import "./styles.css";
import { useState, useEffect } from "react";

const BASE_URL = "https://pre-incubation-backend.onrender.com";

export default function App() {
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

  const fetchStartups = async () => {
    try {
      const response = await fetch(`${BASE_URL}/startups`);
      const data = await response.json();
      setStartups(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

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
        await fetchStartups();
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

  return (
    <div className="app">
      <div className="header">
        <div className="logo-pill">
          <img src="/aic-logo.png" alt="AIC MUJ" className="logo-aic"/>
          <span className="logo-divider"></span>
          <img src="/manipal-logo.png" alt="Manipal University Jaipur" className="logo-manipal"/>
        </div>
        <h1>Automated Pre-Incubation Management System</h1>
        <p>AIC Startup Portal — Application & Review Dashboard</p>
      </div>

      <div className="stats"></div>

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

      <div className="card">
        <div className="card-title">Pre-Incubation Application</div>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Applicant's Details</div>
          <div className="divider-line"></div>
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

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Startup Details</div>
          <div className="divider-line"></div>
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

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Startup Team Details</div>
          <div className="divider-line"></div>
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

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Requirement from the Incubator</div>
          <div className="divider-line"></div>
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

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Upload Documents</div>
          <div className="divider-line"></div>
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
    </div>
  );
}