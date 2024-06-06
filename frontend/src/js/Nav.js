import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Nav.css";

const Nav = ({ onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ user_id: "" });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/authcheck");
        const responseData = await response.json();
        setIsLoggedIn(responseData.isLogin);
        if (responseData.isLogin) {
          setUser({ user_id: responseData.user_id });
        } else {
          setUser(null); // 로그아웃 상태인 경우 user를 초기화
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout");
      const responseData = await response.json();
      if (responseData.message === "로그아웃 성공") {
        localStorage.removeItem("isLoggedIn");
        onLogout();
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/Movie">Movie List</Link>
      <Link to="/MovieTheaters">Map</Link>
      {localStorage.getItem("isLoggedIn") === "true" || isLoggedIn ? (
        <>
          <Link to="/" onClick={handleLogout}>Logout</Link>
          <span className="user_id">{user && user.user_id ? `${user.user_id}님 환영합니다` : ""}</span>
        </>
      ) : (
        <>
          <Link to="/LoginForm">Login</Link>
          <Link to="/JoinForm">Join</Link>
        </>
      )}
    </nav>
  );
};

export default Nav;
