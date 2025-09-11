import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { CronJobs } from '../../../api/cron/CronJobsCollection';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Select, TextArea } from '../common/Input';
import { Badge } from '../common/Badge';
import { Icons } from '../Icons';

const CRON_TYPES = {
  NOTIFICATION_CLEANUP: 'notification_cleanup',
  NOTIFICATION_RETRY: 'notification_retry',
  TASK_REMINDERS: 'task_reminders',
  OVERDUE_NOTIFICATIONS: 'overdue_notifications',
  DAILY_SUMMARY: 'daily_summary',
  DATA_CLEANUP: 'data_cleanup',
  SYSTEM_HEALTH: 'system_health'
};

const PRESET_SCHEDULES = [
  { label: 'Every minute', value: '* * * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * * *' },
  { label: 'Every hour', value: '0 * * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * * *' },
  { label: 'Daily at midnight', value: '0 0 0 * * *' },
  { label: 'Daily at 2 AM', value: '0 0 2 * * *' },
  { label: 'Weekly (Sunday)', value: '0 0 0 * * 0' },
  { label: 'Monthly (1st)', value: '0 0 0 1 * *' },
  { label: 'Weekdays at 9 AM', value: '0 0 9 * * 1-5' }
];

export const CronJobManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', type: 'all' });
  const [stats, setStats] = useState(null);

  // Subscribe to cron jobs
  const { cronJobs, loading } = useTracker(() => {
    const handle = Meteor.subscribe('cronJobs.list', filter);
    
    return {
      cronJobs: CronJobs.find({}, { sort: { createdAt: -1 } }).fetch(),
      loading: !handle.ready()
    };
  }, [filter]);

  // Load stats
  useEffect(() => {
    Meteor.call('cronJobs.getStats', (error, result) => {
      if (!error) {
        setStats(result);
      }
    });
  }, [cronJobs]);

  const handleCreateJob = async (jobData) => {
    try {
      await Meteor.callAsync('cronJobs.create', jobData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create cron job:', error);
      alert(error.message);
    }
  };

  const handleToggleJob = async (jobId, enabled) => {
    try {
      await Meteor.callAsync('cronJobs.toggle', jobId, enabled);
    } catch (error) {
      console.error('Failed to toggle cron job:', error);
      alert(error.message);
    }
  };

  const handleExecuteJob = async (jobId) => {
    if (!confirm('Execute this job immediately?')) return;
    
    try {
      await Meteor.callAsync('cronJobs.execute', jobId);
      alert('Job executed successfully');
    } catch (error) {
      console.error('Failed to execute cron job:', error);
      alert(error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Delete this cron job? This action cannot be undone.')) return;
    
    try {
      await Meteor.callAsync('cronJobs.delete', jobId);
    } catch (error) {
      console.error('Failed to delete cron job:', error);
      alert(error.message);
    }
  };

  const initializeDefaults = async () => {
    try {
      const result = await Meteor.callAsync('cronJobs.initializeDefaults');
      alert(`Created ${result.created} default cron jobs`);
    } catch (error) {
      console.error('Failed to initialize defaults:', error);
      alert(error.message);
    }
  };

  const getStatusBadge = (job) => {
    const statusMap = {
      active: { variant: 'success', text: 'Active' },
      paused: { variant: 'warning', text: 'Paused' },
      error: { variant: 'danger', text: 'Error' },
      inactive: { variant: 'secondary', text: 'Inactive' }
    };
    
    const config = statusMap[job.status] || statusMap.inactive;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <Icons.loader className="w-6 h-6 animate-spin mr-2" />
      Loading cron jobs...
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Cron Job Management</h1>
          <p className="text-gray-600">Manage automated tasks and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={initializeDefaults}
          >
            <Icons.settings className="w-4 h-4 mr-1" />
            Initialize Defaults
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            <Icons.plus className="w-4 h-4 mr-1" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
              <div className="text-sm text-gray-600">Paused</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.enabled}</div>
              <div className="text-sm text-gray-600">Enabled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.runningJobs}</div>
              <div className="text-sm text-gray-600">Running</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-40"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
              <option value="inactive">Inactive</option>
            </Select>
            
            <Select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-48"
            >
              <option value="all">All Types</option>
              {Object.entries(CRON_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {cronJobs.map(job => (
          <Card key={job._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{job.name}</h3>
                    {getStatusBadge(job)}
                    {job.enabled ? (
                      <Badge variant="success" size="sm">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary" size="sm">Disabled</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2">{job.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Schedule:</span>
                      <code className="ml-1 bg-gray-100 px-2 py-1 rounded">{job.schedule}</code>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-1">{job.type.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium">Runs:</span>
                      <span className="ml-1">{job.runCount || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Failures:</span>
                      <span className="ml-1">{job.failureCount || 0}</span>
                    </div>
                  </div>
                  
                  {job.lastRun && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Last Run:</span>
                      <span className="ml-1">{new Date(job.lastRun).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={job.enabled ? "warning" : "success"}
                    onClick={() => handleToggleJob(job._id, !job.enabled)}
                  >
                    {job.enabled ? (
                      <>
                        <Icons.pause className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Icons.play className="w-3 h-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecuteJob(job._id)}
                  >
                    <Icons.play className="w-3 h-3 mr-1" />
                    Run Now
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedJob(job)}
                  >
                    <Icons.edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    <Icons.trash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {cronJobs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Icons.calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Cron Jobs</h3>
              <p className="text-gray-600 mb-4">Create your first automated task to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Cron Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || selectedJob) && (
        <CronJobForm
          job={selectedJob}
          onSubmit={selectedJob ? handleUpdateJob : handleCreateJob}
          onCancel={() => {
            setShowCreateForm(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
};

// Create/Edit Form Component
const CronJobForm = ({ job, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: job?.name || '',
    type: job?.type || CRON_TYPES.NOTIFICATION_CLEANUP,
    schedule: job?.schedule || '0 0 2 * * *',
    description: job?.description || '',
    enabled: job?.enabled ?? true,
    timeout: job?.timeout || 300000,
    config: job?.config || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const setPresetSchedule = (schedule) => {
    setFormData({ ...formData, schedule });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{job ? 'Edit Cron Job' : 'Create New Cron Job'}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Job Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Daily Notification Cleanup"
            />

            <Select
              label="Job Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {Object.entries(CRON_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>

            <div>
              <Input
                label="Cron Schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                required
                placeholder="0 0 2 * * * (seconds minutes hours day month dayOfWeek)"
              />
              
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Presets:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PRESET_SCHEDULES.map(preset => (
                    <Button
                      key={preset.value}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPresetSchedule(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this job does..."
              rows={3}
            />

            <Input
              label="Timeout (ms)"
              type="number"
              value={formData.timeout}
              onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
              min="1000"
              max="1800000"
              placeholder="300000"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="enabled" className="text-sm font-medium">
                Enable job immediately
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary">
                {job ? 'Update Job' : 'Create Job'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
