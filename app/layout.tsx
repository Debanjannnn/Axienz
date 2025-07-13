import localFont from "next/font/local";
import { ThemeProvider } from 'next-themes'
import "./globals.css";
import { SmartWillProvider } from "@/context/SmartWillContext";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EDU LEGACY',
  description: 'Secure Your LegacyOn EDU Chain',
}
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmartWillProvider>
      <html lang="en" >
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
         
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </SmartWillProvider>
  );
}
// import localFont from "next/font/local";
// import { ThemeProvider } from 'next-themes'
// import "./globals.css";
// import { SmartWillProvider } from "@/context/SmartWillContext";
// import { Poppins } from 'next/font/google'
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
// const poppins = Poppins({ weight: ["400"], subsets: ['latin'] , variable: '--font-poppins'})
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SmartWillProvider>
//       <html lang="en" >
//         <body className={` ${poppins.className}`}>
         
//           <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
//             {children}
//           </ThemeProvider>
//         </body>
//       </html>
//     </SmartWillProvider>
//   );
// }
