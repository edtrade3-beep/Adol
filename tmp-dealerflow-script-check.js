
let pricedRows=[];
let lastCarfaxHighlights=[];

document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-tab]");
  if(!btn)return;
  showTab(btn.dataset.tab);
});
function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  const tab=document.getElementById(id); if(tab)tab.classList.add("active");
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
}
function val(id){return document.getElementById(id)?.value?.trim()||""}
function set(id,v){const e=document.getElementById(id); if(e)e.value=v||""}
function money(n){return "$"+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0})}
function num(v){return Number(String(v||"").replace(/[^0-9.]/g,""))||0}
function safe(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function cap(s){return String(s||"").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}

function parseCSV(text){
  const rows=[]; let row=[],cur="",q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c=='"'&&q&&n=='"'){cur+='"';i++;continue}
    if(c=='"'){q=!q;continue}
    if(c==","&&!q){row.push(cur);cur="";continue}
    if((c=="\n"||c=="\r")&&!q){if(c=="\r"&&n=="\n")i++;row.push(cur);cur="";if(row.some(x=>x.trim()))rows.push(row);row=[];continue}
    cur+=c;
  }
  row.push(cur); if(row.some(x=>x.trim()))rows.push(row);
  return rows;
}
function norm(h){return String(h||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
function col(headers,names){
  const h=headers.map(norm);
  for(const n of names){let i=h.indexOf(norm(n)); if(i>=0)return i}
  for(let i=0;i<h.length;i++){if(names.some(n=>h[i].includes(norm(n))))return i}
  return -1;
}
function handleCsvImport(){
  const f=document.getElementById("csvFile").files[0];
  if(!f){alert("Choose CSV first.");return}
  const r=new FileReader();
  r.onload=e=>processCsv(e.target.result);
  r.readAsText(f);
}
function processCsv(text){
  const rows=parseCSV(text); if(rows.length<2){alert("CSV empty.");return}
  const h=rows[0];
  const idx={
    vin:col(h,["vin"]),
    year:col(h,["year"]),
    make:col(h,["make"]),
    model:col(h,["model"]),
    trim:col(h,["trim","series"]),
    miles:col(h,["miles","mileage","odometer"]),
    price:col(h,["price","retail","asking","internet"]),
    days:col(h,["days in inventory","daysininventory","days on lot","daysonlot","age days","days old"]),
    addedDate:col(h,["date added","added date","stock date","in date","date in stock","acquired date","created at","list date"])
  };
  pricedRows=rows.slice(1).map(r=>priceVehicle({
    vin:r[idx.vin]||"",
    year:r[idx.year]||"",
    make:r[idx.make]||"",
    model:r[idx.model]||"",
    trim:r[idx.trim]||"",
    miles:r[idx.miles]||"",
    price:r[idx.price]||"",
    daysRaw: idx.days >= 0 ? (r[idx.days] || "") : "",
    addedDateRaw: idx.addedDate >= 0 ? (r[idx.addedDate] || "") : ""
  }));
  renderTable(pricedRows);
  const avg=pricedRows.reduce((s,r)=>s+r.avg,0)/(pricedRows.length||1);
  const withDays = pricedRows.filter(r => Number.isFinite(Number(r.daysOld))).length;
  document.getElementById("dashCount").textContent=pricedRows.length;
  document.getElementById("dashAvg").textContent=money(avg);
  document.getElementById("inventoryReport").textContent=`Imported: ${pricedRows.length}\nAverage Dealer Retail: ${money(avg)}\nVehicles with day-age data: ${withDays}\nSearch from the top-right search box.`;
}
function decode(row){
  let year=row.year,make=row.make,decoded=[];
  const vin=String(row.vin||"").toUpperCase();
  if(vin.length===17){
    decoded.push("VIN valid length");
    const ym={A:2010,B:2011,C:2012,D:2013,E:2014,F:2015,G:2016,H:2017,J:2018,K:2019,L:2020,M:2021,N:2022,P:2023,R:2024,S:2025,T:2026};
    if(!year&&ym[vin[9]])year=ym[vin[9]];
    const w=vin.slice(0,3),wm={"3GN":"Chevrolet","1GN":"Chevrolet","1GC":"Chevrolet","1G1":"Chevrolet","1FA":"Ford","1FM":"Ford","1FT":"Ford","5FP":"Honda","5FR":"Acura","2T3":"Toyota","5TD":"Toyota","WAU":"Audi","1C4":"Jeep"};
    if(!make&&wm[w])make=wm[w];
    if(wm[w])decoded.push("WMI: "+wm[w]);
  }
  if(/4x4|4wd/i.test(row.trim+" "+row.model))decoded.push("4X4");
  if(/awd/i.test(row.trim+" "+row.model))decoded.push("AWD");
  return {...row,year,make,decoded:decoded.join(", ")||"Manual data"};
}
function basePrice(r){
  let age=Math.max(0,2026-(num(r.year)||2018));
  let b=29500-age*1500;
  const make=String(r.make).toLowerCase(),model=String(r.model).toLowerCase(),trim=String(r.trim).toLowerCase();
  if(/toyota|honda|lexus|acura/.test(make))b+=2500;
  if(/chevrolet|ford|gmc|ram|jeep/.test(make))b+=1000;
  if(/equinox|traverse|pilot|highlander|mdx|wrangler|explorer|tahoe|suburban|rav4/.test(model))b+=4500;
  if(/f-150|silverado|sierra|ram/.test(model))b+=6500;
  if(/limited|ltz|denali|platinum|rubicon|premium|tech|technology/.test(trim))b+=3000;
  return Math.max(4500,b);
}
function payment(price){
  const down=num(val("defaultDown")||2000),apr=num(val("defaultApr")||12.9)/100,tax=num(val("defaultTax")||7.5)/100,fee=num(val("defaultFee")||442),term=72;
  const total=price+price*tax+fee-down,r=apr/12;
  return Math.round(total*r/(1-Math.pow(1+r,-term)));
}
function priceVehicle(row){
  const r=decode(row),m=num(r.miles),yp=num(r.price),expected=Math.max(20000,(2026-(num(r.year)||2018))*12000);
  let avg=Math.round((basePrice(r)+(expected-m)*0.055)/100)*100; avg=Math.max(3500,avg);
  const gap=yp?avg-yp:0;
  let daysOld = null;
  const daysDirect = Number(String(r.daysRaw || "").replace(/[^0-9.-]/g, ""));
  if (Number.isFinite(daysDirect) && daysDirect >= 0) {
    daysOld = Math.round(daysDirect);
  } else {
    const parsedDate = Date.parse(String(r.addedDateRaw || "").trim());
    if (Number.isFinite(parsedDate)) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const delta = Math.floor((Date.now() - parsedDate) / msPerDay);
      if (Number.isFinite(delta) && delta >= 0) daysOld = delta;
    }
  }
  let score="B",cls="scoreB"; if(yp&&gap>1500){score="A+";cls="scoreA"}else if(yp&&gap>500){score="A";cls="scoreA"}else if(yp&&gap<-1800){score="D";cls="scoreD"}else if(yp&&gap<-600){score="C";cls="scoreC"}
  return {...r,milesNum:m,yourPrice:yp,avg,fast:Math.round(avg*.94/100)*100,max:Math.round(avg*1.06/100)*100,trade:Math.round(avg*.72/100)*100,pmt:payment(avg),score,cls,daysOld};
}
function renderTable(rows){
  const tb=document.querySelector("#inventoryTable tbody");
  if(!rows.length){tb.innerHTML='<tr><td colspan="12">No matching vehicles.</td></tr>';return}
  tb.innerHTML=rows.map(r=>`<tr><td>${safe(r.vin)}</td><td><b>${safe(r.year)} ${safe(r.make)} ${safe(r.model)} ${safe(r.trim)}</b></td><td>${r.milesNum.toLocaleString()}</td><td>${money(r.yourPrice)}</td><td>${safe(r.decoded)}</td><td><b>${money(r.avg)}</b></td><td>${money(r.fast)}</td><td>${money(r.max)}</td><td>${money(r.trade)}</td><td>${money(r.pmt)}/mo</td><td class="${r.cls}">${r.score}</td><td><button class="secondary" onclick="loadToAd('${safe(r.vin)}')">Build Ad</button></td></tr>`).join("");
}
function searchInventoryTable(){
  const q=val("inventorySearchTop").toLowerCase();
  renderTable(pricedRows.filter(r=>Object.values(r).join(" ").toLowerCase().includes(q)));
}
function clearInventorySearch(){set("inventorySearchTop","");renderTable(pricedRows)}
function loadToAd(vin){
  const r=pricedRows.find(x=>x.vin===vin); if(!r)return;
  set("year",r.year);set("make",r.make);set("model",r.model);set("trim",r.trim);set("miles",r.milesNum);set("price",r.avg);
  const feats=[]; if(/awd|4x4|4wd/i.test(r.trim+" "+r.decoded))feats.push("AWD / 4X4"); feats.push("backup camera","Bluetooth","clean interior");
  set("features",feats.join(", "));
  showTab("builder"); generateAd();
}
function loadDemoInventory(){
  processCsv(`VIN,Year,Make,Model,Trim,Miles,Price
1C4HJXFN4LW336053,2020,Jeep,Wrangler Unlimited Rubicon 4x4 4dr SUV,4x4,18784,34900
1GNERGKW0KJ118950,2019,Chevrolet,Traverse LT Cloth 4dr SUV w/1LT,LT Cloth,179690,9500
3GNAXKEG1RS121277,2024,Chevrolet,Equinox LT 4dr SUV w/1LT,LT,49022,18900
3GNAXJEV6JS541307,2018,Chevrolet,Equinox LT 4dr SUV w/1LT,LT,180574,6900
2FMPK4J94RBA67933,2024,Ford,Edge SEL AWD 4dr SUV,SEL AWD,42069,21750`);
}
function generateAd(){
  const title=`${val("year")} ${cap(val("make"))} ${cap(val("model"))} ${val("trim")} – Clean – Financing Available`.replace(/\s+/g," ");
  const feats=val("features").split(",").map(x=>x.trim()).filter(Boolean).map(x=>"• "+x).join("\n");
  const ad=`${title}

Price: ${money(num(val("price")))}
Miles: ${num(val("miles")).toLocaleString()}

${feats}

Financing available based on approval.
All credit situations considered.
ITIN accepted.
Trade-ins welcome.

Send your down payment and target monthly payment and I’ll help you find the best option.

Dixie Motors
6416 Dixie Highway
Fairfield, OH 45014
513-874-4999`;
  document.getElementById("adOutput").textContent=ad;
  set("riskText",ad); scanRisk();
}

function calcDealerPayment(price, down, apr, term, taxRate=7.5, fee=442){
  price = Number(price || 0);
  down = Number(down || 0);
  apr = Number(apr || 0) / 100;
  term = Number(term || 72);
  taxRate = Number(taxRate || 0) / 100;
  fee = Number(fee || 0);

  const total = price + (price * taxRate) + fee - down;
  const monthlyRate = apr / 12;
  if(total <= 0) return 0;
  const payment = monthlyRate
    ? total * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term))
    : total / term;

  return Math.round(payment);
}

