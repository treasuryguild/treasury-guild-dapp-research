// ../components/CollectContributions/CustomizableProjectTable.tsx
import React, { useState, useEffect } from 'react';
import styles from '../../styles/CustomizableProjectTable.module.css';

interface Field {
  name: string;
  dataType: string;
}

interface Node {
  login?: string;
  name?: string;
}

interface Milestone {
  title?: string;
}

interface ProjectItem {
  title?: string;
  number?: number;
  state?: string;
  body?: string;
  assignees?: { nodes?: Node[] };
  labels?: { nodes?: Node[] };
  milestone?: Milestone;
  fieldValues?: { [key: string]: any };
  [key: string]: any;
}

interface ProjectDetails {
  fields: Field[];
  items: ProjectItem[];
}

interface Column {
  key: string;
  label: string;
}

interface CustomizableProjectTableProps {
  projectDetails: ProjectDetails;
}

const CustomizableProjectTable: React.FC<CustomizableProjectTableProps> = ({ projectDetails }) => {
  const [allColumns, setAllColumns] = useState<Column[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const excludedFields = ['Reviewers', 'Repository','Linked pull requests', 'Due Date', 'Start Date'];

  useEffect(() => {
    const columns = projectDetails.fields
      .filter(field => !excludedFields.includes(field.name))
      .map(field => ({
        key: field.name,
        label: field.name
      }));
    setAllColumns(columns);
    setSelectedColumns(columns.map(col => col.key));
  }, [projectDetails.fields]);

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const renderCellContent = (item: ProjectItem, column: string): string => {
    if (item.fieldValues && item.fieldValues[column]) {
      const fieldValue = item.fieldValues[column];
      if (fieldValue.text) return fieldValue.text;
      if (fieldValue.number) return fieldValue.number.toString();
      if (fieldValue.date) return fieldValue.date;
      if (fieldValue.name) return fieldValue.name;
    }

    switch (column) {
      case 'Assignees':
        return item.assignees?.nodes?.map(node => node.login).join(', ') || 'N/A';
      case 'Labels':
        return item.labels?.nodes?.map(node => node.name).join(', ') || 'N/A';
      case 'Milestone':
        return item.milestone?.title || 'N/A';
      case 'Title':
        return item.title || 'N/A';
      case 'Number':
        return item.number?.toString() || 'N/A';
      case 'Status':
        return item.state || 'N/A';
      default:
        return item[column]?.toString() || 'N/A';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.columnToggle}>
        {allColumns.map(column => (
          <label key={column.key} className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.key)}
              onChange={() => toggleColumn(column.key)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleText}>{column.label}</span>
          </label>
        ))}
      </div>
      <h3 className={styles.tableTitle}>Unpaid Contributions</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {allColumns
                .filter(column => selectedColumns.includes(column.key))
                .map(column => (
                  <th key={column.key} className={styles.tableHeader}>
                    {column.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {projectDetails.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                {allColumns
                  .filter(column => selectedColumns.includes(column.key))
                  .map(column => (
                    <td key={column.key} className={styles.tableCell}>
                      {renderCellContent(item, column.key)}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomizableProjectTable;