import React from "react";

export const ShareModal = ({ post, isOpen, onClose }) => {
  if (!isOpen) return null;

  const postUrl = post?.mediaUrl; // You can replace with actual post URL if available

  const handleFacebookShare = () => {
    if (window.FB) {
      window.FB.ui({
        method: "share",
        href: postUrl,
      }, (response) => {
        if (response && !response.error_message) {
          alert("Post shared successfully!");
          onClose();
        } else {
          alert("Error while sharing.");
        }
      });
    } else {
      alert("Facebook SDK not loaded");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link"));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">Share Post</h2>
        <button
          onClick={handleFacebookShare}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-3 flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3 3-3h2v3h-2c-.5 0-1 .3-1 1v2h3l-.5 3h-2.5v7A10 10 0 0022 12z" />
          </svg>
          Share on Facebook
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded mb-3"
        >
          Copy Link
        </button>

        <button
          onClick={onClose}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
