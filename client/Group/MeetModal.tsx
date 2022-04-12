import { useState } from "react";
import format from "date-fns/format";
import {
  CheckCircleIcon,
  PlusCircleIcon,
  ThumbUpIcon,
} from "@heroicons/react/solid";
import classNames from "classnames";

import { useGroupContext } from "./GroupContext";
import trpc from "../trpc";
import Dialog from "../components/Dialog";
import Spinner from "../components/icons/Spinner";
import { MeetVote } from "@prisma/client";
import { useUser } from "../UserContext";

export default function MeetModal({ day }: { day: Date }) {
  const {
    userQuery: { data: user },
  } = useUser();
  const [showDateModal, setShowDateModal] = useState<Date>();

  const {
    id,
    groupQuery: { data: group },
    meetsQuery: { data: meets, refetch: refetchMeets },
  } = useGroupContext();

  const { mutate: createMeet, isLoading: creatingMeet } = trpc.useMutation(
    "meet/create",
    {
      onSuccess: () => {
        refetchMeets();
      },
    }
  );

  const { mutate: vote, isLoading: voting } = trpc.useMutation("meet/vote", {
    onSuccess: () => refetchMeets(),
  });

  const { mutate: unvote, isLoading: unvoting } = trpc.useMutation(
    "meet/removeVote",
    {
      onSuccess: () => refetchMeets(),
    }
  );

  const { mutate: validate, isLoading: validating } = trpc.useMutation(
    "meet/validate",
    {
      onSuccess: () => {
        refetchMeets();
        setShowDateModal(undefined);
      },
    }
  );

  const meet = meets?.find((m) => m.day.getDate() === day.getDate());
  const places = meet?.meetVotes.reduce((acc, v) => {
    acc[v.place.address] = [...(acc[v.place.address] ?? []), v];
    return acc;
  }, {} as Record<string, MeetVote[]>);
  const isAdmin = !!group?.users.find((u) => u.userId === user?.id && u.admin);

  return (
    <>
      <button
        className="flex flex-col gap-1 justify-center items-center"
        onClick={() => setShowDateModal(day)}
      >
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary text-white relative text-xs">
          {format(day, "dd/MM")}
          {meet && (
            <>
              <div className="bg-white text-primary text-xs absolute top-0 right-0 rounded-full border border-primary h-4 w-4 flex items-center justify-center">
                {(meet.meetVotes.length ?? 0) > 0 ? meet.meetVotes.length : "v"}
              </div>
              {meet.validated && (
                <div className="bg-green-500 text-white text-xs absolute bottom-0 right-0 rounded-full border border-primary h-4 w-4 flex items-center justify-center">
                  v
                </div>
              )}
            </>
          )}
        </div>
        <span className="text-center text-sm">
          {format(day, "iii").toLocaleLowerCase()}
        </span>
      </button>

      <Dialog
        isOpen={!!showDateModal}
        title={showDateModal && `${format(showDateModal, "iii dd/MM")} meet`}
        onClose={() => setShowDateModal(undefined)}
      >
        <div className="flex flex-col w-full gap-4">
          {!meet && (
            <>
              <p className="text-gray-500">No one's selected this day yet ☁️</p>
              <button
                className="ml-auto rounded border border-primary/60 hover:bg-primary/90 bg-primary text-white p-1 font-medium w-fit flex items-center gap-2"
                onClick={() => createMeet({ groupId: id, day: showDateModal! })}
              >
                {creatingMeet ? <Spinner /> : <PlusCircleIcon height={24} />}
                <span>I'm up 🤘</span>
              </button>
            </>
          )}
          {meet && (
            <div className="flex items-center gap-4">
              <input
                type="text"
                className="rounded px-2 flex-grow py-1 border placeholder:text-gray-300 focus:outline-primary"
                placeholder="address"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  vote({
                    meetId: meet.id,
                    place: { type: "new", address: e.currentTarget.value },
                  })
                }
              />
              <span>
                {voting ? <Spinner /> : <PlusCircleIcon height={24} />}
              </span>
            </div>
          )}
          {meet &&
            places &&
            (Object.keys(places).length > 0 ? (
              <>
                <div className="flex flex-col w-full">
                  {Object.entries(places).map(([k, v]) => {
                    const isVoted = !!v.find((it) => it.userId === user?.id);

                    return (
                      <div
                        key={k}
                        className="flex items-center gap-2 py-2 w-full"
                      >
                        <span className="truncate flex-grow text-gray-500">
                          {k}
                        </span>
                        <span>{v.length}</span>
                        <button
                          className={classNames(
                            isVoted ? "text-primary" : "text-gray-500"
                          )}
                          onClick={() =>
                            isVoted
                              ? unvote({
                                  meetId: meet.id,
                                  placeId: v[0].placeId,
                                })
                              : vote({
                                  meetId: meet.id,
                                  place: { type: "existing", id: v[0].placeId },
                                })
                          }
                        >
                          {unvoting || voting ? (
                            <Spinner />
                          ) : (
                            <ThumbUpIcon height={24} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {isAdmin && (
                  <button
                    className={classNames(
                      "ml-auto border rounded p-1 text-white flex items-center gap-2",
                      meet.validated
                        ? "bg-green-500 border-green-500/50"
                        : "bg-primary border-primary/50"
                    )}
                    onClick={() =>
                      validate({
                        id: meet.id,
                        // TODO: set place
                        placeId: undefined,
                      })
                    }
                    disabled={meet.validated}
                  >
                    {meet.validated ? (
                      <span>validated</span>
                    ) : (
                      <>
                        {validating ? (
                          <Spinner />
                        ) : (
                          <CheckCircleIcon height={24} />
                        )}{" "}
                        <span>validate</span>
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <span className="text-gray-500">No places suggested yet</span>
            ))}
        </div>
      </Dialog>
    </>
  );
}
