// Illustrations for the Kathmandu edition. All decorative → aria-hidden.

/** Himalayan skyline seen from the valley on a clear morning. */
export function Himalaya() {
  return (
    <svg className="k-himalaya" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
      {/* far range */}
      <path
        className="k-himalaya__far"
        d="M0 210 L90 150 L150 175 L240 96 L300 140 L380 70 L450 128 L520 104 L600 40 L660 96 L720 82 L790 128 L860 58 L930 110 L1010 88 L1080 140 L1160 72 L1230 120 L1310 98 L1380 138 L1440 118 L1440 260 L0 260 Z"
      />
      {/* snow on the far peaks */}
      <path
        className="k-himalaya__snow"
        d="M222 112 L240 96 L262 116 L250 112 L240 122 Z M362 86 L380 70 L404 92 L388 88 L378 98 Z M578 60 L600 40 L626 66 L610 60 L598 72 L590 62 Z M842 74 L860 58 L884 82 L868 78 L858 88 Z M1142 88 L1160 72 L1184 94 L1168 90 L1158 100 Z"
      />
      {/* near hills around the valley */}
      <path
        className="k-himalaya__near"
        d="M0 232 C120 196 220 214 330 200 C450 186 520 222 640 214 C780 204 860 176 1000 192 C1120 206 1220 186 1330 198 C1390 204 1420 212 1440 214 L1440 260 L0 260 Z"
      />
    </svg>
  );
}

/**
 * A three-tier Newar pagoda: brick plinth, carved struts, two tiled roofs and a
 * gilded top roof under the gajur (pinnacle). Each tier is its own group so the
 * roofs can settle into place one after another on load.
 */
export function Pagoda() {
  return (
    <svg className="k-pagoda" viewBox="0 0 400 470" aria-hidden focusable="false">
      <defs>
        <pattern id="k-brick-sm" width="20" height="10" patternUnits="userSpaceOnUse">
          <rect width="20" height="10" fill="#a9492c" />
          <path d="M0 0.5 H20 M0 5.5 H20 M0.5 0 V5 M10.5 5 V10" stroke="#5e2414" strokeOpacity=".55" strokeWidth="1" />
        </pattern>
        <linearGradient id="k-gilt" x1="0" x2="1">
          <stop offset="0" stopColor="#b8862c" />
          <stop offset=".45" stopColor="#f0c862" />
          <stop offset="1" stopColor="#a5761f" />
        </linearGradient>
      </defs>

      {/* plinth: stepped brick base */}
      <g className="k-pagoda__base">
        <rect x="40" y="446" width="320" height="24" fill="url(#k-brick-sm)" />
        <rect x="62" y="424" width="276" height="22" fill="url(#k-brick-sm)" />
        <rect x="84" y="404" width="232" height="20" fill="url(#k-brick-sm)" />
        <path d="M40 446 H360 M62 424 H338 M84 404 H316" stroke="#3a1a10" strokeWidth="2" />
        {/* ground-floor body with three doors */}
        <rect x="114" y="330" width="172" height="74" fill="url(#k-brick-sm)" />
        <rect x="114" y="330" width="172" height="10" fill="#23150f" />
        <g fill="#140b07" stroke="#4a2e1f" strokeWidth="2">
          <path d="M140 404 V362 Q153 348 166 362 V404 Z" />
          <path d="M187 404 V358 Q200 342 213 358 V404 Z" />
          <path d="M234 404 V362 Q247 348 260 362 V404 Z" />
        </g>
        {/* struts (tundal) under the first roof */}
        <g stroke="#3b2418" strokeWidth="5" strokeLinecap="round">
          <path d="M120 340 L74 300" />
          <path d="M152 340 L130 300" />
          <path d="M248 340 L270 300" />
          <path d="M280 340 L326 300" />
        </g>
      </g>

      {/* tier 1 — widest roof */}
      <g className="k-pagoda__tier k-pagoda__tier--1">
        <path d="M112 262 H288 L378 318 Q200 304 22 318 Z" fill="#2f1f18" />
        <path d="M22 318 Q200 304 378 318" fill="none" stroke="#c9963a" strokeWidth="3" />
        <path d="M112 262 H288" stroke="#4d3226" strokeWidth="3" />
        <g fill="#d6a441">
          <circle cx="26" cy="326" r="4" />
          <circle cx="374" cy="326" r="4" />
          <circle cx="110" cy="322" r="3" />
          <circle cx="290" cy="322" r="3" />
        </g>
      </g>

      {/* tier 2 — middle body + roof */}
      <g className="k-pagoda__tier k-pagoda__tier--2">
        <rect x="140" y="214" width="120" height="48" fill="url(#k-brick-sm)" />
        <rect x="140" y="214" width="120" height="8" fill="#23150f" />
        <g fill="#140b07">
          <rect x="166" y="232" width="18" height="22" />
          <rect x="216" y="232" width="18" height="22" />
        </g>
        <g stroke="#3b2418" strokeWidth="4" strokeLinecap="round">
          <path d="M146 224 L110 196" />
          <path d="M254 224 L290 196" />
        </g>
        <path d="M144 166 H256 L326 210 Q200 200 74 210 Z" fill="#2f1f18" />
        <path d="M74 210 Q200 200 326 210" fill="none" stroke="#c9963a" strokeWidth="3" />
        <g fill="#d6a441">
          <circle cx="78" cy="217" r="3.5" />
          <circle cx="322" cy="217" r="3.5" />
        </g>
      </g>

      {/* tier 3 — top body + gilded roof */}
      <g className="k-pagoda__tier k-pagoda__tier--3">
        <rect x="164" y="128" width="72" height="38" fill="url(#k-brick-sm)" />
        <rect x="164" y="128" width="72" height="7" fill="#23150f" />
        <rect x="190" y="142" width="20" height="18" fill="#140b07" />
        <path d="M170 82 H230 L282 124 Q200 116 118 124 Z" fill="url(#k-gilt)" />
        <path d="M118 124 Q200 116 282 124" fill="none" stroke="#8a611a" strokeWidth="2" />
      </g>

      {/* gajur — the gilded pinnacle */}
      <g className="k-pagoda__gajur">
        <path d="M184 82 Q200 64 216 82 Z" fill="url(#k-gilt)" />
        <ellipse cx="200" cy="62" rx="11" ry="9" fill="url(#k-gilt)" />
        <path d="M193 54 Q200 30 207 54 Z" fill="url(#k-gilt)" />
        <path d="M200 30 V14" stroke="#d6a441" strokeWidth="3" strokeLinecap="round" />
        <circle cx="200" cy="11" r="4" fill="#f0c862" />
      </g>
    </svg>
  );
}

export function Pigeon() {
  return (
    <svg className="k-pigeon__bird" viewBox="0 0 40 30" aria-hidden focusable="false">
      <path
        d="M6 20 Q4 12 12 10 Q16 4 22 6 Q26 7 27 11 L31 12 L27 14 Q28 20 22 22 L14 23 Q8 26 2 25 Z"
        fill="#3e3a3c"
      />
      <path className="k-pigeon__wing" d="M15 14 Q20 12 24 16" fill="none" stroke="#6b676a" strokeWidth="1.5" />
      <circle cx="24" cy="10" r="1" fill="#e8a23a" />
      <path d="M17 23 V28 M21 22 V28" stroke="#c76a4a" strokeWidth="1.2" />
    </svg>
  );
}
