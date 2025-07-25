import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import "./globals.css";
import { PromptProvider } from "./context/PromptContext";
import { HeaderProvider } from "@/app/context/HeaderContext";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { FolderProvider } from "./context/FolderContext";
import { ThemeProvider } from "./context/theme-provider";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}

// Crea un componente separado para los providers
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FolderProvider>
        <PromptProvider>
          <SidebarProvider>
            <HeaderProvider>
              <AppSidebar />
              <div className="relative flex-1 bg-background">
                {children}
                <Header />
                {/* <footer className="row-start-3 flex gap-[24px] my-8 flex-wrap items-center justify-center">
                  Hola
                </footer> */}
              </div>
              <Toaster position="bottom-right" richColors />
            </HeaderProvider>
          </SidebarProvider>
        </PromptProvider>
      </FolderProvider>
    </ThemeProvider>
  );
}
