import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { FileQuestion } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <Card className="max-w-md text-center">
      <FileQuestion size={56} className="mx-auto mb-4 text-primary" />
      <h1 className="text-5xl font-inter font-bold text-on-surface mb-2">404</h1>
      <p className="text-on-surface-variant mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="text-primary hover:underline">Return Home</Link>
    </Card>
  </div>
);

export default NotFound;
