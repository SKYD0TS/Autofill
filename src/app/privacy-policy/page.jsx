import "./privacy-policy.css";
import feather from 'feather-icons';
export default function page() {
    return <>
        <main>

            <div className="header">
                <nav className="nav">
                    <div className="back-button">
                        <a href="/">
                            <i data-feather="corner-down-left"></i>Kembali
                        </a>
                    </div>
                </nav>

                <div className="logo">
                    <a href="/">
                        <img src="/images/mark-white.png" alt="Autofill mark" />
                        <img src="/images/logo-white.png" alt="Autofill logo" />
                    </a>
                </div>
                <div></div>
            </div>
            <div className="privacy-policy">
                <div className="container">
                    <h1 style={{margin:"0"}}>Privacy Policy</h1>

                </div>
                <div className="container">
                    <h2 style={{"margin-top":"0"}}>1. Introduction</h2>

                    Autofill (“we,” “our,” or “us”) provides a tool that helps users automatically fill out Google Forms faster. This Privacy Policy explains how we handle information when you use our service at autofill.site, particularly in connection with Google OAuth.

                    <h2>2. Information We Collect</h2>

                    When you use Google OAuth to connect your account:

                    We only request permission to access the Google Form structure (questions, input fields, options, and metadata) from a form you manually provide by pasting the form’s edit link.

                    We do not collect your Google Drive files, emails, contacts, calendar, or any other unrelated data.

                    We do not collect Google Form responses or answers filled by other people.

                    <h2>3. How We Use Your Data</h2>

                    To authenticate your identity securely via Google OAuth.

                    To retrieve the structure of a Google Form (via form.body.get) so we can generate autofill functionality.

                    To improve our autofill service and user experience.

                    We do not use your Google data for advertising or profiling.

                    <h2>4. Data Sharing and Disclosure</h2>

                    We do not sell, trade, or share your Google data with third parties.
                    Your Google Form structure data is only used internally to provide the service you request.

                    We may disclose limited information only if required by law or to enforce our terms of service.

                    <h2>5. Data Retention</h2>

                    Google Form structure data is retrieved temporarily during autofill setup.

                    We do not permanently store your Google Form data on our servers, unless explicitly required for your autofill session.

                    You can revoke our access at any time via your Google Account security settings.

                    <h2>6. Security</h2>

                    All data transfers between your browser, Google APIs, and our servers are encrypted using TLS.

                    Access is restricted and monitored to prevent misuse.

                    <h2>7. Your Rights</h2>

                    You can:

                    Revoke Google OAuth access anytime at Google Security Settings
                </div>
            </div>
        </main>
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
    </>
}