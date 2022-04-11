import { PropsWithChildren } from "react";
import Link from "next/link";
import Spinner from "./icons/Spinner";
import { useSession } from "next-auth/react";

export default function Layout({ children }: PropsWithChildren<{}>) {
  const { data, status } = useSession();

  return (
    <>
      <nav className="px-4 w-full h-12 border-b">
        <div className="max-w-xl mx-auto w-full flex h-full items-center gap-8 justify-between">
          <Link href="/">
            <a className="text-xl text-primary font-bold">Budbudbud</a>
          </Link>
          {status === "authenticated" ? (
            <Link href="/me">
              <a className="text-xs text-gray-500 rounded p-2 border-2 border-gray-100 hover:bg-gray-100">
                {data?.user?.email ?? "in"}
              </a>
            </Link>
          ) : status === "unauthenticated" ? (
            <Link href="/signin">
              <a className="text-gray-300">sign in</a>
            </Link>
          ) : (
            <div>
              <Spinner />
            </div>
          )}
        </div>
      </nav>

      <main className="text-gray-500 h-[calc(100vh-48px)] w-screen flex flex-col justify-center items-center gap-4">
        {children}
      </main>
    </>
  );
}
