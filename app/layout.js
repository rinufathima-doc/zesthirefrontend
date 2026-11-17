import { Suspense } from "react";
import "./globals.css";
import Providers from "./providers"; // Your Redux Provider wrapper
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import your footer component

export const metadata = {
  title: "ZestHire - Job Portal",
  description: "Find your dream job or hire top talent.",
  icons: {
    icon: "/icon.png", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f4f6f8] text-slate-800">
        <Providers>
          <Suspense fallback={<div className="h-16 w-full bg-white" />}>
            <Navbar />
          </Suspense>
          
          <main className="flex-grow">{children}</main>

          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}