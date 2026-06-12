import{_ as f,F as y,I as C,e as v,l as w,b as z,a as P,p as F,q as S,g as W,s as D,D as E,G as T,z as A}from"./mermaid.core-C0QBhLUh-BCByg09N.js";import{t as Y}from"./chunk-4BX2VUAB-O6TN1Lsn-Bby0wNY3.js";import{a as j}from"./wardley-L42UT6IY-BbELmqET-BdLMVt3W.js";import"./index-QH5qhp_P.js";var G=T.packet,u,m=(u=class{constructor(){this.packet=[],this.setAccTitle=z,this.getAccTitle=P,this.setDiagramTitle=F,this.getDiagramTitle=S,this.getAccDescription=W,this.setAccDescription=D}getConfig(){const t=y({...G,...E().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){A(),this.packet=[]}},f(u,"PacketDB"),u),H=1e4,I=f((t,e)=>{Y(t,e);let r=-1,o=[],l=1;const{bitsPerRow:n}=e.getConfig();for(let{start:a,end:i,bits:d,label:c}of t.blocks){if(a!==void 0&&i!==void 0&&i<a)throw new Error(`Packet block ${a} - ${i} is invalid. End must be greater than start.`);if(a??=r+1,a!==r+1)throw new Error(`Packet block ${a} - ${i??a} is not contiguous. It should start from ${r+1}.`);if(d===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(i??=a+(d??1)-1,d??=i-a+1,r=i,w.debug(`Packet block ${a} - ${r} with label ${c}`);o.length<=n+1&&e.getPacket().length<H;){const[p,s]=L({start:a,end:i,bits:d,label:c},l,n);if(o.push(p),p.end+1===l*n&&(e.pushWord(o),o=[],l++),!s)break;({start:a,end:i,bits:d,label:c}=s)}}e.pushWord(o)},"populate"),L=f((t,e,r)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*r)return[t,void 0];const o=e*r-1,l=e*r;return[{start:t.start,end:o,label:t.label,bits:o-t.start},{start:l,end:t.end,label:t.label,bits:t.end-l}]},"getNextFittingBlock"),x={parser:{yy:void 0},parse:f(async t=>{const e=await j("packet",t),r=x.parser?.yy;if(!(r instanceof m))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");w.debug(e),I(e,r)},"parse")},M=f((t,e,r,o)=>{const l=o.db,n=l.getConfig(),{rowHeight:a,paddingY:i,bitWidth:d,bitsPerRow:c}=n,p=l.getPacket(),s=l.getDiagramTitle(),h=a+i,b=h*(p.length+1)-(s?0:a),k=d*c+2,g=C(e);g.attr("viewBox",`0 0 ${k} ${b}`),v(g,b,k,n.useMaxWidth);for(const[$,B]of p.entries())N(g,B,$,n);g.append("text").text(s).attr("x",k/2).attr("y",b-h/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),N=f((t,e,r,{rowHeight:o,paddingX:l,paddingY:n,bitWidth:a,bitsPerRow:i,showBits:d})=>{const c=t.append("g"),p=r*(o+n)+n;for(const s of e){const h=s.start%i*a+1,b=(s.end-s.start+1)*a-l;if(c.append("rect").attr("x",h).attr("y",p).attr("width",b).attr("height",o).attr("class","packetBlock"),c.append("text").attr("x",h+b/2).attr("y",p+o/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(s.label),!d)continue;const k=s.end===s.start,g=p-2;c.append("text").attr("x",h+(k?b/2:0)).attr("y",g).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(s.start),k||c.append("text").attr("x",h+b).attr("y",g).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(s.end)}},"drawWord"),R={draw:M},q={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},O=f(({packet:t}={})=>{const e=y(q,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),Q={parser:x,get db(){return new m},renderer:R,styles:O};export{Q as diagram};
