"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoginButton from "@/components/GoogleIO/OauthLoginButton";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";
import dynamic from "next/dynamic";
import toast from 'react-hot-toast'
const CheckoutModal = dynamic(() => import("@/components/TokenPurchaseModal"), {
  ssr: false,
});

import "@/app/autofill.css";
import { redirect } from "next/navigation";
import feather from "feather-icons";

const FORM_PARSE_PAGE = "form";

export default function PageClient() {
  const { data: session, status } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [tokenBuyQty, setTokenBuyQty] = useState(1);

  const [formInput, setFormInput] = useState({
    name: "form-input",
    value: "",
  });

  const [formInputIsValid, setFormInputIsValid] = useState(-1); // -1 null, 0 invalid, 1 valid, 2 responder link, 3 401, 4 no session

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // setFormInputIsValid(searchParams.get("formurlfail"));
    feather.replace();
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
      } else if (formInput.value) {
        setFormInputIsValid(0); // Invalid link format
      }
    };

    validateFormLink();
  }, [formInput, session]);

  useEffect(() => {
    if (status == "unauthenticated" && openModal == true) {
      setOpenModal(false)
      toast.error('Login terlebih dahulu');
    }
  }, [openModal])

  const handleSubmit = () => {
    if (formInputIsValid === 1) {
      redirect(`/${FORM_PARSE_PAGE}?formurl=${formInput.value}`);
    } else {
      const msg =
        formInputIsValid === 0 ? "Link invalid" :
          formInputIsValid === 1 ? "Link valid" :
            formInputIsValid === 2 ? "Hanya bisa link edit" :
              formInputIsValid === 3 ? "Unauthorized" :
                formInputIsValid === 4 ? "Please log-in" : null;
      toast.error(msg);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="container">
      {/* ---------- TUTORIAL MODAL ---------- */}
      {showTutorial && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "2rem 0",
            overflowY: "auto",
          }}
          onClick={() => setShowTutorial(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: 12,
              maxWidth: 640,
              width: "90%",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              position: "relative",
              padding: "2.5rem 2rem",
              marginTop: "2vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "none",
                border: "none",
                fontSize: 26,
                cursor: "pointer",
                color: "#555",
              }}
              onClick={() => setShowTutorial(false)}
            >
              &times;
            </button>

            <h2 style={{ marginTop: 0, marginBottom: "1.2rem" }}>
              Cara Menggunakan Autofill untuk Mengisi Google Form
            </h2>

            {/* === STEP 1 === */}
            <h3>1. Pastikan Email Sesuai</h3>
            <p>
              Gunakan email yang sama saat mendaftar ke Autofill dan sebagai owner/editor Google Form.
              Jika berbeda, tambahkan email ke Google Form sebagai editor:
            </p>
            <ol>
              <li>Klik ikon <strong>“Tambah orang”</strong> di kanan atas (ikon orang dengan tanda plus ➕).</li>
              <img
                src="/images/tutorial/Gambar1.png"
                alt="Langkah 1 - Tambah editor"
                style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0 1.5rem" }}
              />
              <li>Masukkan email yang digunakan saat mendaftar ke Autofill.</li>
              <img
                src="/images/tutorial/Gambar2.png"
                alt="Langkah 1 - Tambah editor"
                style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0 1.5rem" }}
              />
              <li>Ubah akses menjadi <strong>Editor</strong>, lalu klik <strong>Kirim</strong>.</li>
              <img
                src="/images/tutorial/Gambar3.png"
                alt="Langkah 1 - Tambah editor"
                style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0 1.5rem" }}
              />
            </ol>
            {/* === STEP 2 === */}
            <h3>2. Hilangkan Section di GForm (Jika Ada)</h3>
            <p>
              Autofill tidak dapat bekerja jika form memiliki section (bagian).<br />
              <strong>Sebelum hapus section:</strong>
            </p>
            <ol>
              <li>Buat salinan Google Form terlebih dahulu sebagai cadangan.</li>
              <img
                src="/images/tutorial/Gambar4.png"
                alt="Langkah 1 - Tambah editor"
                style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0 1.5rem" }}
              />
              <li>
                Hapus semua section:
                <ol type="a">
                  <li>Klik titik tiga di pojok kanan atas setiap section.</li>
                  <li>Pilih <strong>“Hapus bagian”</strong>.</li>
                </ol>
                <img
                  src="/images/tutorial/Gambar5.png"
                  alt="Langkah 1 - Tambah editor"
                  style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0 1.5rem" }}
                />
              </li>
              <li>
                Setelah pengisian selesai, Anda bisa menambahkan kembali section dari form salinan tadi.
              </li>
            </ol>

            {/* === STEP 3 === */}
            <h3>3. Gunakan Link Edit (Edit URL)</h3>
            <p>
              Pastikan Anda menggunakan link edit form, yaitu link yang mengandung <code>/edit</code> di dalam URL-nya.
            </p>
            <p>
              Contoh:
              <br />
              <code>https://docs.google.com/forms/d/e/xxxxxxxxxxxxxxxxx/edit</code>
            </p>
            <p>Salin dan tempel link tersebut ke dalam kolom input di halaman Autofill.</p>
            <img
              src="/images/tutorial/Gambar6.png"
              alt="Langkah 3 - Salin link edit"
              style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0 1.5rem" }}
            />

            {/* === STEP 4 === */}
            <h3>4. Setelah Autofill Selesai</h3>
            <ul>
              <li>Periksa jawaban responden sebelum mengembalikan section dari form salinan.</li>
              <li>Pastikan jumlah jawaban sesuai dengan yang Anda request.</li>
              <li>Jika sudah sesuai, kembalikan section dari salinan form yang sebelumnya Anda simpan.</li>
            </ul>

            {/* === NOTE === */}
            <p style={{ color: "#d93025", fontWeight: "600", marginTop: "1.5rem" }}>
              ❗ Catatan Penting
            </p>
            <ul style={{ color: "#d93025" }}>
              <li>Jangan mengembalikan section sebelum mengecek jawaban responden.</li>
              <li>Gunakan kembali salinan form untuk menyisipkan section ke posisi yang benar.</li>
            </ul>

            {/* CTA */}
            <p style={{ marginTop: "2rem", marginBottom: 0 }}>
              Butuh bantuan? Chat kami di{" "}
              <a
                href="https://wa.me/message/5HOPHQGRGFWJF1"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1a73e8", fontWeight: 600 }}
              >
                WhatsApp Autofill
              </a>
              .
            </p>
          </div>
        </div>
      )}
      {/* ---------- TOP HALF ---------- */}
      <div className="top-half">
        <div className="header">
          <nav className="nav">
            <a className="tutorial-button" onClick={() => setShowTutorial(true)}>
              Tutorial
            </a>
            <div className="dropdown">
              <a href="#pricelist">Pricelist</a>
            </div>
            <div className="dropdown">
              <a href="#socials">Socials</a>
            </div>
          </nav>

          <div className="logo">
            <a href="/">
              <img src="/images/mark-white.png" alt="Autofill mark" />
              <img src="/images/logo-white.png" alt="Autofill logo" />
            </a>
          </div>

          {status === "loading" ? (
            <div className="account">
              <p>Loading...</p>
            </div>
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
          <h1>
            Make your life easier with <strong>Autofill</strong>
          </h1>
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
            <button
              onClick={() => (handleSubmit())}
            >
              Mulai
            </button>
          </div>

          <p>
            {formInputIsValid === 0
              ? "Link invalid"
              : formInputIsValid === 1
                ? "Link valid"
                : formInputIsValid === 2
                  ? "Hanya bisa link edit"
                  : formInputIsValid === 3
                    ? "Unauthorized"
                    : formInputIsValid === 4
                      ? "Please log-in"
                      : null}
          </p>
        </main>
      </div>

      {/* ---------- BOTTOM HALF ---------- */}
      <div className="bottom-half">
        <section className="features" id="features">
          <div className="feature-box">
            <img src="/images/package-img/Autofill-cepat-icon.svg" alt="Cepat" />
            <h2 className="tagline">Cepat</h2>
            <p>Cocok untuk mahasiswa yang dikejar deadline.</p>
          </div>
          <div className="feature-box">
            <img src="/images/package-img/Autofill-aman-icon.svg" alt="Aman" />
            <h2 className="tagline">Aman</h2>
            <p>Data klien aman dari penyalahgunaan.</p>
          </div>
          <div className="feature-box">
            <img src="/images/package-img/Autofill-fleksibel-icon.svg" alt="Fleksibel" />
            <h2 className="tagline">Fleksibel</h2>
            <p>Menyesuaikan kebutuhan responden dan target.</p>
          </div>
        </section>

        <section className="trial">
          <div className="title">
            <h1>
              Gunakan Free Trial-mu sekarang <p>Dapatkan gratis 5 responden!</p>
            </h1>
          </div>

          <div className="packages" id="pricelist">
            <div className="package">
              <div className="top">
                <p>Diskon 10% dengan kode referral</p>
                <h1>
                  50-99
                  <br />
                  <span className="thin">RESPONDEN</span>
                </h1>
                <div>
                  <h2>
                    <small className="thin currency">Rp</small> 500
                    <small className="thinner">/responden</small>
                  </h2>
                  <small>*Lebih hemat 20%</small>
                </div>
              </div>
              <div className="bottom">
                <button
                  onClick={() => {
                    setTokenBuyQty(50);
                    setOpenModal(true);
                  }}
                >
                  PILIH PAKET
                </button>
              </div>
            </div>

            <div className="package active has-bestseller-badge">
              <div className="bestseller-badge">
                <b>BEST SELLER</b>
              </div>
              <div className="top">
                <p>Diskon 10% dengan kode referral</p>
                <h1>
                  100-299
                  <br />
                  <span className="thin">RESPONDEN</span>
                </h1>
                <div>
                  <h2>
                    <small className="thin currency">Rp</small> 400
                    <small className="thinner">/responden</small>
                  </h2>
                  <small>*Lebih hemat 20%</small>
                </div>
              </div>
              <div className="bottom">
                <button
                  onClick={() => {
                    setTokenBuyQty(100);
                    setOpenModal(true);
                  }}
                >
                  PILIH PAKET
                </button>
              </div>
            </div>

            <div className="package">
              <div className="top">
                <p>Diskon 15% dengan kode referral</p>
                <h1>
                  300-700
                  <br />
                  <span className="thin">RESPONDEN</span>
                </h1>
                <div>
                  <h2>
                    <small className="thin currency">Rp</small> 350
                    <small className="thinner">/responden</small>
                  </h2>
                  <small>*Lebih hemat 30%</small>
                </div>
              </div>
              <div className="bottom">
                <button
                  onClick={() => {
                    setTokenBuyQty(300);
                    setOpenModal(true);
                  }}
                >
                  PILIH PAKET
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-logo">
            <img src="/images/submark-black.png" alt="Autofill submark" />
          </div>
          <div className="footer-links">
            <a href="#pricelist">Pricelist</a>
            <a href="#home">Home</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="socials" id="socials">
            <a
              href="https://www.instagram.com/autofill.id?igsh=MXAxeGd1ejU1amFxbQ=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/social-icons/autofill-instagram-icon.svg"
                height={32}
                alt="Instagram"
              />
            </a>
            <a
              href="https://wa.me/message/5HOPHQGRGFWJF1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/social-icons/autofill-whatsapp-icon.svg"
                height={32}
                alt="WhatsApp"
              />
            </a>
            <a
              href="https://x.com/autofillsite"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/social-icons/autofill-x-icon.svg"
                height={32}
                width={50}
                alt="X"
              />
            </a>
          </div>
          <p>© 2025 AUTOFILL ALL RIGHTS RESERVED</p>
        </footer>
      </div>

      {/* ---------- CHECKOUT MODAL ---------- */}
      {openModal ? (
        <CheckoutModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          qty={tokenBuyQty}
        />
      ) : null}
    </div>
  );
}
