import { Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import DisplayMessages from "./DisplayMessages";
import DisplayFriends from "./DisplayFriends";
import ViewRequests from "./ViewRequests";
import ShowRequests from "./ShowRequests";
import CurrFriends from "./CurrFriends";
import TopNavigation from "./TopNavigation";
import "./index.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/DisplayMessages/:friend" element={<DisplayMessages />} />
        <Route path="/addfriends" element={<DisplayFriends />} />
        <Route path="/viewrequests" element={<ViewRequests />} />
        <Route path="/showrequests" element={<ShowRequests />} />
        <Route path="/CurrFriends" element={<CurrFriends />} />
      </Route>

      <Route path="/notoken" element={<NoToken />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ProtectedLayout() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/notoken" replace />;
  }
  return (
    <>
      <TopNavigation />
      <Outlet />
    </>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>This path doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go to login</Link>
    </div>
  );
}

function NoToken() {
  return (
    <div className="not-found">
      <h1>Session expired</h1>
      <p>Please log in again to continue.</p>
      <Link to="/" className="btn btn-primary">Back to login</Link>
    </div>
  );
}