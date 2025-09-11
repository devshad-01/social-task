import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { CronJobs } from '../../../api/cron/CronJobsCollection';
import { Icons } from '../Icons';

export const SimpleCronManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    taskType: 'cleanup',
    schedule: 'daily'
  });

  // Subscribe to cron jobs
  const { cronJobs, loading } = useTracker(() => {
    const handle = Meteor.subscribe('cronJobs.all');
    return {
      cronJobs: CronJobs.find({}, { sort: { createdAt: -1 } }).fetch(),
      loading: !handle.ready()
    };
  }, []);

  const scheduleOptions = [
    { value: 'every-minute', label: 'Every Minute', cron: '* * * * *' },
    { value: 'every-5-minutes', label: 'Every 5 Minutes', cron: '*/5 * * * *' },
    { value: 'every-15-minutes', label: 'Every 15 Minutes', cron: '*/15 * * * *' },
    { value: 'every-30-minutes', label: 'Every 30 Minutes', cron: '*/30 * * * *' },
    { value: 'hourly', label: 'Every Hour', cron: '0 * * * *' },
    { value: 'daily', label: 'Daily at 2 AM', cron: '0 2 * * *' },
    { value: 'weekly', label: 'Weekly (Sundays)', cron: '0 2 * * 0' },
    { value: 'monthly', label: 'Monthly (1st of month)', cron: '0 2 1 * *' }
  ];

  const taskTypes = [
    { value: 'notification', label: '📋 Process Scheduled Tasks', description: 'Check for due tasks and notify users' },
    { value: 'overdue-check', label: '� Check Overdue Tasks', description: 'Find and alert about overdue tasks' },
    { value: 'cleanup', label: '🧹 Cleanup Old Data', description: 'Remove old notifications, logs, etc.' },
    { value: 'reports', label: '📊 Generate Reports', description: 'Send system statistics and summaries' },
    { value: 'maintenance', label: '⚙️ System Maintenance', description: 'Clean cache, optimize database' },
    { value: 'custom', label: '🔧 Custom Task', description: 'Generic scheduled task' }
  ];

  const handleCreateJob = async () => {
    if (!newJob.name.trim()) {
      alert('Please enter a job name');
      return;
    }

    const selectedSchedule = scheduleOptions.find(s => s.value === newJob.schedule);
    const selectedTask = taskTypes.find(t => t.value === newJob.taskType);

    try {
      await Meteor.callAsync('cronJobs.create', {
        name: newJob.name,
        description: newJob.description || selectedTask.description,
        cronExpression: selectedSchedule.cron,
        taskType: newJob.taskType,
        taskData: {},
        isActive: true
      });

      setNewJob({ name: '', description: '', taskType: 'cleanup', schedule: 'daily' });
      setShowCreateForm(false);
      alert('✅ Scheduled task created successfully!');
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const toggleJob = async (jobId, isActive) => {
    try {
      await Meteor.callAsync('cronJobs.toggle', jobId, !isActive);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const deleteJob = async (jobId, jobName) => {
    if (confirm(`Are you sure you want to delete "${jobName}"?`)) {
      try {
        await Meteor.callAsync('cronJobs.remove', jobId);
        alert('✅ Scheduled task deleted');
      } catch (error) {
        alert(`❌ Error: ${error.message}`);
      }
    }
  };

  const runJobNow = async (jobId, jobName) => {
    if (confirm(`Run "${jobName}" right now?`)) {
      try {
        await Meteor.callAsync('cronJobs.runNow', jobId);
        alert('✅ Task started');
      } catch (error) {
        alert(`❌ Error: ${error.message}`);
      }
    }
  };

  const createTestData = async () => {
    try {
      const result = await Meteor.callAsync('test.createScheduledTasks');
      alert(`✅ ${result.message}\n\nTest tasks created:\n- Due soon: ${result.testInfo.dueSoon}\n- Overdue: ${result.testInfo.overdue}\n- Due later: ${result.testInfo.dueLater}`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const cleanupTestData = async () => {
    try {
      const result = await Meteor.callAsync('test.cleanupTestTasks');
      alert(`✅ ${result.message}`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const getStatusBadge = (job) => {
    if (!job.isActive) {
      return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">⏸️ Paused</span>;
    }
    if (job.status === 'running') {
      return <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">🟢 Running</span>;
    }
    if (job.status === 'error') {
      return <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">🔴 Error</span>;
    }
    return <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded text-xs">⏱️ Scheduled</span>;
  };

  const getNextRunText = (job) => {
    if (!job.nextRun) return 'Not scheduled';
    const now = new Date();
    const nextRun = new Date(job.nextRun);
    const diffMs = nextRun.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    if (diffMs < 60000) return 'In less than a minute';
    if (diffMs < 3600000) return `In ${Math.round(diffMs / 60000)} minutes`;
    if (diffMs < 86400000) return `In ${Math.round(diffMs / 3600000)} hours`;
    return `In ${Math.round(diffMs / 86400000)} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.loader className="w-6 h-6 animate-spin mr-2" />
        Loading scheduled tasks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">⏰ Scheduled Tasks</h2>
          <p className="text-gray-600">Automate your app with scheduled tasks that run automatically</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={createTestData}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            🧪 Create Test Data
          </button>
          <button
            onClick={cleanupTestData}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            🧹 Cleanup Tests
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Icons.plus className="w-4 h-4" />
            Schedule New Task
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">📅 Schedule a New Task</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name *
              </label>
              <input
                type="text"
                value={newJob.name}
                onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                placeholder="e.g., Daily Cleanup, Weekly Reports"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What should this task do?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {taskTypes.map(task => (
                  <div
                    key={task.value}
                    onClick={() => setNewJob({ ...newJob, taskType: task.value })}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      newJob.taskType === task.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{task.label}</div>
                    <div className="text-sm text-gray-600">{task.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When should it run?
              </label>
              <select
                value={newJob.schedule}
                onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {scheduleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Additional details about this task..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCreateJob}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                ✅ Create Task
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {cronJobs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled tasks yet</h3>
            <p className="text-gray-600 mb-4">Create your first automated task to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Schedule Your First Task
            </button>
          </div>
        ) : (
          cronJobs.map(job => {
            const taskType = taskTypes.find(t => t.value === job.taskType);
            const schedule = scheduleOptions.find(s => s.cron === job.cronExpression);
            
            return (
              <div key={job._id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{job.name}</h3>
                      {getStatusBadge(job)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{taskType?.label || job.taskType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        📅 <span>{schedule?.label || job.cronExpression}</span>
                        {job.isActive && (
                          <>
                            • Next run: <span className="font-medium">{getNextRunText(job)}</span>
                          </>
                        )}
                      </div>
                      {job.description && (
                        <div className="text-gray-500">{job.description}</div>
                      )}
                      <div className="flex items-center gap-4 text-xs">
                        <span>✅ {job.successCount || 0} successful</span>
                        <span>❌ {job.errorCount || 0} failed</span>
                        <span>🔄 {job.runCount || 0} total runs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runJobNow(job._id, job.name)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                      title="Run now"
                    >
                      ▶️
                    </button>
                    <button
                      onClick={() => toggleJob(job._id, job.isActive)}
                      className={`px-3 py-1 rounded text-sm ${
                        job.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={job.isActive ? 'Pause' : 'Resume'}
                    >
                      {job.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => deleteJob(job._id, job.name)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
