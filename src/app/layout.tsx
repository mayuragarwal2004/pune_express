import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../../assets/css/Layout.scss";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import ClientLayout from "./ClientLayout";
import DarkButton from "./components/DarkButton";
import SearchIcon from "@mui/icons-material/Search";
import SearchBarClient from "./components/SearchBarClient";
import NewsletterSubscription from "./components/NewsletterSubscription";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pune Express",
  description: "Get your daily dose of news from Pune Express",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navList = [{ name: "Pune", link: "/category/pune" }];

  const privacyPolicy = [
    { name: "Terms and conditions", link: "/terms/conditions" },
    { name: "Privacy policy", link: "/terms/privacy" },
  ];

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <ClientLayout session={session}>
          <div>
            <header>
              <div className="mobile-nav">
                <div className="logo">
                  <Link href="/">
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={160}
                      height={60}
                    />
                  </Link>
                  {/* <h1 className="title">
                    <Link href="/">Pune Express</Link>
                  </h1> */}
                </div>
                <nav>
                  <ul>
                    <div className="search-icon">
                      <Link href="/search">
                        <SearchBarClient />
                      </Link>
                    </div>
                    {navList.map((navItem) => (
                      <div key={navItem.name}>
                        <Link href={navItem.link}>{navItem.name}</Link>
                      </div>
                    ))}
                  </ul>
                  <DarkButton />
                </nav>
              </div>
              <div className="desktop-nav">
                <nav>
                  <ul>
                    {navList
                      .slice(0, Math.ceil(navList.length / 2))
                      .map((navItem) => (
                        <li key={navItem.name}>
                          <Link href={navItem.link}>{navItem.name}</Link>
                        </li>
                      ))}
                  </ul>
                  <div className="search-icon">
                    <Link href="/search">
                      <SearchBarClient />
                    </Link>
                  </div>
                  <ul>
                    <div className="logo">
                      <Link href="/">
                        <Image
                          src="/images/logo.png"
                          alt="Logo"
                          width={160}
                          height={60}
                        />
                      </Link>
                      {/* <h1 className="title">
                        <Link href="/">Pune Express</Link>
                      </h1> */}
                    </div>
                  </ul>
                  <ul>
                    {navList
                      .slice(Math.ceil(navList.length / 2), navList.length)
                      .map((navItem) => (
                        <li key={navItem.name}>
                          <Link href={navItem.link}>{navItem.name}</Link>
                        </li>
                      ))}
                    <DarkButton />
                  </ul>
                  <p style={{ color: "#fff" }}>{formattedDate}</p>
                </nav>
              </div>
            </header>
            {children}
            <section className="footer">
              <div className="footer-row-1-parent">
                <div className="footer-row-1">
                  <div className="about-section">
                    <div className="heading">
                      <Link href="/">
                        <Image
                          src="/images/logo.png"
                          alt="Logo"
                          width={200}
                          height={60}
                        />
                      </Link>
                      {/* <h1 className="title">
                        <Link href="/">Pune Express</Link>
                      </h1> */}
                    </div>
                    <div className="body">
                      <p>
                        Stay informed with the latest headlines, in-depth
                        analysis, and real-time updates from around the globe.
                      </p>
                    </div>
                  </div>
                  <div className="footer-links">
                    <h2>Quick Links</h2>
                    <ul>
                      {navList.map((navItem) => (
                        <li key={navItem.name}>
                          <Link href={navItem.link}>{navItem.name}</Link>
                        </li>
                      ))}
                    </ul>
                    <ul>
                      {privacyPolicy.map((navItem) => (
                        <li key={navItem.name}>
                          <Link href={navItem.link}>{navItem.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <NewsletterSubscription />
                </div>
              </div>
              <div className="footer-row-2">
                <div className="footer-info">
                  <p>© 2024 Pune Express All Rights Reserved.</p>
                </div>
                <div className="footer-socials">
                  <Link href="https://www.instagram.com/thebombayforum/">
                    <Image
                      src="/images/social/instagram_logo.png"
                      alt="Instagram"
                      width={30}
                      height={30}
                    />
                  </Link>
                  <Link href="https://www.threads.net/@thebombayforum">
                    <Image
                      src="/images/social/threads_logo.png"
                      alt="Threads"
                      width={30}
                      height={30}
                    />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
