import React, { useState } from "react";
import "../css/App.css";
import "../css/Footer.css";
import "../css/Scroll.css";
import "../css/Banner.css"
import Header from "./Header";
import Router from "./Router";
import Banner from "./Banner";
import Footer from "./Footer";

function App() {
  const [responseData, setResponseData] = useState(null);

  return (
    <div className="App">
      <Header />
      <Router setResponseData={setResponseData} responseData={responseData} />
      <Banner />
      <Footer />
    </div>
  );
}


export default App;
