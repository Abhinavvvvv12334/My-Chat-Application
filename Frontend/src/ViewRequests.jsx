import axios from "axios";
import { useEffect, useState } from "react";

export default function ViewRequests() {
  const [reqs, setReqs] = useState([]);
  const [currUser, setCurrUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    async function getUser() {
      try {
        const resp1 = await axios.get("http://40.192.26.88:5000/users/me", {
          headers: { Authorization: token },
        });
        setCurrUser(resp1.data.username);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    if (token) {
      getUser();
    }
  }, [token]);

  useEffect(() => {
    if (!currUser) return;
    async function getReqs() {
      setLoading(true);
      try {
        const resp = await axios.post(
          "http://40.192.26.88:5000/users/requests/pending/user2",
          { user: currUser },
          { headers: { Authorization: token } }
        );
        setReqs(resp.data || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setReqs([]);
      } finally {
        setLoading(false);
      }
    }
    getReqs();
  }, [currUser, token]);

  async function handleAccept(sender) {
    setProcessing((prev) => new Set(prev).add(sender));
    try {
      await axios.post(
        "http://40.192.26.88:5000/users/requests/accept",
        {
          sender,
          acceptor: currUser,
        },
        {
          headers: { Authorization: token },
        }
      );
      setReqs((prev) => prev.filter((obj) => obj.user1 !== sender));
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request. Please try again.");
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(sender);
        return next;
      });
    }
  }

  async function handleReject(sender) {
    setProcessing((prev) => new Set(prev).add(sender));
    try {
      await axios.post(
        "http://40.192.26.88:5000/users/requests/reject",
        {
          sender,
          rejector: currUser,
        },
        {
          headers: { Authorization: token },
        }
      );
      setReqs((prev) => prev.filter((obj) => obj.user1 !== sender));
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(sender);
        return next;
      });
    }
  }

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
    <div className="shell-page view-requests-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Incoming Requests</h1>
          <p className="page-subtitle">
            {reqs.length > 0
              ? `${reqs.length} pending request${reqs.length > 1 ? "s" : ""} waiting for your response`
              : "Approve or decline people who want to connect with you."}
          </p>
        </div>
        {reqs.length > 0 && (
          <div className="request-count-badge">{reqs.length}</div>
        )}
      </header>

      <main className="page-content">
        {loading ? (
          <div className="card loading-card">
            <div className="loading-spinner"></div>
            <p className="card-text">Loading requests...</p>
          </div>
        ) : reqs.length === 0 ? (
          <div className="card muted empty-state-card">
            <p className="card-text">No requests pending</p>
          </div>
        ) : (
          <ul className="requests-list enhanced-requests">
              {reqs.map((req, ind) => {
                const isProcessing = processing.has(req.user1);
                const avatarColor = getRandomColor(req.user1);
                return (
                  <li key={ind} className="request-item enhanced-request-item">
                    <div className="request-info">
                      <div className="request-details">
                        <div className="friend-name">{req.user1}</div>
                        <div className="request-meta">
                          <span className="request-badge">New Request</span>
                          <span className="request-time">Just now</span>
                        </div>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn btn-primary accept-btn"
                        onClick={() => handleAccept(req.user1)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="spinner-small"></span>
                        ) : (
                          <>
                            <span>✓</span>
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger reject-btn"
                        onClick={() => handleReject(req.user1)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="spinner-small"></span>
                        ) : (
                          <>
                            <span>✕</span>
                            Decline
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
        )}
      </main>
    </div>
  );
}
