import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/home";
import SignUp from "./pages/signUp";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Lobbys from "./pages/lobbys";
import NewLobby from "./pages/newLobby";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lobbys" element={<Lobbys />} />
      <Route path="/newLobby" element={<NewLobby />} />
      </Routes>
    </Router>
  )
}

export default App
