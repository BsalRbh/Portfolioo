import { STYLES, styleHref, type StyleId } from "@/lib/styles";
import { SwitcherDismiss } from "./SwitcherDismiss";
import "./edition-switch.css";

/**
 * Floating "edition" switcher. No JS: a <details> menu of plain links to
 * "/?style=<id>", which middleware turns into a remembered preference.
 * Each edition themes it via the --ed-* CSS variables on its wrapper.
 */
export function EditionSwitcher({ current }: { current: StyleId }) {
  const active = STYLES.find((s) => s.id === current);
  return (
    <details className="edition-switch">
      <summary>
        <span className="edition-switch__label">Edition</span>
        <span className="edition-switch__current">{active?.name}</span>
      </summary>
      <SwitcherDismiss />
      <ul>
        {STYLES.map((s) => (
          <li key={s.id}>
            <a
              href={styleHref(s.id)}
              rel="nofollow"
              aria-current={s.id === current ? "true" : undefined}
            >
              <span className={`edition-chip edition-chip--${s.id}`} aria-hidden />
              <span>
                <strong>{s.name}</strong>
                <small>{s.blurb}</small>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
