import { Inter } from "next/font/google";
import "./globals.css";
import { ScmProvider } from "@/context/ScmContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "SCM Warung Magonan",
  description: "Supply Chain Management for Warung Magonan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <ScmProvider>
          <Sidebar />
          <main className="main-content">
            <Topbar />
            <div className="page-content">
              {children}
            </div>
          </main>
        </ScmProvider>
      </body>
    </html>
  );
}

