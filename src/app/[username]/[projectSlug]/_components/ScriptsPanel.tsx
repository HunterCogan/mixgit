"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  Button,
  ComboBox,
  Description,
  ErrorMessage,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Spinner,
  Surface,
  TextField,
  ToggleButton,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import RawCodeEditor from "./RawCodeEditor";
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ScriptStack } from "./ScriptStack";
import { AIFeedbackModal } from "./AIFeedbackModal";
import { FileNameSchema } from "@/lib/schemas/remix.zod";
import { fileNameToLanguage, languageDisplayName } from "@/lib/language";
import type { RemixFile } from "./ProjectContent";
import type { Script, AIFeedback, FeedbackStatus } from "@/types";

interface Props {
  files: RemixFile[];
  selectedFileName: string;
  onSelectFile: (fileName: string) => void;
  scripts: Record<string, Script[]>;
  aiFeedback: AIFeedback | null;
  feedbackStatus: FeedbackStatus;
  feedbackError: string | null;
  onGetFeedback: () => void;
  onDeleteRemix: () => Promise<void>;
  hasSelectedRemix: boolean;
  remixName: string | null;
  remixDescription: string | null;
  feedbackTimestamp: string | null;
  canDelete: boolean;
  remixType: "blockcode" | "raw";
  remixId: string | null;
  onCodeSaved: (remixId: string, fileName: string, code: string) => void;
  canEdit: boolean;
  language: string;
  isLoggedIn: boolean;
  canUseAIFeedback: boolean;
}

