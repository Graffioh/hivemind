import "./App.css";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post-page" element={<PostPage />} />
      </Routes>
    </Router>
  );
}

export default App;
