import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SavedProvider } from "@/components/providers/SavedProvider";
import { ListingStatusProvider } from "@/components/providers/ListingStatusProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "CampusKart: buy, sell and trade on campus",
  description:
    "A student-only marketplace for used books, electronics, notes and cycles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider>
          <SavedProvider>
            <ListingStatusProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-primary focus:px-4 focus:py-2 focus:text-background"
              >
                Skip to content
              </a>
              <Navbar />
              <main id="main">{children}</main>
              <Footer />
              <div className="h-16 md:hidden" aria-hidden="true" />
              <MobileTabBar />
            </ListingStatusProvider>
          </SavedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}