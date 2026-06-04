import { SectionIdx } from "@/components/chrome/SectionIdx";

export function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="section-label">
        <SectionIdx value="09 / 09" />
        <span>Contact</span>
      </div>
      <div className="contact-shell">
        <div className="contact-lines">
          <div className="line">
            <span className="prompt">$</span>whoami
          </div>
          <div className="line out">bishal rajbahak — full-stack developer (react/next · go)</div>
          <div className="line">
            <span className="prompt">$</span>cat contact.txt
          </div>
          <div className="line out">
            email:&nbsp;&nbsp;&nbsp;<a href="mailto:bsl.rbh@gmail.com">bsl.rbh@gmail.com</a>
          </div>
          <div className="line out">
            linked:&nbsp;&nbsp;
            <a href="https://www.linkedin.com/in/bishalrajbahak" target="_blank" rel="noreferrer">
              linkedin.com/in/bishalrajbahak
            </a>
          </div>
          <div className="line out">
            fb:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a href="https://www.facebook.com/bsal.rbh/" target="_blank" rel="noreferrer">
              facebook.com/bsal.rbh
            </a>
          </div>
          <div className="line out">
            ig:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a href="https://www.instagram.com/bsal.rbh/" target="_blank" rel="noreferrer">
              instagram.com/bsal.rbh
            </a>
          </div>
          <div className="line out">based:&nbsp;&nbsp;&nbsp;kathmandu, nepal · utc+05:45</div>
          <div className="line out">working:&nbsp;one accord · remote, full-time</div>
          <div className="line">
            <span className="prompt">$</span>availability
          </div>
          <div className="line out" style={{ color: "var(--accent)" }}>
            OPEN · happy to chat about interesting product work
          </div>
          <div className="line">
            <span className="prompt">$</span>
            <span className="cursor-blink" />
          </div>
        </div>
      </div>
    </section>
  );
}
