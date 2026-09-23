import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock, Delete, ArrowRight } from "lucide-react";

interface PinLockScreenProps {
  correctPin?: string;
  pin?: string;
  onUnlock: () => void;
  onResetPin?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  pin,
  onUnlock,
  onResetPin,
}) => {
  const actualPin = (correctPin || pin || "").trim();
  const [enteredPin, setEnteredPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [failCount, setFailCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const dotsContainerRef = useRef<HTMLDivElement>(null);

  const targetLength = actualPin.length || 4;

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < targetLength) {
      setErrorMsg("");
      const next = enteredPin + num;
      setEnteredPin(next);
      if (next.length === targetLength) {
        verifyPin(next);
      }
    }
  };

  const handleDelete = () => {
    setErrorMsg("");
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const verifyPin = (pinToTest: string) => {
    if (pinToTest.trim() === actualPin) {
      setErrorMsg("");
      onUnlock();
    } else {
      setFailCount((prev) => prev + 1);
      setErrorMsg("PIN salah, silakan coba lagi");
      if (dotsContainerRef.current) {
        gsap.fromTo(
          dotsContainerRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.08,
            repeat: 5,
            yoyo: true,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(dotsContainerRef.current, { x: 0 });
              setEnteredPin("");
            },
          },
        );
      } else {
        setEnteredPin("");
      }
    }
  };

  const handleConfirmReset = () => {
    if (onResetPin) {
      onResetPin();
    } else {
      localStorage.removeItem("saku_pin_config");
      onUnlock();
    }
  };

  // Listen to physical keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enteredPin, targetLength]);

  return (
    <div
      id="pin-lock-screen"
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-(--bg-main) p-4 select-none"
    >
      <div className="w-full max-w-xs text-center space-y-6">
        {/* Brand Name Only - no logo icon/box as instructed */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            s<span className="text-(--accent-color)">A</span>ku simpan
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-(--text-muted)">
            <Lock className="w-3.5 h-3.5 text-(--accent-color)" />
            <span>Aplikasi Terkunci oleh PIN</span>
          </div>
        </div>

        {/* PIN Indicators */}
        <div
          ref={dotsContainerRef}
          className="flex justify-center items-center gap-4 py-3"
        >
          {Array.from({ length: targetLength }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                i < enteredPin.length
                  ? "bg-(--accent-color) border-(--accent-color) scale-110"
                  : "bg-transparent border-(--border-color)"
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-500 animate-fade-in">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl border border-(--border-color) bg-(--bg-card) text-xl font-bold font-num text-(--text-primary) shadow-sm hover:border-(--accent-color) active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Hapus Digit"
            className="h-14 rounded-2xl border border-(--border-color) bg-(--bg-card) flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) active:scale-95 transition"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-14 rounded-2xl border border-(--border-color) bg-(--bg-card) text-xl font-bold font-num text-(--text-primary) shadow-sm hover:border-(--accent-color) active:scale-95 transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => {
              if (enteredPin.length === targetLength) verifyPin(enteredPin);
            }}
            aria-label="Buka Kunci"
            className="h-14 rounded-2xl border border-(--accent-color) bg-(--accent-color) flex items-center justify-center text-white active:scale-95 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-(--text-muted)">
          Gunakan tombol di atas atau ketik langsung melalui keyboard fisik
        </p>

        {/* Option: Lupa PIN / Reset PIN */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-(--text-muted) hover:text-(--text-primary) underline transition cursor-pointer"
          >
            Lupa PIN Anda?
          </button>
        </div>

        {/* Modal Konfirmasi Reset PIN */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-xs rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-xl text-left space-y-4">
              <h4 className="text-sm font-bold text-(--text-primary)">
                Reset &amp; Nonaktifkan PIN?
              </h4>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Jika Anda lupa PIN, Anda dapat mereset proteksi PIN. Data
                wishlist, kategori, dan pengaturan produk Anda tetap aman dan
                tidak akan terhapus.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-xl border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary)"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                >
                  Reset PIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
