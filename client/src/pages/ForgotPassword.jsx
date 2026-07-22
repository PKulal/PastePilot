import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authAPI } from '../api';
import { Code, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success('If that email exists, a reset link was generated.');
      // Dev convenience: the API returns the token directly (no email service configured)
      if (res.data.resetToken) setResetToken(res.data.resetToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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
          <KeyRound size={40} className="mx-auto mb-3 text-primary" />
          <h2 className="text-3xl font-inter font-semibold text-on-surface mb-2">Forgot Password</h2>
          <p className="text-on-surface-variant text-sm">Enter your email to receive a reset token.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email Address" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button variant="primary" type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Sending…' : 'Send Reset Token'}
          </Button>
        </form>

        {resetToken && (
          <div className="mt-6 p-4 bg-surface-container rounded-md border border-outline-variant">
            <p className="text-xs text-on-surface-variant mb-2">Dev mode — no email service. Use this token to reset:</p>
            <code className="text-xs text-secondary break-all block mb-3">{resetToken}</code>
            <Button variant="secondary" className="w-full text-sm" onClick={() => navigate(`/reset-password?token=${resetToken}`)}>
              Continue to Reset →
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-on-surface-variant">
          Remembered it? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
