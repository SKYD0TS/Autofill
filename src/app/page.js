'use client'
import { useSession } from "next-auth/react"; // Access session hook
import { useEffect, useState } from "react";
import LoginButton from "@/components/GoogleIO/OauthLoginButton";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";
import '@/app/autofill.css';
import { redirect } from "next/navigation";


export default function Home() {
    const { data: session, status } = useSession();
    const [formInput, setFormInput] = useState({name:"form-input", value:""})
    const [formInputIsValid, setFormInputIsValid] = useState(2)
    // Handle case when there is a session

    function handleFormInputChange(value){
        setFormInput(prev=>{
            return { ...prev, value:value };
        })
    }
    useEffect(()=>{
        if(formInput.value.includes("docs.google.com")){
            console.log(formInput)
            setFormInputIsValid(1)
            redirect(`/testform?formurl="${formInput.value}"`)
        }else if(formInput.value){
            setFormInputIsValid(0)
        }
    },[formInput])
    return (
        <div className="container">
            <div className="top-half">
                <div className="header">
                    <nav className="nav">
                        <a href="#faq">FAQ</a>
                        <div className="dropdown">Pricelist</div>
                        <div className="dropdown">Socials</div>
                    </nav>
                    <div className="logo">
                        <a href="/">
                            <img src="/images/mark-white.png"/>
                            <img src="/images/logo-white.png"/>
                        </a>
                    </div>
                    {status === "loading" ?
                        <div className="account"><p>Loading...</p></div>
                        :
                        session ?
                            <div className="account">
                                <p>{session.user.name} <LogoutButton /></p>
                            </div> :
                            <div className="account">
                                <LoginButton />
                            </div>
                    }
                    {/* <div>account</div> */}
                </div>

                <main className="hero">
                    <h1>Make your life easier with <strong>Autofill</strong></h1>
                    <p className="tagline">Finish your questionere in just one click</p>
                    <input type="text" name={formInput.name} value={formInput.value} onChange={(e)=>handleFormInputChange(e.target.value, formInput.name)} placeholder="Ketik link Google Form Anda disini" className="form-input" />
                    <p>{formInputIsValid==1?
                            "link valid":formInputIsValid==0?"invalid link":null}</p>
                    <div className="arrow-down"><a href="#features"><i data-feather="circle"></i></a></div>
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
                    <div className="packages">
                        <div className="package">
                            <div className="top">
                                <p>Diskon 10% dengan kode referral</p>
                                <h1>50-99<br/><span className="thin">RESPONDEN</span></h1>
                                <div>
                                    <h2><small className="thin currency">Rp</small> 500<small className="thinner">/responden</small></h2>
                                    <small>*Lebih hemat 20%</small>
                                </div>
                            </div>
                            <div className="bottom">
                                <button>PILIH PAKET</button>
                            </div>
                        </div>
                        <div className="package active has-bestseller-badge">
                            <div className="bestseller-badge"><b>BEST SELLER</b></div>
                            <div className="top">
                                <p>Diskon 10% dengan kode referral</p>
                                <h1>100-299<br/><span className="thin">RESPONDEN</span></h1>
                                <div>
                                    <h2><small className="thin currency">Rp</small> 400<small className="thinner">/responden</small></h2>
                                    <small>*Lebih hemat 20%</small>
                                </div>
                            </div>
                            <div className="bottom">
                                <button>PILIH PAKET</button>
                            </div>
                        </div>
                        <div className="package">
                            <div className="top">
                                <p>Diskon 15% dengan kode referral</p>
                                <h1>300-700<br/><span className="thin">RESPONDEN</span></h1>
                                <div>
                                    <h2><small className="thin currency">Rp</small> 350<small className="thinner">/responden</small></h2>
                                    <small>*Lebih hemat 30%</small>
                                </div>
                            </div>
                            <div className="bottom">
                                <button>PILIH PAKET</button>
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
                        <a href="#"><img src="/images/social-icons/autofill-instagram-icon.svg" height={32}/></a>
                        <a href="#"><img src="/images/social-icons/autofill-whatsapp-icon.svg " height={32}/></a>
                        <a href="#"><img src="/images/social-icons/autofill-x-icon.svg" height={32}/></a>
                    </div>
                    <p>© 2025 AUTOFILL ALL RIGHTS RESERVED</p>
                </footer>
            </div>
        </div>
    );
}

