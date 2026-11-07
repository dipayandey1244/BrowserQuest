// Cloudflare Worker — deploy separately from GitHub Pages.
// Set GROQ_API_KEY as a secret; never commit it or send it to the browser.
const ORIGIN = "https://dipayandey1244.github.io";
const ROLES = {
 engineer: "You are Mira, a cautious civil engineer. Evaluate structural uncertainty and evidence. Avoid false precision.",
 humanitarian: "You are Asha, a humanitarian response coordinator. Prioritize vulnerable residents and explain equity tradeoffs.",
 economist: "You are Ravi, a resource economist. Analyze scarcity, incentives, opportunity costs, and long-term recovery.",
 mediator: "You are Noor, a negotiation and trust specialist. Consider legitimacy, incentives, consent, and communication."
};
function json(body,status=200,origin=ORIGIN){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":origin,"vary":"Origin","cache-control":"no-store","x-content-type-options":"nosniff"}})}
export default {
 async fetch(request,env){
  const origin=request.headers.get("Origin");
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":ORIGIN,"access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"Content-Type","access-control-max-age":"3600"}});
  if(request.method!=="POST")return json({error:"POST only"},405);
  if(origin!==ORIGIN)return json({error:"Origin not allowed"},403);
  if(!env.GROQ_API_KEY)return json({error:"Server is not configured with GROQ_API_KEY"},503);
  const length=Number(request.headers.get("content-length")||0);
  if(length>5000)return json({error:"Request too large"},413);
  let body;try{body=await request.json()}catch{return json({error:"Invalid JSON"},400)}
  if(!ROLES[body.agent]||!Number.isInteger(body.stage)||body.stage<0||body.stage>3||typeof body.scenario!=="string"||body.scenario.length>1100)return json({error:"Invalid request"},400);
  const state=body.state||{};
  const summary={safe:Math.max(0,Math.min(120,Number(state.safe)||0)),trust:Math.max(0,Math.min(100,Number(state.trust)||0)),funds:Math.max(0,Math.min(100,Number(state.funds)||0)),risk:Math.max(0,Math.min(100,Number(state.risk)||0))};
  // For production: add Cloudflare WAF rate limiting, Turnstile verification, and usage budgets.
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const upstream=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",signal:controller.signal,headers:{"authorization":"Bearer "+env.GROQ_API_KEY,"content-type":"application/json"},body:JSON.stringify({model:env.GROQ_MODEL||"llama-3.3-70b-versatile",temperature:0.45,max_tokens:300,messages:[{role:"system",content:ROLES[body.agent]+" You are a fictional advisor in a decision-making simulation. Give concise, actionable advice, mention one uncertainty and one potential unintended consequence. Do not claim to have run tools or know real-time facts. You advise but never modify world state."},{role:"user",content:JSON.stringify({chapter:body.stage,scenario:body.scenario,state:summary})}]})});
   if(!upstream.ok)return json({error:"Advisor temporarily unavailable"},502);
   const result=await upstream.json();const reply=result?.choices?.[0]?.message?.content;
   if(typeof reply!=="string"||!reply.trim())return json({error:"Empty advisor response"},502);
   return json({reply:reply.slice(0,2200),model:result.model||"Groq"});
  }catch{return json({error:"Advisor request timed out or failed"},504)}finally{clearTimeout(timeout)}
 }
};