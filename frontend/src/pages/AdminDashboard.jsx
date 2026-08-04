import { useEffect, useState } from 'react';
import api from '../api';
import DashboardShell from '../components/DashboardShell';

const emptyStaff = { name: '', email: '', password: '', role: 'Security', phone: '' };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [staffForm, setStaffForm] = useState(emptyStaff);

  const loadData = async () => {
    const [overview, userRes, visitorRes, logRes] = await Promise.all([
      api.get('/dashboard/overview'),
      api.get('/users'),
      api.get('/dashboard/visitors'),
      api.get('/dashboard/logs'),
    ]);
    setStats(overview.data);
    setUsers(userRes.data.users || []);
    setVisitors(visitorRes.data.visitors || []);
    setLogs(logRes.data.logs || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createStaff = async (e) => {
    e.preventDefault();
    await api.post('/users', staffForm);
    setStaffForm(emptyStaff);
    loadData();
  };

  const runSearch = async () => {
    const { data } = await api.get('/dashboard/visitors', { params: { search } });
    setVisitors(data.visitors || []);
  };

  const exportLogs = async () => {
    const response = await api.get('/dashboard/logs/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'visitor-logs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <DashboardShell title="Admin dashboard" subtitle="Staff, analytics, visitor search, and exports">
      <section className="grid-4">
        <div className="card stat"><span>Visitors</span><strong>{stats?.visitorCount ?? 0}</strong></div>
        <div className="card stat"><span>Appointments</span><strong>{stats?.appointmentCount ?? 0}</strong></div>
        <div className="card stat"><span>Pending</span><strong>{stats?.pendingAppointments ?? 0}</strong></div>
        <div className="card stat"><span>Today in</span><strong>{stats?.todaysCheckins ?? 0}</strong></div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Create staff</h2>
          </div>
          <form className="stack" onSubmit={createStaff}>
            <input placeholder="Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
            <input placeholder="Email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
            <input placeholder="Password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
            <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
              <option>Security</option>
              <option>Employee</option>
              <option>Admin</option>
            </select>
            <input placeholder="Phone" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
            <button className="primary-button" type="submit">Add user</button>
          </form>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Visitor search</h2>
            <button className="ghost-button" type="button" onClick={exportLogs}>Export logs CSV</button>
          </div>
          <div className="inline-form">
            <input placeholder="Search by name, email, or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="primary-button" type="button" onClick={runSearch}>Search</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Status</th></tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor._id}><td>{visitor.name}</td><td>{visitor.email}</td><td>{visitor.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Staff list</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Email</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}><td>{user.name}</td><td>{user.role}</td><td>{user.email}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Recent logs</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pass</th><th>Visitor</th><th>Action</th><th>Time</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}><td>{log.pass?.passNumber}</td><td>{log.visitor?.name}</td><td>{log.action}</td><td>{new Date(log.scannedAt).toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
};

export default AdminDashboard;
