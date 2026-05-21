"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { useTheme } from "@/lib/useTheme";
import { BootOverlay } from "./chrome/BootOverlay";
import { HudFrame } from "./chrome/HudFrame";
import { StatusBar } from "./chrome/StatusBar";
import { KeysFooter } from "./chrome/KeysFooter";
import { CustomCursor } from "./chrome/CustomCursor";
import { CommandPalette } from "./ui/CommandPalette";
import { HelpOverlay } from "./ui/HelpOverlay";
import { Aviary } from "./ui/Aviary";
import { Screensaver } from "./ui/Screensaver";
import { Hero } from "./sections/Hero";
import { WorkCanvas } from "./sections/WorkCanvas";
import { About } from "./sections/About";
import { Process } from "./sections/Process";
import { Writing } from "./sections/Writing";
import { Resume } from "./sections/Resume";
import { Now } from "./sections/Now";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";

function syscall(line: string) {
  window.dispatchEvent(new CustomEvent("portfolio-syscall", { detail: line }));
}

export function AppShell() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdSeed, setCmdSeed] = useState<string>("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [aviaryOpen, setAviaryOpen] = useState(false);
  const [inverse, setInverse] = useState(false);
  const [idle, setIdle] = useState(false);
  const { toggle: toggleTheme } = useTheme();

  const openCmd = useCallback(() => {
    setCmdSeed("");
    setCmdOpen(true);
  }, []);
  const openHelp = useCallback(() => setHelpOpen(true), []);
  const toggleAviary = useCallback(() => {
    setAviaryOpen((o) => !o);
  }, []);
  const toggleInverse = useCallback(() => {
    setInverse((v) => !v);
  }, []);
  const startScreensaver = useCallback(() => {
    setIdle(true);
    syscall("$ /sbin/screensaver --start");
  }, []);

  // Side effects that follow toggles — fire AFTER render to avoid setState-in-render
  const firstAviaryRender = useRef(true);
  useEffect(() => {
    if (firstAviaryRender.current) {
      firstAviaryRender.current = false;
      return;
    }
    syscall(aviaryOpen ? "$ exec ./aviary --shoot" : "$ kill aviary.pid");
  }, [aviaryOpen]);

  const firstInverseRender = useRef(true);
  useEffect(() => {
    if (inverse) document.documentElement.classList.add("inverse");
    else document.documentElement.classList.remove("inverse");
    if (firstInverseRender.current) {
      firstInverseRender.current = false;
      return;
    }
    syscall(inverse ? "$ mount --bind world cursor" : "$ umount /cursor");
  }, [inverse]);

  // Inverse-mode drag: cursor stays centered, drag scrolls the page
  useEffect(() => {
    if (!inverse) return;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let scrollY = 0;

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("button, a, input, .cmdk, .help-card, .post-reader, .pill, .write-card, .proj, .theme-toggle, .aviary-score"))
        return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollY = window.scrollY;
      document.documentElement.classList.add("inverse-dragging");
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      window.scrollTo({ top: scrollY - dy, behavior: "auto" });
    };
    const onUp = () => {
      dragging = false;
      document.documentElement.classList.remove("inverse-dragging");
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("inverse-dragging");
    };
  }, [inverse]);

  // Idle screensaver: 20s of no input. Mount once; listeners reset timer.
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleRef = useRef(idle);
  idleRef.current = idle;
  useEffect(() => {
    const onInput = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      // Wake if currently idle
      if (idleRef.current) setIdle(false);
      idleTimer.current = setTimeout(() => {
        setIdle(true);
        syscall("$ /sbin/screensaver --start");
      }, 20000);
    };
    onInput(); // start the timer
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, onInput, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onInput));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Keyboard handler
  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdSeed("");
        setCmdOpen((o) => !o);
        return;
      }
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        setCmdOpen(false);
        setHelpOpen(false);
        setAviaryOpen(false);
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((o) => !o);
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "g") {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 1200);
        return;
      }
      if (gPressed) {
        const target = NAV.find((n) => n.key === key);
        if (target) {
          gPressed = false;
          document.getElementById(target.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          syscall(`$ cd /${target.id}`);
        }
        return;
      }
      // Dedicated shortcuts
      if (key === "j") {
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
        return;
      }
      if (key === "k") {
        window.scrollBy({ top: -window.innerHeight * 0.85, behavior: "smooth" });
        return;
      }
      if (key === "r") {
        window.dispatchEvent(new CustomEvent("portfolio-action", { detail: "reset-canvas" }));
        syscall("$ rm -rf ./canvas.lock");
        return;
      }
      if (key === "t") {
        toggleTheme();
        syscall("$ chmod +x ./theme.sh");
        return;
      }
      if (key === "b") {
        toggleAviary();
        return;
      }
      if (key === "i") {
        toggleInverse();
        return;
      }
      if (key === "s") {
        setIdle(true);
        syscall("$ /sbin/screensaver --start");
        return;
      }

      // Type-to-search: any single printable key opens cmdk with that char
      if (!cmdOpen && !helpOpen && !aviaryOpen && e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Skip the dedicated shortcut letters and `g` (handled above)
        const reserved = new Set(["g", "j", "k", "r", "t", "b", "i", "s", "?"]);
        if (reserved.has(key)) return;
        e.preventDefault();
        setCmdSeed(e.key);
        setCmdOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [toggleTheme, toggleAviary, toggleInverse, cmdOpen, helpOpen, aviaryOpen]);

  // Click syscalls — wired via event delegation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const proj = t.closest(".proj") as HTMLElement | null;
      if (proj) {
        const title = proj.querySelector(".title")?.textContent?.toLowerCase().replace(/\s+/g, "-");
        if (title) syscall(`$ open ${title}.exe`);
        return;
      }
      if (t.closest(".write-card .read")) {
        syscall("$ less /writing/essay.md");
        return;
      }
      if (t.closest(".station")) {
        syscall("$ cat /cv/role.log");
        return;
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <BootOverlay />
      <HudFrame />
      <StatusBar
        onCommandClick={openCmd}
        onHelpClick={openHelp}
        inverse={inverse}
        onInverseClick={toggleInverse}
      />
      <CustomCursor />

      <Hero />
      <WorkCanvas />
      <About />
      <Process />
      <Writing />
      <Resume />
      <Now />
      <Contact />
      <Footer />

      <KeysFooter />
      <CommandPalette
        open={cmdOpen}
        seed={cmdSeed}
        onClose={() => {
          setCmdOpen(false);
          setCmdSeed("");
        }}
        toggleTheme={toggleTheme}
        toggleAviary={toggleAviary}
        toggleInverse={toggleInverse}
        startScreensaver={startScreensaver}
      />
      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Aviary open={aviaryOpen} />
      <Screensaver active={idle && !cmdOpen && !helpOpen && !aviaryOpen} />
    </>
  );
}
