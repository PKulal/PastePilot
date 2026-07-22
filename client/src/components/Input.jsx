import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col w-full mb-4 ${className}`}>
      {label && <label className="text-sm font-medium text-on-surface-variant mb-1">{label}</label>}
      <input 
        ref={ref}
        className="input-field" 
        {...props} 
      />
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
