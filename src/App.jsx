import "./styles.css";
import { useState, useEffect } from "react";

const BASE_URL = "https://pre-incubation-backend.onrender.com";

export default function App() {

  const [formData, setFormData] = useState({
    startupName: "",
    founderName: "",
    email: "",
    sector: "",
  });

  const [files, setFiles] = useState({
    pitchDeck: null,
    resume: null,
    panCard: null,
    certificate: null,
    businessPlan: null,
  });

  const [startups, setStartups] = useState([]);

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
    try {
      await fetch(`${BASE_URL}/update-status/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status }),
      });
      fetchStartups();
    } catch (error) {
      console.log(error);
      alert("Status Update Failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("startupName", formData.startupName);
      data.append("founderName", formData.founderName);
      data.append("email", formData.email);
      data.append("sector", formData.sector);
      data.append("pitchDeck", files.pitchDeck);
      data.append("resume", files.resume);
      data.append("panCard", files.panCard);
      data.append("certificate", files.certificate);
      data.append("businessPlan", files.businessPlan);

      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        setFormData({ startupName: "", founderName: "", email: "", sector: "" });
        setFiles({ pitchDeck: null, resume: null, panCard: null, certificate: null, businessPlan: null });
        fetchStartups();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.log(error);
      alert("Backend Connection Error");
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Automated Pre-Incubation Management System</h1>
        <p>AIC Startup Portal — Application & Review Dashboard</p>
      </div>

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
        <div className="card-title">Startup Registration</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Startup Name</label>
            <input type="text" placeholder="e.g. GreenFarm AI"
              name="startupName" value={formData.startupName} onChange={handleChange}/>
          </div>
          <div className="form-field">
            <label>Founder Name</label>
            <input type="text" placeholder="e.g. Rohit Sharma"
              name="founderName" value={formData.founderName} onChange={handleChange}/>
          </div>
          <div className="form-field">
            <label>Email Address</label>
            <input type="email" placeholder="founder@startup.com"
              name="email" value={formData.email} onChange={handleChange}/>
          </div>
          <div className="form-field">
            <label>Sector</label>
            <select name="sector" value={formData.sector} onChange={handleChange}>
              <option value="">Select Sector</option>
              <option>Agritech</option>
              <option>Healthtech</option>
              <option>Edtech</option>
              <option>Fintech</option>
            </select>
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
            <input type="file" accept=".pdf"
              onChange={(e) => setFiles({...files, pitchDeck: e.target.files[0]})}/>
          </div>
          <div className="file-upload">
            <label>Resume / CV (PDF)</label>
            <input type="file" accept=".pdf"
              onChange={(e) => setFiles({...files, resume: e.target.files[0]})}/>
          </div>
          <div className="file-upload">
            <label>PAN Card (PDF/Image)</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFiles({...files, panCard: e.target.files[0]})}/>
          </div>
          <div className="file-upload">
            <label>Registration Certificate</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFiles({...files, certificate: e.target.files[0]})}/>
          </div>
          <div className="file-upload" style={{gridColumn:"span 2"}}>
            <label>Business Plan (PDF)</label>
            <input type="file" accept=".pdf"
              onChange={(e) => setFiles({...files, businessPlan: e.target.files[0]})}/>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Submit Application
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
                      <button className="btn-approve" onClick={() => updateStatus(startup.id, "Approved")}>Approve</button>
                      <button className="btn-reject" onClick={() => updateStatus(startup.id, "Rejected")}>Reject</button>
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