function vehicleTitle(){
  return `${val("year")} ${cap(val("make"))} ${cap(val("model"))} ${val("trim")} – Clean – Financing Available`.replace(/\s+/g," ").trim();
}

function featureBullets(){
  return val("features")
    .split(",")
    .map(x=>x.trim())
    .filter(Boolean)
    .map(x=>"• "+x)
    .join("\n");
}

function generateFinanceAd(){
  const price = num(val("price"));
  const miles = num(val("miles"));
  const title = vehicleTitle();
  const feats = featureBullets() || "• Clean interior\n• Runs and drives great";

  const p72 = calcDealerPayment(price, 2000, 6.99, 72);
  const p60 = calcDealerPayment(price, 2000, 6.99, 60);
  const p48 = calcDealerPayment(price, 2000, 6.99, 48);

  const ad = `${title}

Price: ${money(price)}
Miles: ${miles.toLocaleString()}

${feats}

Finance Payment Examples:
• ${money(p72)}/mo for 72 months with $2,000 down plus tax, title, and fees. w.a.c.
• ${money(p60)}/mo for 60 months with $2,000 down plus tax, title, and fees. w.a.c.
• ${money(p48)}/mo for 48 months with $2,000 down plus tax, title, and fees. w.a.c.

6.99% APR example based on approved credit.

Financing available based on approval.
All credit situations considered.
ITIN accepted.
Trade-ins welcome.

Send your down payment and target monthly payment and I’ll help you find the best option.

Dixie Motors
6416 Dixie Highway
Fairfield, OH 45014
513-874-4999`;

  document.getElementById("adOutput").textContent = ad;
  set("riskText", ad);
  scanRisk();
}

