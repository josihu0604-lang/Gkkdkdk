export default function TrustBar(){
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"1rem",opacity:.8}}>
      {["PartnerA","PartnerB","PartnerC","PartnerD","PartnerE"].map(x=>
        <div key={x} className="card" style={{textAlign:"center"}}>{x}</div>
      )}
    </div>
  );
}
