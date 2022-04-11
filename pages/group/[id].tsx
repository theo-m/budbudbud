import Head from "next/head";
import { useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import superjson from "superjson";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChatAltIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  PlusIcon,
  UsersIcon,
} from "@heroicons/react/solid";

import trpc from "../../client/trpc";
import Spinner from "../../client/components/icons/Spinner";
import { groupByIdWithUsers } from "@/server/group/db";
import Dialog from "../../client/components/Dialog";
import classNames from "classnames";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const res = await getSession({ req });

  if (!res?.user)
    return { redirect: { destination: "/signin", permanent: false } };

  const groupId = Array.isArray(query.id) ? query.id[0] : query.id ?? "";
  const group = await groupByIdWithUsers(groupId);
  if (!group.users.find((u) => u.user.email === res.user?.email))
    return { redirect: { destination: "/signin", permanent: false } };

  return { props: { payload: superjson.stringify(group) } };
};

export default function Group({ payload }: { payload: string }) {
  const [showNewUserInput, setShowNewUserInput] = useState(false);
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [showBoard, setShowBoard] = useState(true);
  const [showPeeps, setShowPeeps] = useState(false);

  const router = useRouter();
  const groupId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id ?? "";
  const {
    data: group,
    isLoading,
    error,
    refetch,
  } = trpc.useQuery(["group/byId", groupId], {
    enabled: groupId !== "",
    initialData: () => superjson.parse(payload),
  });

  const { mutate: addUser, isLoading: addingUser } = trpc.useMutation(
    "group/addUser",
    {
      onSuccess: () => {
        refetch();
        setShowNewUserInput(false);
      },
    }
  );

  const { mutate: updateName, isLoading: updatingName } = trpc.useMutation(
    "group/updateName",
    {
      onSuccess: () => {
        refetch();
        setShowGroupNameInput(false);
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
            <button
              className="group-hover:opacity-100 transition opacity-0 rounded px-1 text-sm text-primary border hover:bg-primary/5 focus:outline-primary"
              onClick={() => setShowGroupNameInput(true)}
            >
              edit
            </button>
            <button
              className="ml-auto hover:opacity-80"
              onClick={() => setShowPeeps(true)}
            >
              <UsersIcon height={24} />
            </button>
          </h1>

          <Dialog
            isOpen={showPeeps}
            title="Group members"
            onClose={() => setShowPeeps(false)}
          >
            <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4 ">
                <input
                  type="email"
                  name="email"
                  autoFocus
                  className="rounded px-2 flex-grow py-1 border placeholder:text-gray-300 focus:outline-primary"
                  placeholder="email@example.com"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !!groupId &&
                    addUser({ groupId, userEmail: e.currentTarget.value })
                  }
                  disabled={!groupId}
                />
                <button
                  className="hover:bg-opacity-80 transition focus:rotate-90 transition h-6 w-6 bg-gray-500 text-white rounded-full flex items-center justify-center"
                  onClick={() => setShowNewUserInput(!showNewUserInput)}
                >
                  {addingUser ? <Spinner /> : <PlusIcon height={20} />}
                </button>
              </div>
              <div className="flex flex-col divide-y max-h-[420px]  overflow-y-auto pr-4">
                {group.users.length > 0
                  ? group.users.map((u) => (
                      <div
                        key={u.userId}
                        className="flex items-center gap-4 group py-4"
                      >
                        <span className="whitespace-nowrap text-gray-500 font-medium">
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
                          <button className="group-hover:opacity-100 opacity-0 transition ml-auto whitespace-nowrap rounded px-1 text-sm text-primary border hover:bg-primary/5 focus:outline-primary">
                            make admin
                          </button>
                        )}
                      </div>
                    ))
                  : "No users yet here"}
              </div>
            </div>
          </Dialog>

          <Dialog
            isOpen={showGroupNameInput}
            title="Group name update"
            onClose={() => setShowGroupNameInput(false)}
          >
            <div className="flex items-center gap-4 w-full">
              <input
                type="text"
                defaultValue={group.name ?? ""}
                className="rounded px-2 w-full py-1 border placeholder:text-gray-300 focus:outline-primary"
                autoFocus
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  updateName({ id: group.id, name: e.currentTarget.value })
                }
              />
              {updatingName ? <Spinner /> : <CheckCircleIcon height={24} />}
            </div>
          </Dialog>

          <h2 className="text-gray-500 font-bold text-xl my-8 flex items-center gap-4">
            <CalendarIcon height={24} />
            <span>Next Week</span>
          </h2>
          <div className="w-full flex flex-wrap justify-evenly">
            {["mon", "tue", "wed", "thu", "fri"].map((d) => (
              <div
                key={d}
                className="h-12 w-12 rounded-full flex items-center justify-center bg-primary text-white relative"
              >
                {d}
                <div className="bg-white text-primary text-xs absolute top-0 right-0 rounded-full border border-primary h-4 w-4 flex items-center justify-center">
                  {/*{Math.floor(Math.random() * group.users.length)}*/}0
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 group mt-8">
            <h2 className="text-gray-500 font-bold text-xl my-8 flex items-center gap-4">
              <ChatAltIcon height={24} />
              <span>Board</span>
            </h2>
            <button
              className={classNames(
                "h-6 w-6 rounded-full hover:bg-opacity-80 flex items-center justify-center bg-gray-500 text-white transition focus:outline-primary",
                !showBoard && "rotate-180"
              )}
              onClick={() => setShowBoard(!showBoard)}
            >
              <ChevronUpIcon className="mb-0.5" height={24} />
            </button>
          </div>
          <div
            className="flex flex-col gap-4 board overflow-hidden"
            data-show={showBoard}
          >
            <div className="flex flex-col gap-2 overflow-y-auto">
              {[
                { author: "Théo", id: "wo-2924f2fn", msg: "Hey jeudi ok?" },
                {
                  author: "Sylvain M",
                  id: "w2-2924f2fn",
                  msg: "Lundi mercredi ok pour moi",
                },
                {
                  author: "Théo",
                  id: "wo-2924f2f3",
                  msg: "mais pas mal de meetings dans l'aprem...",
                },
                {
                  author: "Gus",
                  id: "wo-2924f2fe",
                  msg: "Yes chaud mercredi aussi - #cachiquet!",
                },
              ].map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-1 w-fit max-w-[80%] bg-gray-100 rounded-lg p-2 relative"
                >
                  <span className="text-xs font-semibold text-primary">
                    {a.author}
                  </span>
                  <p className="pb-1.5">{a.msg}</p>
                  <span className="absolute right-1 bottom-0 text-xs text-gray-400">
                    2d ago
                  </span>
                </div>
              ))}
            </div>
            <div className="flex mt-4 items-start gap-4 w-full">
              <textarea
                className="p-4 rounded-lg border min-h-[40px] flex-grow placeholder:text-gray-300 focus:outline-primary"
                placeholder="Type a message"
                name="message"
                rows={1}
              />
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full">
                <ArrowRightIcon height={16} />
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
