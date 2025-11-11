export default function FeatureGrid(){
  const items = [
    {t:"서버측 지오펜스",d:"PostGIS ST_DWithin(geography)로 반경 판정"},
    {t:"GPS 무결성 5요소",d:"거리40·Wi‑Fi25·시간15·정확도10·속도10 / 60점 통과"},
    {t:"PII 최소화",d:"로그에 좌표·연락처 미저장, SSID 7일 후 삭제/해시"},
    {t:"멱등 처리",d:"Idempotency-Key 기반 중복 방지"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"1rem"}}>
      {items.map(i=>(
        <div key={i.t} className="card">
          <div style={{fontWeight:700,marginBottom:".25rem"}}>{i.t}</div>
          <div className="subtitle">{i.d}</div>
        </div>
      ))}
    </div>
  );
}
