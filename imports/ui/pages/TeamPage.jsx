import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Icons } from '../components/Icons';

export const TeamPage = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      avatar: '/images/avatar1.jpg',
      role: 'Team Lead',
      department: 'Creative',
      status: 'active',
      joinDate: '2023-01-15',
      lastActive: '2024-01-12T15:30:00Z',
      activeTasks: 5,
      completedTasks: 28,
      skills: ['Content Creation', 'Strategy', 'Instagram', 'Design'],
      clients: ['Fashion Brand Co.', 'Youth Brand LLC'],
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@company.com',
      avatar: '/images/avatar2.jpg',
      role: 'Social Media Manager',
      department: 'Marketing',
      status: 'active',
      joinDate: '2023-03-20',
      lastActive: '2024-01-12T14:15:00Z',
      activeTasks: 3,
      completedTasks: 22,
      skills: ['Facebook Ads', 'Analytics', 'Campaign Management'],
      clients: ['Tech Startup Inc.', 'B2B Software Co.'],
      permissions: ['content', 'analytics']
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily@company.com',
      avatar: '/images/avatar3.jpg',
      role: 'Content Creator',
      department: 'Creative',
      status: 'active',
      joinDate: '2023-02-10',
      lastActive: '2024-01-12T16:45:00Z',
      activeTasks: 7,
      completedTasks: 35,
      skills: ['Video Production', 'Photography', 'TikTok', 'Editing'],
      clients: ['Restaurant Chain', 'Fashion Brand Co.'],
      permissions: ['content']
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david@company.com',
      avatar: '/images/avatar4.jpg',
      role: 'Analytics Specialist',
      department: 'Data',
      status: 'active',
      joinDate: '2023-04-05',
      lastActive: '2024-01-12T13:20:00Z',
      activeTasks: 2,
      completedTasks: 18,
      skills: ['Data Analysis', 'Reporting', 'LinkedIn', 'B2B Marketing'],
      clients: ['B2B Software Co.', 'Tech Startup Inc.'],
      permissions: ['analytics', 'reporting']
    },
    {
      id: 5,
      name: 'Lisa Garcia',
      email: 'lisa@company.com',
      avatar: '/images/avatar5.jpg',
      role: 'Junior Designer',
      department: 'Creative',
      status: 'active',
      joinDate: '2023-08-12',
      lastActive: '2024-01-12T11:30:00Z',
      activeTasks: 4,
      completedTasks: 12,
      skills: ['Graphic Design', 'Canva', 'Brand Design', 'Social Media Graphics'],
      clients: ['Youth Brand LLC', 'Fashion Brand Co.'],
      permissions: ['content']
    },
    {
      id: 6,
      name: 'Alex Rodriguez',
      email: 'alex@company.com',
      avatar: '/images/avatar6.jpg',
      role: 'Account Manager',
      department: 'Client Relations',
      status: 'offline',
      joinDate: '2023-05-18',
      lastActive: '2024-01-11T18:00:00Z',
      activeTasks: 1,
      completedTasks: 15,
      skills: ['Client Communication', 'Project Management', 'Strategy Planning'],
      clients: ['Restaurant Chain', 'Tech Startup Inc.'],
      permissions: ['client_management']
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesFilter = filter === 'all' || member.status === filter || member.department.toLowerCase() === filter;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleInviteMember = (inviteData) => {
    console.log('Inviting member:', inviteData);
    setIsInviteModalOpen(false);
    // In a real app, this would make an API call
  };

  const getTeamStats = () => {
    const stats = {
      total: teamMembers.length,
      active: teamMembers.filter(m => m.status === 'active').length,
      offline: teamMembers.filter(m => m.status === 'offline').length,
      creative: teamMembers.filter(m => m.department === 'Creative').length,
      totalActiveTasks: teamMembers.reduce((sum, m) => sum + m.activeTasks, 0),
      totalCompletedTasks: teamMembers.reduce((sum, m) => sum + m.completedTasks, 0)
    };
    return stats;
  };

  const stats = getTeamStats();

  const filterOptions = [
    { value: 'all', label: 'All Members', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'offline', label: 'Offline', count: stats.offline },
    { value: 'creative', label: 'Creative', count: stats.creative },
    { value: 'marketing', label: 'Marketing', count: teamMembers.filter(m => m.department === 'Marketing').length },
    { value: 'data', label: 'Data', count: teamMembers.filter(m => m.department === 'Data').length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team</h1>
        <p className="text-gray-600">Manage your team members and their access</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Members</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalActiveTasks}</div>
            <div className="text-sm text-gray-500">Active Tasks</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCompletedTasks}</div>
            <div className="text-sm text-gray-500">Completed Tasks</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="flex items-center gap-2"
              >
                {option.label}
                <Badge variant="secondary" size="sm">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
          <Icons.Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMemberClick(member)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar src={member.avatar} alt={member.name} size="md" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <Badge className={getStatusColor(member.status)} size="sm">
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium">{member.department}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active Tasks:</span>
                  <Badge variant="secondary" size="sm">{member.activeTasks}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Completed:</span>
                  <Badge variant="success" size="sm">{member.completedTasks}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" size="sm" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 3 && (
                    <Badge variant="outline" size="sm" className="text-xs">
                      +{member.skills.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Last active: {formatLastActive(member.lastActive)}
                  </span>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.Users}
          title="No team members found"
          description={searchTerm ? 'Try adjusting your search terms' : 'Invite your first team member to get started'}
          action={
            <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
              <Icons.Plus className="h-4 w-4" />
              Invite Member
            </Button>
          }
        />
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleInviteMember(Object.fromEntries(formData));
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select name="role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="content_creator">Content Creator</option>
              <option value="social_media_manager">Social Media Manager</option>
              <option value="analytics_specialist">Analytics Specialist</option>
              <option value="account_manager">Account Manager</option>
              <option value="designer">Designer</option>
              <option value="team_lead">Team Lead</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select name="department" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Creative">Creative</option>
              <option value="Marketing">Marketing</option>
              <option value="Data">Data</option>
              <option value="Client Relations">Client Relations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              name="message"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Welcome message..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Details Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={selectedMember.name}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={selectedMember.avatar} alt={selectedMember.name} size="lg" />
              <div>
                <h3 className="font-semibold">{selectedMember.name}</h3>
                <p className="text-gray-600">{selectedMember.role}</p>
                <p className="text-sm text-gray-500">{selectedMember.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Department:</span>
                <p className="text-sm">{selectedMember.department}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge className={getStatusColor(selectedMember.status)} size="sm">
                  {selectedMember.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedMember.skills.map((skill) => (
                  <Badge key={skill} variant="outline" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">Clients:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedMember.clients.map((client) => (
                  <Badge key={client} variant="secondary" size="sm">
                    {client}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Join Date:</span>
                <p className="text-sm">{new Date(selectedMember.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Last Active:</span>
                <p className="text-sm">{formatLastActive(selectedMember.lastActive)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
              <Button>Edit Member</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


