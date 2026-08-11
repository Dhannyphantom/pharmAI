import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Disclaimer from "@/components/Disclaimer";
import NeuralBackground from "@/components/NeuralBackground";

export const metadata = {
  title: "AI Clinical Pharmacy Assistant — Educational Demonstration",
  description: "Applications of AI in Current Pharmacy Practice and Patient Care",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#050B18] text-slate-100 font-sans antialiased relative">
        <AppProvider>
          <NeuralBackground />
          <div className="relative z-10 flex flex-col min-h-full flex-1">
            <div className="flex-1 flex flex-col">{children}</div>
            <Disclaimer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
