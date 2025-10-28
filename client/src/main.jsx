import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/postContext'; 


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PostProvider>
        <App /> 
      </PostProvider>
    </AuthProvider>
  </StrictMode>,
);
