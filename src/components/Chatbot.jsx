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

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((draft) => [
      ...draft,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: "", sources: [], loading: true },
    ]);
    setNewMessage("");

    let chatIdOrNew = chatId;
    try {
      // if (!chatId) {
      //   const { id } = await api.createChat();
      //   setChatId(id);
      //   chatIdOrNew = id;
      // }

      const stream = await api.sendChatMessage(chatIdOrNew, [
        { role: "user", content: trimmedMessage },
      ]);
      console.log("stream", stream);
      for await (const textChunk of parseSSEStream(stream)) {
        console.log(textChunk);
        setMessages((draft) => {
          draft[draft.length - 1].content += textChunk;
        });
      }
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((draft) => [
      ...draft,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: "", sources: [], loading: true },
    ]);
    setNewMessage("");

    let chatIdOrNew = chatId;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2-1.5b-instruct",
          messages: [{ role: "user", content: trimmedMessage }],
        }),
      });

      // ✅ Read the streamed response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          try {
            // ✅ Parse JSON chunk
            const data = JSON.parse(chunk);

            if (data?.choices?.[0]?.message?.content) {
              assistantMessage += data.choices[0]?.message?.content;

              // ✅ Update state dynamically
              setMessages((draft) => {
                draft[draft.length - 1].content = assistantMessage;
              });
            }
          } catch (error) {
            console.error("Error parsing chunk:", error);
          }
        }
      }

      // ✅ Mark message as complete (remove loading)
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

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
          <p>I am GPT4All qwesn 1.5b demo</p>
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
