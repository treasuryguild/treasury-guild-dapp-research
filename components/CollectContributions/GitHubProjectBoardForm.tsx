// components/GitHubProjectBoardForm.tsx
import React, { useState, useEffect } from 'react';
import { fetchProjectBoardDetails } from '../../services/githubApi';
import { useTxData } from '../../context/TxDataContext';
import { supabaseAnon } from '../../lib/supabaseClient';
import styles from '../../styles/GitHubProjectBoardForm.module.css';
import CustomizableProjectTable from './CustomizableProjectTable';

interface GitHubProjectBoardFormProps {
  onSubmit: (contributions: any) => void;
  tokens: any[];
}

interface Project {
  id: string;
  name: string;
  group_id: string;
  created_at: string;
  project_settings: any;
}

interface ProjectDetails {
  items: any[];
  fields: any[];
  title: string;
  // Add other properties as needed
}

export default function GitHubProjectBoardForm({ onSubmit, tokens }: GitHubProjectBoardFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const { txData, setTxData } = useTxData();

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabaseAnon
        .from('projects')
        .select('*')
        .eq('id', txData.project_id)
        .single();

      if (error) {
        setError('Failed to fetch project from database');
      } else {
        const projectData = {
          ...data,
          project_settings: data.project_settings || { boards: [] },
        };
        if (!projectData.project_settings.boards) {
          projectData.project_settings.boards = [];
        }
        setProject(projectData);
      }
    };

    fetchProject();
  }, [txData.project_id]);

  const handleFetchProjectDetails = async (board: any) => {
    try {
      setLoading(true);
      const details = await fetchProjectBoardDetails(board.repoUrl, board.projectNumber);
      setProjectDetails(details);
      onSubmit(details);
    } catch (err) {
      setError('Failed to fetch project board details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const projectDetails = await fetchProjectBoardDetails(repoUrl, projectNumber);
      const newBoard = {
        repoUrl,
        projectNumber,
        title: projectDetails.title,
      };

      if (project) {
        const updatedSettings = {
          ...project.project_settings,
          boards: [...(project.project_settings.boards || []), newBoard],
        };

        const { data, error } = await supabaseAnon
          .from('projects')
          .update({ project_settings: updatedSettings })
          .eq('id', txData.project_id);

        if (error) {
          throw error;
        }

        setProject({ ...project, project_settings: updatedSettings });
      } else {
        const { data, error }: any = await supabaseAnon.from('projects').insert([
          {
            name: `Project Board ${projectNumber}`,
            group_id: txData.group,
            project_settings: { boards: [newBoard] },
          },
        ]);

        if (error) {
          throw error;
        }

        setProject(data[0]);
      }

      onSubmit(projectDetails);
      setShowForm(false);
      setRepoUrl('');
      setProjectNumber('');
    } catch (err) {
      setError('Failed to fetch project board details');
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    setSelectedBoard(e.target.value);
    if (selectedIndex >= 0 && project && project.project_settings.boards) {
      const board = project.project_settings.boards[selectedIndex];
      if (board) {
        handleFetchProjectDetails(board);
      }
    }
  };

  return (
    <div className={styles.container}>  
      <div className={styles.boardSelection}>
        <select 
          value={selectedBoard} 
          onChange={handleBoardSelect}
          className={styles.dropdown}
        >
          <option value="">Select a project board</option>
          {project && project.project_settings.boards?.map((board: any, index: number) => (
            <option key={index} value={index}>
              {board.title ? board.title : `Board ${index + 1}`}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(true)}
          className={`${styles.button} ${styles.addButton}`}
        >
          Add New Project Board
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="repoUrl" className={styles.label}>
              GitHub Repository or Organization URL:
            </label>
            <input
              id="repoUrl"
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="projectNumber" className={styles.label}>
              Project Number:
            </label>
            <input
              id="projectNumber"
              type="text"
              value={projectNumber}
              onChange={(e) => setProjectNumber(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Adding...' : 'Add Project Board'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Loading...</p>}
      {projectDetails && (
        <div className={styles.tableContainer}>
          <CustomizableProjectTable projectDetails={projectDetails} />
        </div>
      )}
    </div>
  );
}