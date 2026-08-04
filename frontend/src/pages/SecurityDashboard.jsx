import { useEffect, useState } from 'react';
import api from '../api';
import DashboardShell from '../components/DashboardShell';
import QrScanner from '../components/QrScanner';

const SecurityDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({ appointmentId: '', expiresAt: '' });
  const [scanToken, setScanToken] = useState('');
  const [status, setStatus] = useState('');

  const loadPasses = async () => {
    const { data } = await api.get('/passes');
    setPasses(data.passes || []);
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const issuePass = async (e) => {
    e.preventDefault();
    await api.post('/passes', form);
    setForm({ appointmentId: '', expiresAt: '' });
    setStatus('Pass issued.');
    loadPasses();
  };

  const scan = async (action) => {
    const { data } = await api.post('/passes/scan', { token: scanToken, action });
    setStatus(`${action} saved at ${new Date(data.log.scannedAt).toLocaleString()}`);
    loadPasses();
  };

  const handleDownload = async (passId) => {
    const response = await api.get(`/passes/${passId}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'visitor-pass.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <DashboardShell title="Security dashboard" subtitle="Issue passes and scan visitors in and out">
      <section className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Issue pass</h2></div>
          <form className="stack" onSubmit={issuePass}>
            <input placeholder="Appointment ID" value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} />
            <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            <button className="primary-button" type="submit">Generate pass</button>
          </form>
        </div>

        <div className="card">
          <div className="card-head"><h2>Manual token scan</h2></div>
          <div className="stack">
            <input placeholder="Paste scanned token" value={scanToken} onChange={(e) => setScanToken(e.target.value)} />
            <div className="inline-form">
              <button className="primary-button" type="button" onClick={() => scan('checkin')}>Check in</button>
              <button className="ghost-button" type="button" onClick={() => scan('checkout')}>Check out</button>
            </div>
          </div>
          <p className="muted">Or use the camera below.</p>
          <QrScanner onScan={setScanToken} />
        </div>
      </section>

      {status && <div className="notice success">{status}</div>}

      <section className="card">
        <div className="card-head"><h2>Recent passes</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pass</th><th>Visitor</th><th>Status</th><th>PDF</th></tr></thead>
            <tbody>
              {passes.map((pass) => (
                <tr key={pass._id}>
                  <td>{pass.passNumber}</td>
                  <td>{pass.visitor?.name}</td>
                  <td>{pass.status}</td>
                  <td><button className="link-button" onClick={() => handleDownload(pass._id)}>Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
};

export default SecurityDashboard;
