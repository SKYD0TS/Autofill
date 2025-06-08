'use client'
import { useSession } from "next-auth/react"; // Access session hook
import { useEffect, useState } from "react";
import LoginButton from "@/components/GoogleIO/OauthLoginButton";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Ensure that the component only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading or other placeholder until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  // Handle loading state while session is being fetched
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Handle case when there is no session
  if (!session) {
    return (
      <div>
        <h1>Welcome to My Site!</h1>
        <LoginButton />
      </div>
    );
  }

  // Handle case when there is a session
  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Your email: {session.user.email}</p>
      <LogoutButton />  
    </div>
  );
}
