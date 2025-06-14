"use client"
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import LoginButton from "@/components/GoogleIO/OauthLoginButton";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";
import '@/app/autofill.css';
import { redirect, useSearchParams } from "next/navigation";
import feather from 'feather-icons';

function Home() {
    const { data: session, status } = useSession();
    const [formInput, setFormInput] = useState({ name: "form-input", value: "" });
    const [formInputIsValid, setFormInputIsValid] = useState(-1); // -1 null, 0 invalid, 1 valid, 2 responder link, 3 401, 4 no session
    const searchParams = useSearchParams();
    
    useEffect(() => {
        setFormInputIsValid(searchParams.get('formurlfail'));
        feather.replace();  // Replaces <i> elements with feather icons
    }, []);

    function handleFormInputChange(value) {
        setFormInput((prev) => ({ ...prev, value }));
    }

    useEffect(() => {
        const validateFormLink = async () => {
            if (formInput.value.includes("docs.google.com")) {
                setFormInputIsValid(1);

                // Check if it’s an editor link or not
                if (!formInput.value.includes("edit")) {
                    setFormInputIsValid(2); // Not an editor link
                    return;
                } 

                // Check if the user is logged in
                if (!session) {
                    setFormInputIsValid(4); // User is not logged in
                    return;
                }

                // If everything is valid, proceed with redirect
                redirect(`/${FORM_PARSE_PAGE}?formurl=${formInput.value}`);
            } else if (formInput.value) {
                setFormInputIsValid(0); // Invalid link format
            }
        };

        validateFormLink();
    }, [formInput, session]); // The effect depends on formInput and session

    return (
        <div className="container">
            <div className="top-half">
                <div className="header">
                    <nav className="nav">
                        <a href="#faq">FAQ <i data-feather="chevron-down"></i></a>
                        <div className="dropdown">Pricelist</div>
                        <div className="dropdown">Socials</div>
                    </nav>
                    <div className="logo">
                        <a href="/">
                            <img src="/images/mark-white.png" />
                            <img src="/images/logo-white.png" />
                        </a>
                    </div>
                    {status === "loading" ? (
                        <div className="account"><p>Loading...</p></div>
                    ) : session ? (
                        <div className="account">
                            <LogoutButton />
                        </div>
                    ) : (
                        <div className="account">
                            <LoginButton />
                        </div>
                    )}
                </div>

                <main className="hero">
                    <h1>Make your life easier with <strong>Autofill</strong></h1>
                    <p className="tagline">Finish your questionnaire in just one click</p>
                    <input
                        type="text"
                        name={formInput.name}
                        value={formInput.value}
                        onChange={(e) => handleFormInputChange(e.target.value)}
                        placeholder="Ketik link Google Form Anda disini"
                        className="form-input"
                    />
                    <p>
                        {formInputIsValid === 0 ? "Invalid link" :
                         formInputIsValid === 1 ? "Link valid" :
                         formInputIsValid === 2 ? "Currently only accept editor link" :
                         formInputIsValid === 3 ? "Unauthorized" :
                         formInputIsValid === 4 ? "Please log-in" : null}
                    </p>
                    <div className="arrow-down">
                        <a href="#features"><i data-feather="circle"></i></a>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function page(){
    return (
        <Suspense fallback={<div className="suspense-fallback">loading...</div>}><Home/></Suspense>
    )
}