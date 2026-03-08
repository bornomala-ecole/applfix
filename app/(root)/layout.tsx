import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { ToastContainer, toast } from 'react-toastify';



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 wrapper mt-[50px] md:mt-0">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      
    </div>
  );
}