import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authAPI } from '../api';
import { Code, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: params.get('token') || '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token: form.token, password: form.password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 font-inter font-bold text-xl text-primary">
        <Code /> PasteBinPro
      </Link>
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock size={40} className="mx-auto mb-3 text-primary" />
          <h2 className="text-3xl font-inter font-semibold text-on-surface mb-2">Reset Password</h2>
          <p className="text-on-surface-variant text-sm">Choose a new password for your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Reset Token" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} required />
          <Input label="New Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          <Button variant="primary" type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-on-surface-variant">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
