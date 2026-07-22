import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { ShieldAlert } from 'lucide-react';

const Forbidden = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <Card className="max-w-md text-center">
      <ShieldAlert size={56} className="mx-auto mb-4 text-error" />
      <h1 className="text-5xl font-inter font-bold text-on-surface mb-2">403</h1>
      <p className="text-on-surface-variant mb-6">You don't have permission to access this page.</p>
      <Link to="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
    </Card>
  </div>
);

export default Forbidden;
