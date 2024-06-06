import React from "react";

const Footer = (props) => {
  return (
    <footer id="footerType" className={`footer__wrap ${props.element}`}>
      <div className="footer__inner container">
        <div className="banner__wrap">
          <h2 className="blind">{props.title}</h2>
          <div className="banner__inner">
            <p className="desc">
              <div className="banner-icon-container">
                <a
                  href="https://github.com/myeonghyun-7011/movie_project.git"
                  title="깃허브 페이지 이동"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={require("../img/icon_github1.png")}
                    alt="GitHub Icon"
                    className="banner-small-icon"
                  />
                </a>
                <a
                  href="/"
                  title="노션 페이지 이동"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={require("../img/icon_notion.jpg")}
                    alt="Notion Icon"
                    className="banner-small-icon"
                  />
                </a>
              </div>
            </p>
          </div>
        </div>
        <div className="footer__right">
          Kubernetes Single Project ⓒ 2024 All Rights Reserved. Kakao Cloud Engineer 4th
        </div>
      </div>
    </footer>
  );
};

export default Footer;