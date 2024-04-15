// components/ProjectDetailsForm.tsx
import React, { useState, useEffect } from 'react';
import {
  checkWalletExists,
  getProjectByWallet,
  createGroup,
  createProject,
  addWalletToProject,
} from '../utils/polkadot/polkaWalletReg';
import { useTxData } from '../context/TxDataContext';

interface Project {
  id: string;
  name: string;
  groups: {
    id: string;
    name: string;
  };
}

const ProjectDetailsForm: React.FC<{ walletAddress: string; blockchain: string }> = ({
  walletAddress,
  blockchain,
}) => {
  const [groupName, setGroupName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const { txData, setTxData } = useTxData();

  useEffect(() => {
    const fetchProject: any = async () => {
      setLoading(true);
      const walletExists = await checkWalletExists(walletAddress, blockchain);
      if (walletExists) {
        const projectData = await getProjectByWallet(walletAddress, blockchain);
        setProject(projectData);
        setTxData((prevTxData) => ({
          ...prevTxData,
          project_id: projectData.id,
          wallet: walletAddress,
          project: projectData.name,
        }));
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
        setTxData((prevTxData) => ({
          ...prevTxData,
          project_id: projectData.id,
          wallet: walletAddress,
          project: projectData.name,
        }));
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
        <p>Group Name: {project?.groups?.name}</p>
        <p>Project Name: {project?.name}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Please enter wallet details:</p>
      <input
        type="text"
        placeholder="Group/Organization Name"
        title="The name of your organization or group."
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Project Name"
        title="The name of your project."
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ProjectDetailsForm;