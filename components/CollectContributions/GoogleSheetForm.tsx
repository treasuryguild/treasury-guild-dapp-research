// components/CollectContributions/GoogleSheetForm.tsx
import React, { useState } from 'react';

interface GoogleSheetFormProps {
  onSubmit: (contributions: any) => void;
  tokens: any[];
}

export default function GoogleSheetForm({ onSubmit, tokens }: GoogleSheetFormProps) {
  const [sheetUrl, setSheetUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement the logic to fetch contributions from the Google Sheet URL
    // and pass them to the onSubmit callback
    console.log("sheetUrl", sheetUrl);
    onSubmit({/* contributions */});
  };

  return (
    <div>
      <h2>Google Sheet Contribution Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Google Sheet URL:
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}