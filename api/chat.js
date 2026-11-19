import policy from '../server/chat-policy.cjs';

export default async function handler(req,res){
  const origin=req.headers.origin;
  let sameOrigin=false;
  try { sameOrigin=new URL(origin).host===req.headers.host; } catch {}
  if(!sameOrigin)return res.status(403).json({error:'Niet toegestaan.'});
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Gebruik het chatvenster voor een vraag.'});
  const messages=req.body?.messages;
  if(!Array.isArray(messages)||!messages.length||messages.length>12||messages.at(-1)?.role!=='user'||messages.some(m=>!['user','assistant'].includes(m?.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>2000)||JSON.stringify(messages).length>12000)return res.status(400).json({error:'Stel een korte productvraag, of bel 06-155 888 43.'});
  if(policy.technical(messages.at(-1).content))return res.status(200).json({reply:policy.contact});
  if(!process.env.GROQ_API_KEY)return res.status(503).json({error:'Productadvies is tijdelijk niet beschikbaar. Bel 06-155 888 43.'});
  try {
    const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.GROQ_API_KEY},
      signal:AbortSignal.timeout(15000),
      body:JSON.stringify({model:'llama-3.1-8b-instant',max_tokens:400,messages:[{role:'system',content:policy.system},...messages]})
    });
    const data=await response.json();
    if(!response.ok||typeof data.choices?.[0]?.message?.content!=='string')throw Error('Unavailable');
    return res.status(200).json({reply:data.choices[0].message.content});
  }catch{return res.status(502).json({error:'We konden geen antwoord ophalen. Bel 06-155 888 43 of mail info@nijtec.nl.'});}
}
