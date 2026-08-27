import React from "react";

const Sidebar = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  currentUser,
  isSigningIn,
  onSignIn,
  onSignOut,
}) => {
  return (
    <div className="w-64 bg-[#0b1320] text-gray-200 flex flex-col p-4 shrink-0 gap-2">
      <button
        onClick={onNewChat}
        className="w-full bg-[#1e88e5] text-white px-3 py-2.5 text-sm rounded-xl font-medium mb-2"
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {conversations
          .filter((c) => c.messages?.some((m) => m.role === "user"))
          .map((c) => {
            const userMsg = c.messages.find((m) => m.role === "user");
            const topic = userMsg
              ? userMsg.content.slice(0, 20) + "..."
              : "New Chat";
            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`w-full px-3 py-2.5 text-sm rounded-xl truncate font-medium border cursor-pointer ${
                  c.id === activeId
                    ? "bg-[#1d2c3f] text-white border-[#2c3e55]"
                    : "text-gray-400 border-transparent"
                }`}
              >
                💬 {topic}
              </div>
            );
          })}
      </div>

      {/* LOGIN / ACCOUNT AREA */}
      <div className="pt-2 border-t border-[#2c3e55]">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-sm truncate">
              {currentUser.displayName || currentUser.email}
            </span>
            <button
              onClick={onSignOut}
              className="text-xs text-gray-400 hover:text-white shrink-0"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-2 bg-white text-[#1a1a1a] px-3 py-2.5 text-sm rounded-xl font-medium disabled:opacity-60"
          >
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
