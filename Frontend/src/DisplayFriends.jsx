import axios from "axios";
import { useEffect, useState } from "react";

export default function DisplayFriends() {
  const [user, setUser] = useState("");
  const [display, setDisplay] = useState(false);
  const [err, setErr] = useState("");
  const [searchedUser, setSearchedUser] = useState("");
  const [currUser, setCurrUser] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    async function getUser() {
      try {
        const resp1 = await axios.get("http://localhost:8080/users/me", {
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (user.trim().length === 0) {
      setErr("Username cannot be empty");
      return;
    }

    setIsSearching(true);
    setErr("");
    setDisplay(false);

    try {
      const resp = await axios.get(
        `http://localhost:8080/users/${encodeURIComponent(user.trim())}`,
        {
          headers: { Authorization: token },
        }
      );
      const { username } = resp.data;

      if (username && username.length !== 0) {
        if (currUser === username) {
          setErr("You can't send a request to yourself");
          setIsSearching(false);
          return;
        }
        setDisplay(true);
        setSearchedUser(username);
        setUser("");
        setIsSent(false);
      } else {
        setErr("Username not found");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setErr("Username not found");
      } else {
        setErr("Something went wrong. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSendReq(e) {
    e.preventDefault();
    setIsSending(true);
    setErr("");

    try {
      const resp = await axios.post(
        "http://localhost:8080/users/request/",
        {
          sender: currUser,
          receiver: searchedUser,
        },
        {
          headers: { Authorization: token },
        }
      );
      if (resp.data.status !== "Success") {
        setErr(resp.data.status);
        setIsSent(false);
      } else {
        setIsSent(true);
        setTimeout(() => {
          setDisplay(false);
          setSearchedUser("");
          setIsSent(false);
        }, 2000);
      }
    } catch (error) {
      setErr("Failed to send request. Please try again.");
      setIsSent(false);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="shell-page add-friends-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Add Friends</h1>
          <p className="page-subtitle">
            Search for users and send them friend requests to connect.
          </p>
        </div>
      </header>

      <main className="page-content">
        <div className="hero-search-section">
          <div className="hero-icon">👥</div>
          <h2 className="hero-title">Find New Connections</h2>
          <p className="hero-description">
            Search by username to find people you know and expand your network
          </p>
        </div>

        <form className="card card-form enhanced-form" onSubmit={handleSubmit}>
          <div className="search-wrapper">
            <div className="search-icon">🔍</div>
            <input
              id="friend-search"
              type="text"
              placeholder="Enter username to search..."
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setErr("");
                setDisplay(false);
              }}
              className="card-input search-input"
              disabled={isSearching}
              autoComplete="off"
            />
            <button 
              type="submit" 
              className="btn btn-primary search-btn"
              disabled={isSearching || !user.trim()}
            >
              {isSearching ? (
                <>
                  <span className="spinner-small"></span>
                  Searching...
                </>
              ) : (
                <>
                  <span>🔎</span>
                  Search
                </>
              )}
            </button>
          </div>
          {err && (
            <div className="field-error enhanced-error" role="alert">
              <span className="error-icon">⚠️</span>
              {err}
            </div>
          )}
        </form>

        {display && searchedUser.length !== 0 && (
          <div className="card result-card enhanced-result">
            <div className="friend-result">
              <div className="friend-info">
                <div className="friend-name">{searchedUser}</div>
              </div>
            </div>
            <div className="result-actions">
              {isSent ? (
                <div className="status-badge success-badge">
                  <span className="check-icon">✓</span>
                  Request sent!
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary send-btn"
                  onClick={handleSendReq}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <span className="spinner-small"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      Send Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}