import { Dialog as HDialog } from "@headlessui/react";

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <HDialog
      as="div"
      open={isOpen}
      className="inset-0 z-10 fixed overflow-hidden flex items-center justify-center"
      onClose={onClose ?? (() => null)}
    >
      <HDialog.Overlay
        as="div"
        className="bg-black bg-opacity-40 inset-0 fixed"
      />
      <span className="inline-block h-screen align-middle" aria-hidden="true">
        &#8203;
      </span>
      <div className="bg-white shadow-xl rounded-xl p-4 w-[calc(100vw-32px)] max-w-xl z-10 flex flex-col gap-4">
        <HDialog.Title>
          <h2 className="font-medium">{title}</h2>
        </HDialog.Title>
        <div className="flex items-center gap-4 w-full">{children}</div>
      </div>
    </HDialog>
  );
}
