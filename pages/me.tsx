import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, signOut } from "next-auth/react";

import trpc from "../client/trpc";
import Spinner from "../client/components/icons/Spinner";
import Link from "next/link";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const res = await getSession({ req });

  if (!res?.user) return { redirect: { destination: "/", permanent: false } };
  return { props: { user: res.user } };
};

export default function Me({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: groups, isLoading, refetch } = trpc.useQuery(["group/mine"]);
  const { mutate: createGroup, isLoading: creatingGroup } = trpc.useMutation(
    "group/create",
    {
      onSuccess: () => refetch(),
    }
  );
  return (
    <div className="flex-grow flex flex-col px-4 gap-4 py-2 w-full max-w-xl">
      <Head>
        <title>Me</title>
      </Head>
      <div className="flex items-center gap-4 justify-between">
        <span>Logged in as {user?.email}</span>
        <button
          className="border rounded p-2 hover:bg-primary/10 focus:outline focus:outline-2 focus:outline-primary"
          onClick={() => signOut()}
        >
          sign out
        </button>
      </div>

      <h2 className="font-bold text-black text-xl">My groups</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col divide-y">
          {groups?.map((g) => (
            <Link key={g.id} href="/group/[id]" as={`/group/${g.id}`}>
              <a className="flex items-center justify-between gap-2 py-4">
                <span className="font-medium whitespace-nowrap truncate">
                  {g.name}
                </span>
                <span className="text-sm text-gray-300">
                  {g.userGroups.length} pals
                </span>
              </a>
            </Link>
          ))}
        </div>
      )}
      <button
        className="border text-primary rounded p-2 hover:bg-primary/10 focus:outline focus:outline-2 focus:outline-primary"
        onClick={() => createGroup({ name: "my group", users: [] })}
        disabled={creatingGroup}
      >
        {creatingGroup ? <Spinner /> : "create group"}
      </button>
    </div>
  );
}
