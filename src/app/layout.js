import SessionWrapper from "@/components/Wrapper/SessionWrapper";
import ToastProvider from '@/components/ToastProvider';
import "./globals.css"; // Import global styles

export default function RootLayout({ children }) {
  

  return (
    <html lang="en">
      <body suppressHydrationWarning>
          <SessionWrapper>
            <ToastProvider />
            {children}
          </SessionWrapper>
      </body>
    </html>
  );
}
