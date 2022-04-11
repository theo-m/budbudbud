import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.push("/");
  }, [status, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center w-screen">
      <Link href="/">
        <a className="text-xl text-primary font-bold mb-16">Budbudbud</a>
      </Link>
      <div className="flex flex-col relative items-center">
        <button
          className="mb-4 border w-[200px] rounded p-2 hover:bg-primary/10 focus:outline focus:outline-2 focus:outline-primary"
          onClick={() => {
            setEmail(false);
            signIn("google");
          }}
        >
          with google
        </button>
        <button
          className="border w-[200px] rounded p-2 hover:bg-primary/10 focus:outline focus:outline-2 focus:outline-primary"
          onClick={() => setEmail(!email)}
        >
          with email
        </button>
        {email && (
          <div className="relative top-8 min-w-[12rem] max-w-md">
            <input
              type="email"
              name="email"
              placeholder="email@email.com"
              autoFocus
              className="px-4 py-1 border rounded absolute w-full placeholder:text-gray-300 active:outline-primary focus-visible:outline-primary"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                signIn("email", { email: e.currentTarget.value })
              }
            />
            <span className="absolute right-2 top-1 text-primary">{">"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
