import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, query, orderBy } from "firebase/firestore";

const STORAGE_KEY = "chat_conversations";

const createEmptyConversation = () => ({
  id: Date.now(),
  messages: [
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ],
});
const normalize = (c) => ({ ...c, messages: c.messages ?? [] });

export function useConversations(currentUser) {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).map(normalize) : [createEmptyConversation()];
  });

  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const loadedForUid = useRef(null); // avoid re-fetching Firestore on every re-render

  const conversationDocRef = (conversationId) =>
    doc(db, "users", currentUser.uid, "conversations", String(conversationId));

  // Load this account's conversations once per sign-in (whole docs, no lazy subcollections)
  useEffect(() => {
    if (!currentUser) {
      loadedForUid.current = null;
      return;
    }
    if (loadedForUid.current === currentUser.uid) return;

    const syncWithFirestore = async () => {
      try {
        const q = query(
          collection(db, "users", currentUser.uid, "conversations"),
          orderBy("id", "desc"),
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          // first time this account signs in — push whatever guest chats exist locally
          await Promise.all(
            conversations.map((c) => setDoc(conversationDocRef(c.id), c)),
          );
        } else {
          const loaded = snapshot.docs.map((d) => normalize(d.data()));
          setConversations(loaded);
          setActiveId(loaded[0].id);
        }
        loadedForUid.current = currentUser.uid;
      } catch (err) {
        console.error("Failed to sync conversations:", err);
      }
    };

    syncWithFirestore();

  }, [currentUser]);

  // localStorage is the guest/offline fallback only
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, currentUser]);

  const saveConversationToFirestore = (conversation) => {
    if (!currentUser) return;
    setDoc(conversationDocRef(conversation.id), conversation).catch((err) =>
      console.error("Failed to save conversation:", err),
    );
  };

  const activeChat = conversations.find((c) => c.id === activeId);

  const addMessage = (conversationId, message) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c,
      );
      saveConversationToFirestore(updated.find((c) => c.id === conversationId));
      return updated;
    });
  };

  const handleNewChat = () => {
    const newChat = createEmptyConversation();
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    saveConversationToFirestore(newChat);
  };

  const resetConversations = () => {
    const fresh = createEmptyConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
  };

  return {
    conversations,
    activeId,
    setActiveId,
    activeChat,
    addMessage,
    handleNewChat,
    resetConversations,
  };
}