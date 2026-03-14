import { CRM } from "@/components/atomic-crm/root/CRM";
import { LandingPage } from "@/components/atomic-crm/landing/LandingPage";
import "./App.css";

/**
 * Application entry point
 *
 * Customize Atomic CRM by passing props to the CRM component:
 *  - contactGender
 *  - companySectors
 *  - darkTheme
 *  - dealCategories
 *  - dealPipelineStatuses
 *  - dealStages
 *  - lightTheme
 *  - logo
 *  - noteStatuses
 *  - taskTypes
 *  - title
 * ... as well as all the props accepted by shadcn-admin-kit's <Admin> component.
 *
 * @example
 * const App = () => (
 *    <CRM
 *       logo="./img/logo.png"
 *       title="Acme CRM"
 *    />
 * );
 */
const App = () => {
  if (typeof window === "undefined") {
    return <CRM />;
  }

  const pathname = window.location.pathname;
  if (pathname === "/" || pathname === "/index.html") {
    return <LandingPage />;
  }
  if (pathname === "/app" || pathname === "/app/") {
    window.location.replace("/login");
    return null;
  }
  if (pathname.startsWith("/app/")) {
    window.location.replace(pathname.slice(4));
    return null;
  }

  return <CRM />;
};

export default App;
