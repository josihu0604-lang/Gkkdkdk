export async function submitLead(body:any){
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,'') + "/api/v1/leads",{
    method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body)
  }).catch(()=>({ok:false}));
  return res ?? { ok:false };
}
