import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Settings, User } from "lucide-react";
import { CanAccess } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { UserMenu } from "@/components/admin/user-menu";
import { useUserMenu } from "@/hooks/user-menu-context";

import { useConfigurationContext } from "../root/ConfigurationContext";

const Header = () => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();
  const location = useLocation();

  let currentPath: string | boolean = "/";
  if (matchPath("/", location.pathname)) {
    currentPath = "/";
  } else if (matchPath("/contacts/*", location.pathname)) {
    currentPath = "/contacts";
  } else if (matchPath("/companies/*", location.pathname)) {
    currentPath = "/companies";
  } else if (matchPath("/deals/*", location.pathname)) {
    currentPath = "/deals";
  } else {
    currentPath = false;
  }

  return (
    <nav className="grow sticky top-0 z-30 px-4 md:px-6 pt-3">
      <header className="rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md shadow-[0_18px_36px_-28px_oklch(0.24_0.03_246/.45)]">
        <div className="px-3 md:px-4 py-2.5">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-foreground no-underline min-w-fit"
            >
              <img
                className="in-[.light]:hidden h-6"
                src={darkModeLogo}
                alt={title}
              />
              <img
                className="in-[.dark]:hidden h-6"
                src={lightModeLogo}
                alt={title}
              />
              <h1 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h1>
            </Link>

            <div className="order-3 md:order-2 w-full md:w-auto">
              <nav className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
                <NavigationTab
                  label="Dashboard"
                  to="/"
                  isActive={currentPath === "/"}
                />
                <NavigationTab
                  label="Contacts"
                  to="/contacts"
                  isActive={currentPath === "/contacts"}
                />
                <NavigationTab
                  label="Companies"
                  to="/companies"
                  isActive={currentPath === "/companies"}
                />
                <NavigationTab
                  label="Deals"
                  to="/deals"
                  isActive={currentPath === "/deals"}
                />
                <NavigationTab
                  label="IMS"
                  to="http://localhost:5000"
                  isActive={currentPath === "http://localhost:5000"}
                />
              </nav>
            </div>

            <div className="order-2 md:order-3 flex items-center rounded-xl border border-border/60 bg-background/65 px-1 py-1">
              <ThemeModeToggle />
              <RefreshButton />
              <UserMenu>
                <ConfigurationMenu />
                <CanAccess resource="sales" action="list">
                  <UsersMenu />
                </CanAccess>
              </UserMenu>
            </div>
          </div>
        </div>
      </header>
    </nav>
  );
};

const NavigationTab = ({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all border ${
      isActive
        ? "text-primary-foreground bg-primary border-primary shadow-sm"
        : "text-foreground/72 border-border/60 bg-background/45 hover:text-foreground hover:bg-background/85"
    }`}
  >
    {label}
  </Link>
);

const UsersMenu = () => {
  const { onClose } = useUserMenu() ?? {};
  return (
    <DropdownMenuItem asChild onClick={onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <User /> Users
      </Link>
    </DropdownMenuItem>
  );
};

const ConfigurationMenu = () => {
  const { onClose } = useUserMenu() ?? {};
  return (
    <DropdownMenuItem asChild onClick={onClose}>
      <Link to="/settings" className="flex items-center gap-2">
        <Settings />
        My info
      </Link>
    </DropdownMenuItem>
  );
};
export default Header;
