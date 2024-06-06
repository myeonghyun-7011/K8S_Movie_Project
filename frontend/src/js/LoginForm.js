import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // axios 추가
import "../css/LoginForm.css";
import GoogleImage from "../img/구글.png";
import KakaoImage from "../img/카카오톡.png";
import FacebookImage from "../img/페이스북.png";

const LoginForm = ({ setUser }) => {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
     // 로컬 스토리지에서 로그인 상태 확인
     const storedLoginStatus = localStorage.getItem("isLoggedIn");
     setIsLoggedIn(storedLoginStatus === "true");
    };

    checkLoggedIn();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post( // axios로 변경
        "http://localhost:5000/api/login",
        { user_id, password },
        { withCredentials: true } // 세션 쿠키를 서버에 함께 전달
      );

      const responseData = response.data;
      if (responseData.isLogin === "True") {
        setUser({ user_id });
        // 로그인 성공 시 로컬 스토리지에 로그인 상태 저장
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
      } else {
        alert(responseData.isLogin || "로그인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

   // 로그아웃 함수 정의
   const handleLogout = () => {
    // 로컬 스토리지에서 로그인 상태 제거
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };
  
  const handleForgotPassword = () => {
    // 비밀번호를 잊어버렸을 때의 처리
    // 비밀번호 재설정 페이지로 이동하거나 재설정을 위한 방법을 제공하는 모달 등을 표시할 수 있음
  };

  const handleSignUp = () => {
    navigate("/JoinForm"); // 회원가입 페이지로 이동
  };

  return (
    <div className="login-container">
      <h2>LOGIN</h2>
      {isLoggedIn ? (
        <p>이미 로그인되었습니다.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="custom-input">
            <label htmlFor="userId">
              <b>ID</b>
            </label>
            <input
              type="text"
              id="userId"
              placeholder="ID를 입력하세요"
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <label htmlFor="password">
              <b>Password</b>
            </label>
            <input
              type="password"
              id="password"
              placeholder="PW를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">SIGN IN</button>
          </div>
          <div className="social-login">
            <button type="button">
              <img src={FacebookImage} alt="Facebook" />
            </button>
            <button type="button">
              <img src={GoogleImage} alt="Google" />
            </button>
            <button type="button">
              <img src={KakaoImage} alt="Kakao" />
            </button>
          </div>
          <div className="forgot-password">
            <a href="#" onClick={handleForgotPassword}>
              비밀번호를 잊어버리셨나요? here
            </a>
          </div>
          <p>
            계정이 없으신가요? <button onClick={handleSignUp}>회원가입</button>
          </p>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
