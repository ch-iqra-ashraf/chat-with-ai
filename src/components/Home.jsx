import React from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchChatResponse } from "../util/service";
import { useAuth } from "./useAuth";
import { useConversations } from "./useConversations";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

const Home = () => {
  const { currentUser, isSigningIn, handleSignIn, handleSignOut } = useAuth();

  const {
    conversations,
    activeId,
    setActiveId,
    activeChat,
    addMessage,
    handleNewChat,
    resetConversations,
  } = useConversations(currentUser);

  const messages = activeChat.messages;

  const { mutate, isPending, error } = useMutation({
    mutationFn: (updatedMessages) => fetchChatResponse(updatedMessages),
    onSuccess: (assistantResponse) => {
      addMessage(activeId, { role: "assistant", content: assistantResponse });
    },
  });

  const handleSendMessage = (userMessage) => {
    const userMsg = { role: "user", content: userMessage };
    addMessage(activeId, userMsg);
    mutate([...messages, userMsg]);
  };

  const onSignOut = async () => {
    await handleSignOut();
    resetConversations();
  };

  return (
    <div className="flex h-screen w-screen bg-gray-200 font-sans overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        onNewChat={handleNewChat}
        currentUser={currentUser}
        isSigningIn={isSigningIn}
        onSignIn={handleSignIn}
        onSignOut={onSignOut}
      />
      <ChatWindow
        messages={messages}
        isPending={isPending}
        error={error}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Home;
