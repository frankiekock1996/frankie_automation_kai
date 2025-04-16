import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-providers";
import ModalProvider from "@/providers/modal-providers";
import { Toaster } from "@/components/ui/sonner";
import { BillingProvider } from "@/providers/billing-provider";
const font = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fuzzie.",
  description: "Automate Your Work With Fuzzie."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <BillingProvider>
              <ModalProvider>
                {children}
                <Toaster />
              </ModalProvider>
            </BillingProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
