import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../css/Reservation.css";

const Reservation = () => {
  const location = useLocation();
  const [remainingTickets, setRemainingTickets] = useState(100);
  const [selectedCount, setSelectedCount] = useState(1);
  const [movie_name, setMovieNm] = useState("");
  const [notification, setNotification] = useState("");
  const [user_id, setUser_id] = useState("");
  const [userTickets, setUserTickets] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const movie_name = searchParams.get("movieNm");
    setMovieNm(movie_name);

    axios.get("/api/authcheck")
      .then(response => {
        if (response.data.isLogin) {
          setUser_id(response.data.user_id);
          fetchUserTickets(response.data.user_id);
          fetchRemainingTickets(movie_name);
        }
      })
      .catch(error => {
        console.error("사용자 정보 요청 오류:", error);
      });
  }, [location.search]);

  const fetchUserTickets = (user_id) => {
    axios.get(`/api/usertickets?user_id=${user_id}`)
      .then(response => {
        setUserTickets(response.data.total_tickets);
      })
      .catch(error => {
        console.error("사용자 티켓 수 요청 오류:", error);
      });
  };

  const fetchRemainingTickets = (movie_name) => {
    axios.get(`/api/remainingtickets?movie_name=${movie_name}`)
      .then(response => {
        setRemainingTickets(response.data.remaining_tickets);
      })
      .catch(error => {
        console.error("남은 티켓 수 요청 오류:", error);
      });
  };

  const handleIncrement = () => {
    setSelectedCount((prevCount) => Math.min(prevCount + 1, 3));
  };

  const handleDecrement = () => {
    setSelectedCount((prevCount) => Math.max(prevCount - 1, 1));
  };

  const handlePurchase = async () => {
    if (selectedCount <= remainingTickets) {
      try {
        const response = await axios.post("/api/reservation", {
          movie_name: movie_name,
          ticket_count: selectedCount,
          user_id: user_id
        });
        console.log(response.data);
        const updatedRemainingTickets = remainingTickets - selectedCount;
        setRemainingTickets(updatedRemainingTickets);
        setUserTickets(userTickets + selectedCount);
        setNotification(`예매가 완료되었습니다. 선택한 티켓 수량: ${selectedCount}`);
      } catch (error) {
        console.error("예약 오류:", error);
        if (error.response) {
          console.error("서버 응답 데이터:", error.response.data);
          setNotification(`오류: ${error.response.data.message}`);
        }
      }
    } else {
      setNotification("예매할 수 있는 티켓 수량이 부족합니다.");
    }
  };

  const handleCancel = async () => {
    if (selectedCount <= userTickets) {
      try {
        const response = await axios.delete("/api/cancel", {
          data: {
            movie_name: movie_name,
            ticket_count: selectedCount,
            user_id: user_id
          },
        });
        console.log(response.data);
        const updatedRemainingTickets = remainingTickets + selectedCount;
        setRemainingTickets(updatedRemainingTickets);
        setUserTickets(userTickets - selectedCount);
        setNotification(`예매가 취소되었습니다. 취소한 티켓 수량: ${selectedCount}`);
      } catch (error) {
        console.error("취소 오류:", error);
        if (error.response) {
          console.error("서버 응답 데이터:", error.response.data);
          setNotification(`오류: ${error.response.data.message}`);
        }
      }
    } else {
      setNotification("취소할 수 있는 티켓 수량이 부족합니다.");
    }
  };

  return (
    <div>
      <h1>예매하기</h1>
      <div className="reservation-container">
        <h1>{movie_name}</h1>
        <p className="remaining-tickets">남은 티켓 수: {remainingTickets}</p>
        <div className="ticket-buttons">
          <button onClick={handleDecrement}>-</button>
          <span className="selected-count">{selectedCount}</span>
          <button onClick={handleIncrement}>+</button>
        </div>
        <div className="action-buttons">
          <button onClick={handlePurchase}>예매하기</button>
          <button onClick={handleCancel}>예매 취소하기</button>
        </div>
        {notification && <p className="notification">{notification}</p>}
      </div>
    </div>
  );
};

export default Reservation;
