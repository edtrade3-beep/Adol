const fs = require('fs');
const path = process.argv[2];
const s = fs.readFileSync(path, 'utf8');
let i=0, line=1, col=0;
let state='code';
const stack=[];
const push=(t)=>stack.push({t,line,col});
while(i<s.length){
  const ch=s[i], n=s[i+1];
  col++;
  if(ch==='\n'){ line++; col=0; }

  if(state==='line'){ if(ch==='\n') state='code'; i++; continue; }
  if(state==='block'){ if(ch==='*'&&n==='/'){ state='code'; i+=2; col++; continue; } i++; continue; }
  if(state==='single'){ if(ch==='\\'){ i+=2; col++; continue; } if(ch==="'") state='code'; i++; continue; }
  if(state==='double'){ if(ch==='\\'){ i+=2; col++; continue; } if(ch==='"') state='code'; i++; continue; }
  if(state==='template'){
    if(ch==='\\'){ i+=2; col++; continue; }
    if(ch==='`'){ state='code'; i++; continue; }
    if(ch==='$'&&n==='{'){ push('${'); state='code'; i+=2; col++; continue; }
    i++; continue;
  }

  if(ch==='/'&&n==='/'){ state='line'; i+=2; col++; continue; }
  if(ch==='/'&&n==='*'){ state='block'; i+=2; col++; continue; }
  if(ch==="'"){ state='single'; i++; continue; }
  if(ch==='"'){ state='double'; i++; continue; }
  if(ch==='`'){ state='template'; i++; continue; }

  if(ch==='{'||ch==='('||ch==='['){ push(ch); i++; continue; }
  if(ch==='}'||ch===')'||ch===']'){
    const need = ch==='}' ? ['{','${'] : (ch===')' ? ['('] : ['[']);
    const top=stack.pop();
    if(!top || !need.includes(top.t)){
      console.log(`MISMATCH close ${ch} at ${line}:${col}; top=${top ? top.t+'@'+top.line+':'+top.col : '<none>'}`);
      process.exit(0);
    }
    if(top.t==='${' && ch==='}') state='template';
    i++; continue;
  }

  i++;
}

console.log('OPEN_COUNT', stack.length);
stack.slice(-60).forEach((x)=>console.log(`${x.t}@${x.line}:${x.col}`));
