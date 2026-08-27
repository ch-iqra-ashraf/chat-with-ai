import React, { useState } from "react";
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messages = activeChat?.messages ?? [];

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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* mobile top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 p-3 bg-white border-b border-[#e1ecf7]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-xl leading-none text-[#1a1a1a]"
          >
            ☰
          </button>
          <span className="text-sm font-medium text-[#1a1a1a]">Chat</span>
        </div>

        <ChatWindow
          messages={messages}
          isPending={isPending}
          error={error}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Home;