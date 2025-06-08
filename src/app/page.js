'use client'
import { useSession } from "next-auth/react"; // Access session hook
import { useEffect, useState } from "react";
import LoginButton from "@/components/GoogleIO/OauthLoginButton";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";
import '@/app/autofill.css';


export default function Home() {
    const { data: session, status } = useSession();
    // Handle case when there is a session
    return (
        <div className="container">
            <div className="top-half">
                <div className="header">
                    <div className="logo">Autofill</div>
                    <nav className="nav">
                        <a href="#faq">FAQ</a>
                        <div className="dropdown">Pricelist</div>
                        <div className="dropdown">Socials</div>
                    </nav>
                    {status === "loading"?
                        <div>Loading...</div>:
                            session?
                            <p className="account">{session.user.name} <LogoutButton/></p>:
                            <LoginButton/>
                    }
                    {/* <button className="login-btn">Sign in with</button> */}
                </div>

                <main className="hero">
                    <h1>Make your life easier with <strong>Autofill</strong></h1>
                    <p>Finish your questionere in just one click</p>
                    <input type="text" placeholder="Ketik link Google Form Anda disini" className="form-input" />
                    <div className="arrow-down"><a href="#features"><img src="/down-chevron.svg" width={64} height={64} style={{ filter:'invert(1)' }}/></a></div>
                </main>
            </div>
            <div className="bottom-half">
                <section className="features" id="features">
                    <div className="feature-box">
                        <span role="img" aria-label="speed"><img src="/lightning.svg" width={32} height={32} /></span>
                        <h3>Cepat</h3>
                        <p>Menekankan kecepatan, cocok untuk mahasiswa yang dikejar deadline.</p>
                    </div>
                    <div className="feature-box">
                        <span role="img" aria-label="secure"><img src="/lightning.svg" width={32} height={32} /></span>
                        <h3>Aman</h3>
                        <p>Data klien tidak akan disalahgunakan dan disebarluaskan.</p>
                    </div>
                    <div className="feature-box">
                        <span role="img" aria-label="flexible"><img src="/lightning.svg" width={32} height={32} /></span>
                        <h3>Fleksibel</h3>
                        <p>Menawarkan fleksibilitas sesuai kebutuhan responden dan target.</p>
                    </div>
                </section>

                <section className="trial">
                    <div className="title">
                        <h1>Gunakan Free Trial-mu sekarang <p>Dapatkan gratis 5 responden!</p></h1>

                    </div>
                    <div className="packages">
                        <div className="package">
                            <div className="top">
                                <h3>50-99 responden</h3>
                                <p>Diskon 10% dengan kode referral</p>
                            </div>
                            <div className="bottom">
                                <h3><span>Rp</span> 500 <span>/responden</span></h3>
                                <button>PILIH PAKET</button>
                            </div>
                        </div>
                        <div className="package">
                            <div className="top">
                                <h3>100-299 responden</h3>
                                <p>Diskon 10% dengan kode referral</p>
                            </div>
                            <div className="bottom">
                                <h3><span>Rp</span> 400 <span>/responden</span></h3>
                                <small>*Lebih hemat 20%</small>
                                <button>PILIH PAKET</button>
                            </div>
                        </div>
                        <div className="package">
                            <div className="top">
                                <h3>300-700 responden</h3>
                                <p>Diskon 15% dengan kode referral</p>
                            </div>
                            <div className="bottom">
                                <h3><span>Rp</span> 350 <span>/responden</span></h3>
                                <small>*Lebih hemat 30%</small>
                                <button>PILIH PAKET</button>
                            </div>
                        </div>
                    </div>
                </section>
                <footer className="footer">
                    <div className="footer-logo">✨</div>
                    <div className="footer-links">
                        <a href="#pricelist">Pricelist</a>
                        <a href="#home">Home</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div className="socials">[Social Icons Here]</div>
                    <p>© 2025 AUTOFILL ALL RIGHTS RESERVED</p>
                </footer>
            </div>

        </div>
    );
}

