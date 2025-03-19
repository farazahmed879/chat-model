import { useState } from "react";
import { useImmer } from "use-immer";
import api from "@/api";
import { parseSSEStream } from "@/utils";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";

function Chatbot() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useImmer([]);
  const [newMessage, setNewMessage] = useState("");
  const [baseURl, setBaseUrl] = useState("");

  const isLoading = messages.length && messages[messages.length - 1].loading;

  // async function submitNewMessage() {
  //   const trimmedMessage = newMessage.trim();
  //   if (!trimmedMessage || isLoading) return;

  //   setMessages((draft) => [
  //     ...draft,
  //     { role: "user", content: trimmedMessage },
  //     { role: "assistant", content: "", sources: [], loading: true },
  //   ]);
  //   setNewMessage("");

  //   let chatIdOrNew = chatId;
  //   try {
  //     // if (!chatId) {
  //     //   const { id } = await api.createChat();
  //     //   setChatId(id);
  //     //   chatIdOrNew = id;
  //     // }

  //     const stream = await api.sendChatMessage(chatIdOrNew, [
  //       { role: "user", content: trimmedMessage },
  //     ]);
  //     for await (const textChunk of parseSSEStream(stream)) {
  //       console.log(textChunk);
  //       setMessages((draft) => {
  //         draft[draft.length - 1].content += textChunk;
  //       });
  //     }
  //     setMessages((draft) => {
  //       draft[draft.length - 1].loading = false;
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     setMessages((draft) => {
  //       draft[draft.length - 1].loading = false;
  //       draft[draft.length - 1].error = true;
  //     });
  //   }
  // }

  // async function submitNewMessage() {
  //   const trimmedMessage = newMessage.trim();
  //   if (!trimmedMessage || isLoading) return;

  //   // ✅ Add the new user message to state
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { role: "user", content: trimmedMessage },
  //     { role: "assistant", content: "", loading: true }, // Temporary message while loading
  //   ]);
  //   setNewMessage("");

  //   try {
  //     // ✅ Create a clean message history (remove extra keys)
  //     const filteredMessages = [
  //       ...messages,
  //       { role: "user", content: trimmedMessage },
  //     ].map(({ role, content }) => ({ role, content }));

  //     // ✅ Send entire history to GPT4All
  //     const response = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         model: "qwen2-1.5b-instruct",
  //         messages: filteredMessages,
  //         max_tokens: 1000,
  //         stream: true
  //       }),
  //     });

  //     // ✅ Process streaming response
  //     const reader = response.body?.getReader();
  //     const decoder = new TextDecoder("utf-8");
  //     let assistantMessage = "";

  //     if (reader) {
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) break;

  //         const chunk = decoder.decode(value, { stream: true });

  //         try {
  //           const data = JSON.parse(chunk);
  //           if (data?.choices?.[0]?.message?.content) {
  //             assistantMessage += data.choices[0].message.content;

  //             // ✅ Update the last assistant message dynamically
  //             setMessages((prevMessages) =>
  //               prevMessages.map((msg, index) =>
  //                 index === prevMessages.length - 1
  //                   ? { ...msg, content: assistantMessage, loading: false }
  //                   : msg
  //               )
  //             );
  //           }
  //         } catch (error) {
  //           console.error("Error parsing chunk:", error);
  //         }
  //       }
  //     }

  //     setMessages((draft) => {
  //       draft[draft.length - 1].loading = false;
  //     });
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     setMessages((draft) => {
  //       draft[draft.length - 1].loading = false;
  //       draft[draft.length - 1].error = true;
  //     });
  //   }
  // }

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: "", loading: true }, // Placeholder for response
    ]);
    setNewMessage("");
  
    try {
      // Send request to GPT4All
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // model: "qwen2-1.5b-instruct",
          model: "gemma-3-4b-it",
          messages: [...messages, { role: "user", content: trimmedMessage }].map(({ role, content }) => ({
            role,
            content,
          })),
          max_tokens: 1000,
        }),
      });
  
      const data = await response.json();
      const fullMessage = data?.choices?.[0]?.message?.content || "";
  
      // ✅ Simulate Streaming (Show Words One by One)
      let displayedMessage = "";
      const words = fullMessage.split(" "); // Split into words
  
      words.forEach((word, index) => {
        setTimeout(() => {
          displayedMessage += word + " ";
  
          setMessages((prevMessages) =>
            prevMessages.map((msg, i) =>
              i === prevMessages.length - 1 ? { ...msg, content: displayedMessage } : msg
            )
          );
        }, index * 50); // Adjust speed (50ms per word)
      });
  
      // ✅ Remove loading state when done
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg, i) =>
            i === prevMessages.length - 1 ? { ...msg, loading: false } : msg
          )
        );
      }, words.length * 50);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.map((msg, i) =>
          i === prevMessages.length - 1 ? { ...msg, loading: false, error: true } : msg
        )
      );
    }
  }
  

  console.log("messages", messages);
  console.log("isLoading", isLoading);

  return (
    <div className="relative grow flex flex-col gap-6 pt-6">
      {/* <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label
          style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568" }}
        >
          Base URL
        </label>
        <input
          type="text"
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Enter Base URL"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #CBD5E0",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#1A202C",
            backgroundColor: "#FFFFFF",
            outline: "none",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "border 0.2s ease-in-out",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #3182CE")}
          onBlur={(e) => (e.target.style.border = "1px solid #CBD5E0")}
        />
      </div> */}

      {messages.length === 0 && (
        <div className="mt-3 font-urbanist text-primary-blue text-xl font-light space-y-2">
          <p>👋 Welcome!</p>
          <p>I am UBL funds AI Model</p>
        </div>
      )}
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
}

export default Chatbot;
