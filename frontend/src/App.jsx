import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/user/Dashboard";
import Preview from "./pages/user/Preview";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/user/EditorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
