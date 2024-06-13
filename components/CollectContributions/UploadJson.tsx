// components/UploadJson.tsx
import React, { useState } from 'react';

interface UploadJsonProps {
  onSubmit: (contributions: any) => void;
  tokens: any[];
}

const UploadJson: React.FC<UploadJsonProps> = ({ onSubmit, tokens }) => {
  const [jsonFile, setJsonFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setJsonFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!jsonFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonData = JSON.parse(event.target?.result as string);
      onSubmit(jsonData);
    };
    reader.readAsText(jsonFile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button type="submit">Upload JSON</button>
    </form>
  );
};

export default UploadJson;