import { useState } from "react";
import trpc from "../trpc";
import Dialog from "../components/Dialog";
import Spinner from "../components/icons/Spinner";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { useGroupContext } from "./GroupContext";

export default function NameChangeModal() {
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);

  const {
    id,
    groupQuery: { refetch, data: group },
  } = useGroupContext();

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
    <>
      <button
        className="group-hover:opacity-100 transition opacity-0 rounded px-1 text-sm text-primary border hover:bg-primary/5 focus:outline-primary"
        onClick={() => setShowGroupNameInput(true)}
      >
        edit
      </button>

      <Dialog
        isOpen={showGroupNameInput}
        title="Group name update"
        onClose={() => setShowGroupNameInput(false)}
      >
        <div className="flex items-center gap-4 w-full">
          <input
            type="text"
            defaultValue={group?.name ?? ""}
            className="rounded px-2 w-full py-1 border placeholder:text-gray-300 focus:outline-primary"
            autoFocus
            onKeyDown={(e) =>
              e.key === "Enter" &&
              updateName({ id, name: e.currentTarget.value })
            }
          />
          {updatingName ? <Spinner /> : <CheckCircleIcon height={24} />}
        </div>
      </Dialog>
    </>
  );
}
