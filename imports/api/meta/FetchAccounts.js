import { Meteor } from 'meteor/meteor';
import { ClientAccountsCollection } from '/imports/api/clientsaccounts/AccountsClients.js';

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

export const fetchAndStoreMetaAccounts = async () => {
  const accessToken = Meteor.settings?.private?.metaApi?.userAccessToken;

  if (!accessToken) {
    console.warn("⚠️ Meta API user access token not configured in settings.json - skipping Meta accounts fetch");
    return;
  }

  console.log("🔄 Fetching Facebook Pages using fetch API...");

  try {
    // Use fetch instead of Meteor's HTTP package
    const url = `${GRAPH_URL}/me/accounts?access_token=${accessToken}`;
    console.log("🔗 Making request to:", url.replace(accessToken, accessToken.substring(0, 20) + '...'));
    
    const response = await fetch(url);
    console.log("✅ Fetch completed, status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("🔍 Response data structure:", {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      hasPaging: !!data.paging
    });
    
    const pages = data.data || [];
    console.log("📄 Raw Pages data fetched:", pages.length, "pages");

    if (pages.length === 0) {
      console.log("❌ No pages found in response");
      return;
    }

    for (const page of pages) {
      console.log(`🔄 Processing page: ${page.name} (ID: ${page.id})`);
      
      const pageId = page.id;
      const pageName = page.name;
      const pageAccessToken = page.access_token;

      // Fetch Page Profile Picture using fetch
      let profilePic = null;
      try {
        console.log(`🖼️ Fetching profile picture for ${pageName}...`);
        const picUrl = `${GRAPH_URL}/${pageId}/picture?redirect=false&access_token=${pageAccessToken}&width=200&height=200`;
        const picResponse = await fetch(picUrl);
        
        if (picResponse.ok) {
          const picData = await picResponse.json();
          profilePic = picData?.data?.url;
          console.log("✅ Profile picture fetched successfully");
        } else {
          console.warn(`⚠️ Profile picture fetch failed with status: ${picResponse.status}`);
        }
      } catch (err) {
        console.warn(`⚠️ Could not fetch profile picture for ${pageName}:`, err.message);
      }

      // Fetch connected Instagram Business Account
      let igAccount = null;
      try {
        console.log(`📱 Checking Instagram connection for ${pageName}...`);
        const igUrl = `${GRAPH_URL}/${pageId}?fields=connected_instagram_account&access_token=${pageAccessToken}`;
        const igResponse = await fetch(igUrl);
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          console.log("📱 Instagram response:", igData);

          if (igData.connected_instagram_account) {
            const igId = igData.connected_instagram_account.id;
            console.log(`✅ Found connected Instagram account: ${igId}`);
            
            // Try to fetch Instagram details
            try {
              const igDetailsUrl = `${GRAPH_URL}/${igId}?fields=username,profile_picture_url&access_token=${pageAccessToken}`;
              const igDetailsResponse = await fetch(igDetailsUrl);
              
              if (igDetailsResponse.ok) {
                const igDetails = await igDetailsResponse.json();
                igAccount = {
                  id: igId,
                  username: igDetails.username || `IG-${igId}`,
                  profile_picture_url: igDetails.profile_picture_url || 
                    `https://via.placeholder.com/40/ff69b4?text=IG`,
                };
                console.log("✅ Instagram details fetched:", igAccount);
              } else {
                console.warn(`⚠️ Instagram details fetch failed with status: ${igDetailsResponse.status}`);
                igAccount = {
                  id: igId,
                  username: `IG-${igId}`,
                  profile_picture_url: `https://via.placeholder.com/40/ff69b4?text=IG`,
                };
              }
            } catch (igErr) {
              console.warn(`⚠️ Could not fetch Instagram details for ${igId}:`, igErr.message);
              igAccount = {
                id: igId,
                username: `IG-${igId}`,
                profile_picture_url: `https://via.placeholder.com/40/ff69b4?text=IG`,
              };
            }
          } else {
            console.log("ℹ️ No connected Instagram account found");
          }
        } else {
          console.warn(`⚠️ Instagram connection check failed with status: ${igResponse.status}`);
        }
      } catch (err) {
        console.warn(`⚠️ IG fetch failed for ${pageName}:`, err.message);
      }

      const accountData = {
        facebookPage: {
          id: pageId,
          name: pageName,
          category: page.category,
          category_list: page.category_list,
          profile_picture_url: profilePic,
          access_token: pageAccessToken,
          tasks: page.tasks,
        },
        instagramAccount: igAccount,
        lastUpdated: new Date(),
      };

      console.log("💾 Storing account data for:", pageName);

      try {
        const existing = await ClientAccountsCollection.findOneAsync({ 'facebookPage.id': pageId });
        if (existing) {
          await ClientAccountsCollection.updateAsync({ _id: existing._id }, { $set: accountData });
          console.log(`🔁 Updated page: ${pageName}`);
        } else {
          const insertResult = await ClientAccountsCollection.insertAsync(accountData);
          console.log(`✅ Stored page: ${pageName} ${igAccount ? '(+ IG)' : ''} - ID: ${insertResult}`);
        }
      } catch (dbErr) {
        console.error(`❌ Database error for ${pageName}:`, dbErr);
      }
    }

    console.log("✅ All accounts updated.");
    
    // Verify what's in the database
    try {
      const allAccounts = await ClientAccountsCollection.find({}).fetchAsync();
      console.log("🗄️ Total accounts in database:", allAccounts.length);
      allAccounts.forEach((account, index) => {
        console.log(`  ${index + 1}. ${account.facebookPage?.name} (${account.facebookPage?.id})`);
      });
    } catch (dbErr) {
      console.error("❌ Could not fetch accounts from database:", dbErr);
    }

  } catch (err) {
    console.error("❌ Failed to fetch pages:", err.message);
    throw err;
  }
};