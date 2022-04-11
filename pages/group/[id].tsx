import Head from "next/head";
import { useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

import trpc from "../../client/trpc";
import Spinner from "../../client/components/icons/Spinner";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const res = await getSession({ req });

  if (!res?.user) return { redirect: { destination: "/", permanent: false } };
  return { props: { user: res.user } };
};

export default function Group() {
  const [showNewUserInput, setShowNewUserInput] = useState(false);

  const router = useRouter();
  const groupId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id ?? "";
  const {
    data: group,
    isLoading,
    error,
    refetch,
  } = trpc.useQuery(["group/byId", groupId], { enabled: groupId !== "" });

  const { mutate: addUser, isLoading: addingUser } = trpc.useMutation(
    "group/addUser",
    {
      onSuccess: () => {
        refetch();
        setShowNewUserInput(false);
      },
    }
  );

  return (
    <div className="flex-grow w-full max-w-xl px-4">
      <Head>
        <title>{group?.name ?? "New group"}</title>
      </Head>
      {isLoading && <Spinner />}
      {error && <div>{error.message}</div>}
      {group && (
        <>
          <h1 className="font-bold group w-full text-black text-xl my-8 flex items-center gap-4">
            {group.name ?? "New group"}
            <button className="group-hover:block hidden rounded px-1 text-sm text-primary border hover:bg-primary/5 focus:outline-primary">
              edit
            </button>
          </h1>

          <h2 className="text-gray-500 font-bold text-xl my-8">Next Week</h2>
          <div className="w-full flex flex-wrap justify-evenly">
            {["mon", "tue", "wed", "thu", "fri"].map((d) => (
              <div
                key={d}
                className="h-12 w-12 rounded-full flex items-center justify-center bg-primary text-white relative"
              >
                {d}
                <div className="bg-white text-primary text-xs absolute top-0 right-0 rounded-full border border-primary h-4 w-4 flex items-center justify-center">
                  {Math.floor(Math.random() * group.users.length)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 group">
            <h2 className="text-gray-500 font-bold text-xl my-8">Peeps</h2>
            <div className="flex items-center gap-2">
              {showNewUserInput && (
                <input
                  type="email"
                  name="email"
                  autoFocus
                  className="rounded px-2 py-1 border placeholder:text-gray-300 focus:outline-primary"
                  placeholder="email@example.com"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !!groupId &&
                    addUser({ groupId, userEmail: e.currentTarget.value })
                  }
                  disabled={!groupId}
                />
              )}
              <button onClick={() => setShowNewUserInput(!showNewUserInput)}>
                {addingUser ? <Spinner /> : "+"}
              </button>
            </div>
          </div>
          <div className="flex flex-col divide-y">
            {group.users.length > 0
              ? group.users.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center gap-4 group py-4"
                  >
                    <span className="whitespace-nowrap font-medium">
                      {u.user.name}
                    </span>
                    <span className="text-xs text-gray-300 truncate">
                      {u.user.email}
                    </span>
                    {u.admin ? (
                      <span className="ml-auto text-xs rounded border text-gray-300 p-1">
                        admin
                      </span>
                    ) : (
                      <button className="group-hover:block hidden ml-auto whitespace-nowrap rounded px-1 text-sm text-primary border hover:bg-primary/5 focus:outline-primary">
                        make admin
                      </button>
                    )}
                  </div>
                ))
              : "No users yet here"}
          </div>
        </>
      )}
    </div>
  );
}
