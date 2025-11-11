import axios from "axios";

function idemKey(payload:any){ // 간단 멱등 키
  const raw = JSON.stringify(payload) + ":" + Date.now().toString().slice(0,9);
  let h=0; for(let i=0;i<raw.length;i++){ h=(h*31 + raw.charCodeAt(i))>>>0; }
  return "idem-"+h.toString(16);
}

const API = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/,'');

export async function checkin({ latitude, longitude, accuracy, timestamp }:{
  latitude:number; longitude:number; accuracy:number; timestamp:string;
}):Promise<boolean>{
  try{
    const headers = { "Idempotency-Key": idemKey({latitude,longitude,timestamp}) };
    const body = { placeId: undefined, hospitalId: undefined, latitude, longitude, accuracy, timestamp };
    const res = await axios.post(API+"/api/v1/checkins", body, { headers });
    return res.status >= 200 && res.status < 300 && !!res.data;
  }catch{ return false; }
}
