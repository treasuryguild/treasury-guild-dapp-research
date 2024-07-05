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
import { useTxData } from '../context/TxDataContext';

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
  groups: Group;  // Changed this to match the actual data structure
  created_at: string;
  updated_at: string;
  project_settings: any | null;
}

const ProjectDetailsForm: React.FC<{ walletAddress: string; blockchain: string }> = ({
  walletAddress,
  blockchain,
}) => {
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
  const { txData, setTxData } = useTxData();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const walletExists = await checkWalletExists(walletAddress, blockchain);
      if (walletExists) {
        const projectData = await getProjectByWallet(walletAddress, blockchain);
        if (projectData && projectData.groups) {
          setProject(projectData);
          setTxData((prevTxData) => ({
            ...prevTxData,
            project_id: projectData.id,
            wallet: walletAddress,
            project: projectData.name,
            group: projectData.groups.name, // Access group name through projectData.groups
          }));
        } else {
          console.error('Project data or group information is missing');
          setProject(null);
        }
      } else {
        setProject(null);
        const fetchedGroups = await getAllGroups();
        setGroups(fetchedGroups);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, [walletAddress, blockchain]);

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
      setTxData((prevTxData) => ({
        ...prevTxData,
        project_id: projectData.id,
        wallet: walletAddress,
        project: projectData.name,
      }));
    }

    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
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
      <p>Please select or create a group and project:</p>
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