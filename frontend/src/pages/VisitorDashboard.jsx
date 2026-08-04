import { useEffect, useState } from 'react';
import api from '../api';
import DashboardShell from '../components/DashboardShell';

const VisitorDashboard = () => {
  const [visitor, setVisitor] = useState(null);
  const [pass, setPass] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const loadData = async () => {
    const visitorRes = await api.get('/visitors/me');
    setVisitor(visitorRes.data.visitor);

    try {
      const passRes = await api.get('/passes/me');
      setPass(passRes.data.pass);
      const qrRes = await api.get(`/passes/${passRes.data.pass._id}/qr`);
      setQrDataUrl(qrRes.data.qrDataUrl);
    } catch (error) {
      setPass(null);
      setQrDataUrl('');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const downloadPdf = async () => {
    if (!pass) return;
    const response = await api.get(`/passes/${pass._id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'visitor-pass.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <DashboardShell title="Visitor dashboard" subtitle="View your profile, QR pass, and PDF badge">
      <section className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Your profile</h2></div>
          {visitor ? (
            <div className="stack">
              <p><strong>Name:</strong> {visitor.name}</p>
              <p><strong>Email:</strong> {visitor.email}</p>
              <p><strong>Phone:</strong> {visitor.phone}</p>
              <p><strong>Purpose:</strong> {visitor.purpose}</p>
              <span className="chip">{visitor.status}</span>
            </div>
          ) : (
            <p className="muted">No visitor profile found yet.</p>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h2>Your pass</h2></div>
          {pass ? (
            <div className="stack">
              <p><strong>Pass:</strong> {pass.passNumber}</p>
              <p><strong>Status:</strong> {pass.status}</p>
              {qrDataUrl && <img className="qr-image" src={qrDataUrl} alt="QR code" />}
              <button className="primary-button" onClick={downloadPdf}>Download PDF</button>
            </div>
          ) : (
            <p className="muted">No pass has been issued yet.</p>
          )}
        </div>
      </section>
    </DashboardShell>
  );
};

export default VisitorDashboard;
