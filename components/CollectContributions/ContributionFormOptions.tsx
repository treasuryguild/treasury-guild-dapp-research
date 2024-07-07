// components/ContributionFormOptions.tsx
import React, { useState } from 'react';
import ContributionForm from './ContributionForm';
import UploadJson from './UploadJson';
import GoogleSheetForm from './GoogleSheetForm';
import GitHubProjectBoardForm from './GitHubProjectBoardForm';
import CsvUploadForm from './CsvUploadForm';
import styles from '../../styles/ContFormOptions.module.css';

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

interface ContributionFormOptionsProps {
  onContributionSubmit: (contributions: any) => void;
  tokens: any[];
}

export default function ContributionFormOptions({ onContributionSubmit, tokens }: ContributionFormOptionsProps) {
  const [activeForm, setActiveForm] = useState('contribution');

  return (
    <div className={styles.container}>
      <div className={styles.buttonWrapper}>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => setActiveForm('contribution')}
            className={`${styles.button} ${activeForm === 'contribution' ? styles.active : ''}`}
          >
            Contribution Form
          </button>
          <button
            onClick={() => setActiveForm('googleSheet')}
            className={`${styles.button} ${activeForm === 'googleSheet' ? styles.active : ''}`}
          >
            Google Sheet
          </button>
          <button
            onClick={() => setActiveForm('githubProjectBoard')}
            className={`${styles.button} ${activeForm === 'githubProjectBoard' ? styles.active : ''}`}
          >
            GitHub Project Board
          </button>
          <button
            onClick={() => setActiveForm('csvUpload')}
            className={`${styles.button} ${activeForm === 'csvUpload' ? styles.active : ''}`}
          >
            CSV Upload
          </button>
          <button
            onClick={() => setActiveForm('uploadJson')}
            className={`${styles.button} ${activeForm === 'uploadJson' ? styles.active : ''}`}
          >
            Upload JSON
          </button>
        </div>
      </div>
      <div className={styles.formContainer}>
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
      </div>
    </div>
  );
}