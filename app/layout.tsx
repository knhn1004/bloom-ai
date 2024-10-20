import type { Metadata, Viewport } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { Roboto } from "next/font/google";
export const viewport: Viewport = {
  themeColor: "#8FCE00",
};
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "900"],
});
export const metadata: Metadata = {
  title: "Bloom.ai",
  description: "Bloom AI is a platform for plant health monitoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="favicon_io/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="favicon_io/favicon.svg" />
        <link rel="shortcut icon" href="favicon_io/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="favicon_io/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="BloomAI" />
        <link rel="manifest" href="favicon_io/site.webmanifest" />
      </head>
      <body
        className={`${roboto.className} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
