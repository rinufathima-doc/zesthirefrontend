'use client';

import { Provider } from 'react-redux';
import { store } from './lib/store'; // Uses Next.js root alias
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#a3e635',
              secondary: '#0f172a',
            },
          },
        }} 
      />
      {children}
    </Provider>
  );
}