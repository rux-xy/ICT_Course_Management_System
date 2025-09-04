// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GetStarted from "./pages/getStarted";
import Login from "./pages/login";
import Signup from "./pages/signup";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
