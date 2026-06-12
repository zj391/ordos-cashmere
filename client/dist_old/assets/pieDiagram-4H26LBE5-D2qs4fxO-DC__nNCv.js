import{g as Q,s as U,a as Y,b as tt,q as et,p as at,_ as d,l as F,c as nt,F as it,I as rt,N as lt,e as st,z as ot,G as ct,a4 as w,b2 as pt,a7 as z}from"./mermaid.core-C0QBhLUh-BCByg09N.js";import{t as ut}from"./chunk-4BX2VUAB-O6TN1Lsn-Bby0wNY3.js";import{a as dt}from"./wardley-L42UT6IY-BbELmqET-BdLMVt3W.js";import{h as j}from"./arc-CQhlHKoc-BkqtWjmi.js";import{h as gt}from"./ordinal-Cboi1Yqb-DUCuiKwa.js";import"./index-QH5qhp_P.js";import"./init-Gi6I4Gst-DHuO7-vr.js";function ft(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ht(t){return t}function mt(){var t=ht,a=ft,f=null,s=w(0),o=w(z),$=w(0);function l(e){var i,c=(e=pt(e)).length,g,h,y=0,p=new Array(c),r=new Array(c),x=+s.apply(this,arguments),v=Math.min(z,Math.max(-z,o.apply(this,arguments)-x)),m,A=Math.min(Math.abs(v)/c,$.apply(this,arguments)),C=A*(v<0?-1:1),u;for(i=0;i<c;++i)(u=r[p[i]=i]=+t(e[i],i,e))>0&&(y+=u);for(a!=null?p.sort(function(S,b){return a(r[S],r[b])}):f!=null&&p.sort(function(S,b){return f(e[S],e[b])}),i=0,h=y?(v-c*C)/y:0;i<c;++i,x=m)g=p[i],u=r[g],m=x+(u>0?u*h:0)+C,r[g]={data:e[g],index:i,value:u,startAngle:x,endAngle:m,padAngle:A};return r}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:w(+e),l):t},l.sortValues=function(e){return arguments.length?(a=e,f=null,l):a},l.sort=function(e){return arguments.length?(f=e,a=null,l):f},l.startAngle=function(e){return arguments.length?(s=typeof e=="function"?e:w(+e),l):s},l.endAngle=function(e){return arguments.length?(o=typeof e=="function"?e:w(+e),l):o},l.padAngle=function(e){return arguments.length?($=typeof e=="function"?e:w(+e),l):$},l}var yt=ct.pie,N={sections:new Map,showData:!1},D=N.sections,R=N.showData,xt=structuredClone(yt),wt=d(()=>structuredClone(xt),"getConfig"),$t=d(()=>{D=new Map,R=N.showData,ot()},"clear"),vt=d(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(t)||(D.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),St=d(()=>D,"getSections"),bt=d(t=>{R=t},"setShowData"),At=d(()=>R,"getShowData"),q={getConfig:wt,clear:$t,setDiagramTitle:at,getDiagramTitle:et,setAccTitle:tt,getAccTitle:Y,setAccDescription:U,getAccDescription:Q,addSection:vt,getSections:St,setShowData:bt,getShowData:At},Ct=d((t,a)=>{ut(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),Dt={parse:d(async t=>{const a=await dt("pie",t);F.debug(a),Ct(a,q)},"parse")},Tt=d(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),kt=Tt,Mt=d(t=>{const a=[...t.values()].reduce((s,o)=>s+o,0),f=[...t.entries()].map(([s,o])=>({label:s,value:o})).filter(s=>s.value/a*100>=1);return mt().value(s=>s.value).sort(null)(f)},"createPieArcs"),Ot=d((t,a,f,s)=>{F.debug(`rendering pie chart
`+t);const o=s.db,$=nt(),l=it(o.getConfig(),$.pie),e=40,i=18,c=4,g=450,h=g,y=rt(a),p=y.append("g");p.attr("transform","translate("+h/2+","+g/2+")");const{themeVariables:r}=$;let[x]=lt(r.pieOuterStrokeWidth);x??=2;const v=l.textPosition,m=Math.min(h,g)/2-e,A=j().innerRadius(0).outerRadius(m),C=j().innerRadius(m*v).outerRadius(m*v);p.append("circle").attr("cx",0).attr("cy",0).attr("r",m+x/2).attr("class","pieOuterCircle");const u=o.getSections(),S=Mt(u),b=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12];let T=0;u.forEach(n=>{T+=n});const W=S.filter(n=>(n.data.value/T*100).toFixed(0)!=="0"),k=gt(b).domain([...u.keys()]);p.selectAll("mySlices").data(W).enter().append("path").attr("d",A).attr("fill",n=>k(n.data.label)).attr("class","pieCircle"),p.selectAll("mySlices").data(W).enter().append("text").text(n=>(n.data.value/T*100).toFixed(0)+"%").attr("transform",n=>"translate("+C.centroid(n)+")").style("text-anchor","middle").attr("class","slice");const I=p.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),B=[...u.entries()].map(([n,O])=>({label:n,value:O})),M=p.selectAll(".legend").data(B).enter().append("g").attr("class","legend").attr("transform",(n,O)=>{const L=i+c,H=L*B.length/2,J=12*i,K=O*L-H;return"translate("+J+","+K+")"});M.append("rect").attr("width",i).attr("height",i).style("fill",n=>k(n.label)).style("stroke",n=>k(n.label)),M.append("text").attr("x",i+c).attr("y",i-c).text(n=>o.getShowData()?`${n.label} [${n.value}]`:n.label);const P=Math.max(...M.selectAll("text").nodes().map(n=>n?.getBoundingClientRect().width??0)),X=h+e+i+c+P,E=I.node()?.getBoundingClientRect().width??0,Z=h/2-E/2,_=h/2+E/2,V=Math.min(0,Z),G=Math.max(X,_)-V;y.attr("viewBox",`${V} 0 ${G} ${g}`),st(y,g,G,l.useMaxWidth)},"draw"),zt={draw:Ot},Gt={parser:Dt,db:q,renderer:zt,styles:kt};export{Gt as diagram};
