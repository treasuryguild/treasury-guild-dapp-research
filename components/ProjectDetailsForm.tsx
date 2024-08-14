import React, { useState, useEffect } from 'react';
import {
  checkWalletExists,
  getProjectByWallet,
  createGroup,
  createProject,
  addWalletToProject,
  getAllGroups,
  getProjectsByGroup,
} from '../utils/walletReg';
import { usePolkadotData, PolkadotData } from '../context/PolkadotContext';
import { useCardanoData, CardanoData } from '../context/CardanoContext';

interface ProjectDetailsFormProps {
  walletAddress: string;
  blockchain: 'Polkadot' | 'Cardano';
  provider: string;
}

interface Group {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  info: string | null;
  logo_url: string | null;
}

interface Project {
  id: string;
  name: string;
  group_id: string;
  groups: Group;
  created_at: string;
  updated_at: string;
  project_settings: any | null;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ walletAddress, blockchain, provider }) => {
  const { polkadotData, setPolkadotData } = usePolkadotData();
  const { cardanoData, setCardanoData } = useCardanoData();

  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getWalletData = () => {
    if (blockchain === 'Polkadot') {
      return {
        setData: setPolkadotData,
        data: polkadotData,
      };
    } else if (blockchain === 'Cardano') {
      return {
        setData: setCardanoData,
        data: cardanoData,
      };
    }
    throw new Error(`Unsupported blockchain: ${blockchain}`);
  };

  const { setData, data } = getWalletData();

  const updateData = (updater: (prevData: PolkadotData | CardanoData) => Partial<PolkadotData | CardanoData>) => {
    if (blockchain === 'Polkadot') {
      setPolkadotData((prevData: PolkadotData) => ({ ...prevData, ...updater(prevData) }));
    } else if (blockchain === 'Cardano') {
      setCardanoData((prevData: CardanoData) => ({ ...prevData, ...updater(prevData) }));
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const walletExists = await checkWalletExists(walletAddress, blockchain);
        if (walletExists) {
          const projectData = await getProjectByWallet(walletAddress, blockchain);
          if (projectData && projectData.groups) {
            setProject(projectData);
            updateData((prevData) => ({
              project_id: projectData.id,
              wallet: walletAddress,
              project: projectData.name,
              group: projectData.groups.name,
              provider: provider,
            }));
          } else {
            console.error('Project data or group information is missing');
            setProject(null);
            setError('Failed to fetch project details. Please try again.');
          }
        } else {
          setProject(null);
          const fetchedGroups = await getAllGroups();
          setGroups(fetchedGroups);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('An error occurred while fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchInitialData();
    }
  }, [walletAddress, blockchain, provider]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedGroupId && selectedGroupId !== 'new') {
        const fetchedProjects = await getProjectsByGroup(selectedGroupId);
        setProjects(fetchedProjects);
      } else {
        setProjects([]);
      }
    };

    fetchProjects();
  }, [selectedGroupId]);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsAddingNewGroup(true);
      setSelectedGroupId('');
    } else {
      setIsAddingNewGroup(false);
      setSelectedGroupId(value);
    }
    setSelectedProjectId('');
    setIsAddingNewProject(false);
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsAddingNewProject(true);
      setSelectedProjectId('');
    } else {
      setIsAddingNewProject(false);
      setSelectedProjectId(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let groupId = selectedGroupId;
    let projectId = selectedProjectId;

    try {
      if (isAddingNewGroup) {
        const newGroup = await createGroup(newGroupName);
        groupId = newGroup.id;
      }

      if (isAddingNewProject) {
        const newProject = await createProject(groupId, newProjectName);
        projectId = newProject.id;
      }

      if (groupId && projectId) {
        await addWalletToProject(projectId, walletAddress, blockchain);
        const projectData = await getProjectByWallet(walletAddress, blockchain);
        setProject(projectData);
        updateData((prevData) => ({
          project_id: projectData.id,
          wallet: walletAddress,
          project: projectData.name,
          group: projectData.groups.name,
        }));
      }
    } catch (err) {
      console.error('Error submitting project details:', err);
      setError('An error occurred while submitting project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (project) {
    return (
      <div>
        <h3>{project.groups?.name || 'Unknown Group'} - {project.name}</h3>
        <p>Blockchain: {blockchain}</p>
        <p>Wallet: {walletAddress}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Please select or create a group and project for {blockchain}:</p>
      <select value={selectedGroupId} onChange={handleGroupChange}>
        <option value="">Select Group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
        <option value="new">Add New Group</option>
      </select>
      {isAddingNewGroup && (
        <input
          type="text"
          placeholder="New Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
      )}
      {selectedGroupId && !isAddingNewGroup && (
        <select value={selectedProjectId} onChange={handleProjectChange}>
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
          <option value="new">Add New Project</option>
        </select>
      )}
      {isAddingNewProject && (
        <input
          type="text"
          placeholder="New Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
      )}
      <button type="submit">Submit</button>
    </form>
  );
};

export default ProjectDetailsForm;