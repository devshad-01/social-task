# 🔗 Social Media API Integration Guide

## Facebook Graph API Integration

### OAuth Setup & Token Management

#### FacebookConnect.jsx
```javascript
// imports/ui/components/social/FacebookConnect.jsx
import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';

export function FacebookConnect({ clientId, onSuccess, onError }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function() {
      FB.init({
        appId: Meteor.settings.public.facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleFacebookLogin = () => {
    setIsConnecting(true);
    
    FB.login((response) => {
      if (response.authResponse) {
        // Exchange short-lived token for long-lived token
        const shortToken = response.authResponse.accessToken;
        
        Meteor.call('facebook.exchangeToken', shortToken, (error, longLivedToken) => {
          if (error) {
            setIsConnecting(false);
            onError?.(error);
            return;
          }
          
          // Get user's Facebook pages
          FB.api('/me/accounts', { access_token: longLivedToken }, (pagesResponse) => {
            setIsConnecting(false);
            
            if (pagesResponse.data && pagesResponse.data.length > 0) {
              // Show page selection modal
              handlePageSelection(pagesResponse.data, longLivedToken);
            } else {
              onError?.('No Facebook pages found');
            }
          });
        });
      } else {
        setIsConnecting(false);
        onError?.('Facebook login cancelled');
      }
    }, {
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish'
    });
  };

  const handlePageSelection = (pages, userToken) => {
    // This would open a modal to select which page to connect
    // For now, we'll just take the first page
    const selectedPage = pages[0];
    
    // Connect the page to the client
    Meteor.call('clients.connectSocial', clientId, {
      platform: 'facebook',
      accountId: selectedPage.id,
      accessToken: selectedPage.access_token,
      name: selectedPage.name
    }, (error) => {
      if (error) {
        onError?.(error);
      } else {
        setConnectionStatus('connected');
        onSuccess?.({
          platform: 'facebook',
          accountId: selectedPage.id,
          name: selectedPage.name
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Facebook</h3>
            <p className="text-sm text-gray-500">
              {connectionStatus === 'connected' ? 'Connected' : 'Connect your Facebook page'}
            </p>
          </div>
        </div>
        
        {connectionStatus === 'disconnected' && (
          <button
            onClick={handleFacebookLogin}
            disabled={isConnecting}
            className="btn-primary text-sm"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
        
        {connectionStatus === 'connected' && (
          <button
            onClick={() => handleDisconnect('facebook')}
            className="btn-outline text-sm"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
```

### Server-Side Facebook Methods

