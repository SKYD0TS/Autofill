"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut("google")} style={{border:"1px solid red"}} >Logout</button>
  );
}
