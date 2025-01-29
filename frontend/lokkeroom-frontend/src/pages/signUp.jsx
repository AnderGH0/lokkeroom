import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../styles/signUp.css';

const SignUp = () => {

  // state
  const [users, setUsers] = useState({
    name : '',
    surname : '',
    email : '',
    password: '',
    repPassword: ''
  });

  const [errors, setErrors] = useState({
    name : '',
    surname : '',
    email : '',
    password: '',
    repPassword: ''
  });

  const [succesMessage, setSuccesMessage] = useState(null);

  // comportement
  const handleSubmit = async (event) => {
    event.preventDefault();
    //affichage des messages d'erreurs
    let tmpErrors = {};
    if(users.name.length<3 || users.name.length > 15) {
      tmpErrors.name = "minimum 3, maximum 15 letters !";
    }
    if(users.surname.length<3 || users.surname.length > 15) {
      tmpErrors.surname = "minimum 3, maximum 15 letters !";
    }
    if(users.email.length<1) {
      tmpErrors.email = "errors !";
    }
    if(users.password < 4) {
      tmpErrors.password = "minimum 4 letters !";
    }
    else if(users.repPassword !== users.password && users.repPassword.length>1) {
      tmpErrors.repPassword = "the password isn't correct !";
    }

    setErrors(tmpErrors);
    console.log("tmperrors", tmpErrors);

    if(Object.keys(tmpErrors).length === 0) {
      console.log("tout est ok pour submit");
      const newUserInfos = {
        id: Date.now(),
        name: users.name,
        surname: users.surname,
        email: users.email,
        password: users.password
      }
      console.log(newUserInfos);
      try {
        const response = await fetch(`http://localhost:3001/users?email=${users.email}`); // à remplacer par le lien du backend
        // (j'avais fait ça pour un fichier users.json ou j'avais stocké les données des utilisateurs dedans)
        const existingUsers = await response.json();
        if(existingUsers.length > 0) {
          alert("This users exist !");
          return;
        }
        else {
          handleAddUser(newUserInfos);
          
          const succesMessageHTML = (
            <div className="succes-message-container">
              <h1>SUCCESS !</h1>
              <h2>Welcome to lokkerroom,</h2>
              <p>{users.name} {users.surname} !</p>
              <h2>We're glad you joined us.</h2>
              <Link className="sign-up-nav" to="/login">Click here to Login</Link>
              <Link className="sign-up-nav" to="/">Go to home !</Link>
            </div>
          );
          setUsers({
            name : '',
            surname : '',
            email : '',
            password: '',
            repPassword: ''
          });
          setSuccesMessage(succesMessageHTML);
        }
      }
      catch(error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
      
    }
  };

  const handleChange = (event) => {
    const {name, value} = event.target;
    setUsers((prevUsers) => ({
      ...prevUsers,
      [name] : value
    }));
  }
  const handleAddUser = (newUser) => {
    // a changer avec le backend
    fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
    .then((response) => response.json())
    .then ((data) => {
      console.log("Utilisateur ajouté:", data);
    })
    .catch((error) => console.log("erreur:", error));
  }
  
  // affichage


  const usersForm = (
    <form action="submit" onSubmit={handleSubmit} className="sign-up-infos">
      <label htmlFor="name">Name : {errors.name && <p className="errors-message">{errors.name}</p>}</label> 
      <input type="text" placeholder="Your name..." name="name" value={users.name} onChange={handleChange}/>
      

      <label htmlFor="surname">Surname : {errors.surname && <p className="errors-message">{errors.surname}</p>}</label> 
      <input type="text" placeholder="Your surname..." name="surname" value={users.surname} onChange={handleChange}/>

      <label htmlFor="email">Email : {errors.email && <p className="errors-message">{errors.email}</p>}</label> 
      <input type="email" placeholder="abcd@gmail.com" name="email" value={users.email} onChange={handleChange}/>

      <label htmlFor="password">Password : {errors.password && <p className="errors-message">{errors.password}</p>}</label> 
      <input type="password"  name="password" value={users.password} onChange={handleChange}/>

      <label htmlFor="repPassword">Repeat password : {errors.repPassword && <p className="errors-message">{errors.repPassword}</p>}</label> 
      <input type="password"  name="repPassword" value={users.repPassword} onChange={handleChange}/>

      <button type="submit">Register</button>
    </form>
  );
  return (
    <div className="signUp-container">
      <div className="signUp-title">
        <h1>Lokkerroom</h1>
      </div>
      <div className="signUp-cont">
        <h2>CREATE ACCOUNT</h2>
          {usersForm}
          <Link className="sign-up-nav" to="/login">Do you have an account? Click here !</Link>
          <Link className="sign-up-nav" to="/">Go to home !</Link>
          {succesMessage}
      </div>
    </div>
  );
};

export default SignUp;