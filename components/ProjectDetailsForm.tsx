// components/ProjectDetailsForm.tsx
import React, { useState, useEffect } from 'react';
import {
  checkWalletExists,
  getProjectByWallet,
  createGroup,
  createProject,
  addWalletToProject,
} from '../utils/supabaseUtils';
import { useTxData } from '../context/TxDataContext';

const ProjectDetailsForm: React.FC<{ walletAddress: string; blockchain: string }> = ({
  walletAddress,
  blockchain,
}) => {
  const [groupName, setGroupName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const { txData, setTxData } = useTxData();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const walletExists = await checkWalletExists(walletAddress, blockchain);
      if (walletExists) {
        const projectData = await getProjectByWallet(walletAddress, blockchain);
        console.log("Project Data:", projectData);
        setProject(projectData);
        setTxData({ ...txData, project_id: projectData.id, wallet: walletAddress, project: projectData.name});
      } else {
        setProject(null);
        setGroupName('');
        setProjectName('');
      }
      setLoading(false);
    };

    fetchProject();
  }, [walletAddress, blockchain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (project) {
      // Wallet already exists, no need to create a new project
      setLoading(false);
      return;
    }

    const groupData = await createGroup(groupName);
    if (groupData) {
      const projectData = await createProject(groupData.id, projectName);
      if (projectData) {
        await addWalletToProject(projectData.id, walletAddress, blockchain);
        setProject(projectData);
        setTxData({ ...txData, project_id: projectData.id, wallet: walletAddress, project: projectData.name});
        setGroupName('');
        setProjectName('');
      }
    }

    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (project) {
    return (
      <div>
        <h3>Project Details</h3>
        <p>Group Name: {project.groups.name}</p>
        <p>Project Name: {project.name}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ProjectDetailsForm;