function generateCashAd(){
  const price = num(val("price"));
  const miles = num(val("miles"));
  const title = `${val("year")} ${cap(val("make"))} ${cap(val("model"))} ${val("trim")} – Clean – Cash Deal`.replace(/\s+/g," ").trim();
  const feats = featureBullets() || "• Clean interior\n• Runs and drives great";

  const ad = `${title}

Cash Price: ${money(price)}
Miles: ${miles.toLocaleString()}

${feats}

Clean vehicle, ready to go.
Trade-ins welcome.

Come see it today.

Dixie Motors
6416 Dixie Highway
Fairfield, OH 45014
513-874-4999`;

  document.getElementById("adOutput").textContent = ad;
  set("riskText", ad);
  scanRisk();
}

function generateDownPaymentAd(){
  const price = num(val("price"));
  const miles = num(val("miles"));
  const title = `${val("year")} ${cap(val("make"))} ${cap(val("model"))} ${val("trim")} – $1,500 Down Option`.replace(/\s+/g," ").trim();
  const feats = featureBullets() || "• Clean interior\n• Runs and drives great";

  const p72 = calcDealerPayment(price, 1500, 6.99, 72);
  const p60 = calcDealerPayment(price, 1500, 6.99, 60);
  const p48 = calcDealerPayment(price, 1500, 6.99, 48);

  const ad = `${title}

Price: ${money(price)}
Miles: ${miles.toLocaleString()}

${feats}

$1,500 Down Payment Option:
• ${money(p72)}/mo for 72 months with $1,500 down plus tax, title, and fees. w.a.c.
• ${money(p60)}/mo for 60 months with $1,500 down plus tax, title, and fees. w.a.c.
• ${money(p48)}/mo for 48 months with $1,500 down plus tax, title, and fees. w.a.c.

6.99% APR example based on approved credit.

Financing available based on approval.
All credit situations considered.
ITIN accepted.
Trade-ins welcome.

Send me your down payment and target monthly payment and I’ll help you find the best option.

Dixie Motors
6416 Dixie Highway
Fairfield, OH 45014
513-874-4999`;

  document.getElementById("adOutput").textContent = ad;
  set("riskText", ad);
  scanRisk();
}