#### facebook-methods.js
```javascript
// imports/api/social/facebook-methods.js
import { HTTP } from 'meteor/http';
import CryptoJS from 'crypto-js';

const FB_APP_ID = Meteor.settings.private?.facebookAppId;
const FB_APP_SECRET = Meteor.settings.private?.facebookAppSecret;
const ENCRYPTION_KEY = Meteor.settings.private?.encryptionKey;

Meteor.methods({
  'facebook.exchangeToken'(shortLivedToken) {
    check(shortLivedToken, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.get('https://graph.facebook.com/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: shortLivedToken
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      throw new Meteor.Error('token-exchange-failed', error.message);
    }
  },
  
  'facebook.getPagePosts'(pageId, accessToken, limit = 10) {
    check(pageId, String);
    check(accessToken, String);
    check(limit, Number);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.get(`https://graph.facebook.com/${pageId}/posts`, {
        params: {
          access_token: accessToken,
          limit: limit,
          fields: 'id,message,created_time,permalink_url,engagement'
        }
      });
      
      return response.data.data;
    } catch (error) {
      throw new Meteor.Error('fetch-posts-failed', error.message);
    }
  },
  
  'facebook.publishPost'(pageId, accessToken, postData) {
    check(pageId, String);
    check(accessToken, String);
    check(postData, {
      message: String,
      link: Match.Optional(String),
      published: Match.Optional(Boolean),
      scheduled_publish_time: Match.Optional(Number)
    });
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.post(`https://graph.facebook.com/${pageId}/feed`, {
        params: {
          access_token: accessToken,
          ...postData
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Meteor.Error('publish-failed', error.message);
    }
  },
  
  'facebook.uploadPhoto'(pageId, accessToken, photoUrl, caption) {
    check(pageId, String);
    check(accessToken, String);
    check(photoUrl, String);
    check(caption, Match.Optional(String));
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.post(`https://graph.facebook.com/${pageId}/photos`, {
        params: {
          access_token: accessToken,
          url: photoUrl,
          caption: caption,
          published: true
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Meteor.Error('photo-upload-failed', error.message);
    }
  },
  
  'facebook.getInsights'(pageId, accessToken, metrics, period = 'day') {
    check(pageId, String);
    check(accessToken, String);
    check(metrics, [String]);
    check(period, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.get(`https://graph.facebook.com/${pageId}/insights`, {
        params: {
          access_token: accessToken,
          metric: metrics.join(','),
          period: period
        }
      });
      
      return response.data.data;
    } catch (error) {
      throw new Meteor.Error('insights-failed', error.message);
    }
  },
  
  'facebook.validateToken'(accessToken) {
    check(accessToken, String);
    
    try {
      const response = HTTP.get('https://graph.facebook.com/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name'
        }
      });
      
      return {
        valid: true,
        user: response.data
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
});
```

## Instagram Business API Integration

### Instagram Connection Component

#### InstagramConnect.jsx
```javascript
// imports/ui/components/social/InstagramConnect.jsx
import React, { useState } from 'react';

export function InstagramConnect({ clientId, onSuccess, onError }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const handleInstagramConnect = () => {
    setIsConnecting(true);
    
    // Instagram requires Facebook login first (since it's part of Facebook Business)
    FB.login((response) => {
      if (response.authResponse) {
        // Get Instagram Business accounts connected to Facebook pages
        FB.api('/me/accounts', { 
          access_token: response.authResponse.accessToken,
          fields: 'instagram_business_account'
        }, (pagesResponse) => {
          const instagramAccounts = pagesResponse.data
            .filter(page => page.instagram_business_account)
            .map(page => ({
              pageId: page.id,
              pageName: page.name,
              instagramId: page.instagram_business_account.id
            }));
          
          if (instagramAccounts.length > 0) {
            handleInstagramAccountSelection(instagramAccounts, response.authResponse.accessToken);
          } else {
            setIsConnecting(false);
            onError?.('No Instagram Business accounts found');
          }
        });
      } else {
        setIsConnecting(false);
        onError?.('Facebook login required for Instagram');
      }
    }, {
      scope: 'instagram_basic,instagram_content_publish,pages_show_list'
    });
  };

  const handleInstagramAccountSelection = (accounts, accessToken) => {
    // For now, take the first account
    const selectedAccount = accounts[0];
    
    Meteor.call('clients.connectSocial', clientId, {
      platform: 'instagram',
      accountId: selectedAccount.instagramId,
      accessToken: accessToken,
      name: selectedAccount.pageName
    }, (error) => {
      setIsConnecting(false);
      if (error) {
        onError?.(error);
      } else {
        setConnectionStatus('connected');
        onSuccess?.({
          platform: 'instagram',
          accountId: selectedAccount.instagramId,
          name: selectedAccount.pageName
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">Instagram</h3>
          <p className="text-sm text-gray-500">
            {connectionStatus === 'connected' ? 'Connected' : 'Connect your Instagram Business account'}
          </p>
        </div>
      </div>
      
      {connectionStatus === 'disconnected' && (
        <button
          onClick={handleInstagramConnect}
          disabled={isConnecting}
          className="btn-primary text-sm"
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      )}
    </div>
  );
}
```

### Instagram Server Methods

#### instagram-methods.js
```javascript
// imports/api/social/instagram-methods.js
import { HTTP } from 'meteor/http';

Meteor.methods({
  'instagram.getProfile'(instagramId, accessToken) {
    check(instagramId, String);
    check(accessToken, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.get(`https://graph.facebook.com/${instagramId}`, {
        params: {
          access_token: accessToken,
          fields: 'id,username,profile_picture_url,followers_count,media_count'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Meteor.Error('profile-fetch-failed', error.message);
    }
  },
  
  'instagram.getMedia'(instagramId, accessToken, limit = 10) {
    check(instagramId, String);
    check(accessToken, String);
    check(limit, Number);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.get(`https://graph.facebook.com/${instagramId}/media`, {
        params: {
          access_token: accessToken,
          limit: limit,
          fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count'
        }
      });
      
      return response.data.data;
    } catch (error) {
      throw new Meteor.Error('media-fetch-failed', error.message);
    }
  },
  
  'instagram.publishPhoto'(instagramId, accessToken, imageUrl, caption) {
    check(instagramId, String);
    check(accessToken, String);
    check(imageUrl, String);
    check(caption, Match.Optional(String));
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      // Step 1: Create media container
      const containerResponse = HTTP.post(`https://graph.facebook.com/${instagramId}/media`, {
        params: {
          access_token: accessToken,
          image_url: imageUrl,
          caption: caption
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Step 2: Publish the media
      const publishResponse = HTTP.post(`https://graph.facebook.com/${instagramId}/media_publish`, {
        params: {
          access_token: accessToken,
          creation_id: containerId
        }
      });
      
      return publishResponse.data;
    } catch (error) {
      throw new Meteor.Error('instagram-publish-failed', error.message);
    }
  },
  
  'instagram.publishVideo'(instagramId, accessToken, videoUrl, caption) {
    check(instagramId, String);
    check(accessToken, String);
    check(videoUrl, String);
    check(caption, Match.Optional(String));
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      // Create video container
      const containerResponse = HTTP.post(`https://graph.facebook.com/${instagramId}/media`, {
        params: {
          access_token: accessToken,
          video_url: videoUrl,
          caption: caption,
          media_type: 'VIDEO'
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Check container status (videos need processing time)
      const checkStatus = () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            HTTP.get(`https://graph.facebook.com/${containerId}`, {
              params: {
                access_token: accessToken,
                fields: 'status_code'
              }
            }, (error, response) => {
              if (error) {
                clearInterval(interval);
                reject(error);
                return;
              }
              
              if (response.data.status_code === 'FINISHED') {
                clearInterval(interval);
                resolve(containerId);
              } else if (response.data.status_code === 'ERROR') {
                clearInterval(interval);
                reject(new Error('Video processing failed'));
              }
            });
          }, 5000); // Check every 5 seconds
          
          // Timeout after 2 minutes
          setTimeout(() => {
            clearInterval(interval);
            reject(new Error('Video processing timeout'));
          }, 120000);
        });
      };
      
      const readyContainerId = await checkStatus();
      
      // Publish the video
      const publishResponse = HTTP.post(`https://graph.facebook.com/${instagramId}/media_publish`, {
        params: {
          access_token: accessToken,
          creation_id: readyContainerId
        }
      });
      
      return publishResponse.data;
    } catch (error) {
      throw new Meteor.Error('instagram-video-publish-failed', error.message);
    }
  },
  
  'instagram.getInsights'(mediaId, accessToken, metrics) {
    check(mediaId, String);
    check(accessToken, String);
    check(metrics, [String]);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    try {
      const response = HTTP.get(`https://graph.facebook.com/${mediaId}/insights`, {
        params: {
          access_token: accessToken,
          metric: metrics.join(',')
        }
      });
      
      return response.data.data;
    } catch (error) {
      throw new Meteor.Error('instagram-insights-failed', error.message);
    }
  }
});
```

## Social Media Posting Workflow

### PostingWorkflow.jsx
```javascript
// imports/ui/components/social/PostingWorkflow.jsx
import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Clients } from '/imports/api/clients/clients';

export function PostingWorkflow({ task, onComplete }) {
  const [isPosting, setIsPosting] = useState(false);
  const [postResults, setPostResults] = useState([]);
  
  const client = useTracker(() => 
    Clients.findOne(task.clientId)
  );

  const handlePublishToAll = async () => {
    setIsPosting(true);
    const results = [];
    
    for (const account of client.socialAccounts) {
      if (!account.isConnected) continue;
      
      try {
        let result;
        
        if (account.platform === 'facebook') {
          if (task.attachments && task.attachments.length > 0) {
            // Post with image
            result = await new Promise((resolve, reject) => {
              Meteor.call('facebook.uploadPhoto', 
                account.accountId, 
                account.accessToken, 
                task.attachments[0].url, 
                task.content,
                (error, response) => {
                  if (error) reject(error);
                  else resolve(response);
                }
              );
            });
          } else {
            // Text post
            result = await new Promise((resolve, reject) => {
              Meteor.call('facebook.publishPost',
                account.accountId,
                account.accessToken,
                { message: task.content },
                (error, response) => {
                  if (error) reject(error);
                  else resolve(response);
                }
              );
            });
          }
        } else if (account.platform === 'instagram') {
          if (task.attachments && task.attachments.length > 0) {
            const attachment = task.attachments[0];
            
            if (attachment.type === 'image') {
              result = await new Promise((resolve, reject) => {
                Meteor.call('instagram.publishPhoto',
                  account.accountId,
                  account.accessToken,
                  attachment.url,
                  task.content,
                  (error, response) => {
                    if (error) reject(error);
                    else resolve(response);
                  }
                );
              });
            } else if (attachment.type === 'video') {
              result = await new Promise((resolve, reject) => {
                Meteor.call('instagram.publishVideo',
                  account.accountId,
                  account.accessToken,
                  attachment.url,
                  task.content,
                  (error, response) => {
                    if (error) reject(error);
                    else resolve(response);
                  }
                );
              });
            }
          }
        }
        
        results.push({
          platform: account.platform,
          accountId: account.accountId,
          success: true,
          postId: result.id,
          url: result.permalink_url || result.id
        });
        
      } catch (error) {
        results.push({
          platform: account.platform,
          accountId: account.accountId,
          success: false,
          error: error.message
        });
      }
    }
    
    setPostResults(results);
    setIsPosting(false);
    
    // Mark task as completed if at least one post succeeded
    const hasSuccess = results.some(r => r.success);
    if (hasSuccess) {
      onComplete(task._id, `Posted to ${results.filter(r => r.success).length} platforms`);
    }
  };

  if (!client) {
    return <div>Loading client data...</div>;
  }

  const connectedAccounts = client.socialAccounts?.filter(acc => acc.isConnected) || [];

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Publish Task: {task.title}
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-900">{task.content}</p>
            </div>
          </div>
          
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
              <div className="grid grid-cols-2 gap-3">
                {task.attachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    {attachment.type === 'image' ? (
                      <img 
                        src={attachment.url} 
                        alt="Attachment" 
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ) : (
                      <video 
                        src={attachment.url} 
                        className="w-full h-24 object-cover rounded-md"
                        controls
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Target Platforms ({connectedAccounts.length})
            </h4>
            <div className="space-y-2">
              {connectedAccounts.map((account, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    account.platform === 'facebook' ? 'bg-blue-500' : 'bg-pink-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {account.platform} - {account.name || account.accountId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {postResults.length === 0 ? (
          <div className="flex space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={handlePublishToAll}
              disabled={isPosting || connectedAccounts.length === 0}
              className="btn-primary flex-1"
            >
              {isPosting ? 'Publishing...' : `Publish to All Platforms (${connectedAccounts.length})`}
            </button>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Publishing Results</h4>
            <div className="space-y-2">
              {postResults.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-md ${
                  result.success ? 'bg-success-50 border border-success-200' : 'bg-error-50 border border-error-200'
                }`}>
                  <span className="text-sm font-medium">
                    {result.platform.charAt(0).toUpperCase() + result.platform.slice(1)}
                  </span>
                  {result.success ? (
                    <span className="text-success-700 text-sm">✓ Published</span>
                  ) : (
                    <span className="text-error-700 text-sm">✗ Failed: {result.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

This comprehensive social media integration provides secure, reliable posting to Facebook and Instagram with proper error handling, token management, and user-friendly workflows.
