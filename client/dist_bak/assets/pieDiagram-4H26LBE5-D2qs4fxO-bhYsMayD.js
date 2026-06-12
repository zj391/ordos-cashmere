import{g as U,s as Y,a as tt,b as et,q as at,p as nt,_ as d,l as F,c as it,F as rt,I as lt,N as st,e as ot,z as ct,G as pt,a4 as w,b2 as ut,a7 as z}from"./mermaid.core-C0QBhLUh-BG-zKLA4.js";import{t as dt}from"./chunk-4BX2VUAB-O6TN1Lsn-9EsyRQ3F.js";import{a as gt}from"./wardley-L42UT6IY-BbELmqET-wWBnqy4Y.js";import{h as q}from"./arc-CQhlHKoc-Bzc4u1MS.js";import{h as ft}from"./ordinal-Cboi1Yqb-DUCuiKwa.js";import"./index-BWBpP45v.js";import"./init-Gi6I4Gst-DHuO7-vr.js";function ht(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function mt(t){return t}function yt(){var t=mt,a=ht,f=null,s=w(0),o=w(z),$=w(0);function l(e){var i,c=(e=ut(e)).length,g,h,y=0,p=new Array(c),r=new Array(c),x=+s.apply(this,arguments),v=Math.min(z,Math.max(-z,o.apply(this,arguments)-x)),m,A=Math.min(Math.abs(v)/c,$.apply(this,arguments)),C=A*(v<0?-1:1),u;for(i=0;i<c;++i)(u=r[p[i]=i]=+t(e[i],i,e))>0&&(y+=u);for(a!=null?p.sort(function(S,b){return a(r[S],r[b])}):f!=null&&p.sort(function(S,b){return f(e[S],e[b])}),i=0,h=y?(v-c*C)/y:0;i<c;++i,x=m)g=p[i],u=r[g],m=x+(u>0?u*h:0)+C,r[g]={data:e[g],index:i,value:u,startAngle:x,endAngle:m,padAngle:A};return r}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:w(+e),l):t},l.sortValues=function(e){return arguments.length?(a=e,f=null,l):a},l.sort=function(e){return arguments.length?(f=e,a=null,l):f},l.startAngle=function(e){return arguments.length?(s=typeof e=="function"?e:w(+e),l):s},l.endAngle=function(e){return arguments.length?(o=typeof e=="function"?e:w(+e),l):o},l.padAngle=function(e){return arguments.length?($=typeof e=="function"?e:w(+e),l):$},l}var xt=pt.pie,N={sections:new Map,showData:!1},D=N.sections,R=N.showData,wt=structuredClone(xt),$t=d(()=>structuredClone(wt),"getConfig"),vt=d(()=>{D=new Map,R=N.showData,ct()},"clear"),St=d(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(t)||(D.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),bt=d(()=>D,"getSections"),At=d(t=>{R=t},"setShowData"),Ct=d(()=>R,"getShowData"),I={getConfig:$t,clear:vt,setDiagramTitle:nt,getDiagramTitle:at,setAccTitle:et,getAccTitle:tt,setAccDescription:Y,getAccDescription:U,addSection:St,getSections:bt,setShowData:At,getShowData:Ct},Dt=d((t,a)=>{dt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),Tt={parse:d(async t=>{const a=await gt("pie",t);F.debug(a),Dt(a,I)},"parse")},kt=d(t=>`
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
`,"getStyles"),Mt=kt,Ot=d(t=>{const a=[...t.values()].reduce((s,o)=>s+o,0),f=[...t.entries()].map(([s,o])=>({label:s,value:o})).filter(s=>s.value/a*100>=1);return yt().value(s=>s.value).sort(null)(f)},"createPieArcs"),zt=d((t,a,f,s)=>{var L;F.debug(`rendering pie chart
`+t);const o=s.db,$=it(),l=rt(o.getConfig(),$.pie),e=40,i=18,c=4,g=450,h=g,y=lt(a),p=y.append("g");p.attr("transform","translate("+h/2+","+g/2+")");const{themeVariables:r}=$;let[x]=st(r.pieOuterStrokeWidth);x??(x=2);const v=l.textPosition,m=Math.min(h,g)/2-e,A=q().innerRadius(0).outerRadius(m),C=q().innerRadius(m*v).outerRadius(m*v);p.append("circle").attr("cx",0).attr("cy",0).attr("r",m+x/2).attr("class","pieOuterCircle");const u=o.getSections(),S=Ot(u),b=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12];let T=0;u.forEach(n=>{T+=n});const W=S.filter(n=>(n.data.value/T*100).toFixed(0)!=="0"),k=ft(b).domain([...u.keys()]);p.selectAll("mySlices").data(W).enter().append("path").attr("d",A).attr("fill",n=>k(n.data.label)).attr("class","pieCircle"),p.selectAll("mySlices").data(W).enter().append("text").text(n=>(n.data.value/T*100).toFixed(0)+"%").attr("transform",n=>"translate("+C.centroid(n)+")").style("text-anchor","middle").attr("class","slice");const P=p.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),B=[...u.entries()].map(([n,O])=>({label:n,value:O})),M=p.selectAll(".legend").data(B).enter().append("g").attr("class","legend").attr("transform",(n,O)=>{const j=i+c,J=j*B.length/2,K=12*i,Q=O*j-J;return"translate("+K+","+Q+")"});M.append("rect").attr("width",i).attr("height",i).style("fill",n=>k(n.label)).style("stroke",n=>k(n.label)),M.append("text").attr("x",i+c).attr("y",i-c).text(n=>o.getShowData()?`${n.label} [${n.value}]`:n.label);const X=Math.max(...M.selectAll("text").nodes().map(n=>(n==null?void 0:n.getBoundingClientRect().width)??0)),Z=h+e+i+c+X,E=((L=P.node())==null?void 0:L.getBoundingClientRect().width)??0,_=h/2-E/2,H=h/2+E/2,V=Math.min(0,_),G=Math.max(Z,H)-V;y.attr("viewBox",`${V} 0 ${G} ${g}`),ot(y,g,G,l.useMaxWidth)},"draw"),Ft={draw:zt},Lt={parser:Tt,db:I,renderer:Ft,styles:Mt};export{Lt as diagram};
