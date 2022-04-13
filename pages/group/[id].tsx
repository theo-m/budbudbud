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
import Board from "../../client/Group/Board";
import { useForm } from "react-hook-form";
import trpc from "../../client/trpc";
import { getQueryParam } from "../../shared/query";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const res = await getSession({ req });

  if (!res?.user || !res.user.email)
    return { redirect: { destination: "/signin", permanent: false } };

  const groupId = getQueryParam(query.id);
  if (!groupId) return { redirect: { destination: "/", permanent: true } };

  const group = await groupByIdWithUsers(groupId, res.user.email);
  if (!group.users.find((u) => u.user.email === res.user?.email))
    return { redirect: { destination: "/signin", permanent: false } };

  return { props: { payload: superjson.stringify(group) } };
};

export default function GroupWrapper({ payload }: { payload: string }) {
  const router = useRouter();
  const groupId = getQueryParam(router.query.id) ?? "";

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
    id,
    groupQuery: { data: group, isLoading, refetch },
    meetsQuery: { isLoading: loadingMeets },
  } = useGroupContext();

  const [showBoard, setShowBoard] = useState(true);

  const { handleSubmit, register, reset } = useForm<{ message: string }>();
  const { mutate: addMessage, isLoading: addingMessage } = trpc.useMutation(
    "group/newMessage",
    { onSuccess: () => refetch() }
  );

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

              return <MeetModal key={d} day={day} />;
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
            <Board />
            <form
              className="flex mt-4 items-start gap-4 w-full"
              onSubmit={handleSubmit((e) => {
                addMessage({ id, text: e.message });
                reset();
              })}
            >
              <textarea
                className="p-4 rounded-lg border min-h-[40px] flex-grow placeholder:text-gray-300 focus:outline-primary"
                placeholder="Type a message"
                {...register("message")}
                rows={1}
              />

              <button className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full">
                {addingMessage ? <Spinner /> : <ArrowRightIcon height={16} />}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
