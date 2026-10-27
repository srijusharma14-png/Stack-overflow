import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify/unstyled";
import { AuthProvider } from "@/lib/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Code-Quest</title>
        <meta
          name="description"
          content="Ask questions, share knowledge, and learn with Code-Quest."
        />
      </Head>

      <ToastContainer />
      <Component {...pageProps} />
    </AuthProvider>
  );
}