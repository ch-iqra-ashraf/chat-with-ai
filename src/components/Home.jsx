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

  // CHANGE: agar user logged-in nahi hai, to poori app ki jagah
  // sirf ek centered login card render hoga — Sidebar/ChatWindow bilkul nahi.
  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-200 font-sans">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-sm w-80">
          <h1 className="text-lg font-semibold text-[#1a1a1a]">Welcome</h1>
          <p className="text-sm text-gray-500 text-center">
            Please sign in to start chatting.
          </p>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-2 bg-[#1e88e5] text-white px-3 py-2.5 text-sm rounded-xl font-medium disabled:opacity-60"
          >
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    );
  }

  // CHANGE: yeh hissa (poora chat app) ab sirf tab render hota hai
  // jab currentUser upar wale check se guzar chuka ho (i.e. logged in ho)
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