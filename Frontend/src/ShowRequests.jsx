import axios from "axios";
import { useEffect, useState } from "react";

export default function ShowRequests() {
  const [reqs, setReqs] = useState([]);
  const [currUser, setCurrUser] = useState("");
  const [loading, setLoading] = useState(true);
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
          "http://40.192.26.88:5000/users/requests/pending/user1",
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

  return (
    <div className="shell-page view-requests-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sent Requests</h1>
          <p className="page-subtitle">
            {reqs.length > 0
              ? `${reqs.length} request${reqs.length > 1 ? "s" : ""} waiting for response`
              : "View requests you've sent to other users."}
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
            <div className="empty-icon-large">📤</div>
            <h3 className="empty-title">No Sent Requests</h3>
            <p className="card-text">
              You haven&apos;t sent any friend requests yet. Visit Add Friends to start connecting!
            </p>
          </div>
        ) : (
          <>
            <div className="requests-header">
              <h3 className="section-title">Pending Requests</h3>
              <span className="section-subtitle">Waiting for response</span>
            </div>
            <ul className="requests-list enhanced-requests">
              {reqs.map((req, ind) => {
                return (
                  <li key={ind} className="request-item enhanced-request-item">
                    <div className="request-info">
                      <div className="request-details">
                        <div className="friend-name">{req.user2}</div>
                        <div className="request-meta">
                          <span className="request-badge pending">Pending</span>
                          <span className="request-time">Waiting...</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
