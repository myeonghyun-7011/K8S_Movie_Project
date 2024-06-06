import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Join.css";

const JoinForm = () => {
  const [user_id, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_id || !password || !email || !phone) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const formData = {
      user_id,
      password,
      email,
      phone,
    };

    try {
      const userExists = await checkUserExists(user_id);
      if (userExists) {
        setMessage("이미 존재하는 사용자입니다.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/joins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.message === "회원가입 성공") {
        alert("회원가입이 성공적으로 완료되었습니다.");
        navigate("/LoginForm"); // 회원가입 성공 시 로그인 페이지로 이동
      } else {
        setMessage(responseData.message || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("회원가입 중 오류가 발생했습니다.");
    }
  };

  const checkUserExists = async (user_id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/checkUserExists?user_id=${user_id}`
      );
      const responseData = await response.json();
      return responseData.exists;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  return (
    <div className="login-container join-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="join-input">
          <label htmlFor="user_id">
            <b>아이디</b>
          </label>
          <input
            type="text"
            id="user_id"
            placeholder="아이디를 입력하세요"
            value={user_id}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="password">
            <b>비밀번호</b>
          </label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">
            <b>비밀번호 확인</b>
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label htmlFor="email">
            <b>이메일</b>
          </label>
          <input
            type="email"
            id="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="phone">
            <b>핸드폰번호</b>
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="핸드폰번호를 입력하세요"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button type="submit">가입하기</button>
        </div>
      </form>
      {message && <p className="error-message">{message}</p>}
      <p>
        로그인 화면으로 돌아가기{" "}
        <button onClick={() => navigate("/LoginForm")}>로그인</button>
      </p>
    </div>
  );
};

export default JoinForm;
