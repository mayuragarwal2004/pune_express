"use client";
import React from "react";
import { signIn } from "next-auth/react";
import styles from "./login.module.css";

export default function LoginPage() {
  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/" }); // Replace '/dashboard' with your desired redirect path
  };

  return (
    <div className={styles["login-area-parent"]}>
      <h1>Welcome to the login page</h1>
      <button
        className={styles["login-with-google-btn"]}
        onClick={handleSignIn}
      >
        Sign in with Google
      </button>
    </div>
  );
}
