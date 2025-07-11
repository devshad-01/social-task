import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Icons } from '../components/Icons';

export const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Mock data
  const analyticsData = {
    overview: {
      totalFollowers: 45230,
      totalEngagement: 12450,
      totalReach: 89650,
      totalImpressions: 156780,
      followerGrowth: 8.5,
      engagementRate: 4.2,
      reachGrowth: 12.3,
      impressionGrowth: 15.7
    },
    platforms: {
      instagram: {
        followers: 18500,
        engagement: 4850,
        reach: 32100,
        impressions: 58200,
        growth: 12.5
      },
      facebook: {
        followers: 15200,
        engagement: 3200,
        reach: 28400,
        impressions: 45600,
        growth: 6.8
      },
      twitter: {
        followers: 8300,
        engagement: 2100,
        reach: 19800,
        impressions: 35200,
        growth: 4.2
      },
      linkedin: {
        followers: 3230,
        engagement: 2300,
        reach: 9350,
        impressions: 17780,
        growth: 18.9
      }
    },
    topPosts: [
      {
        id: 1,
        platform: 'Instagram',
        content: 'Summer collection launch - behind the scenes',
        engagement: 2840,
        reach: 12500,
        date: '2024-01-10',
        type: 'image'
      },
      {
        id: 2,
        platform: 'Facebook',
        content: 'Customer testimonial video',
        engagement: 1950,
        reach: 8900,
        date: '2024-01-09',
        type: 'video'
      },
      {
        id: 3,
        platform: 'LinkedIn',
        content: 'Industry insights: Social media trends 2024',
        engagement: 1420,
        reach: 5600,
        date: '2024-01-08',
        type: 'article'
      }
    ],
    demographics: {
      age: {
        '18-24': 32,
        '25-34': 28,
        '35-44': 22,
        '45-54': 12,
        '55+': 6
      },
      gender: {
        female: 58,
        male: 40,
        other: 2
      },
      location: {
        'United States': 45,
        'Canada': 12,
        'United Kingdom': 8,
        'Australia': 6,
        'Germany': 5,
        'Other': 24
      }
    },
    engagement: {
      likes: 8450,
      comments: 2100,
      shares: 1200,
      saves: 700,
      clicks: 3450
    }
  };

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const metricOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'platforms', label: 'Platforms' },
    { value: 'content', label: 'Content' },
    { value: 'audience', label: 'Audience' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (growth) => {
    if (growth > 10) return 'text-green-600';
    if (growth > 0) return 'text-green-500';
    return 'text-red-500';
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your social media performance and insights</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {metricOptions.map((metric) => (
            <Button
              key={metric.value}
              variant={selectedMetric === metric.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(metric.value)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Followers</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalFollowers)}</p>
                </div>
                <div className="text-right">
                  <Icons.users className="h-8 w-8 text-blue-500" />
                  <p className={`text-sm ${getGrowthColor(analyticsData.overview.followerGrowth)}`}>
                    +{analyticsData.overview.followerGrowth}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Engagement</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalEngagement)}</p>
                </div>
                <div className="text-right">
                  <Icons.heart className="h-8 w-8 text-red-500" />
                  <p className={`text-sm ${getGrowthColor(analyticsData.overview.engagementRate)}`}>
                    +{analyticsData.overview.engagementRate}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reach</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalReach)}</p>
                </div>
                <div className="text-right">
                  <Icons.eye className="h-8 w-8 text-green-500" />
                  <p className={`text-sm ${getGrowthColor(analyticsData.overview.reachGrowth)}`}>
                    +{analyticsData.overview.reachGrowth}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Impressions</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalImpressions)}</p>
                </div>
                <div className="text-right">
                  <Icons.chart className="h-8 w-8 text-purple-500" />
                  <p className={`text-sm ${getGrowthColor(analyticsData.overview.impressionGrowth)}`}>
                    +{analyticsData.overview.impressionGrowth}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Engagement Breakdown */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Engagement Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(analyticsData.engagement).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(value)}</div>
                    <div className="text-sm text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Performance */}
      {selectedMetric === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(analyticsData.platforms).map(([platform, data]) => (
            <Card key={platform} className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getPlatformIcon(platform)}</span>
                  <span className="capitalize">{platform}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Followers</p>
                    <p className="text-xl font-bold">{formatNumber(data.followers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement</p>
                    <p className="text-xl font-bold">{formatNumber(data.engagement)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reach</p>
                    <p className="text-xl font-bold">{formatNumber(data.reach)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Impressions</p>
                    <p className="text-xl font-bold">{formatNumber(data.impressions)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Growth Rate</span>
                    <Badge variant={data.growth > 10 ? 'success' : data.growth > 0 ? 'warning' : 'destructive'}>
                      {data.growth > 0 ? '+' : ''}{data.growth}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Top Content */}
      {selectedMetric === 'content' && (
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                      <div>
                        <h4 className="font-medium">{post.content}</h4>
                        <p className="text-sm text-gray-500">{post.platform} • {post.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Engagement</p>
                          <p className="font-bold">{formatNumber(post.engagement)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reach</p>
                          <p className="font-bold">{formatNumber(post.reach)}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {post.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audience Demographics */}
      {selectedMetric === 'audience' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.demographics.age).map(([age, percentage]) => (
                  <div key={age} className="flex items-center justify-between">
                    <span className="text-sm">{age}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.demographics.gender).map(([gender, percentage]) => (
                  <div key={gender} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{gender}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.demographics.location).map(([location, percentage]) => (
                  <div key={location} className="flex items-center justify-between">
                    <span className="text-sm">{location}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Icons.download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Icons.download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};
