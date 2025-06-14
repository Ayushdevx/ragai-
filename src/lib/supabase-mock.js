// src/lib/supabase.js
// Mock implementation to replace Supabase for development

// Mock data
const mockDocuments = [
  {
    id: '1',
    user_id: '1',
    title: 'Financial Report Q3',
    file_name: 'financial_report_q3.pdf',
    file_size: 2048576,
    file_type: 'application/pdf',
    content: 'Mock content for financial report...',
    processing_status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    user_id: '1',
    title: 'Marketing Strategy 2024',
    file_name: 'marketing_strategy_2024.docx',
    file_size: 1024768,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    content: 'Mock content for marketing strategy...',
    processing_status: 'completed',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const mockConversations = [
  {
    id: '1',
    user_id: '1',
    title: 'Financial Report Analysis',
    status: 'active',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    messages: [{ count: 5 }],
    conversation_documents: [
      {
        document_id: '1',
        documents: { title: 'Financial Report Q3', file_name: 'financial_report_q3.pdf' }
      }
    ]
  }
];

// Mock Supabase client
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Use local auth') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Use local auth') }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

// Helper functions for common operations
export const getCurrentUser = async () => {
  const storedUser = localStorage.getItem('auth_user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const getCurrentSession = async () => {
  const storedUser = localStorage.getItem('auth_user');
  return storedUser ? { user: JSON.parse(storedUser) } : null;
};

export const signOut = async () => {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_profile');
};

// Database helper functions
export const getUserProfile = async (userId) => {
  const storedProfile = localStorage.getItem('auth_profile');
  if (storedProfile) {
    return JSON.parse(storedProfile);
  }
  throw new Error('Profile not found');
};

export const updateUserProfile = async (userId, updates) => {
  const storedProfile = localStorage.getItem('auth_profile');
  if (storedProfile) {
    const profile = JSON.parse(storedProfile);
    const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem('auth_profile', JSON.stringify(updatedProfile));
    return updatedProfile;
  }
  throw new Error('Profile not found');
};

export const getUserDocuments = async (userId) => {
  // Return mock documents for the current user
  return mockDocuments.filter(doc => doc.user_id === userId);
};

export const uploadDocument = async (userId, file, metadata = {}) => {
  const newDoc = {
    id: Date.now().toString(),
    user_id: userId,
    title: metadata.title || file.name.split('.')[0],
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    content: 'Uploaded content...',
    processing_status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockDocuments.push(newDoc);
  return newDoc;
};

export const deleteDocument = async (documentId) => {
  const index = mockDocuments.findIndex(doc => doc.id === documentId);
  if (index > -1) {
    mockDocuments.splice(index, 1);
    return { success: true };
  }
  throw new Error('Document not found');
};

export const getUserConversations = async (userId) => {
  return mockConversations.filter(conv => conv.user_id === userId);
};

export const createConversation = async (userId, title) => {
  const newConversation = {
    id: Date.now().toString(),
    user_id: userId,
    title,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [{ count: 0 }],
    conversation_documents: []
  };
  
  mockConversations.push(newConversation);
  return newConversation;
};

export const addMessageToConversation = async (conversationId, userId, content, messageType = 'user') => {
  // Mock message creation
  return {
    id: Date.now().toString(),
    conversation_id: conversationId,
    user_id: userId,
    content,
    message_type: messageType,
    created_at: new Date().toISOString()
  };
};

export const getConversationMessages = async (conversationId) => {
  // Return mock messages
  return [
    {
      id: '1',
      conversation_id: conversationId,
      content: 'Hello! How can I help you with your documents today?',
      message_type: 'assistant',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];
};

export const deleteConversation = async (conversationId) => {
  const index = mockConversations.findIndex(conv => conv.id === conversationId);
  if (index > -1) {
    mockConversations.splice(index, 1);
    return { success: true };
  }
  throw new Error('Conversation not found');
};
