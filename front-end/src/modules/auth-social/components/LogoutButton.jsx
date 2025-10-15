import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseAuth";

export default function LogoutButton() {
  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log("Logout successful"))
      .catch((error) => console.error("Logout error:", error));
  };

  return (
    <button
      onClick={handleLogout}
      className="btn-copilot-secondary flex items-center gap-2 group"
    >
      <svg
        className="w-4 h-4 text-copilot-text-secondary group-hover:text-copilot-text-primary transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Logout
    </button>
  );
}
