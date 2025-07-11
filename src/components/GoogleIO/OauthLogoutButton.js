"use client"
import styles from "../../app/oauthOutButton.module.css"
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import feather from "feather-icons"
import CheckoutModal from "@/components/TokenPurchaseModal"

export default function Dropdown(){
  const [isOpen, setIsOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { data: session, SessionStatus } = useSession()
  const [googleUserToken, setGoogleUserToken] = useState(null);

  useEffect(() => {
    if (isOpen == true) {
      feather.replace(); // Replaces <i> elements with feather icons
    }
  }, [isOpen]);

  useEffect(() => {
    if (session?.user?.email) {
      const fetchGoogleUserToken = async () => {
        try {
          // Call the API route to get the token
          const response = await fetch(`/api/get-token?email=${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            setGoogleUserToken(data.token_count); // Set the token count
          } else {
            const errorData = await response.json();
            console.error(errorData.error);
            setGoogleUserToken(null); // Set to null if no token found
          }
        } catch (error) {
          console.error("Error fetching Google user's token:", error);
          setGoogleUserToken(null);
        }
      };

      fetchGoogleUserToken();
    }
  }, [session]); 
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className={styles["dropdown-toggle"]}>
        {session?.user.name ?? null} | {`Token: ${googleUserToken}`}
      </button>
      {isOpen && (
        <ul className={styles["dropdown-menu"]}>
          <li><a className={styles["get-tokens"]} onClick={() => setOpenModal(true)}>
            Get tokens <i data-feather="shopping-bag"></i></a></li>
          <hr style={{ margin: '0', paddingLeft: "0.5rem" }} />
          <li className={styles.logout}><button onClick={() => { signOut("google") }}>
            Logout <i data-feather="log-out"></i></button></li>
        </ul>
      )}
      <CheckoutModal open={openModal} onClose={() => setOpenModal(false)} ></CheckoutModal>
    </div>
  );
};
