// src/components/ChatList.jsx

import { useMutation, useSubscription, gql } from '@apollo/client';
import { useUserId } from '@nhost/react';

// GraphQL subscription to fetch chats in real-time
const GET_CHATS_SUBSCRIPTION = gql`
  subscription GetChats($userId: uuid!) {
    chats(
      where: { user_id: { _eq: $userId } }
      order_by: { created_at: desc }
    ) {
      id
      created_at
    }
  }
`;

const CREATE_CHAT_MUTATION = gql`
  mutation CreateChat($userId: uuid!) {
    insert_chats_one(object: { user_id: $userId }) {
      id
    }
  }
`;

// Accept selectedChatId and setSelectedChatId as props
export const ChatList = ({ selectedChatId, setSelectedChatId }) => {
  const userId = useUserId();

  const { data, loading: chatsLoading, error: chatsError } = useSubscription(
    GET_CHATS_SUBSCRIPTION,
    {
      variables: { userId },
      skip: !userId,
    }
  );

  const [createChat, { loading: creatingChat, error: createChatError }] =
    useMutation(CREATE_CHAT_MUTATION);

  const handleNewChat = async () => {
    try {
      // After creating a new chat, automatically select it
      const result = await createChat({ variables: { userId } });
      if (result.data?.insert_chats_one?.id) {
        setSelectedChatId(result.data.insert_chats_one.id);
      }
    } catch (e) {
      console.error(e);
      alert('Error creating chat.');
    }
  };

  if (chatsLoading) {
    return <p>Loading chats...</p>;
  }

  if (chatsError || createChatError) {
    console.error(chatsError || createChatError);
    return <p>Error loading or creating chats.</p>;
  }

  return (
    <div className="chat-list">
      <button onClick={handleNewChat} disabled={creatingChat}>
        + New Chat
      </button>
      <ul>
        {data?.chats.map((chat) => (
          <li
            key={chat.id}
            // Add a 'selected' class if the chat is the currently selected one
            className={chat.id === selectedChatId ? 'selected' : ''}
            // Set the selected chat ID when a chat is clicked
            onClick={() => setSelectedChatId(chat.id)}
          >
            Chat from {new Date(chat.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};