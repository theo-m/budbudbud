import Dialog from "../components/Dialog";
import Spinner from "../components/icons/Spinner";
import { PlusIcon, UsersIcon } from "@heroicons/react/solid";
import { useGroupContext } from "./GroupContext";
import trpc from "../trpc";
import { useState } from "react";

export default function PeepsModal() {
  const [showNewUserInput, setShowNewUserInput] = useState(false);
  const [showPeeps, setShowPeeps] = useState(false);

  const {
    id,
    groupQuery: { refetch, data: group },
  } = useGroupContext();

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
    <>
      <button
        className="ml-auto hover:opacity-80"
        onClick={() => setShowPeeps(true)}
      >
        <UsersIcon height={24} />
      </button>

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
                addUser({ groupId: id, userEmail: e.currentTarget.value })
              }
            />
            <button
              className="hover:bg-opacity-80 transition focus:rotate-90 transition h-6 w-6 bg-gray-500 text-white rounded-full flex items-center justify-center"
              onClick={() => setShowNewUserInput(!showNewUserInput)}
            >
              {addingUser ? <Spinner /> : <PlusIcon height={20} />}
            </button>
          </div>
          <div className="flex flex-col divide-y max-h-[420px]  overflow-y-auto pr-4">
            {(group?.users.length ?? 0) > 0
              ? group?.users.map((u) => (
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
    </>
  );
}
