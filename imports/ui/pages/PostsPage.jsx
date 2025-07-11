import React, { useState } from 'react';
import { Mongo } from 'meteor/mongo'; // Not strictly needed in this specific component, but harmless
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { PostsCollection } from '/imports/api/posts/PostsCollections.js'; // Ensure this path is correct
import { PostItem } from '../components/common/PostItem';

import { Icons } from '../components/Icons';
import { Input } from '../components/common/Input'; // Optional: Create this input component or use a styled <input>

const FilterDropdown = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="border border-gray-300 rounded-md p-2 text-sm bg-white shadow-sm"
  >
    <option value="all">All</option>
    <option value="shared">Shared</option>
    <option value="unshared">Unshared</option>
    <option value="scheduled">Scheduled</option>
  </select>
);

export const PostsPage = ({ handleShare }) => { // Removed allPosts prop as it's not used
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Use useTracker to reactively get posts from the database
  const posts = useTracker(() => {
    // Subscribe to the 'posts' publication. This will automatically
    // re-run if the subscription status changes (e.g., ready/not ready).
    const handle = Meteor.subscribe('posts');

    // Check if the subscription is ready. If not, return an empty array
    // to prevent rendering incomplete data.
    if (!handle.ready()) {
      return [];
    }

    // Fetch the posts from the local Minimongo collection.
    // The sort order should match your publication for consistency.
    return PostsCollection.find({}, { sort: { createdAt: -1 } }).fetch();
  });

  // Filter posts based on searchTerm and filter state
  const filteredPosts = posts.filter((post) => {
    // CRITICAL FIX: Use post.caption for searching, as that's what's in the schema/method
    const matchesSearch = post.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || post.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-inter"> {/* Added font-inter for consistency */}
      {/* Top Navbar */}
      <div className="bg-white sticky top-0 z-10 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-b-lg">
        <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-teal-500 focus:border-teal-500"
          />
          <FilterDropdown value={filter} onChange={setFilter} />
        </div>
        <Link to="/add-post">
          <Button className="flex items-center gap-2 w-full sm:w-auto justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md px-4 py-2 transition duration-200">
            <Icons.plus className="h-4 w-4" /> Add Post
          </Button>
        </Link>
      </div>

      {/* Posts List */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="text-center text-gray-500 p-8 border border-gray-200 rounded-lg bg-white shadow-sm">
            {posts.length === 0 && searchTerm === '' && filter === 'all' ? (
              <p>Loading posts or no posts available yet...</p>
            ) : (
              <p>No posts found matching your criteria.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <PostItem key={post._id} post={post} handleShare={handleShare} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
