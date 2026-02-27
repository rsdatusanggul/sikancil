import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib';
import { router } from '@/routes';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FiscalYearProvider } from '@/contexts/FiscalYearContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <FiscalYearProvider>
          <Toaster />
          <RouterProvider router={router} />
        </FiscalYearProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;