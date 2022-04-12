import type { AppProps } from "next/app";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import superjson from "superjson";

import "../styles/globals.css";
import type { AppRouter } from "./api/trpc/[...trpc]";
import Layout from "../client/components/Layout";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { UserContextProvider } from "../client/UserContext";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={session} refetchInterval={60}>
      <UserContextProvider>
        {getLayout(<Component {...pageProps} />)}
      </UserContextProvider>
    </SessionProvider>
  );
}

export default withTRPC<AppRouter>({
  config: () => ({
    url: process.browser
      ? "/api/trpc"
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : "http://localhost:3000/api/trpc",
    queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    fetch: (req, params) =>
      fetch(req, { credentials: "include", ...(params ?? {}) }),
    transformer: superjson,
  }),
  ssr: false,
})(MyApp);
