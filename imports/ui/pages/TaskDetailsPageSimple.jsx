import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Task Details</h1>
        <p>Task ID: {id}</p>
        <button onClick={() => navigate('/tasks')}>Back to Tasks</button>
      </div>
    </div>
  );
};
