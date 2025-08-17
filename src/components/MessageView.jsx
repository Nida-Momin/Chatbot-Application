import { useSubscription, useMutation, gql } from '@apollo/client';
import { useState } from 'react';

// Subscription to get messages for a specific chat
const GET_MESSAGES_SUBSCRIPTION = gql`
  subscription GetMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      sender
      created_at
    }
  }
`;

// This mutation is for calling our new Hasura Action
const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chatId: uuid!, $content: String!) {
    sendMessage(chat_id: $chatId, content: $content) {
      botResponse
    }
  }
`;

// This mutation is for saving the user's AND bot's messages to the DB
const INSERT_MESSAGE_MUTATION = gql`
  mutation InsertMessage($chatId: uuid!, $content: String!, $sender: String!) {
    insert_messages_one(
      object: { chat_id: $chatId, content: $content, sender: $sender }
    ) {
      id
    }
  }
`;

export const MessageView = ({ selectedChatId }) => {
  const [message, setMessage] = useState('');

  const {
    data,
    loading: messagesLoading,
    error: messagesError,
  } = useSubscription(GET_MESSAGES_SUBSCRIPTION, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
  });

  // Action for triggering the bot
  const [sendMessageAction, { loading: sendingMessage, error: actionError }] =
    useMutation(SEND_MESSAGE_ACTION);

  // Mutation for inserting messages into the DB
  const [insertMessage, { error: insertError }] = useMutation(
    INSERT_MESSAGE_MUTATION
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage) return;

    const userMessageContent = message;
    setMessage(''); // Clear input immediately for better UX

    try {
      // Step 1: Insert the user's message into the database
      await insertMessage({
        variables: {
          chatId: selectedChatId,
          content: userMessageContent,
          sender: 'user',
        },
      });

      // Step 2: Call the Hasura Action to get the bot's response
      const actionResult = await sendMessageAction({
        variables: {
          chatId: selectedChatId,
          content: userMessageContent,
        },
      });

      const botResponse = actionResult.data?.sendMessage?.botResponse;

      // Step 3: If we got a response, insert it into the database
      if (botResponse) {
        await insertMessage({
          variables: {
            chatId: selectedChatId,
            content: botResponse,
            sender: 'bot',
          },
        });
      } else {
        // This will be triggered for now, since n8n isn't sending a response yet
        throw new Error('No response from bot');
      }
    } catch (error) {
      console.error('Error in message sending process:', error);
      // Optional: If something fails, you could add the user's message back to the input
      // setMessage(userMessageContent);
      alert('Error sending message or getting a response.');
    }
  };

  // Log any GraphQL errors to the console for easier debugging
  if (actionError || insertError) {
    console.error({
      actionError: actionError?.message,
      insertError: insertError?.message,
    });
  }

  return (
    <div className="message-view">
      <div className="messages-list">
        {messagesLoading && <p>Loading messages...</p>}
        {messagesError && <p>Error: {messagesError.message}</p>}
        {data?.messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        {/* Add a simple typing indicator when waiting for the bot */}
        {sendingMessage && (
          <div className="message bot">
            <p>Bot is typing...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sendingMessage}
        />
        <button type="submit" disabled={sendingMessage}>
          {sendingMessage ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};