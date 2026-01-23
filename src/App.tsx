import { useState } from "react";
import MainLayout from "./MainLayout";
import Login from "./login";

/**
 * Central page union type
 * This MUST exist only once in the app
 */
export type Page =
  | "home"
  | "live"
  | "history"
  | "applications"
  | "settings";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [page, setPage] = useState<Page>("home");

  // Login gate
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <MainLayout
      page={page}
      setPage={setPage}
    />
  );
}
