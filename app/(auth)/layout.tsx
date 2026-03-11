import { ToastContainer } from 'react-toastify';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <div className="container flex h-screen justify-center items-center">

        {children}

      <ToastContainer position="top-right" autoClose={2000} />
      
    </div>
  );
}