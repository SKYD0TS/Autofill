"use client";
import { signIn } from "next-auth/react";
import styles from "@/app/oauthInButton.module.css"
export default function LoginButton() {
  return (
    <button className={styles.btn} onClick={()=>signIn('google')}>
      Sign in with
      <img src="/images/social-icons/google-48.png" alt="Google" className={styles.icon}/>
    </button>

  );
}