function copyAd(){navigator.clipboard.writeText(document.getElementById("adOutput").textContent);alert("Ad copied.")}
function buildVehicleAlertText(row){
  const title = `${row.year} ${row.make} ${row.model} ${row.trim}`.replace(/\s+/g," ").trim();
  const miles = Number(row.milesNum || 0).toLocaleString();
  const daysOldText = Number.isFinite(Number(row.daysOld)) ? `${Number(row.daysOld)} days old` : "day-age not provided";
  const down = 1500;
  const apr = 6.99;
  const term = 72;
  const payment72 = calcDealerPayment(row.avg, down, apr, term);
  return `*** 🚗 ${title}
VIN: ${row.vin}
*** ✨${miles} miles. ${daysOldText}. Clean title, financing available, nice condition.

*** 🔑 Estimated start down payment: $${down.toLocaleString()}
Finance example: $${Number(payment72 || 0).toLocaleString()}/month for ${term} months at ${apr}% APR (qualified buyers)

*** 📩 Message with your budget and whether you have a trade. We can go over next steps and estimated options.

*** We work with all credit types. ITIN numbers accepted. Self-employed buyers welcome with bank statements. Subject to lender approval. Taxes, title, registration, and dealer fees not included. Payment examples are estimates only.`;
}
async function sendRecentVehicleAlerts(){
  if(!pricedRows.length){
    alert("Load inventory first.");
    return;
  }
  const qualified = pricedRows.filter(r => {
    const d = Number(r.daysOld);
    return Number.isFinite(d) && d >= 0 && d <= 10;
  });
  if(!qualified.length){
    document.getElementById("inventoryReport").textContent =
      `Imported: ${pricedRows.length}\nNo vehicles in 0-10 day range found for Telegram alerts.\nTip: Include "Days in Inventory" or "Date Added" column in CSV.`;
    return;
  }
  document.getElementById("inventoryReport").textContent =
    `Imported: ${pricedRows.length}\nSending ${qualified.length} recent (0-10 day) alerts to Telegram...`;

  let sent = 0;
  let failed = 0;
  let lastError = "";
  for(const row of qualified){
    try{
      const response = await fetch("/api/dealerflow/alert",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          title:`Recent Vehicle Alert (${Number(row.daysOld)} days old)`,
          message:buildVehicleAlertText(row)
        })
      });
      const data = await response.json().catch(()=>({}));
      if(!response.ok || data?.ok === false){
        failed += 1;
        lastError = data?.error || "Telegram send failed";
      }else{
        sent += 1;
      }
    }catch(err){
      failed += 1;
      lastError = err?.message || "Network error";
    }
  }

  document.getElementById("inventoryReport").textContent =
    `Imported: ${pricedRows.length}
Recent 0-10 day vehicles: ${qualified.length}
Alerts sent: ${sent}
Failed: ${failed}${lastError ? `\nLast error: ${lastError}` : ""}`;
}
async function sendTelegramAlert(){
  const outputEl = document.getElementById("adOutput");
  const statusEl = document.getElementById("telegramAlertStatus");
  const message = (outputEl?.textContent || "").trim();
  if(!message || /your ad will appear here\./i.test(message)){
    statusEl.textContent = "Telegram alert: generate an ad first.";
    return;
  }
  const vehicleTitle = `${val("year")} ${val("make")} ${val("model")} ${val("trim")}`.replace(/\s+/g," ").trim() || "Vehicle";
  statusEl.textContent = "Telegram alert: sending...";
  try{
    const res = await fetch("/api/dealerflow/alert",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({title:vehicleTitle,message})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok || data?.ok===false){
      throw new Error(data?.error || "Failed to send alert");
    }
    statusEl.textContent = `Telegram alert sent.\nChat: ${data?.chatIdMasked || "configured"}`;
  }catch(err){
    statusEl.textContent = `Telegram alert failed: ${err?.message || "Unknown error"}`;
  }
}
function fmtNy(iso){
  if(!iso) return "--";
  try{
    return new Date(iso).toLocaleString("en-US",{timeZone:"America/New_York"});
  }catch{
    return String(iso);
  }
}
function getFbStatusEl(){
  return document.getElementById("fbPostStatus");
}
function setFbStatus(text){
  const el = getFbStatusEl();
  if(el) el.textContent = text;
}
function useCurrentAdForFb(){
  const ad = (document.getElementById("adOutput")?.textContent || "").trim();
  if(!ad || /your ad will appear here\./i.test(ad)){
    setFbStatus("Facebook scheduler: generate an ad first.");
    return;
  }
  set("fbPostMessage", ad);
  setFbStatus("Facebook scheduler: current ad copied into message.");
}
async function saveFacebookConfig(){
  const pageId = val("fbPageId");
  const pageAccessToken = val("fbPageToken");
  if(!pageId || !pageAccessToken){
    setFbStatus("Facebook scheduler: Page ID and Access Token are required.");
    return;
  }
  setFbStatus("Facebook scheduler: saving config...");
  try{
    const res = await fetch("/api/dealerflow/facebook/config",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({pageId,pageAccessToken})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok || data?.ok===false){
      throw new Error(data?.error || "Failed to save Facebook config");
    }
    setFbStatus(`Facebook configured for page ${data?.pageIdMasked || pageId}.`);
  }catch(err){
    setFbStatus(`Facebook config failed: ${err?.message || "Unknown error"}`);
  }
}
async function postFacebookNow(){
  const message = val("fbPostMessage") || (document.getElementById("adOutput")?.textContent || "").trim();
  const link = val("fbPostLink");
  if(!message){
    setFbStatus("Facebook scheduler: message is required.");
    return;
  }
  setFbStatus("Facebook scheduler: posting now...");
  try{
    const res = await fetch("/api/dealerflow/facebook/post-now",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        title:`${val("year")} ${val("make")} ${val("model")} ${val("trim")}`.trim() || "Vehicle Post",
        message,
        link
      })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok || data?.ok===false){
      throw new Error(data?.error || "Facebook post failed");
    }
    setFbStatus(`Facebook post sent. Post ID: ${data?.postId || "created"}`);
  }catch(err){
    setFbStatus(`Facebook post failed: ${err?.message || "Unknown error"}`);
  }
}
async function scheduleFacebookPost(){
  const message = val("fbPostMessage") || (document.getElementById("adOutput")?.textContent || "").trim();
  const link = val("fbPostLink");
  const runAtLocal = val("fbPostTime");
  if(!message){
    setFbStatus("Facebook scheduler: message is required.");
    return;
  }
  if(!runAtLocal){
    setFbStatus("Facebook scheduler: choose a post time.");
    return;
  }
  const runAtIso = new Date(runAtLocal).toISOString();
  setFbStatus("Facebook scheduler: creating schedule...");
  try{
    const res = await fetch("/api/dealerflow/facebook/schedules",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        title:`${val("year")} ${val("make")} ${val("model")} ${val("trim")}`.trim() || "Vehicle Scheduled Post",
        message,
        link,
        runAtIso
      })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok || data?.ok===false){
      throw new Error(data?.error || "Failed to create schedule");
    }
    setFbStatus(`Scheduled for ${fmtNy(data?.schedule?.runAtIso || runAtIso)}.`);
    await refreshFacebookSchedules();
  }catch(err){
    setFbStatus(`Schedule failed: ${err?.message || "Unknown error"}`);
  }
}
async function cancelFacebookSchedule(id){
  if(!id) return;
  try{
    const res = await fetch(`/api/dealerflow/facebook/schedules?id=${encodeURIComponent(id)}`,{method:"DELETE"});
    const data = await res.json().catch(()=>({}));
    if(!res.ok || data?.ok===false){
      throw new Error(data?.error || "Delete failed");
    }
    setFbStatus("Schedule removed.");
    await refreshFacebookSchedules();
  }catch(err){
    setFbStatus(`Delete failed: ${err?.message || "Unknown error"}`);
  }
}
async function refreshFacebookSchedules(){
  const tableBody = document.querySelector("#fbScheduleTable tbody");
  if(!tableBody) return;
  try{
    const [statusRes, schedRes] = await Promise.all([
      fetch("/api/dealerflow/facebook/status"),
      fetch("/api/dealerflow/facebook/schedules")
    ]);
    const statusData = await statusRes.json().catch(()=>({}));
    const schedData = await schedRes.json().catch(()=>({}));
    if(statusData?.pageIdMasked && !val("fbPageId")) set("fbPageId", statusData.pageIdMasked);
    const rows = Array.isArray(schedData?.rows) ? schedData.rows : [];
    if(!rows.length){
      tableBody.innerHTML = "<tr><td colspan='5'>No scheduled posts.</td></tr>";
    } else {
      tableBody.innerHTML = rows.map((r)=>`<tr>
        <td>${safe(r.id || "--")}</td>
        <td>${safe(fmtNy(r.runAtIso))}</td>
        <td>${safe(r.status || "scheduled")}</td>
        <td>${safe(r.title || "Vehicle Post")}</td>
        <td>${r.status === "scheduled" ? `<button class="danger" onclick="cancelFacebookSchedule('${safe(r.id)}')">Cancel</button>` : "--"}</td>
      </tr>`).join("");
    }
    const cfgLine = statusData?.configured ? `Configured: Yes (${statusData.pageIdMasked || "page"})` : "Configured: No";
    setFbStatus(`Facebook scheduler ready. ${cfgLine}. Pending: ${rows.filter(x=>x.status==="scheduled").length}`);
  }catch(err){
    setFbStatus(`Facebook scheduler unavailable: ${err?.message || "Unknown error"}`);
  }
}
function scanCarfaxInline(){
  const t = val("carfaxText");
  if(!t){ alert("Paste Carfax text first."); return; }

  const lower = t.toLowerCase();
  const positives = [];
  const risks = [];
  const safeHighlights = [];
  const missing = [];

  // VIN / year / miles
  const vin = (t.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i) || [""])[0];
  const year = (t.match(/\b(20[0-2][0-9]|19[8-9][0-9])\b/) || [""])[0];

  const milesMatch =
    t.match(/(?:last reported mileage|reported mileage|mileage|odometer reading|odometer|miles?)\D{0,40}([0-9,]{4,7})/i) ||
    t.match(/\b([0-9]{2,3},[0-9]{3})\s*(?:mi|miles?)\b/i);

  const miles = milesMatch ? milesMatch[1].replace(/,/g,"") : "";

  set("cfVin", vin);
  set("cfYear", year);
  set("cfMiles", miles);

  // Make detect
  const brands = ["Chevrolet","Ford","Honda","Toyota","Jeep","Acura","Nissan","Kia","Hyundai","GMC","Ram","Dodge","Lexus","Audi","BMW","Mercedes-Benz","Subaru","Mazda","Volkswagen","Cadillac","Buick","Lincoln"];
  brands.forEach(b => {
    if(lower.includes(b.toLowerCase())) set("cfMake", b);
  });

  // Model detect from common inventory text
  const models = ["Equinox","Traverse","Colorado","Silverado","Tahoe","Malibu","Wrangler","Cherokee","Grand Cherokee","F-150","Explorer","Edge","Escape","Pilot","Accord","Civic","Camry","Corolla","RAV4","Highlander","MDX","RDX"];
  models.forEach(m => {
    if(lower.includes(m.toLowerCase())) set("cfModel", m);
  });

  // ENGINE — many formats
  let engine = "";
  const enginePatterns = [
    /(?:engine|motor)\D{0,25}((?:\d\.\d|\d)\s*(?:l|liter)\s*(?:turbo)?\s*(?:i4|v6|v8|4-cylinder|6-cylinder|8-cylinder|4 cyl|6 cyl|8 cyl)?)/i,
    /((?:\d\.\d|\d)\s*(?:l|liter)\s*(?:turbo)?\s*(?:i4|v6|v8|4-cylinder|6-cylinder|8-cylinder|4 cyl|6 cyl|8 cyl)?)/i,
    /\b(v6|v8|i4|4-cylinder|6-cylinder|8-cylinder|4 cyl|6 cyl|8 cyl)\b/i
  ];
  for(const p of enginePatterns){
    const m = t.match(p);
    if(m && m[1]){
      engine = m[1]
        .replace(/\bliter\b/i,"L")
        .replace(/\s+/g," ")
        .replace(/4 cyl/i,"4-Cylinder")
        .replace(/6 cyl/i,"6-Cylinder")
        .replace(/8 cyl/i,"8-Cylinder")
        .trim();
      break;
    }
  }
  if(engine){
    engine = engine.replace(/\bl\b/i,"L");
    positives.push("Engine: " + engine);
    safeHighlights.push(engine + " engine");
  } else {
    missing.push("Engine not found in pasted report text");
  }

  // FUEL TYPE — many formats
  let fuel = "";
  const fuelMatch =
    t.match(/(?:fuel type|fuel)\D{0,20}(gasoline|gas|diesel|hybrid|electric|ev|flex fuel|e85)/i);
  if(fuelMatch){
    fuel = fuelMatch[1];
  } else if(/\bgasoline\b|\bgas\b/i.test(t)) fuel = "Gasoline";
  else if(/\bdiesel\b/i.test(t)) fuel = "Diesel";
  else if(/\bhybrid\b/i.test(t)) fuel = "Hybrid";
  else if(/\belectric\b|\bev\b/i.test(t)) fuel = "Electric";
  else if(/\bflex fuel\b|\be85\b/i.test(t)) fuel = "Flex Fuel";

  if(fuel){
    fuel = fuel.toLowerCase() === "gas" ? "Gasoline" : fuel.replace(/\b\w/g,c=>c.toUpperCase());
    positives.push("Fuel Type: " + fuel);
    safeHighlights.push(fuel);
  } else {
    missing.push("Fuel type not found in pasted report text");
  }

  // DRIVE TYPE / DRIVETRAIN
  let drive = "";
  const driveMatch =
    t.match(/(?:drive type|drivetrain|drive)\D{0,20}(awd|4x4|4wd|fwd|rwd|all wheel drive|four wheel drive|front wheel drive|rear wheel drive)/i);
  if(driveMatch){
    drive = driveMatch[1];
  } else if(/\b4x4\b|\b4wd\b|four wheel drive/i.test(t)) drive = "4X4";
  else if(/\bawd\b|all wheel drive/i.test(t)) drive = "AWD";
  else if(/\bfwd\b|front wheel drive/i.test(t)) drive = "FWD";
  else if(/\brwd\b|rear wheel drive/i.test(t)) drive = "RWD";

  if(drive){
    drive = drive.toUpperCase()
      .replace("ALL WHEEL DRIVE","AWD")
      .replace("FOUR WHEEL DRIVE","4X4")
      .replace("FRONT WHEEL DRIVE","FWD")
      .replace("REAR WHEEL DRIVE","RWD");
    positives.push("Drive Type: " + drive);
    safeHighlights.push(drive);
  } else {
    missing.push("Drive type not found in pasted report text");
  }

  // OWNERS — many CARFAX formats
  let ownersText = "";
  if(/carfax\s*1-owner|1-owner|one owner|1 owner|single owner/i.test(t)) {
    ownersText = "1 Owner";
  } else {
    const ownerPatterns = [
      /number of owners\D{0,20}([1-9])/i,
      /owners?\D{0,20}([1-9])\b/i,
      /\b([1-9])\s*(?:previous owners|owners|owner)\b/i,
      /\b([1-9])\s*owner vehicle\b/i
    ];
    for(const p of ownerPatterns){
      const m = t.match(p);
      if(m && m[1]){
        ownersText = m[1] === "1" ? "1 Owner" : `${m[1]} Owners`;
        break;
      }
    }
  }

  if(ownersText){
    positives.push("Ownership: " + ownersText);
    safeHighlights.push(ownersText);
  } else {
    missing.push("Owner count not found in pasted report text");
  }

  // SERVICE HISTORY — exact count if possible
  let serviceText = "";
  const servicePatterns = [
    /\b([0-9]{1,3})\s*(?:service records|service history records|maintenance records)\b/i,
    /(?:service records|service history|maintenance records)\D{0,25}([0-9]{1,3})/i,
    /\b([0-9]{1,3})\s*(?:reported services|service visits|maintenance visits)\b/i
  ];
  for(const p of servicePatterns){
    const m = t.match(p);
    if(m && m[1]){
      serviceText = `${m[1]} Service Records`;
      break;
    }
  }
  if(!serviceText && /service record|maintenance|serviced|oil change|regular maintenance/i.test(t)){
    serviceText = "Service History Reported";
  }

  if(serviceText){
    positives.push(serviceText);
    safeHighlights.push(serviceText);
  } else {
    missing.push("Service history count not found in pasted report text");
  }

  // Accident / damage logic — only add clean signals if truly clean
  const cleanAcc = /no accident|no accidents reported|accident free/i.test(t);
  const cleanDamage = /no damage reported|no structural damage|no airbag deployment|no airbag deployments/i.test(t);
  const badAcc = /accident reported|collision|crash/i.test(t) && !cleanAcc;
  const badDamage = /damage reported|structural damage|airbag deployed|airbag deployment/i.test(t) && !cleanDamage;

  if(cleanAcc && !badAcc){
    positives.push("No accidents reported");
    safeHighlights.push("No accidents reported");
  }
  if(cleanDamage && !badDamage){
    positives.push("No damage reported");
    safeHighlights.push("No damage reported");
  }

  if(badAcc) risks.push("Accident reported — not added to Top Features");
  if(badDamage) risks.push("Damage reported — not added to Top Features");
  if(/salvage|rebuilt|flood|lemon|branded title/i.test(t)) risks.push("Title brand risk");
  if(/odometer rollback|mileage inconsistency|not actual mileage/i.test(t)) risks.push("Mileage / odometer concern");

  let score = Math.max(0, Math.min(100, 82 + positives.length * 3 - risks.length * 18));

  document.getElementById("carfaxScore").textContent = score + "/100";
  document.getElementById("carfaxGrade").textContent =
    score >= 85 ? "Grade A" :
    score >= 70 ? "Grade B" :
    score >= 50 ? "Grade C" : "Grade D";

  let htmlOut = (positives.length ? positives : ["No strong safe highlights found."])
    .map(x => "• " + x).join("<br>");

  if(missing.length){
    htmlOut += "<br><br><b style='color:#b54708'>Missing From Report Text:</b><br>" +
      missing.map(x => "• " + x).join("<br>");
  }

  if(risks.length){
    htmlOut += "<br><br><b style='color:#b42318'>Risk Signals:</b><br>" +
      risks.map(x => "• " + x).join("<br>");
  }

  document.getElementById("carfaxPositives").innerHTML = htmlOut;

  // Only safe highlights go to Top Features
  lastCarfaxHighlights = [...new Set(safeHighlights.length ? safeHighlights : ["Vehicle history report available"])];
  document.getElementById("carfaxHighlights").innerHTML =
    lastCarfaxHighlights.map(x => "• " + x).join("<br>");

  autoFillFeaturesFromCarfax();
}