export function ScriptsPanel({
  files,
  selectedFileName,
  onSelectFile,
  scripts,
  aiFeedback,
  feedbackStatus,
  feedbackError,
  onGetFeedback,
  onDeleteRemix,
  hasSelectedRemix,
  remixName,
  remixDescription,
  feedbackTimestamp,
  canDelete,
  remixType,
  remixId,
  onCodeSaved,
  canEdit,
  language,
  isLoggedIn,
  canUseAIFeedback,
}: Props) {
  const router = useRouter();
  // isEmpty overrides the toggle, as empty projects should be viewed raw.
  const isEmpty = Object.keys(scripts).length === 0;
  const [isRawToggled, setIsRawToggled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const logicFiles = files.filter((f) => f.fileType === "logic");
  const selectedFile =
    logicFiles.find((f) => f.name === selectedFileName) ?? logicFiles[0];
  const raw = selectedFile?.data ?? "";
  const fileName = selectedFile?.name ?? "project.json";

  const [edits, setEdits] = useState<Record<string, string>>({});
  const currentCode = edits[selectedFileName] ?? raw;
  const hasUnsavedChanges = currentCode !== raw;

  function setCurrentCode(value: string) {
    setEdits((prev) => ({ ...prev, [selectedFileName]: value }));
  }

  async function handleSaveCode() {
    if (!remixId || !selectedFileName) return;
    setSaving(true);
    setSaveError(null);
    setSavedSuccessfully(false);
    try {
      const res = await fetch(`/api/remixes/${remixId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selectedFileName, code: currentCode }),
      });
      if (res.ok) {
        onCodeSaved(remixId, selectedFileName, currentCode);
        setSavedSuccessfully(true);
        setTimeout(() => setSavedSuccessfully(false), 2000);
      } else {
        const data = await res.json();
        setSaveError(
          typeof data.error === "string" ? data.error : "Failed to save",
        );
      }
    } catch {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const addFileState = useOverlayState();
  const [newFileName, setNewFileName] = useState("");
  const [addFileSubmitted, setAddFileSubmitted] = useState(false);
  const [addFileError, setAddFileError] = useState<string | null>(null);
  const [addingFile, setAddingFile] = useState(false);

  async function handleAddFile(e: React.SyntheticEvent) {
    e.preventDefault();
    setAddFileSubmitted(true);
    if (!newFileName) return;

    setAddingFile(true);
    setAddFileError(null);
    try {
      const res = await fetch(`/api/remixes/${remixId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFileName }),
      });
      if (res.ok) {
        addFileState.close();
        onSelectFile(newFileName.trim());
        setNewFileName("");
        setAddFileSubmitted(false);
        router.refresh();
      } else {
        const data = await res.json();
        setAddFileError(
          typeof data.error === "string" ? data.error : "Failed to add file",
        );
      }
    } catch {
      setAddFileError("Network error");
    } finally {
      setAddingFile(false);
    }
  }

  const renameFileState = useOverlayState();
  const [renameValue, setRenameValue] = useState(selectedFileName);
  const [renameSubmitted, setRenameSubmitted] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);

  async function handleRenameFile(e: React.SyntheticEvent) {
    e.preventDefault();
    setRenameSubmitted(true);
    if (!renameValue) return;

    setRenaming(true);
    setRenameError(null);
    try {
      const res = await fetch(`/api/remixes/${remixId}/files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedFileName,
          newName: renameValue,
        }),
      });
      if (res.ok) {
        const trimmed = renameValue.trim();
        renameFileState.close();
        setEdits((prev) => {
          if (!(selectedFileName in prev)) return prev;
          const { [selectedFileName]: value, ...rest } = prev;
          return { ...rest, [trimmed]: value };
        });
        onSelectFile(trimmed);
        setRenameSubmitted(false);
        router.refresh();
      } else {
        const data = await res.json();
        setRenameError(
          typeof data.error === "string" ? data.error : "Failed to rename",
        );
      }
    } catch {
      setRenameError("Network error");
    } finally {
      setRenaming(false);
    }
  }

  const deleteFileState = useOverlayState();
  const [deletingFile, setDeletingFile] = useState(false);
  const [deleteFileError, setDeleteFileError] = useState<string | null>(null);

  async function handleDeleteFile() {
    if (!remixId || !selectedFileName) return;
    setDeletingFile(true);
    setDeleteFileError(null);
    try {
      const res = await fetch(`/api/remixes/${remixId}/files`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedFileName }),
      });
      if (res.ok) {
        deleteFileState.close();
        router.refresh();
      } else {
        const data = await res.json();
        setDeleteFileError(
          typeof data.error === "string" ? data.error : "Failed to delete file",
        );
      }
    } catch {
      setDeleteFileError("Network error");
    } finally {
      setDeletingFile(false);
    }
  }

  const [selectedTarget, setSelectedTarget] = useState(
    Object.keys(scripts).find((name) => scripts[name].length > 0) ?? "",
  );
  const targetScripts = scripts[selectedTarget] ?? [];

  const deleteState = useOverlayState();
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteRemix() {
    setLoading(true);
    setDeleteError(null);
    try {
      await onDeleteRemix();
      deleteState.close();
    } catch (e) {
      setDeleteError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex flex-wrap gap-2 items-center">
        {remixType === "raw" && canEdit && (
          <>
            <Button
              size="sm"
              onPress={handleSaveCode}
              isDisabled={saving || !hasUnsavedChanges}
              isPending={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            {savedSuccessfully && (
              <p className="text-xs text-green-500">Saved!</p>
            )}
            <ComboBox
              aria-label="Select file"
              variant="secondary"
              className="w-fit"
              value={selectedFileName}
              onChange={(key) => {
                if (key) onSelectFile(String(key));
              }}
            >
              <ComboBox.InputGroup>
                <Input
                  placeholder="Search files..."
                  className="h-9 py-0 md:h-8"
                />
                <ComboBox.Trigger />
              </ComboBox.InputGroup>
              <ComboBox.Popover>
                <ListBox>
                  {logicFiles.map((f) => (
                    <ListBox.Item key={f.name} id={f.name} textValue={f.name}>
                      <Label>{f.name}</Label>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>
            <Modal state={addFileState}>
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label="Add file"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Add a new file to this Remix</p>
                </Tooltip.Content>
              </Tooltip>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Add File</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p className="px-1 mb-2 text-sm">
                        Add another file to this Remix — its extension (like{" "}
                        <code>.py</code> or <code>.js</code>) sets its own
                        language.
                      </p>
                      <Form
                        className="flex flex-col gap-4 p-1"
                        validationBehavior="aria"
                        onSubmit={handleAddFile}
                      >
                        <TextField
                          isRequired
                          name="fileName"
                          value={newFileName}
                          onChange={setNewFileName}
                          validate={(value) => {
                            if (!addFileSubmitted && !value) return null;
                            const result = FileNameSchema.safeParse(value);
                            return result.success
                              ? null
                              : result.error.issues[0].message;
                          }}
                        >
                          <Label>File name</Label>
                          <Input
                            variant="secondary"
                            placeholder='"utils.py", "main.js", "styles.css"'
                          />
                          <Description>
                            {newFileName
                              ? `Detected language: ${languageDisplayName(fileNameToLanguage(newFileName))}`
                              : "The extension you choose (like .py or .js) sets this file's language."}
                          </Description>
                          <FieldError />
                        </TextField>
                        <ErrorMessage>{addFileError}</ErrorMessage>
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          isPending={addingFile}
                        >
                          {addingFile && <Spinner size="sm" />}
                          {addingFile ? "Adding..." : "Add File"}
                        </Button>
                      </Form>
                    </Modal.Body>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
            <Modal state={renameFileState}>
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label="Rename file"
                    isDisabled={!selectedFileName}
                    onPress={() => setRenameValue(selectedFileName)}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Rename this file</p>
                </Tooltip.Content>
              </Tooltip>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Rename File</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p className="px-1 mb-2 text-sm">
                        You can also change this file&apos;s language by
                        changing its extension (like <code>.py</code> or{" "}
                        <code>.js</code>).
                      </p>
                      <Form
                        className="flex flex-col gap-4 p-1"
                        validationBehavior="aria"
                        onSubmit={handleRenameFile}
                      >
                        <TextField
                          isRequired
                          name="newFileName"
                          value={renameValue}
                          onChange={setRenameValue}
                          validate={(value) => {
                            if (!renameSubmitted && !value) return null;
                            const result = FileNameSchema.safeParse(value);
                            return result.success
                              ? null
                              : result.error.issues[0].message;
                          }}
                        >
                          <Label>File name</Label>
                          <Input variant="secondary" />
                          <Description>
                            {renameValue
                              ? `Detected language: ${languageDisplayName(fileNameToLanguage(renameValue))}`
                              : "The extension you choose (like .py or .js) sets this file's language."}
                          </Description>
                          <FieldError />
                        </TextField>
                        <ErrorMessage>{renameError}</ErrorMessage>
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          isPending={renaming}
                        >
                          {renaming && <Spinner size="sm" />}
                          {renaming ? "Renaming..." : "Rename"}
                        </Button>
                      </Form>
                    </Modal.Body>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
            {logicFiles.length > 1 && (
              <AlertDialog
                isOpen={deleteFileState.isOpen}
                onOpenChange={deleteFileState.setOpen}
              >
                <Tooltip delay={0}>
                  <Tooltip.Trigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label="Delete file"
                      onPress={deleteFileState.open}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Delete this file</p>
                  </Tooltip.Content>
                </Tooltip>
                <AlertDialog.Backdrop>
                  <AlertDialog.Container>
                    <AlertDialog.Dialog>
                      <AlertDialog.CloseTrigger className="m-3" />
                      <AlertDialog.Header>
                        <AlertDialog.Heading className="flex items-center gap-2 text-2xl mb-3">
                          <AlertDialog.Icon />
                          Delete File?
                        </AlertDialog.Heading>
                      </AlertDialog.Header>
                      <AlertDialog.Body>
                        <strong>{selectedFileName}</strong> will be permanently
                        deleted. This cannot be undone.
                      </AlertDialog.Body>
                      <AlertDialog.Footer>
                        {deleteFileError && (
                          <p className="text-sm text-red-500">
                            {deleteFileError}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          onPress={deleteFileState.close}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          isDisabled={deletingFile}
                          onPress={handleDeleteFile}
                        >
                          {deletingFile && <Spinner size="sm" />}
                          {deletingFile ? "Deleting..." : "Delete"}
                        </Button>
                      </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                  </AlertDialog.Container>
                </AlertDialog.Backdrop>
              </AlertDialog>
            )}
          </>
        )}

        {hasSelectedRemix && !isEmpty && remixType === "blockcode" && (
          <AIFeedbackModal
            aiFeedback={aiFeedback}
            feedbackStatus={feedbackStatus}
            feedbackError={feedbackError}
            onGetFeedback={onGetFeedback}
            remixId={remixId}
            remixName={remixName}
            remixDescription={remixDescription}
            feedbackTimestamp={feedbackTimestamp}
            isLoggedIn={isLoggedIn}
            canUseAIFeedback={canUseAIFeedback}
            remixType={remixType}
          />
        )}
        <ToggleButton
          isSelected={isEmpty || isRawToggled}
          onChange={setIsRawToggled}
          isDisabled={isEmpty}
          size="sm"
          className="sm:ml-auto"
        >
          Raw
        </ToggleButton>
        {raw && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              const blob = new Blob([raw], {
                type: "application/json",
              });

              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");

              a.href = url;
              a.download = fileName;
              a.click();

              URL.revokeObjectURL(url);
            }}
          >
            <ArrowDownTrayIcon />
            Download
          </Button>
        )}

        {hasSelectedRemix && (
          <AlertDialog
            isOpen={deleteState.isOpen}
            onOpenChange={deleteState.setOpen}
          >
            <Button
              variant="danger-soft"
              size="sm"
              onPress={deleteState.open}
              isDisabled={!canDelete}
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </Button>

            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog>
                  <AlertDialog.CloseTrigger className="m-3" />

                  <AlertDialog.Header>
                    <AlertDialog.Heading className="flex items-center gap-2 text-2xl mb-3">
                      <AlertDialog.Icon />
                      Delete Remix?
                    </AlertDialog.Heading>
                  </AlertDialog.Header>

                  <AlertDialog.Body>
                    <strong>{remixName}</strong> will be permanently deleted.
                    This cannot be undone.
                  </AlertDialog.Body>

                  <AlertDialog.Footer>
                    {deleteError && (
                      <p className="text-sm text-red-500">{deleteError}</p>
                    )}
                    <Button variant="outline" onPress={deleteState.close}>
                      Cancel
                    </Button>

                    <Button
                      variant="danger"
                      isDisabled={loading}
                      onPress={handleDeleteRemix}
                    >
                      {loading && <Spinner size="sm" />}
                      {loading ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        )}
      </div>
      {isEmpty || isRawToggled ? (
        remixType === "raw" && canEdit ? (
          <Surface className="flex flex-1 min-h-0 border rounded-lg overflow-hidden">
            <RawCodeEditor
              key={selectedFileName}
              value={currentCode}
              onChange={setCurrentCode}
              language={language}
            />
          </Surface>
        ) : (
          <Surface className="flex flex-1 min-h-0 border rounded-lg overflow-hidden">
            <RawCodeEditor
              key={selectedFileName}
              value={raw}
              language={language}
              readOnly
            />
          </Surface>
        )
      ) : (
        <Surface className="flex-1 min-h-0 bg-grid bg-local border rounded-lg overflow-auto">
          <div className="sticky top-0 z-10 p-3">
            <ComboBox
              aria-label="Select target"
              variant="secondary"
              className="w-fit"
              isRequired
              inputValue={selectedTarget}
              onInputChange={(value) => setSelectedTarget(value)}
            >
              <ComboBox.InputGroup>
                <Input placeholder="Search targets..." />
                <ComboBox.Trigger />
              </ComboBox.InputGroup>
              <ComboBox.Popover>
                <ListBox>
                  {Object.keys(scripts).map((name) => (
                    <ListBox.Item
                      key={name}
                      textValue={name}
                      isDisabled={scripts[name].length === 0}
                    >
                      <div className="flex flex-col">
                        <Label>{name}</Label>
                        <Description>
                          {scripts[name].length === 0
                            ? "empty"
                            : `${scripts[name].length} script${scripts[name].length !== 1 ? "s" : ""}`}
                        </Description>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 p-3">
            {targetScripts.map((script) => (
              <div key={script.hatBlockId} className="break-inside-avoid mb-3">
                <ScriptStack script={script} />
              </div>
            ))}
          </div>
        </Surface>
      )}
    </div>
  );
}
