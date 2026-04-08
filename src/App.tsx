import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { store } from '@/store';
import { initAuth } from '@/store/authSlice';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const AppInit: React.FC = () => {
  useEffect(() => {
    store.dispatch(initAuth());
  }, []);

  return <RouterProvider router={router} />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppInit />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
