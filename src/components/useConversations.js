import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const STORAGE_KEY = "chat_conversations";

const createEmptyConversation = () => ({
  id: Date.now(),
  messages: [
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ],
});

export function useConversations(currentUser) {
  // conversations = [{ id, messages }]
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [createEmptyConversation()];
  });

  const [activeId, setActiveId] = useState(() => conversations[0].id);

  const conversationDocRef = (conversationId) =>
    doc(db, "users", currentUser.uid, "conversations", String(conversationId));

  const messagesCollectionRef = (conversationId) =>
    collection(
      db,
      "users",
      currentUser.uid,
      "conversations",
      String(conversationId),
      "messages",
    );

  // 1. Load the list of conversations (metadata only) once the user logs in
  useEffect(() => {
    const loadConversationList = async () => {
      if (!currentUser) return; // not logged in — stick with localStorage/guest data

      try {
        const q = query(
          collection(db, "users", currentUser.uid, "conversations"),
          orderBy("id", "desc"),
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const loaded = snapshot.docs.map((d) => ({
          id: d.data().id,
          messages: [], // messages are fetched lazily, see effect below
        }));

        setConversations(loaded);
        setActiveId(loaded[0].id);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    loadConversationList();
  }, [currentUser]);

  // 2. Lazily load the messages subcollection for whichever chat is active
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser || activeId == null) return;

      const current = conversations.find((c) => c.id === activeId);
      if (!current || current.messages.length > 0) return; // already loaded

      try {
        const q = query(
          messagesCollectionRef(activeId),
          orderBy("createdAt", "asc"),
        );
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map((d) => d.data());

        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, messages } : c)),
        );
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, currentUser]);

  // keep localStorage in sync for guest/offline use
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // create/update the conversation's metadata doc (cheap, no messages inside it)
  const ensureConversationDoc = (conversationId) => {
    if (!currentUser) return;
    setDoc(
      conversationDocRef(conversationId),
      { id: conversationId },
      { merge: true },
    ).catch((err) => console.error("Failed to save conversation:", err));
  };

  // write a single message as its own document in the subcollection
  const saveMessageToFirestore = (conversationId, message) => {
    if (!currentUser) return;
    addDoc(messagesCollectionRef(conversationId), {
      ...message,
      createdAt: serverTimestamp(),
    }).catch((err) => console.error("Failed to save message:", err));
  };

  const activeChat = conversations.find((c) => c.id === activeId);

  // append one message locally AND persist it as its own Firestore doc
  const addMessage = (conversationId, message) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c,
      ),
    );
    ensureConversationDoc(conversationId);
    saveMessageToFirestore(conversationId, message);
  };

  const handleNewChat = () => {
    const newChat = createEmptyConversation();
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);

    if (currentUser) {
      ensureConversationDoc(newChat.id);
      newChat.messages.forEach((m) => saveMessageToFirestore(newChat.id, m));
    }
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
