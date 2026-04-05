import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "Context/themeContext";
import { Button } from "Components/ui/button";
import { Separator } from "Components/ui/separator";
import { SidebarTrigger } from "Components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "Components/ui/breadcrumb";

const routeLabels = {
  "/addjob": "Add Job",
  "/jobs": "Job Dashboard",
  "/addcompany": "Add Company",
  "/companys": "Company List",
  "/canvas": "Banners",
  "/admin/scraper": "Scraper Dashboard",
  "/admin/scraper/staging": "Staging Queue",
  "/admin/scraper/logs": "Scrape Logs",
  "/admin/scraper/health": "Adapter Health",
  "/analytics": "Analytics",
};

const getRouteLabel = (pathname) => {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.startsWith("/admin/scraper/staging/")) return "Job Review";
  return "Dashboard";
};

const AppHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const currentLabel = getRouteLabel(location.pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b shadow-sm px-4 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/addjob">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-7 w-7">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
};

export default AppHeader;
