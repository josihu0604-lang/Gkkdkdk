"use client";
import { useState } from "react";
import { submitLead } from "@/lib/api";
export default function LeadForm(){
  const [loading,setLoading]=useState(false);
  const [ok,setOk]=useState(false);
  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    const r = await submitLead(data);
    setOk(r.ok); setLoading(false);
  }
  return (
    <form id="lead" onSubmit={onSubmit} className="card" style={{display:"grid",gap:".5rem"}}>
      <label>회사명<input name="business_name" required className="card" /></label>
      <label>담당자<input name="contact_name" required className="card" /></label>
      <label>이메일<input name="email" type="email" required className="card" /></label>
      <label>전화번호<input name="phone" required className="card" /></label>
      <button className="btn" disabled={loading}>{loading?"전송 중":"상담 신청"}</button>
      {ok && <div className="subtitle">제출되었습니다. 영업일 기준 1일 내 회신합니다.</div>}
    </form>
  );
}
