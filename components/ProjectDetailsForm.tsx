import React, { useState, useEffect, useCallback } from 'react';
import {
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
  token: string | null;
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

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ walletAddress, blockchain, provider, token }) => {
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

  const fetchInitialData = useCallback(async () => {
    console.log("Fetching initial data...");
    setLoading(true);
    setError(null);
    try {
      const projectData = await getProjectByWallet(token, walletAddress, blockchain);
      console.log("Project data:", projectData);
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
        console.log('No existing project found. Fetching groups...');
        setProject(null);
        const fetchedGroups = await getAllGroups(token);
        console.log("Fetched groups:", fetchedGroups);
        setGroups(fetchedGroups);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, walletAddress, blockchain, provider]);

  useEffect(() => {
    if (token && walletAddress) {
      fetchInitialData();
    }
  }, [fetchInitialData, token, walletAddress]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedGroupId && token && selectedGroupId !== 'new') {
        const fetchedProjects = await getProjectsByGroup(token, selectedGroupId);
        console.log("Fetched projects:", fetchedProjects);
        setProjects(fetchedProjects);
      } else {
        setProjects([]);
      }
    };

    fetchProjects();
  }, [selectedGroupId, token]);

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
    if (!token) {
      setError('Authentication token is missing. Please ensure you are logged in.');
      return;
    }

    setLoading(true);
    setError(null);

    let groupId = selectedGroupId;
    let projectId = selectedProjectId;

    try {
      if (isAddingNewGroup) {
        const newGroup = await createGroup(token, newGroupName);
        groupId = newGroup.id;
      }

      if (isAddingNewProject) {
        const newProject = await createProject(token, groupId, newProjectName);
        projectId = newProject.id;
      }

      if (groupId && projectId) {
        await addWalletToProject(token, projectId, walletAddress, blockchain);
        const projectData = await getProjectByWallet(token, walletAddress, blockchain);
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