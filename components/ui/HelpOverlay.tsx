"use client";

type Props = { open: boolean; onClose: () => void };

export function HelpOverlay({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="help-shroud" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <h3>Keyboard.</h3>
        <div className="help-row">
          <span>Command palette</span>
          <kbd>⌘K</kbd>
        </div>
        <div className="help-row">
          <span>This help</span>
          <kbd>?</kbd>
        </div>
        <div className="help-row">
          <span>Scroll down / up</span>
          <span>
            <kbd>J</kbd>
            <kbd>K</kbd>
          </span>
        </div>
        <div className="help-row">
          <span>Jump to section</span>
          <span>
            <kbd>G</kbd> + <kbd>h/w/a/p/r/c/n/x</kbd>
          </span>
        </div>
        <div className="help-row">
          <span>Reset project canvas</span>
          <kbd>R</kbd>
        </div>
        <div className="help-row">
          <span>Cycle theme (dark / light / crt / …)</span>
          <kbd>T</kbd>
        </div>
        <div className="help-row">
          <span>Toggle aviary (shoot birds)</span>
          <kbd>B</kbd>
        </div>
        <div className="help-row">
          <span>Start screensaver</span>
          <kbd>S</kbd>
        </div>
        <div className="help-row">
          <span>Type anywhere to search</span>
          <span style={{ color: "var(--paper-dim)" }}>a–z, 0–9</span>
        </div>
        <div className="help-row">
          <span>Close any overlay</span>
          <kbd>Esc</kbd>
        </div>
        <p style={{ fontSize: 11, color: "var(--paper-dim)", marginTop: 18, lineHeight: 1.55 }}>
          this whole site is keyboard-first. mouse works too — drag the project cards, click writing to cycle.
        </p>
      </div>
    </div>
  );
}
