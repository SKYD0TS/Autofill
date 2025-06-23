import SessionWrapper from "@/components/Wrapper/SessionWrapper";
import "./globals.css"; // Import global styles

export default function RootLayout({ children }) {
  

  return (
    <html lang="en">
      <body suppressHydrationWarning>
          <SessionWrapper>
            {children}
          </SessionWrapper>
      </body>
    </html>
  );
}
