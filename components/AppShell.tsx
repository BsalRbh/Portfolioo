"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { cycleMode, restoreMode } from "@/lib/visualMode";
import { BootOverlay } from "./chrome/BootOverlay";
import { HudFrame } from "./chrome/HudFrame";
import { StatusBar } from "./chrome/StatusBar";
import { KeysFooter } from "./chrome/KeysFooter";
import { CustomCursor } from "./chrome/CustomCursor";
import { MobileFab } from "./chrome/MobileFab";
import { AwayOverlay } from "./ui/AwayOverlay";
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
import type { PostMeta } from "@/lib/posts.types";

function syscall(line: string) {
  window.dispatchEvent(new CustomEvent("portfolio-syscall", { detail: line }));
}

export function AppShell({ posts }: { posts: PostMeta[] }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdSeed, setCmdSeed] = useState<string>("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [aviaryOpen, setAviaryOpen] = useState(false);
  const [idle, setIdle] = useState(false);

  // Restore the last chosen visual mode (dark / light / crt / newspaper / blueprint / neon)
  useEffect(() => {
    restoreMode();
  }, []);


  // Devtools easter egg — fires once per page load.
  useEffect(() => {
    const banner = [
      "",
      "  ██████╗ ██╗███████╗██╗  ██╗ █████╗ ██╗     ",
      "  ██╔══██╗██║██╔════╝██║  ██║██╔══██╗██║     ",
      "  ██████╔╝██║███████╗███████║███████║██║     ",
      "  ██╔══██╗██║╚════██║██╔══██║██╔══██║██║     ",
      "  ██████╔╝██║███████║██║  ██║██║  ██║███████╗",
      "  ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝",
      "",
    ].join("\n");
    const accent = "color:#c8ff00;font-family:ui-monospace,monospace;font-weight:700";
    const dim = "color:#b8b3a6;font-family:ui-monospace,monospace";
    const link = "color:#c8ff00;font-family:ui-monospace,monospace;text-decoration:underline";

    const bold = "color:#f3efe6;font-family:ui-monospace,monospace;font-weight:700";

    console.log(`%c${banner}`, accent);
    console.log("%c// hey, fellow dev.", bold);
    console.log("");
    console.log(
      "%cif you got here it's because you do this too —",
      dim,
    );
    console.log(
      "%copen devtools first, read the page later. respect.",
      dim,
    );
    console.log("");
    console.log("%c// stack you're looking at:", dim);
    console.log("%c  next.js 15 · react 19 · typescript · tailwind 4", dim);
    console.log("%c  no analytics, no trackers, no service worker.", dim);
    console.log("%c  ~970 lines of plain css, one global stylesheet.", dim);
    console.log("");
    console.log("%c// things that took longer than they should have:", dim);
    console.log("%c  · the draggable project canvas (lib/projects.ts)", dim);
    console.log("%c  · 6-mode theme cycle without flash on reload (lib/visualMode.ts)", dim);
    console.log("%c  · making the cursor not feel laggy on safari", dim);
    console.log("");
    console.log("%c// things i'm proud of:", dim);
    console.log("%c  press B  → shoot some birds. real game, real game-over.", dim);
    console.log("%c  press T  → cycle visual modes (try newspaper).", dim);
    console.log("%c  type anything → cmdk opens with that char seeded.", dim);
    console.log("");
    console.log("%c// if you want to talk shop:", bold);
    console.log("%c  %cbsl.rbh@gmail.com", dim, link);
    console.log("");
    console.log("");
  }, []);

  const openCmd = useCallback(() => {
    setCmdSeed("");
    setCmdOpen(true);
  }, []);
  const openHelp = useCallback(() => setHelpOpen(true), []);
  const toggleAviary = useCallback(() => {
    setAviaryOpen((o) => !o);
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

  // Idle screensaver: 45s of no input. Mount once; listeners reset timer.
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
      }, 45000);
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
        cycleMode();
        return;
      }
      if (key === "b") {
        toggleAviary();
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
        const reserved = new Set(["g", "j", "k", "r", "t", "b", "s", "?"]);
        if (reserved.has(key)) return;
        e.preventDefault();

        // Ghost letter — visual proof that the key just opened the launcher
        const ghost = document.createElement("div");
        ghost.className = "ghost-letter";
        ghost.textContent = e.key.toUpperCase();
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 450);

        setCmdSeed(e.key);
        setCmdOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [toggleAviary, cmdOpen, helpOpen, aviaryOpen]);

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

  // Hover whisper — each project card emits its own fake syscall while hovered.
  useEffect(() => {
    let current: HTMLElement | null = null;
    const onOver = (e: MouseEvent) => {
      const proj = (e.target as HTMLElement | null)?.closest(".proj") as HTMLElement | null;
      if (!proj || proj === current) return;
      current = proj;
      const whisper = proj.dataset.whisper;
      if (whisper) syscall(whisper);
    };
    const onOut = (e: MouseEvent) => {
      const proj = (e.target as HTMLElement | null)?.closest(".proj") as HTMLElement | null;
      const related = (e.relatedTarget as HTMLElement | null)?.closest(".proj");
      if (proj && !related) current = null;
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      <BootOverlay />
      <HudFrame />
      <StatusBar
        onCommandClick={openCmd}
        onHelpClick={openHelp}
        onAviaryClick={toggleAviary}
      />
      <CustomCursor />

      <Hero />
      <WorkCanvas />
      <About />
      <Process />
      <Writing posts={posts} />
      <Resume />
      <Now />
      <Contact />
      <Footer />

      <KeysFooter />
      <MobileFab
        onCommand={openCmd}
        onHelp={openHelp}
        onAviary={toggleAviary}
        onTheme={cycleMode}
        onScreensaver={startScreensaver}
      />
      <CommandPalette
        open={cmdOpen}
        seed={cmdSeed}
        onClose={() => {
          setCmdOpen(false);
          setCmdSeed("");
        }}
        toggleTheme={cycleMode}
        toggleAviary={toggleAviary}
        startScreensaver={startScreensaver}
      />
      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Aviary open={aviaryOpen} />
      <Screensaver active={idle && !cmdOpen && !helpOpen && !aviaryOpen} />
      <AwayOverlay />
    </>
  );
}
