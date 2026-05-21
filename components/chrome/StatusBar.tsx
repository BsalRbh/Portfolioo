"use client";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  onCommandClick: () => void;
  onHelpClick: () => void;
  onAviaryClick: () => void;
};

type BatteryInfo = { level: number; charging: boolean } | null;

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}
interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
  connection?: { effectiveType?: string; downlink?: number };
}

const DEFAULT_LOCATION = "KATHMANDU, NP · 27.71° N";

export function StatusBar({ onCommandClick, onHelpClick, onAviaryClick }: Props) {
  const [clock, setClock] = useState("--:--:--");
  const [battery, setBattery] = useState<BatteryInfo>(null);
  const [net, setNet] = useState<string>("");
  const [syscall, setSyscall] = useState<string | null>(null);

  // Clock
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Battery
  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) return;
    let mgr: BatteryManager | null = null;
    const update = () => {
      if (!mgr) return;
      setBattery({ level: mgr.level, charging: mgr.charging });
    };
    nav.getBattery().then((b) => {
      mgr = b;
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    }).catch(() => {});
    return () => {
      if (mgr) {
        mgr.removeEventListener("levelchange", update);
        mgr.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  // Network
  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    const conn = nav.connection;
    if (!conn) return;
    const update = () => {
      const eff = conn.effectiveType?.toUpperCase() ?? "";
      setNet(eff);
    };
    update();
  }, []);

  // Syscall log: listen for portfolio-syscall events and replace location for 1500ms
  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    const onSyscall = (e: Event) => {
      const ce = e as CustomEvent<string>;
      setSyscall(ce.detail);
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => setSyscall(null), 1500);
    };
    window.addEventListener("portfolio-syscall", onSyscall as EventListener);
    return () => {
      window.removeEventListener("portfolio-syscall", onSyscall as EventListener);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  const batteryLabel = battery
    ? `BAT ${Math.round(battery.level * 100)}%${battery.charging ? "⚡" : ""}`
    : null;

  return (
    <div className="statusbar">
      <div className="group">
        <span>
          <span className="dot" />
          EMPLOYED · ONE ACCORD
        </span>
        <span className={"syscall-slot" + (syscall ? " active" : "")}>
          {syscall ?? DEFAULT_LOCATION}
        </span>
      </div>
      <div className="group">
        {batteryLabel && <span className="meter">{batteryLabel}</span>}
        {net && <span className="meter">NET · {net}</span>}
        <button type="button" className="pill" onClick={onCommandClick}>
          ⌘K · COMMAND
        </button>
        <button type="button" className="pill" onClick={onAviaryClick}>
          B · GAME
        </button>
        <button type="button" className="pill" onClick={onHelpClick}>
          ? · KEYS
        </button>
        <ThemeToggle />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{clock}</span>
      </div>
    </div>
  );
}
