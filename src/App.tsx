import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import LiveMap from "./pages/LiveMap";
import Dashboard from "./pages/Dashboard";


export default function App() {
  // const navigate = useNavigate()
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/livemap" element={<LiveMap />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

    </>
  )
}

