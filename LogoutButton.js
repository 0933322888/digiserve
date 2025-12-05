'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    console.log('[LogoutButton] handleLogout called.');
    setIsLoggingOut(true);
    try {
      // 1. Call the API endpoint to clear the server-side session.
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      console.log(`[LogoutButton] Logout API response status: ${response.status}`);

      if (!response.ok) {
        // Handle cases where the server fails to log out.
        console.error('Logout failed on the server.');
        // Optionally, show an error message to the user.
      }

      // 2. After the server has confirmed logout, perform a full-page redirect.
      // Using window.location.href ensures a hard refresh, which is the most
      // reliable way to clear all client-side state (React Context, etc.)
      // and avoid any chance of displaying stale data.
      console.log('[LogoutButton] Redirecting to /admin/login...');
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('An error occurred during logout:', error);
      // Even if there's an error, try to redirect to login page as a fallback.
      window.location.href = '/admin/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return <button onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? 'Logging out...' : 'Logout'}</button>;
}