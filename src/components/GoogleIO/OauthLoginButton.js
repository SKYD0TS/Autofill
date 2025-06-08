"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button onClick={() => signIn("google")} style={{border:"1px solid red"}} >Sign in with Google</button>
  );
}
