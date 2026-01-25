import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";

import Home from "./pages/Home";
import Applications from "./pages/applications/Applications";
import Aquaculture from "./pages/applications/Aquaculture";
import Agriculture from "./pages/applications/Agriculture";
import Industrial from "./pages/applications/Industrial";
import ErrorBoundary from "./components/ErrorBoundary";

// placeholders if not ready
const LiveDashboard = () => <div>Live Dashboard</div>;
const History = () => <div>History</div>;
const Settings = () => <div>Settings</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route
  path="/live"
  element={
    <ErrorBoundary>
      <LiveDashboard />
    </ErrorBoundary>
  }
/>
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/applications" element={<Applications />} />
          <Route
            path="/applications/aquaculture"
            element={<Aquaculture />}
          />
          <Route
            path="/applications/agriculture"
            element={<Agriculture />}
          />
          <Route
            path="/applications/industrial"
            element={<Industrial />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
