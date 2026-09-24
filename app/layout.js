import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Disclaimer from "@/components/Disclaimer";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "PhantomAI: The Clinical Pharmacy Assistant — Educational Demonstration",
  description: "Applications of AI in current pharmacy practice and patient care",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--canvas)] text-slate-100 font-sans antialiased relative">
        <AppProvider>
          <div className="app-ambient" />
          <Sidebar />
          <div className="relative z-10 flex flex-col min-h-full flex-1 lg:pl-[84px]">
            <div className="flex-1 flex flex-col">{children}</div>
            <Disclaimer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
