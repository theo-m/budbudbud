import { useState } from "react";
import {
  MinusCircleIcon,
  UserAddIcon,
  UsersIcon,
} from "@heroicons/react/solid";

import Dialog from "../components/Dialog";
import Spinner from "../components/icons/Spinner";
import { useGroupContext } from "./GroupContext";
import trpc from "../trpc";
import { GroupWithUsers } from "@/server/group/db";
import { useForm } from "react-hook-form";

const UserControl = ({ user }: { user: GroupWithUsers["users"][number] }) => {
  const {
    id,
    groupQuery: { refetch },
  } = useGroupContext();
  const { mutate: removeUser, isLoading: removingUser } = trpc.useMutation(
    "group/removeUser",
    { onSuccess: () => refetch() }
  );

  return (
    <div className="ml-auto bg-white transition opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 flex items-center rounded-xl overflow-hidden border outline outline-2  outline-white divide-x">
      <button className="py-3 px-1 hover:bg-gray-100 text-xs">
        {user.admin ? "- admin rights" : "Make admin"}
      </button>
      <button
        className="p-2 hover:bg-gray-100"
        onClick={() => removeUser({ userId: user.id, groupId: id })}
      >
        {removingUser ? (
          <Spinner />
        ) : (
          <MinusCircleIcon className="text-red-500" height={24} />
        )}
      </button>
    </div>
  );
};

export default function PeepsModal() {
  const [showPeeps, setShowPeeps] = useState(false);

  const {
    id,
    groupQuery: { refetch, data: group },
  } = useGroupContext();

  const { mutate: addUser, isLoading: addingUser } = trpc.useMutation(
    "group/addUser",
    { onSuccess: () => refetch() }
  );

  const { register, handleSubmit, reset } = useForm<{
    email: string;
    name: string;
  }>();

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
          <form
            className="flex items-center gap-2 sm:gap-4 mb-4"
            onSubmit={handleSubmit(({ name, email }) => {
              addUser({ userEmail: email, groupId: id, name });
              reset();
            })}
          >
            <input
              {...register("name")}
              type="text"
              autoFocus
              className="rounded px-2 min-w-0 w-1/3 py-1 border placeholder:text-gray-300 focus:outline-primary"
              placeholder="Type a name"
            />
            <input
              {...register("email")}
              type="email"
              autoFocus
              className="rounded px-2 flex-grow min-w-0 py-1 border placeholder:text-gray-300 focus:outline-primary"
              placeholder="email@example.com"
            />
            <button className="hover:bg-opacity-80 min-w-[24px] transition focus:rotate-90 transition h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center">
              {addingUser ? (
                <Spinner />
              ) : (
                <UserAddIcon className="" height={18} width={18} />
              )}
            </button>
          </form>
          <div className="flex flex-col divide-y max-h-[420px] overflow-y-auto pr-4">
            {(group?.users.length ?? 0) > 0
              ? group?.users.map((u) => (
                  <div
                    key={u.userId}
                    className="relative flex items-center gap-4 group py-4"
                  >
                    <span className="whitespace-nowrap text-gray-500 font-normal truncate">
                      {u.name}
                    </span>
                    <span className="text-xs text-gray-300 truncate">
                      {u.user.email}
                    </span>
                    <UserControl user={u} />
                  </div>
                ))
              : "No users yet here"}
          </div>
        </div>
      </Dialog>
    </>
  );
}
