import { Routes, Route } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/ui';
import { useEffect } from 'react';
import { MintTicket, ViewTickets } from './pages';
import { AppLayout } from './components/layout';
import { ThemeProvider } from './providers/ThemeProvider';

function App() {
  const { isConnected } = useAccount();
  const { toasts, success, removeToast } = useToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isConnected) {
      success('Wallet connected successfully!');
    }
  }, [isConnected, success]);

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Routes>
        <Route path="/" element={
          <AppLayout>
            <MintTicket />
          </AppLayout>
        } />

        <Route path="/tickets" element={
          <AppLayout>
            <ViewTickets />
          </AppLayout>
        } />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
