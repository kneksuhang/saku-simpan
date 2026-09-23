import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  showCloseButton = true,
}) => {
  const [rendered, setRendered] = useState(isOpen);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      isClosingRef.current = false;
    } else if (rendered && !isClosingRef.current) {
      handleAnimateClose();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!rendered || isClosingRef.current) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // GSAP Open Transition
    const tl = gsap.timeline();
    if (backdropRef.current && modalBoxRef.current) {
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(modalBoxRef.current, { scale: 0.95, opacity: 0, y: 8 });

      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      }).to(
        modalBoxRef.current,
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: "back.out(1.2)",
        },
        "-=0.12",
      );
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleAnimateClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered]);

  const handleAnimateClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (backdropRef.current && modalBoxRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setRendered(false);
          isClosingRef.current = false;
          onClose();
        },
      });

      tl.to(modalBoxRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 6,
        duration: 0.18,
        ease: "power2.in",
      }).to(
        backdropRef.current,
        {
          opacity: 0,
          duration: 0.16,
          ease: "power2.in",
        },
        "-=0.08",
      );
    } else {
      setRendered(false);
      isClosingRef.current = false;
      onClose();
    }
  };

  if (!rendered) return null;

  return (
    <div
      id="modal-root-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Backdrop Layer */}
      <div
        ref={backdropRef}
        id="modal-backdrop"
        onClick={handleAnimateClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Box Container */}
      <div
        ref={modalBoxRef}
        id="modal-content-container"
        onClick={(e) => e.stopPropagation()} // Clicking inside does not close modal
        className={`relative w-full ${maxWidth} z-10 my-auto rounded-xl border bg-(--bg-card) text-(--text-primary) border-(--border-color) shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-(--border-color) px-6 py-4 bg-(--bg-card)">
            <div>
              {typeof title === "string" ? (
                <h3 className="text-xl font-bold tracking-tight text-(--text-primary)">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="mt-1 text-xs sm:text-sm text-(--text-muted)">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                id="btn-modal-close"
                onClick={handleAnimateClose}
                aria-label="Tutup Modal"
                className="rounded-lg p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
