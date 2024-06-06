// Main.js

import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import "../css/Main.css"; // Main.css 파일을 import

const Main = () => {
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
    <div className="main-containers"> {/* main-container 클래스 추가 */}
      <br />
      <button className="scroll-button" onClick={scrollToTop}>
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
      <button className="scroll-button" onClick={scrollToBottom}>
        <FontAwesomeIcon icon={faArrowDown} />
      </button>
    </div>
  );
};

export default Main;
