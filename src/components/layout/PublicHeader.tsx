import { Link, useLocation } from "react-router-dom";

const PublicHeader = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center p-6 md:p-8">
      <Link 
        to="/" 
        className="font-display text-primary tracking-widest text-sm md:text-base hover:opacity-80 transition-opacity duration-300"
      >
        Lomaria
      </Link>
      
      <nav className="flex gap-6 items-center">
        <Link 
          to="/about" 
          className={`font-display tracking-wider text-xs md:text-sm transition-colors duration-300 ${
            isActive("/about") 
              ? "text-primary" 
              : "text-foreground/70 hover:text-primary"
          }`}
        >
          Über uns
        </Link>
      </nav>
    </header>
  );
};

export default PublicHeader;
