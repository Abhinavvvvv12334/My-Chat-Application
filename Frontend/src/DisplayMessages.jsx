import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function DisplayMessages() {
  const socket = useRef(null);
  const token = sessionStorage.getItem("token");
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState("");
  const { friend } = useParams();
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    async function init() {
      socket.current = io("http://localhost:8080", { auth: { token } });
      socket.current.on("private-message", (msgObj) =>
        setMsgs((prev) => [...prev, msgObj])
      );
      const resp = await axios.get("http://localhost:8080/users/me", {
        headers: { Authorization: token },
      });
      setUsername(resp.data.username);
      const resp1 = await axios.get(
        `http://localhost:8080/users/get/messages/${friend}`,
        {
          headers: { Authorization: token },
        }
      );
      setMsgs(resp1.data);
    }
    init();
    return () => {
      socket.current?.off("private-message");
      socket.current?.disconnect();
    };
  }, [token, friend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!msg.trim() || !socket.current) return;
    socket.current.emit("private-message", { to: friend, msg });
    setMsg("");
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <h1>Conversation</h1>
          {friend && <p className="chat-subtitle">Chatting with {friend}</p>}
        </div>
        {username && <span className="user-badge">{username}</span>}
      </header>

      <div className="chat-messages">
        {msgs.length === 0 && (
          <div className="empty-chat">
            <div className="empty-icon-large">💬</div>
            <h3>No messages yet</h3>
            <p>Say hi to {friend} to start the conversation!</p>
          </div>
        )}
        {msgs.map((data, index) => (
          <div
            key={index}
            className={`msg-bubble ${data.from === username ? "sent" : "received"}`}
          >
            <span className="msg-text">{data.msg}</span>
            <div className="msg-meta">
              {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-row">
          <input
            type="text"
            placeholder="Type a message…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            aria-label="Message"
            className="chat-input"
          />
          <button type="submit" className="btn-send" disabled={!msg.trim()}>
            <span>Send</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}