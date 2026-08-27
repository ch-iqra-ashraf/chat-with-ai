import React, { useEffect, useRef, useState } from "react";

const ChatWindow = ({ messages, isPending, error, onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isPending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f8ff] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-t-2xl rounded-bl-2xl rounded-br-sm bg-[#1e88e5] text-white"
                  : "rounded-t-2xl rounded-br-2xl rounded-bl-sm bg-white text-[#1a1a1a] shadow-xs"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] rounded-t-2xl rounded-br-2xl rounded-bl-sm bg-white text-[#1a1a1a] border border-[#e2eaf4] opacity-70 px-4 py-3 text-sm animate-pulse">
              Typing...
            </div>
          </div>
        )}

        {error && (
          <div className="flex w-full justify-center">
            <div className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              Error: {error.message}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 bg-white border-t border-[#e1ecf7]"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isPending}
          className="flex-1 rounded-full border border-[#e2eaf4] bg-white px-4 py-2.5 text-sm text-[#333] outline-hidden"
        />
        <button
          type="submit"
          disabled={isPending || !inputText.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e88e5] text-white disabled:bg-[#b0d4f5]"
        >
          ➔
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
