import Navbar from "../components/Navbar";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";
import Footer from "../components/Footer";

export const metadata = {
    title: "Canvas Vibe",
    description: "A modern social platform to share ideas, connect and create.",
    openGraph: {
      title: "Canvas Vibe",
      description: "Share your vibe with the world.",
      url: "https://your-domain.com",
      siteName: "Canvas Vibe",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="
        min-h-screen dark:bg-gray-900
        bg-gradient-to-br
        from-white via-sky-200 to-gray-100
      ">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col dark:bg-gray-900">
              <Navbar />

              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
