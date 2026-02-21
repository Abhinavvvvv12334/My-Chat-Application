import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TopNavigation() {
  const location = useLocation();
  const [currUser, setCurrUser] = useState("");
  const token = sessionStorage.getItem("token");

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        <div className="top-nav-brand">
          <Link to="/CurrFriends" className="nav-brand-link">
            {currUser ? `${currUser}'s Chat` : "Chat App"}
          </Link>
        </div>
        <div className="top-nav-links">
          <Link
            to="/CurrFriends"
            className={`nav-link ${isActive("/CurrFriends") ? "active" : ""}`}
          >
            Friends
          </Link>
          <Link
            to="/viewrequests"
            className={`nav-link ${isActive("/viewrequests") ? "active" : ""}`}
          >
            Incoming Requests
          </Link>
          <Link
            to="/showrequests"
            className={`nav-link ${isActive("/showrequests") ? "active" : ""}`}
          >
            Sent Requests
          </Link>
          <Link
            to="/addfriends"
            className={`nav-link ${isActive("/addfriends") ? "active" : ""}`}
          >
            Add Friends
          </Link>
        </div>
      </div>
    </nav>
  );
}