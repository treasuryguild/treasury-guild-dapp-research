// components/GitHubProjectBoardForm.tsx
import React, { useState, useEffect } from 'react';
import { fetchProjectBoardDetails } from '../../services/githubApi'; // Adjust the path as necessary
import { useTxData } from '../../context/TxDataContext';
import { supabaseAnon } from '../../lib/supabaseClient';

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

export default function GitHubProjectBoardForm({ onSubmit, tokens }: GitHubProjectBoardFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
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
        // Ensure project_settings is an object and initialize boards array if not present
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
      const projectDetails = await fetchProjectBoardDetails(board.repoUrl, board.projectNumber);
      onSubmit(projectDetails);
    } catch (err) {
      setError('Failed to fetch project board details');
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
        // Update existing project settings
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
        // Insert new project (unlikely scenario based on your description)
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
    } catch (err) {
      setError('Failed to fetch project board details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>GitHub Project Board Contribution Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          GitHub Repository or Organization URL:
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
        </label>
        <label>
          Project Number:
          <input
            type="text"
            value={projectNumber}
            onChange={(e) => setProjectNumber(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Fetching...' : 'Submit'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h3>Existing Project Boards</h3>
      <div>
        {project && project.project_settings.boards?.map((board: any, index: number) => (
          <button
            key={index}
            onClick={() => handleFetchProjectDetails(board)}
          >
            {board.title ? board.title : `Board ${index + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}
