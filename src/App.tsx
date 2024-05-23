import "./App.css";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post-page" element={<PostPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
