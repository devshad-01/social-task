import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

import { ClientAccountsCollection } from '/imports/api/clientsaccounts/AccountsClients.js';


const ClientsModal = ({ isOpen, onClose, post, toast }) => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState(null);

  const { loading, accounts } = useTracker(() => {
    const handle = Meteor.subscribe('clientAccounts');
    return {
      loading: !handle.ready(),
      accounts: ClientAccountsCollection.find().fetch(),
    };
  }, []);

const handleSubmit = async () => {
  const account = accounts.find((a) => a._id === selectedAccountId);
  if (!account) return;

  setLoadingPost(true);
  setError(null);

  try {
    const result = await Meteor.callAsync('facebook.postToPageFeed', {
      pageId: account.facebookPage.id,
      accessToken: account.facebookPage.access_token,
      message: post.caption,
      mediaUrl: post.mediaUrl,
    });

    toast?.showSuccess(' Post shared to Facebook!');
    onClose();
  } catch (err) {
    console.error('❌ Error posting to Facebook:', err);
    const message = err.reason || 'Something went wrong';
    setError(message);
    toast?.showError(`❌ ${message}`);
  } finally {
    setLoadingPost(false);
  }
};

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold">Select Client Account</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              <X />
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">-- Select Account --</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.facebookPage.name}
                    {acc.instagramAccount?.username && ` / ${acc.instagramAccount.username}`}
                  </option>
                ))}
              </select>

              {selectedAccountId && (
                <div className="flex flex-col gap-4 border p-3 rounded-md bg-gray-50">
                  {(() => {
                    const acc = accounts.find((a) => a._id === selectedAccountId);
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.facebookPage.profile_picture_url}
                            alt="FB profile"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{acc.facebookPage.name}</p>
                            <p className="text-xs text-gray-500">Facebook Page</p>
                          </div>
                        </div>

                        {acc.instagramAccount && (
                          <div className="flex items-center gap-3">
                            <img
                              src={acc.instagramAccount.profile_picture_url}
                              alt="IG profile"
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="text-pink-600 font-medium">@{acc.instagramAccount.username}</p>
                              <p className="text-xs text-gray-500">Instagram Business</p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={loadingPost}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAccountId || loadingPost}
              className="px-4 py-2 rounded bg-[#3ca1ad] text-white hover:bg-[#2f8d99]"
            >
              {loadingPost ? 'Sharing...' : 'Share Now'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ClientsModal;
