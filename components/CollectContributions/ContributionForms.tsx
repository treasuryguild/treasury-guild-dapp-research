// components/ContributionForms.tsx
import React, { useState } from 'react';
import ContributionForm from './ContributionForm';
import UploadJson from './UploadJson';
import GoogleSheetForm from './GoogleSheetForm';
import GitHubProjectBoardForm from './GitHubProjectBoardForm';
import CsvUploadForm from './CsvUploadForm';

interface Contribution {
  name: string;
  labels: string;
  date: string;
  contributors: {
    tokens: {
      token: string;
      amount: string;
    }[];
  }[];
}

interface ContributionFormsProps {
  onContributionSubmit: (contributions: any) => void;
  tokens: any[];
}

export default function ContributionForms({ onContributionSubmit, tokens }: ContributionFormsProps) {
  const [activeForm, setActiveForm] = useState('contribution');

  return (
    <>
      <div>
        <button onClick={() => setActiveForm('contribution')}>Contribution Form</button>
        <button onClick={() => setActiveForm('googleSheet')}>Google Sheet</button>
        <button onClick={() => setActiveForm('githubProjectBoard')}>GitHub Project Board</button>
        <button onClick={() => setActiveForm('csvUpload')}>CSV Upload</button>
        <button onClick={() => setActiveForm('uploadJson')}>Upload JSON</button>
      </div>
      {activeForm === 'contribution' ? (
        <ContributionForm onSubmit={onContributionSubmit} tokens={tokens} />
      ) : activeForm === 'googleSheet' ? (
        <GoogleSheetForm onSubmit={onContributionSubmit} tokens={tokens} />
      ) : activeForm === 'githubProjectBoard' ? (
        <GitHubProjectBoardForm onSubmit={onContributionSubmit} tokens={tokens} />
      ) : activeForm === 'csvUpload' ? (
        <CsvUploadForm onSubmit={onContributionSubmit} tokens={tokens} />
      ) : activeForm === 'uploadJson' ? (
        <UploadJson onSubmit={onContributionSubmit} tokens={tokens} />
      ) : null}
    </>
  );
}