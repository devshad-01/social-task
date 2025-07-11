import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icons } from '../components/Icons';

export const AddPosts = () => {
  const [mediaFile, setMediaFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image') || file.type.startsWith('video'))) {
      setMediaFile(file);
    } else {
      alert('Please upload a valid image or video file.');
      setMediaFile(null);
    }
  };

  const handleClearMedia = () => setMediaFile(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mediaFile) return alert('Please select an image or video');

    setUploading(true);
    setUploadProgress(0);
    setSuccessMessage('');

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Data = reader.result;
      const fileName = mediaFile.name;

      // Simulate progress (for UI feedback)
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress += 10;
        setUploadProgress(Math.min(fakeProgress, 95));
      }, 200);

      Meteor.call('uploadToCloudinary', base64Data, fileName, (err, mediaUrl) => {
        clearInterval(interval);
        setUploadProgress(100);

        if (err) {
          setUploading(false);
          console.error('Cloudinary Upload Error:', err);
          alert('Upload failed: ' + err.reason);
          return;
        }

        Meteor.call(
          'posts.add',
          {
            caption,
            tags,
            mediaUrl,
            type: mediaFile.type.startsWith('video') ? 'video' : 'image',
          },
          (error) => {
            setUploading(false);
            if (error) {
              console.error('Error saving post:', error);
              alert('Post creation failed.');
            } else {
              setSuccessMessage('✅ Post added successfully!');
              setTimeout(() => navigate('/'), 2000);
            }
          }
        );
      });
    };

    reader.readAsDataURL(mediaFile);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate('/posts')}
          className="text-sm text-teal-600 hover:underline flex items-center gap-1"
        >
          <Icons.arrowLeft className="h-4 w-4" />
          Back to Posts
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">📤 Create New Post</h1>

        {successMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Upload Media (Image or Video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full border border-gray-300 rounded-md px-4 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />

            {mediaFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="relative rounded-md overflow-hidden max-h-64">
                  {mediaFile.type.startsWith('image') ? (
                    <img
                      src={URL.createObjectURL(mediaFile)}
                      alt="Preview"
                      className="rounded-md object-contain max-h-64 w-full"
                    />
                  ) : (
                    <video
                      controls
                      src={URL.createObjectURL(mediaFile)}
                      className="rounded-md max-h-64 w-full object-contain"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Caption</label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-teal-500 focus:border-teal-500"
              placeholder="What's on your heart? ✍️"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Hashtags/Tags (optional)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-teal-500 focus:border-teal-500"
              placeholder="#grace #hope #biblestudy"
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="text-sm text-teal-700">
              Uploading... {uploadProgress}% complete
              <div className="h-2 bg-gray-200 rounded mt-1">
                <div
                  className="h-2 bg-teal-500 rounded transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md"
            >
              <Icons.plus className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Add Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
