import localFont from "next/font/local";
import "../globals.css";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700', '900'],
});

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Conscious Curations",
  description: "Conscious Curations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
