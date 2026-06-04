import { SectionIdx } from "@/components/chrome/SectionIdx";

export function About() {
  return (
    <section id="about" className="section">
      <div className="section-label">
        <SectionIdx value="03 / 09" />
        <span>About</span>
      </div>
      <div className="two-col">
        <div className="about-body">
          I&apos;m a <span className="accent">full-stack developer</span> who came to code the long way around —
          <em> five years in a classroom, a stint behind a bank counter, an accountant&apos;s chair </em>— before finding
          that interfaces were the thing I actually wanted to build.
        </div>
        <div className="about-side">
          <div className="row">
            <span className="k">based</span>
            <span className="v">Kathmandu, Nepal</span>
          </div>
          <div className="row">
            <span className="k">studied</span>
            <span className="v">PG Diploma, CS · Purbanchal Univ.</span>
          </div>
          <div className="row">
            <span className="k">also</span>
            <span className="v">BTEC IT · BBS · Nepalaya</span>
          </div>
          <div className="row">
            <span className="k">working at</span>
            <span className="v">One Accord (remote, US)</span>
          </div>
          <div className="row">
            <span className="k">before</span>
            <span className="v">Webpoint · Motherland · Sipradi · SBI</span>
          </div>
          <div className="row">
            <span className="k">stack</span>
            <span className="v">react · next · ts · go</span>
          </div>
          <div className="row">
            <span className="k">certs</span>
            <span className="v">IELTS · freeCodeCamp JS/DSA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
