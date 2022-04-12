import { useGroupContext } from "./GroupContext";
import Spinner from "../components/icons/Spinner";
import { GroupMessage } from "@prisma/client";
import { formatRelative } from "date-fns";
import classNames from "classnames";
import { useUser } from "../UserContext";

const Message = ({
  m: { id, authorId, text, createdAt },
}: {
  m: GroupMessage;
}) => {
  const { userQuery } = useUser();
  const {
    groupQuery: { data: group },
  } = useGroupContext();
  const authorName = group?.users.find((it) => it.userId === authorId)?.user
    .name;
  const isAuthor = userQuery.data?.id === authorId;

  return (
    <div
      key={id}
      className={classNames(
        "flex flex-col gap-1 w-fit max-w-[80%] bg-gray-100 rounded-lg p-2 relative",
        isAuthor && "ml-auto text-right"
      )}
    >
      <span className="text-xs font-semibold text-primary">{authorName}</span>
      <p className="pb-1.5">{text}</p>
      {!isAuthor && (
        <span className="absolute whitespace-nowrap right-1 bottom-0 text-xs text-gray-400">
          {formatRelative(createdAt, new Date())}
        </span>
      )}
    </div>
  );
};

export default function Board() {
  const {
    groupQuery: { data: group, isLoading },
  } = useGroupContext();

  return (
    <div className="flex flex-col gap-2 w-full h-full overflow-y-auto">
      {isLoading ? (
        <Spinner />
      ) : (
        group?.messages.map((it) => <Message key={it.id} m={it} />)
      )}
    </div>
  );
}
