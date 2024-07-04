import React, { useState, useEffect } from 'react';
import styles from '../styles/TxBuilder.module.css';

interface Project {
  id: string;
  name: string;
  description: string;
  blockchain: string;
  status: 'Active' | 'Completed' | 'Upcoming';
}

const PublicProjectsDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating an API call to fetch projects
    const fetchProjects = async () => {
      try {
        // Replace this with actual API call
        const response = await fetch('/api/public-projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Public Projects Dashboard</h2>
      <div className={styles.projectList}>
        {projects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <h3 className={styles.projectName}>{project.name}</h3>
            <p className={styles.projectDescription}>{project.description}</p>
            <div className={styles.projectDetails}>
              <span className={styles.blockchain}>{project.blockchain}</span>
              <span className={`${styles.status} ${styles[project.status.toLowerCase()]}`}>
                {project.status}
              </span>
            </div>
            <button className={styles.viewButton}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicProjectsDashboard;