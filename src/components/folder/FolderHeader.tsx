import { FolderMenu } from "./FolderMenu";

export const FolderHeader: React.FC<{
  folder: { id: string; name: string };
  isEditing: boolean;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onFinishRename: () => void;
  onStartEditing: () => void;
  onDelete: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}> = ({
  folder,
  isEditing,
  renameValue,
  onRenameChange,
  onFinishRename,
  onStartEditing,
  onDelete,
  inputRef,
}) => {
  return (
    <div className="flex gap-4 mb-8 w-full z-20">
      {isEditing ? (
        <input
          ref={inputRef}
          aria-label="Rename folder"
          className="text-xl font-semibold bg-transparent border-b border-neutral-400 outline-none w-48"
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onBlur={onFinishRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") onFinishRename();
            if (e.key === "Escape") {
              onRenameChange(folder.name);
              onFinishRename();
            }
          }}
        />
      ) : (
        <span className="font-semibold text-xl">{folder.name}</span>
      )}
      <FolderMenu onRename={onStartEditing} onDelete={onDelete} />
    </div>
  );
};
