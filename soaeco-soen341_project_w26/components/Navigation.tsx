"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { layoutStyles } from "@/lib/styles";

export function Navigation() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) {
    return null;
  }

  // Hide nav on certain pure auth pages if desired, but since it's user bound, typically we only show it when logged in anyway.
  // Still, let's make sure it doesn't show on login/register if they somehow have a leftover session
  if (pathname === "/login" || pathname === "/register" || pathname === "/reset-password") {
    return null;
  }

  const getNavItemClass = (path: string) => {
    return `${layoutStyles.navBase} ${
      pathname === path ? layoutStyles.navActive : layoutStyles.navInactive
    }`;
  };

  return (
    <nav className={layoutStyles.navContainer}>
      <Link href="/search_page" className={getNavItemClass('/search_page')}>
        Studio
      </Link>
      <Link href="/recipe" className={getNavItemClass('/recipe')}>
        Create
      </Link>
      <Link href="/profile_management" className={getNavItemClass('/profile_management')}>
        Profile
      </Link>
      <Link href="/" className={getNavItemClass('/')}>
        Home
      </Link>
    </nav>
  );
}
