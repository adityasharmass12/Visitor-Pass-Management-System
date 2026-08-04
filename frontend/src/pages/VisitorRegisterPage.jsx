import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const VisitorRegisterPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', purpose: '' });
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (photo) data.append('photo', photo);

    const response = await api.post('/visitors/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setMessage('Visitor profile submitted.');
    setTempPassword(response.data.tempPassword || '');
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <p className="eyebrow">Pre-registration</p>
        <h1>Visitor form</h1>
        <p className="muted">Submit your details before the visit and get a visitor account if needed.</p>
        <form onSubmit={submit} className="stack">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Purpose of visit
            <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </label>
          <label>
            Photo upload
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </label>
          <button className="primary-button" type="submit">Submit registration</button>
        </form>
        {message && <div className="notice success">{message}</div>}
        {tempPassword && <div className="notice">Temporary password: {tempPassword}</div>}
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegisterPage;
