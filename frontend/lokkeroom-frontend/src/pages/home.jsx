import React from "react";
import { Link } from "react-router-dom";
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="overlay">
        {/* <NavBar /> */}
        <h1>Lokkerroom</h1>
        <div className="home-design">
        </div>
          <div className="home-button">
        </div>
        <Link className="sign-up" to="/signUp">Yes, I want to create my account !</Link>
        <Link className="sign-in" to="/login">I want to login !</Link>
      </div>
    </div>
    
  );
};

export default Home;