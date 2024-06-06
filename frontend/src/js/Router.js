import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./Nav";
import LoginForm from "./LoginForm";
import JoinForm from "./JoinForm";
import Main from "./Main";
import Movie from "./Movie";
import MovieTheaters from "./MovieTheaters";
import Reservation from "./Reservation";

const AppRouter = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // setIsLoggedIn 추가

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/authcheck");
        const responseData = await response.json();
        if (responseData.isLogin) {
          setUser({ username: responseData.user_id });
          setIsLoggedIn(true); // 로그인 상태 업데이트
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        credentials: "include" // 쿠키를 전달하기 위해 credentials 설정 추가
      });
      const responseData = await response.json();
      if (response.ok && responseData.message === "로그아웃 성공") {
        setUser(null);
        setIsLoggedIn(false); // 로그아웃 상태 업데이트
      } else {
        console.error("로그아웃 중 오류 발생:", responseData.message);
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Main setUser={setUser} />} />
        <Route path="/LoginForm" element={<LoginForm setUser={setUser} />} />
        <Route
          path="/JoinForm"
          element={<JoinForm setUser={setUser} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/Movie" element={<Movie setUser={setUser} />} />
        <Route
          path="/MovieTheaters"
          element={<MovieTheaters setUser={setUser} />}
        />
        <Route path="/Reservation" element={<Reservation setUser={setUser} />} />
      </Routes>
    </>
  );
};

export default AppRouter;
