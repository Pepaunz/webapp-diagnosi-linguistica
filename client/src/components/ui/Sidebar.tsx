import { Link, useLocation } from "react-router-dom";
import { Home, List, AlertCircle, Settings } from "lucide-react";
import { LogoutButton } from "../LogoutButton";

function Sidebar() {
  const location = useLocation(); 

  return (
    <nav className="flex-1 py-4">
      <ul>
        <li
          className={`px-4 py-2 flex items-center gap-3 ${
            location.pathname === "/" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
        >
          <Link to="/" className="flex items-center gap-3 w-full">
            <Home size={20} />
            <span>Lista Risposte</span>
          </Link>
        </li>
        <li
          className={`px-4 py-2 flex items-center gap-3 ${
            location.pathname.startsWith("/templates")
              ? "bg-gray-700"
              : "hover:bg-gray-700"
          }`}
        >
          <Link to="/templates" className="flex items-center gap-3 w-full">
            <List size={20} />
            <span>Template Questionari</span>
          </Link>
        </li>
        <li className={`px-4 py-2 flex items-center gap-3 hover:bg-gray-700`}>
          <Link to="/feedback" className="flex items-center gap-3 w-full">
            <AlertCircle size={20} />
            <span>Segnalazioni</span>
          </Link>
        </li>
        <li className={`px-4 py-2 flex items-center gap-3 hover:bg-gray-700`}>
          <Link to="/settings" className="flex items-center gap-3 w-full">
            <Settings size={20} />
            <span>Impostazioni</span>
          </Link>
         
        </li>
        <li className= {`px-4 py-2 border-t border-gray-700 flex items-center gap-3 hover:bg-gray-700 mouse:hover bg`} >     
          <LogoutButton/>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
