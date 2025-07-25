"use client"
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import LoginButton from "@/components/GoogleIO/OauthLoginButton";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";
import PdfModal from "@/components/PdfModal";
import dynamic from "next/dynamic";
const CheckoutModal = dynamic(
() => import('@/components/TokenPurchaseModal'),
  { ssr: false }
);
// import CheckoutModal from "@/components/TokenPurchaseModal";
import '@/app/autofill.css';
import { redirect, useSearchParams } from "next/navigation";
import feather from 'feather-icons';
const FORM_PARSE_PAGE = 'form'
function Home() {
    const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
    const pdfUrl = '/Tutorial_Autofill.pdf';
    const { data: session, status } = useSession();
    const [formInput, setFormInput] = useState({ name: "form-input", value: "" });
    const [formInputIsValid, setFormInputIsValid] = useState(-1); // -1 null, 0 invalid, 1 valid, 2 responder link, 3 401, 4 no session
    const [openModal, setOpenModal] = useState(false);
    const [tokenBuyQty, setTokenBuyQty] = useState(1);
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

                if (!formInput.value.includes("edit")) {
                    setFormInputIsValid(2); // Not an editor link
                    return;
                } 

                if (!session) {
                    setFormInputIsValid(4); // User is not logged in
                    return;
                }

                // redirect(`/${FORM_PARSE_PAGE}?formurl=${formInput.value}`);
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
                        {/* <a href="/Tutorial_Autofill.pdf" target="_blank">Tutorial</a> */}
                        <a onClick={()=>{setIsPDFModalOpen(true)}}>Tutorial</a>
                        <div className="dropdown"><a href="#pricelist">Pricelist</a></div>
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
                    <div className="pill-input">
                        <input
                            type="text"
                            name={formInput.name}
                            value={formInput.value}
                            onChange={(e) => handleFormInputChange(e.target.value)}
                            placeholder="Ketik link Google Form Anda disini"
                            className="form-input"
                            />
                        <button onClick={()=>{
                            if(formInputIsValid == 1){   
                                redirect(`/${FORM_PARSE_PAGE}?formurl=${formInput.value}`);
                            }
                            else{
                                const msg = formInputIsValid === 0 ? "Link invalid" :
                                formInputIsValid === 1 ? "Link valid" :
                                formInputIsValid === 2 ? "Hanya bisa link edit" :
                                formInputIsValid === 3 ? "Unauthorized" :
                                formInputIsValid === 4 ? "Please log-in" : null
                                alert(msg)
                            }
                        }}>Mulai</button>
                    </div>
                    <p>
                        {formInputIsValid === 0 ? "Link invalid" :
                         formInputIsValid === 1 ? "Link valid" :
                         formInputIsValid === 2 ? "Hanya bisa link edit" :
                         formInputIsValid === 3 ? "Unauthorized" :
                         formInputIsValid === 4 ? "Please log-in" : null}
                    </p>
                    <div className="arrow-down">
                        <a href="#features"><i data-feather="circle"></i></a>
                    </div>
                </main>
            </div>
            
                <div className="bottom-half">
                    <section className="features" id="features">
                        <div className="feature-box">
                            <img src="/images/package-img/Autofill-cepat-icon.svg" />
                            <h2 className="tagline">Cepat</h2>
                            <p>Cocok untuk mahasiswa yang dikejar deadline.</p>
                        </div>
                        <div className="feature-box">
                            <img src="/images/package-img/Autofill-aman-icon.svg" />
                            <h2 className="tagline">Aman</h2>
                            <p>Data klien aman dari penyalahgunaan.</p>
                        </div>
                        <div className="feature-box">
                            <img src="/images/package-img/Autofill-fleksibel-icon.svg" />
                            <h2 className="tagline">Fleksibel</h2>
                            <p>Menyesuaikan kebutuhan responden dan target.</p>
                        </div>
                    </section>

                    <section className="trial">
                        <div className="title">
                            <h1>Gunakan Free Trial-mu sekarang <p>Dapatkan gratis 5 responden!</p></h1>

                        </div>
                        <div className="packages" id="pricelist">
                            <div className="package">
                                <div className="top">
                                    <p>Diskon 10% dengan kode referral</p>
                                    <h1>50-99<br /><span className="thin">RESPONDEN</span></h1>
                                    <div>
                                        <h2><small className="thin currency">Rp</small> 500<small className="thinner">/responden</small></h2>
                                        <small>*Lebih hemat 20%</small>
                                    </div>
                                </div>
                                <div className="bottom">
                                    <button onClick={() => {setTokenBuyQty(50); setOpenModal(true)}} >PILIH PAKET</button>
                                </div>
                            </div>
                            <div className="package active has-bestseller-badge">
                                <div className="bestseller-badge"><b>BEST SELLER</b></div>
                                <div className="top">
                                    <p>Diskon 10% dengan kode referral</p>
                                    <h1>100-299<br /><span className="thin">RESPONDEN</span></h1>
                                    <div>
                                        <h2><small className="thin currency">Rp</small> 400<small className="thinner">/responden</small></h2>
                                        <small>*Lebih hemat 20%</small>
                                    </div>
                                </div>
                                <div className="bottom">
                                    <button onClick={() => {setTokenBuyQty(100); setOpenModal(true)}}>PILIH PAKET</button>
                                </div>
                            </div>
                            <div className="package">
                                <div className="top">
                                    <p>Diskon 15% dengan kode referral</p>
                                    <h1>300-700<br /><span className="thin">RESPONDEN</span></h1>
                                    <div>
                                        <h2><small className="thin currency">Rp</small> 350<small className="thinner">/responden</small></h2>
                                        <small>*Lebih hemat 30%</small>
                                    </div>
                                </div>
                                <div className="bottom">
                                    <button onClick={() => {setTokenBuyQty(300); setOpenModal(true)}}>PILIH PAKET</button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer className="footer">
                        <div className="footer-logo"><img src="/images/mark-black.png" /></div>
                        <div className="footer-links">
                            <a href="#pricelist">Pricelist</a>
                            <a href="#home">Home</a>
                            <a href="#faq">FAQ</a>
                        </div>
                        <div className="socials">
                            <a href="#"><img src="/images/social-icons/autofill-instagram-icon.svg" height={32} /></a>
                            <a href="#"><img src="/images/social-icons/autofill-whatsapp-icon.svg " height={32} /></a>
                            <a href="#"><img src="/images/social-icons/autofill-x-icon.svg" height={32} /></a>
                        </div>
                        <p>© 2025 AUTOFILL ALL RIGHTS RESERVED</p>
                    </footer>
                </div>
                {openModal?
                    <CheckoutModal open={openModal} onClose={() => setOpenModal(false)} qty={tokenBuyQty}></CheckoutModal>
                : null
                }
                {isPDFModalOpen && (
                    <PdfModal pdfUrl={pdfUrl} onClose={()=>{setIsPDFModalOpen(false)}} />
                )}
        </div>
    );
}

export default function page(){
    return (
        <Suspense fallback={<div className="suspense-fallback">..loading.</div>}><Home/></Suspense>
    )
}