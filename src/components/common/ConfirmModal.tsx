import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";
import { COLOR_DANGER, COLOR_CANCEL } from "../../theme/dentoIro";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton={false}
    >
      <div className="text-center py-2">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgba(217, 56, 28, 0.12)",
            color: COLOR_DANGER,
          }}
        >
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-(--text-primary)">{title}</h3>
        <p className="mt-2 text-sm text-(--text-muted) px-2 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            id="btn-confirm-cancel"
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: COLOR_CANCEL }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: COLOR_DANGER }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
