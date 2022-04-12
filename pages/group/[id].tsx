import Head from "next/head";
import { useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import superjson from "superjson";
import nextMonday from "date-fns/nextMonday";
import addDays from "date-fns/addDays";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChatAltIcon,
  ChevronUpIcon,
} from "@heroicons/react/solid";
import classNames from "classnames";
import Spinner from "../../client/components/icons/Spinner";
import { groupByIdWithUsers } from "@/server/group/db";
import {
  GroupContextProvider,
  useGroupContext,
} from "../../client/Group/GroupContext";
import PeepsModal from "../../client/Group/PeepsModal";
import NameChangeModal from "../../client/Group/NameChangeModal";
import MeetModal from "../../client/Group/MeetModal";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const res = await getSession({ req });

  if (!res?.user || !res.user.email)
    return { redirect: { destination: "/signin", permanent: false } };

  const groupId = Array.isArray(query.id) ? query.id[0] : query.id ?? "";
  const group = await groupByIdWithUsers(groupId, res.user.email);
  if (!group.users.find((u) => u.user.email === res.user?.email))
    return { redirect: { destination: "/signin", permanent: false } };

  return { props: { payload: superjson.stringify(group) } };
};

export default function GroupWrapper({ payload }: { payload: string }) {
  const router = useRouter();
  const groupId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id ?? "";

  return (
    groupId !== "" && (
      <GroupContextProvider id={groupId} payload={payload}>
        <Group />
      </GroupContextProvider>
    )
  );
}

function Group() {
  const {
    groupQuery: { data: group, isLoading },
    meetsQuery: { isLoading: loadingMeets },
  } = useGroupContext();

  const [showBoard, setShowBoard] = useState(true);

  return (
    <div className="flex-grow w-full max-w-xl px-4">
      <Head>
        <title>{group?.name ?? "New group"}</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      {isLoading && <Spinner />}
      {group && (
        <>
          <h1 className="font-bold group w-full text-black text-xl my-8 flex items-center gap-4">
            {group.name ?? "New group"}
            <NameChangeModal />
            <PeepsModal />
          </h1>

          <h2 className="text-gray-500 font-bold text-xl my-8 flex items-center gap-4">
            <CalendarIcon height={24} />
            <span>Next Week</span>
          </h2>
          <div className="w-full flex flex-wrap justify-evenly relative">
            {loadingMeets && (
              <div className="absolute top-0 right-0 h-4 w-4">
                <Spinner />
              </div>
            )}
            {["mon", "tue", "wed", "thu", "fri"].map((d, i) => {
              const date = new Date();
              const monday = nextMonday(date);
              const day = addDays(monday, i);

              return <MeetModal day={day} />;
            })}
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
