import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import ProtectedRoute from "../components/ProtectedRoute";

function MyApp({ Component, pageProps, router }: AppProps) {
  // Don't protect login and register pages
  const isAuthPage =
    router.pathname === "/login" || router.pathname === "/register";

  return (
    <ChakraProvider>
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </ChakraProvider>
  );
}

export default MyApp;
