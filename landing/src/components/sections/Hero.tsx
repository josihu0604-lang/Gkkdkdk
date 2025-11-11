import Button from "@/components/ui/Button";
export default function Hero(){
  return (
    <section style={{padding:"4rem 0"}}>
      <div className="container" style={{display:"grid",gap:"1.25rem"}}>
        <h1 style={{fontSize:"2.5rem",fontWeight:800,letterSpacing:"-0.02em"}}>위치 무결성으로 체크인 사기 차단</h1>
        <p className="subtitle">DB ST_DWithin + 5요소 무결성(거리·Wi‑Fi·시간·정확도·속도)로 현장 방문을 증명합니다.</p>
        <div style={{display:"flex",gap:".75rem"}}>
          <a className="btn" href="#lead">데모 상담</a>
          <a className="btn" style={{background:"transparent",color:"oklch(50% 0.18 290)",border:"1px solid oklch(50% 0.18 290)"}} href="#features">제품 기능</a>
        </div>
      </div>
    </section>
  );
}
