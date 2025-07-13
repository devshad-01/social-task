// PostItem.jsx
import React from 'react';
import { Button } from '../common/Button';
import { Icons } from '../Icons';
import { Meteor } from 'meteor/meteor';

export const PostItem = ({ post, handleShare }) => {
  const handleFacebookPost = async () => {
    try {
      await Meteor.callAsync('postToFacebook', { postId: post._id });
      alert("Posted to Facebook successfully!");
    } catch (error) {
      alert(`Facebook Post Failed: ${error.message}`);
    }
  };

  const handleInstagramPost = async () => {
    try {
      await Meteor.callAsync('postToInstagram', { postId: post._id });
      alert("Posted to Instagram successfully!");
    } catch (error) {
      alert(`Instagram Post Failed: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4">
      {/* Media */}
      <div className="w-full max-h-96 rounded-md overflow-hidden">
        {post.type === 'image' ? (
          <img src={post.mediaUrl} alt="Post Media" className="object-cover w-full max-h-96 rounded-md" />
        ) : (
          <video src={post.mediaUrl} controls className="object-contain w-full max-h-96 rounded-md" />
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
          {post.caption}
        </p>
      )}

      {/* Tags */}
      {post.tags && (
        <div className="flex flex-wrap gap-2">
          {post.tags.split(' ').map((tag, i) => (
            <span
              key={i}
              className="inline-block bg-teal-100 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 justify-end">
        <Button onClick={handleFacebookPost} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
          <Icons.facebook className="w-4 h-4 mr-1" /> Facebook
        </Button>
        <Button onClick={handleInstagramPost} className="bg-pink-600 hover:bg-pink-700 text-white text-sm">
          <Icons.instagram className="w-4 h-4 mr-1" /> Instagram
        </Button>
        <Button onClick={() => handleShare(post)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700">
          <Icons.share className="w-4 h-4" /> Share
        </Button>
      </div>
    </div>
  );
};
