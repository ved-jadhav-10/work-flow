import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Providers from "@/components/providers/Providers";
import StarryBackground from "@/components/StarryBackground";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Workflow — Where ideas bloom under starlight",
  description:
    "Workflow is a persistent AI context layer that eliminates productivity loss caused by context switching, while accelerating EasyLearn and EasyCode workflows through structured intelligence generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning style={{ scrollPaddingTop: "72px" }}>
      <body
        className={`${jakarta.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        <StarryBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
