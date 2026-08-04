import { useEffect, useState } from 'react';
import api from '../api';
import DashboardShell from '../components/DashboardShell';

const HostDashboard = () => {
  const [form, setForm] = useState({ visitorName: '', visitorPhone: '', visitorEmail: '', purpose: '', visitDateTime: '' });
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      const { data } = await api.get('/appointments', { params: { mine: 1 } });
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load appointments');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/appointments', form);
      setForm({ visitorName: '', visitorPhone: '', visitorEmail: '', purpose: '', visitDateTime: '' });
      setStatus('Appointment created.');
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create appointment');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    setError('');
    try {
      await api.patch(`/appointments/${id}/approve`);
      setStatus('Appointment approved.');
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve appointment');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Reason for rejection') || 'Rejected by host';
    setError('');
    try {
      await api.patch(`/appointments/${id}/reject`, { reason });
      setStatus('Appointment rejected.');
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject appointment');
    }
  };

  return (
    <DashboardShell title="Host dashboard" subtitle="Invite visitors and approve or reject requests">
      <section className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Invite visitor</h2></div>
          <form className="stack" onSubmit={submit}>
            <input placeholder="Visitor name" value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} />
            <input placeholder="Visitor phone" value={form.visitorPhone} onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })} />
            <input placeholder="Visitor email" value={form.visitorEmail} onChange={(e) => setForm({ ...form, visitorEmail: e.target.value })} />
            <input placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <input type="datetime-local" value={form.visitDateTime} onChange={(e) => setForm({ ...form, visitDateTime: e.target.value })} />
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create appointment'}</button>
          </form>
        </div>

        <div className="card">
          <div className="card-head"><h2>My appointments</h2></div>
          <div className="stack list-stack">
            {appointments.map((appointment) => (
              <div className="list-row" key={appointment._id}>
                <div>
                  <strong>{appointment.visitorName}</strong>
                  <p className="muted">{appointment.purpose} · {new Date(appointment.visitDateTime).toLocaleString()}</p>
                  <span className="chip">{appointment.status}</span>
                </div>
                {appointment.status === 'pending' && (
                  <div className="inline-form">
                    <button className="primary-button" onClick={() => approve(appointment._id)}>Approve</button>
                    <button className="ghost-button" onClick={() => reject(appointment._id)}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {status && <div className="notice success">{status}</div>}
      {error && <div className="notice error">{error}</div>}
    </DashboardShell>
  );
};

export default HostDashboard;
