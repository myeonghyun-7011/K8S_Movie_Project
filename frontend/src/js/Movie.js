import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

import "../css/Movie.css";

const Movie = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = formatDate(yesterday);
      const baseUrl =
        "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?";
      const myKey = "d0c0ebcd8606c274ad0c8fc093094bc7";
      const url = `${baseUrl}key=${myKey}&targetDt=${formattedDate}`;

      const response = await axios.get(url);
      const movieList = response.data.boxOfficeResult.dailyBoxOfficeList;

      const updatedMovies = await Promise.all(
        movieList.map(async (movie) => {
          const remainingTickets = await fetchRemainingTickets(movie.movieNm);
          return { ...movie, remainingTickets };
        })
      );

      setMovies(updatedMovies);
    } catch (error) {
      console.error("데이터 가져오기 오류: ", error);
    }
  };

  const fetchRemainingTickets = async (movieName) => {
    try {
      const response = await axios.get(`/api/remainingtickets?movie_name=${movieName}`);
      return response.data.remaining_tickets;
    } catch (error) {
      console.error("남은 티켓 수 요청 오류:", error);
      return 0;
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const handleReservationClick = (index, movie) => {
    window.location.href = `/Reservation?movieNm=${encodeURIComponent(movie.movieNm)}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="containerd">
      <h1 className="title">현재 상영 중인 영화 목록</h1>
      <div className="movie-container">
        {movies.map((movie, index) => (
          <div key={index} className="movie-item">
            <p className="movie-rank">
              {movie.rank}위 <br /> {movie.movieNm}
            </p>
            <p className="ticket-count">남은 티켓 수: {movie.remainingTickets}</p>
            <div className="buttons">
              <a
                className="movie-link button"
                href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                  movie.movieNm
                )} 영화`}
                target="_blank"
                rel="noopener noreferrer"
              >
                영화 정보 보기
              </a>
              <button
                className="reservation-button button"
                onClick={() => handleReservationClick(index, movie)}
                disabled={movie.remainingTickets === 0}
              >
                예매 하러가기
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <br />
        <button className="scroll-button" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
        <button className="scroll-button" onClick={scrollToBottom}>
          <FontAwesomeIcon icon={faArrowDown} />
        </button>
      </div>
    </div>
  );
};

export default Movie;
