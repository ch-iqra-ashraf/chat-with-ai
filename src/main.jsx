import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css'; 

// 1. Import React Query core components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Create a global Client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents auto-fetching when changing browser tabs
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