function autoFillFeaturesFromCarfax(){
  const cur = val("features").split(",").map(x=>x.trim()).filter(Boolean);
  const blocked = /accident reported|damage reported|structural|airbag deployed|salvage|rebuilt|flood|odometer|mileage concern|not found/i;

  const cleanCarfaxFeatures = lastCarfaxHighlights
    .filter(x => x && !blocked.test(x))
    .map(x => x.trim());

  const priority = [];
  const rest = [];

  cleanCarfaxFeatures.forEach(f=>{
    if(/engine|gasoline|diesel|hybrid|electric|awd|4x4|fwd|rwd|owner|service records|service history|no accidents|no damage/i.test(f)){
      priority.push(f);
    } else {
      rest.push(f);
    }
  });

  const combined = [...new Set([...priority, ...rest, ...cur])];
  set("features", combined.join(", "));
}

function fillAdFromCarfaxInline(){
  ["Year","Make","Model","Trim","Miles"].forEach(k=>{const from=document.getElementById("cf"+k),to=document.getElementById(k.toLowerCase());if(from&&to&&from.value)to.value=from.value});
  autoFillFeaturesFromCarfax(); showTab("builder"); generateAd();
}
function clearCarfaxInline(){["carfaxText","cfVin","cfYear","cfMake","cfModel","cfTrim","cfMiles"].forEach(id=>set(id,""));document.getElementById("carfaxScore").textContent="--";document.getElementById("carfaxGrade").textContent="No scan yet.";document.getElementById("carfaxPositives").textContent="No scan yet.";document.getElementById("carfaxHighlights").textContent="Highlights will show here."}
function scanRisk(){
  const t=val("riskText")||document.getElementById("adOutput").textContent; let risk=0,issues=[];
  ["guaranteed approval","no credit no problem","100% approved","everyone approved"].forEach(w=>{if(t.toLowerCase().includes(w)){risk+=25;issues.push(w)}});
  if((t.match(/[\u{1F300}-\u{1FAFF}]/gu)||[]).length>3){risk+=10;issues.push("too many emojis")}
  document.getElementById("dashRisk").textContent=risk+"/100";
  document.getElementById("riskReport").textContent=`Risk: ${risk}/100\nIssues:\n${issues.length?issues.map(x=>"• "+x).join("\n"):"• No major risky phrases found."}`;
}
function rewriteRiskSafer(){
  let t=val("riskText");
  t=t.replace(/guaranteed approval|100% approved|everyone approved/gi,"financing available based on approval").replace(/bad credit\?? no credit\?? no problem!?/gi,"all credit situations considered");
  set("riskText",t); scanRisk();
}
function saveVehicle(){alert("Saved in this browser build soon.")}
function downloadPricedCsv(){
  if(!pricedRows.length){alert("No inventory loaded.");return}
  const lines=["VIN,Year,Make,Model,Trim,Miles,YourPrice,AvgDealer,FastSell,MaxProfit,Trade,Payment,Score"];
  pricedRows.forEach(r=>lines.push([r.vin,r.year,r.make,r.model,r.trim,r.milesNum,r.yourPrice,r.avg,r.fast,r.max,r.trade,r.pmt,r.score].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")));
  const blob=new Blob([lines.join("\n")],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="priced_inventory.csv";a.click();
}
refreshFacebookSchedules();

