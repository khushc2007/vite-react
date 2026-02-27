import { Outlet } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
