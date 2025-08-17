// src/App.jsx

import { useState } from 'react';
import { useNhostClient } from '@nhost/react'; // <-- Import the Nhost client
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import './App.css';
import { ChatList } from './components/ChatList';
import { MessageView } from './components/MessageView';

function App() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const nhost = useNhostClient();
  const navigate = useNavigate();

  // --- ADD THIS SIGN-OUT HANDLER ---
  const handleSignOut = async () => {
    await nhost.auth.signOut();
    navigate('/auth'); // Redirect to the login page after signing out
  };
  // --------------------------------

  return (
    <div className="app-container">
      {/* --- REPLACE THE OLD HEADER WITH THIS NEW ONE --- */}
      <header className="app-header">
        <h1 className="app-title">AI ChatBot</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </header>
      {/* ----------------------------------------------- */}
      <main className="chat-container">
        <ChatList
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
        />
        {selectedChatId ? (
          <MessageView selectedChatId={selectedChatId} key={selectedChatId} />
        ) : (
          <div className="message-view">
            {/* Improved empty state message */}
            <div className="empty-chat-message">
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;