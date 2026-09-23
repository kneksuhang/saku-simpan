import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Modal } from "./Modal";
import { AlertOctagon } from "lucide-react";
import { COLOR_DANGER, COLOR_CANCEL } from "../../theme/dentoIro";

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetConfirmed: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onResetConfirmed,
}) => {
  const [inputText, setInputText] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasValidRef = useRef(false);

  const isValid = inputText.trim() === "RESET";

  useEffect(() => {
    if (!isOpen) {
      setInputText("");
      wasValidRef.current = false;
      return;
    }
  }, [isOpen]);

  // Trigger horizontal shake when user reaches the exact word 'RESET'
  useEffect(() => {
    if (isValid && !wasValidRef.current) {
      wasValidRef.current = true;
      if (buttonRef.current) {
        gsap.killTweensOf(buttonRef.current);
        gsap.fromTo(
          buttonRef.current,
          { x: 0 },
          {
            x: 8,
            duration: 0.06,
            repeat: 7,
            yoyo: true,
            ease: "power2.inOut",
            onComplete: () => {
              if (buttonRef.current) gsap.set(buttonRef.current, { x: 0 });
            },
          },
        );
      }
    } else if (!isValid) {
      wasValidRef.current = false;
    }
  }, [isValid]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <AlertOctagon className="w-5 h-5" />
          <span className="font-bold">Konfirmasi</span>
        </div>
      }
    >
      <div className="space-y-4 text-sm text-(--text-muted)">
        <p className="leading-relaxed">
          Tindakan ini bersifat{" "}
          <strong className="text-rose-600 font-semibold">permanen</strong> dan
          akan menghapus seluruh data produk, kategori, dan tag.
        </p>
        <input
          id="input-reset-confirmation"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik RESET"
          autoFocus
          className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-3.5 py-2.5 text-center text-base font-mono font-bold tracking-widest text-(--text-primary) focus:border-(--accent-color) focus:outline-none focus:ring-1 focus:ring-(--accent-color)"
        />

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            id="btn-cancel-reset"
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: COLOR_CANCEL }}
          >
            Batal
          </button>
          <button
            ref={buttonRef}
            type="button"
            id="btn-execute-reset"
            disabled={!isValid}
            onClick={() => {
              if (isValid) {
                onResetConfirmed();
                onClose();
              }
            }}
            style={{
              backgroundColor: isValid ? COLOR_DANGER : "#C5C3BF",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200"
          >
            Musnahkan Data
          </button>
        </div>
      </div>
    </Modal>
  );
};
