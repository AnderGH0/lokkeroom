import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/login.css';

const Home = () => {

        // state
          const [user, setUsers] = useState({
            email : '',
            password : ''
          });
          const navigate = useNavigate();
          
        // comportement
        const handleSubmit =  async (event) => {
          event.preventDefault();
          try {
            const response = await fetch(`http://localhost:3001/users?email=${user.email}`);
            const usersInfos = await response.json();
            if(usersInfos.length > 0) {
              const usersInfos0 = usersInfos[0];
              console.log(usersInfos0);
              console.log("this users exist, now verify the password");
              console.log("base de données mdp : ", usersInfos0.password);
              if(user.password === usersInfos0.password) {
                console.log('tout est prêt pour login');
                localStorage.setItem("userId", usersInfos0.id);
                navigate("/dashboard");
              }
              else {
                console.log('mot de passe incorrect !');
              }
            }
          }
          catch(error) {
            console.error("Erreur:", error);
          }
          
        }
      
        const handleChange = (event) => {
          const {name, value} = event.target;
          setUsers((prevUsers) => ({
            ...prevUsers, 
            [name] : value
          }));
        }
      
        // affichage
      

          
        const loginForm = 
          <form action="submit" onSubmit={handleSubmit} className="login-infos">
            <label htmlFor="email">Email :</label>
            <input type="email" placeholder="abcd@gmail.com" name="email" value= {user.email} onChange={handleChange}/>
      
            <label htmlFor="password">Password :</label>
            <input type="password"  name="password" value={user.password} onChange={handleChange}/>
      
            <button type="submit">Login</button>
          </form>
        
      
        return (
          <div className="login-container">
            <div className="signUp-title">
              <h1>Lokkerroom</h1>
            </div>
            <div className="login-cont">
              <h2>Login</h2>
              {loginForm}
              <Link className="sign-up-nav" to="/signUp">Create an account</Link>
              <Link className="sign-up-nav" to="/">Dashboard</Link>
            </div>
          </div>
        );
  };
  
  export default Home;