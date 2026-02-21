import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CurrFriends() {
  const [currUser, setCurrUser] = useState("");
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      try {
        const resp = await axios.get("http://localhost:8080/users/me", {
          headers: { Authorization: token },
        });
        setCurrUser(resp.data.username);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    if (token) {
      getUser();
    }
  }, [token]);

  useEffect(() => {
    async function getFriends() {
      if (!currUser) return;
      setLoading(true);
      try {
        const resp = await axios.get(
          "http://localhost:8080/users/friends/display",
          {
            headers: { Authorization: token },
          }
        );
        setFriends(resp.data || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    }
    getFriends();
  }, [currUser, token]);

  function getRandomColor(name) {
    const colors = [
      "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
      "#ef4444", "#f59e0b", "#10b981", "#06b6d4"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="shell-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {currUser ? currUser : "Your friends"}
          </h1>
          <p className="page-subtitle">
            {friends.length > 0 
              ? `${friends.length} friend${friends.length > 1 ? "s" : ""} ready to chat`
              : "See who you can chat with and manage requests."}
          </p>
        </div>
      </header>

      <main className="page-content">
        {loading ? (
          <div className="card loading-card">
            <div className="loading-spinner"></div>
            <p className="card-text">Loading friends...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="card muted empty-state-card">
            <div className="empty-icon-large">👥</div>
            <h3 className="empty-title">No Friends Yet</h3>
            <p className="card-text">
              You don&apos;t have any friends added yet. Use the navigation bar to send or view requests.
            </p>
          </div>
        ) : (
          <ul className="friends-list">
            {friends.map((obj, index) => {
              const avatarColor = getRandomColor(obj.friend);
              return (
                <li key={index} className="friends-item">
                  <div className="friend-info">
                    <div className="friend-details">
                      <div className="friend-name">{obj.friend}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/DisplayMessages/${obj.friend}`)}
                  >
                    Chat
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}