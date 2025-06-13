import styles from "@/app/oauthOutButton.module.css"
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import feather from "feather-icons"
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, SessionStatus } = useSession()
  
  useEffect(() => {
    if(isOpen==true){
      feather.replace(); // Replaces <i> elements with feather icons
    }
  }, [isOpen]);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className={styles["dropdown-toggle"]}>
        {session?.user.name??null}
      </button>
      {isOpen && (
        <ul className={styles["dropdown-menu"]}>
          <li><a href="#">
            Get tokens <i data-feather="shopping-bag"></i></a></li>
          <hr style={{margin:'0',paddingLeft:"0.5rem"}}/>
          <li className={styles.logout}><button onClick={()=>{signOut("google")}}>
            Logout <i data-feather="log-out"></i></button></li>
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
