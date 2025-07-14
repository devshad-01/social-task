import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Link } from "react-router-dom";

import { Button } from "../components/common/Button";
import { Icons } from "../components/Icons";
import { PostItem } from "../components/clients/PostItem";
import { SkeletonPostItem } from "../components/common/SkeletonPostItem";

import { PostsCollection } from "/imports/api/posts/PostsCollections.js";
import { ClientsCollection } from "/imports/api/clients/ClientsCollection.js";

// ✅ Modal import
import ClientsModal from "../components/clients/ClientModal";
import { useToast, ToastContainer } from '../components/common/Toast';





// Filter by status dropdown component
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

// Filter by client dropdown component
const ClientDropdown = ({ clients, selectedClient, onChange }) => (
  <select
    value={selectedClient}
    onChange={(e) => onChange(e.target.value)}
    className="border border-gray-300 rounded-md p-2 text-sm bg-white shadow-sm"
  >
    <option value="all">All Clients</option>
    {clients.map((client) => (
      <option key={client._id} value={client._id}>
        {client.name}
      </option>
    ))}
  </select>
);

export const PostsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("unshared");
  const [selectedClient, setSelectedClient] = useState("all");
   const toast = useToast();


  // ✅ Share modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);

  // Subscribe and fetch posts
  const posts = useTracker(() => {
    const handle = Meteor.subscribe("posts");
    if (!handle.ready()) return [];
    return PostsCollection.find({}, { sort: { createdAt: -1 } }).fetch();
  });

  // Subscribe and fetch clients
  const clients = useTracker(() => {
    const handle = Meteor.subscribe("clients");
    if (!handle.ready()) return [];
    return ClientsCollection.find({}, { sort: { name: 1 } }).fetch();
  });

  // Filter posts client-side by search, status filter, and client
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.caption
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || post.status === filter;
    const matchesClient =
      selectedClient === "all" || post.clientId === selectedClient;
    return matchesSearch && matchesFilter && matchesClient;
  });

  // ✅ Called by PostItem Share button
  const handleShare = (post) => {
    setActivePost(post);
    setModalOpen(true);
  };

  // ✅ Called when account selected from modal
  const handleAccountSelected = (account) => {
    console.log("Ready to post this:", activePost);
    console.log("To this account:", account);

    // Post to Meta API here (to be implemented next)
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Top Navbar with search, filters, and add button */}
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
          <ClientDropdown
            clients={clients}
            selectedClient={selectedClient}
            onChange={setSelectedClient}
          />
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
            {posts.length === 0 && searchTerm === "" && filter === "all" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonPostItem key={i} />
                ))}
              </div>
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

      {/* ✅ Clients Modal (shared globally) */}
    <ClientsModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  post={activePost}
/>

 <>
      <div className="min-h-screen bg-gray-50 font-inter">
        {/* ...all your page JSX... */}
        <ClientsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          post={activePost}
          toast={toast}
        />
      </div>

      {/* Render toasts globally */}
      <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />
    </>

    </div>
  );
};
