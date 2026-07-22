import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Code, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Auth = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', remember: true });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await authAPI.login({ email: formData.email, password: formData.password, remember: formData.remember });
      } else {
        res = await authAPI.register({ name: formData.name, email: formData.email, password: formData.password });
      }
      login(res.data);
      toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 font-inter font-bold text-xl text-primary hover:brightness-110 transition-colors">
        <Code /> PasteBinPro
      </Link>

      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-inter font-semibold text-on-surface mb-2">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-on-surface-variant font-inter text-sm">
            {isLogin ? 'Log in to manage your snippets securely.' : 'Join the elite snippet manager for developers.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <Input label="Full Name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          )}
          <Input label="Email Address" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          {!isLogin && <p className="text-[11px] text-on-surface-variant -mt-2">Min 8 characters, at least one letter and one number.</p>}

          {isLogin && (
            <div className="flex items-center justify-between text-sm -mt-1">
              <label className="flex items-center gap-2 text-on-surface-variant cursor-pointer">
                <input type="checkbox" checked={formData.remember} onChange={(e) => setFormData({ ...formData, remember: e.target.checked })} />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            </div>
          )}

          <Button variant="primary" type="submit" disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2">
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface-variant font-inter">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'} className="text-primary hover:underline">
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
