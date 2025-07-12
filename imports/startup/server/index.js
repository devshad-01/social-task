import { ClientsCollection } from '/imports/api/clients/ClientsCollection';

const insertExampleClients = async () => {
  const count = await ClientsCollection.find().countAsync();

  if (count === 0) {
    const exampleClients = [
      {
        name: 'Fashion Brand Co.',
        email: 'contact@fashionbrand.com',
        phone: '+1 (555) 123-4567',
        avatar: '/images/client1.jpg',
        industry: 'Fashion',
        status: 'active',
        tier: 'premium',
        joinDate: new Date('2023-06-15'),
        lastActivity: new Date('2024-01-12'),
        activeProjects: 3,
        totalProjects: 12,
        monthlyBudget: 5000,
        platforms: ['Instagram', 'Facebook', 'Pinterest'],
        manager: {
          name: 'Sarah Johnson',
          avatar: '/images/avatar1.jpg',
        },
        notes: 'High-value client with focus on visual content and influencer partnerships',
        address: {
          street: '123 Fashion Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA',
        },
      },
      // add more clients here as needed
    ];

    for (const client of exampleClients) {
      await ClientsCollection.insertAsync(client);
    }

    console.log('Example clients inserted.');
  } else {
    console.log('Clients already exist, skipping insertion.');
  }
};

insertExampleClients().catch(console.error);
