import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/home";
import SignUp from "./pages/signUp";
import Login from "./pages/login";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
