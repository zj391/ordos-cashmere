import{d as Zt}from"./chunk-55IACEB6-BwpegnI1-5ZnppcHD.js";import{d as te}from"./chunk-2J33WTMH-CwbOxEjd-CZ1c3UBC.js";import{_ as d,l as k,c as N,r as ee,u as se,a as ie,b as re,g as ae,s as ne,p as oe,q as le,T as ce,k as X,z as he}from"./mermaid.core-C0QBhLUh-BG-zKLA4.js";var Dt=(function(){var t=d(function(F,a,r,y){for(r=r||{},y=F.length;y--;r[F[y]]=a);return r},"o"),e=[1,2],n=[1,3],s=[1,4],h=[2,4],o=[1,9],f=[1,11],S=[1,16],l=[1,17],g=[1,18],E=[1,19],b=[1,33],x=[1,20],O=[1,21],I=[1,22],R=[1,23],D=[1,24],u=[1,26],C=[1,27],v=[1,28],B=[1,29],M=[1,30],G=[1,31],j=[1,32],it=[1,35],rt=[1,36],at=[1,37],nt=[1,38],H=[1,34],p=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],ot=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],Ct=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],gt={trace:d(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:d(function(F,a,r,y,m,i,T){var c=i.length-1;switch(m){case 3:return y.setRootDoc(i[c]),i[c];case 4:this.$=[];break;case 5:i[c]!="nl"&&(i[c-1].push(i[c]),this.$=i[c-1]);break;case 6:case 7:this.$=i[c];break;case 8:this.$="nl";break;case 12:this.$=i[c];break;case 13:const Q=i[c-1];Q.description=y.trimColon(i[c]),this.$=Q;break;case 14:this.$={stmt:"relation",state1:i[c-2],state2:i[c]};break;case 15:const St=y.trimColon(i[c]);this.$={stmt:"relation",state1:i[c-3],state2:i[c-1],description:St};break;case 19:this.$={stmt:"state",id:i[c-3],type:"default",description:"",doc:i[c-1]};break;case 20:var Y=i[c],U=i[c-2].trim();if(i[c].match(":")){var ct=i[c].split(":");Y=ct[0],U=[U,ct[1]]}this.$={stmt:"state",id:Y,type:"default",description:U};break;case 21:this.$={stmt:"state",id:i[c-3],type:"default",description:i[c-5],doc:i[c-1]};break;case 22:this.$={stmt:"state",id:i[c],type:"fork"};break;case 23:this.$={stmt:"state",id:i[c],type:"join"};break;case 24:this.$={stmt:"state",id:i[c],type:"choice"};break;case 25:this.$={stmt:"state",id:y.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:i[c-1].trim(),note:{position:i[c-2].trim(),text:i[c].trim()}};break;case 29:this.$=i[c].trim(),y.setAccTitle(this.$);break;case 30:case 31:this.$=i[c].trim(),y.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:i[c-3],url:i[c-2],tooltip:i[c-1]};break;case 33:this.$={stmt:"click",id:i[c-3],url:i[c-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:i[c-1].trim(),classes:i[c].trim()};break;case 36:this.$={stmt:"style",id:i[c-1].trim(),styleClass:i[c].trim()};break;case 37:this.$={stmt:"applyClass",id:i[c-1].trim(),styleClass:i[c].trim()};break;case 38:y.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:y.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:y.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:y.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:i[c].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:i[c-2].trim(),classes:[i[c].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:i[c-2].trim(),classes:[i[c].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:e,5:n,6:s},{1:[3]},{3:5,4:e,5:n,6:s},{3:6,4:e,5:n,6:s},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],h,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:o,5:f,8:8,9:10,10:12,11:13,12:14,13:15,16:S,17:l,19:g,22:E,24:b,25:x,26:O,27:I,28:R,29:D,32:25,33:u,35:C,37:v,38:B,41:M,45:G,48:j,51:it,52:rt,53:at,54:nt,57:H},t(p,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:S,17:l,19:g,22:E,24:b,25:x,26:O,27:I,28:R,29:D,32:25,33:u,35:C,37:v,38:B,41:M,45:G,48:j,51:it,52:rt,53:at,54:nt,57:H},t(p,[2,7]),t(p,[2,8]),t(p,[2,9]),t(p,[2,10]),t(p,[2,11]),t(p,[2,12],{14:[1,40],15:[1,41]}),t(p,[2,16]),{18:[1,42]},t(p,[2,18],{20:[1,43]}),{23:[1,44]},t(p,[2,22]),t(p,[2,23]),t(p,[2,24]),t(p,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(p,[2,28]),{34:[1,49]},{36:[1,50]},t(p,[2,31]),{13:51,24:b,57:H},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(ot,[2,44],{58:[1,56]}),t(ot,[2,45],{58:[1,57]}),t(p,[2,38]),t(p,[2,39]),t(p,[2,40]),t(p,[2,41]),t(p,[2,6]),t(p,[2,13]),{13:58,24:b,57:H},t(p,[2,17]),t(Ct,h,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(p,[2,29]),t(p,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(p,[2,14],{14:[1,71]}),{4:o,5:f,8:8,9:10,10:12,11:13,12:14,13:15,16:S,17:l,19:g,21:[1,72],22:E,24:b,25:x,26:O,27:I,28:R,29:D,32:25,33:u,35:C,37:v,38:B,41:M,45:G,48:j,51:it,52:rt,53:at,54:nt,57:H},t(p,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(p,[2,34]),t(p,[2,35]),t(p,[2,36]),t(p,[2,37]),t(ot,[2,46]),t(ot,[2,47]),t(p,[2,15]),t(p,[2,19]),t(Ct,h,{7:78}),t(p,[2,26]),t(p,[2,27]),{5:[1,79]},{5:[1,80]},{4:o,5:f,8:8,9:10,10:12,11:13,12:14,13:15,16:S,17:l,19:g,21:[1,81],22:E,24:b,25:x,26:O,27:I,28:R,29:D,32:25,33:u,35:C,37:v,38:B,41:M,45:G,48:j,51:it,52:rt,53:at,54:nt,57:H},t(p,[2,32]),t(p,[2,33]),t(p,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:d(function(F,a){if(a.recoverable)this.trace(F);else{var r=new Error(F);throw r.hash=a,r}},"parseError"),parse:d(function(F){var a=this,r=[0],y=[],m=[null],i=[],T=this.table,c="",Y=0,U=0,ct=2,Q=1,St=i.slice.call(arguments,1),_=Object.create(this.lexer),z={yy:{}};for(var mt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,mt)&&(z.yy[mt]=this.yy[mt]);_.setInput(F,z.yy),z.yy.lexer=_,z.yy.parser=this,typeof _.yylloc>"u"&&(_.yylloc={});var kt=_.yylloc;i.push(kt);var qt=_.options&&_.options.ranges;typeof z.yy.parseError=="function"?this.parseError=z.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Qt(A){r.length=r.length-2*A,m.length=m.length-A,i.length=i.length-A}d(Qt,"popStack");function vt(){var A;return A=y.pop()||_.lex()||Q,typeof A!="number"&&(A instanceof Array&&(y=A,A=y.pop()),A=a.symbols_[A]||A),A}d(vt,"lex");for(var L,V,w,Tt,K={},ht,P,Lt,dt;;){if(V=r[r.length-1],this.defaultActions[V]?w=this.defaultActions[V]:((L===null||typeof L>"u")&&(L=vt()),w=T[V]&&T[V][L]),typeof w>"u"||!w.length||!w[0]){var _t="";dt=[];for(ht in T[V])this.terminals_[ht]&&ht>ct&&dt.push("'"+this.terminals_[ht]+"'");_.showPosition?_t="Parse error on line "+(Y+1)+`:
`+_.showPosition()+`
Expecting `+dt.join(", ")+", got '"+(this.terminals_[L]||L)+"'":_t="Parse error on line "+(Y+1)+": Unexpected "+(L==Q?"end of input":"'"+(this.terminals_[L]||L)+"'"),this.parseError(_t,{text:_.match,token:this.terminals_[L]||L,line:_.yylineno,loc:kt,expected:dt})}if(w[0]instanceof Array&&w.length>1)throw new Error("Parse Error: multiple actions possible at state: "+V+", token: "+L);switch(w[0]){case 1:r.push(L),m.push(_.yytext),i.push(_.yylloc),r.push(w[1]),L=null,U=_.yyleng,c=_.yytext,Y=_.yylineno,kt=_.yylloc;break;case 2:if(P=this.productions_[w[1]][1],K.$=m[m.length-P],K._$={first_line:i[i.length-(P||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(P||1)].first_column,last_column:i[i.length-1].last_column},qt&&(K._$.range=[i[i.length-(P||1)].range[0],i[i.length-1].range[1]]),Tt=this.performAction.apply(K,[c,U,Y,z.yy,w[1],m,i].concat(St)),typeof Tt<"u")return Tt;P&&(r=r.slice(0,-1*P*2),m=m.slice(0,-1*P),i=i.slice(0,-1*P)),r.push(this.productions_[w[1]][0]),m.push(K.$),i.push(K._$),Lt=T[r[r.length-2]][r[r.length-1]],r.push(Lt);break;case 3:return!0}}return!0},"parse")},Jt=(function(){var F={EOF:1,parseError:d(function(a,r){if(this.yy.parser)this.yy.parser.parseError(a,r);else throw new Error(a)},"parseError"),setInput:d(function(a,r){return this.yy=r||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:d(function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var r=a.match(/(?:\r\n?|\n).*/g);return r?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},"input"),unput:d(function(a){var r=a.length,y=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-r),this.offset-=r;var m=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),y.length-1&&(this.yylineno-=y.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:y?(y.length===m.length?this.yylloc.first_column:0)+m[m.length-y.length].length-y[0].length:this.yylloc.first_column-r},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-r]),this.yyleng=this.yytext.length,this},"unput"),more:d(function(){return this._more=!0,this},"more"),reject:d(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:d(function(a){this.unput(this.match.slice(a))},"less"),pastInput:d(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:d(function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:d(function(){var a=this.pastInput(),r=new Array(a.length+1).join("-");return a+this.upcomingInput()+`
`+r+"^"},"showPosition"),test_match:d(function(a,r){var y,m,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),m=a[0].match(/(?:\r\n?|\n).*/g),m&&(this.yylineno+=m.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:m?m[m.length-1].length-m[m.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],y=this.performAction.call(this,this.yy,this,r,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),y)return y;if(this._backtrack){for(var T in i)this[T]=i[T];return!1}return!1},"test_match"),next:d(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,r,y,m;this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),T=0;T<i.length;T++)if(y=this._input.match(this.rules[i[T]]),y&&(!r||y[0].length>r[0].length)){if(r=y,m=T,this.options.backtrack_lexer){if(a=this.test_match(y,i[T]),a!==!1)return a;if(this._backtrack){r=!1;continue}else return!1}else if(!this.options.flex)break}return r?(a=this.test_match(r,i[m]),a!==!1?a:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:d(function(){var a=this.next();return a||this.lex()},"lex"),begin:d(function(a){this.conditionStack.push(a)},"begin"),popState:d(function(){var a=this.conditionStack.length-1;return a>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:d(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:d(function(a){return a=this.conditionStack.length-1-Math.abs(a||0),a>=0?this.conditionStack[a]:"INITIAL"},"topState"),pushState:d(function(a){this.begin(a)},"pushState"),stateStackSize:d(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:d(function(a,r,y,m){function i(){const T=r.yytext.indexOf("%%");if(T===0)return!1;if(T>0){const c=r.yytext.slice(0,T),Y=r.yytext.slice(T);Y&&a.lexer.unput(Y),r.yytext=c}return!0}switch(d(i,"processId"),y){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;case 17:return this.popState(),"acc_title_value";case 18:return this.begin("acc_descr"),35;case 19:return this.popState(),"acc_descr_value";case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";case 25:return this.popState(),this.pushState("CLASSDEFID"),42;case 26:return this.popState(),43;case 27:return this.pushState("CLASS"),48;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;case 29:return this.popState(),50;case 30:return this.pushState("STYLE"),45;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;case 32:return this.popState(),47;case 33:return this.pushState("SCALE"),17;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),25;case 38:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),26;case 39:return this.popState(),r.yytext=r.yytext.slice(0,-10).trim(),27;case 40:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),25;case 41:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),26;case 42:return this.popState(),r.yytext=r.yytext.slice(0,-10).trim(),27;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";case 49:return i()?(this.popState(),"ID"):void 0;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:return 19;case 53:this.popState();break;case 54:return this.popState(),this.pushState("struct"),20;case 55:return this.popState(),21;case 56:break;case 57:return this.begin("NOTE"),29;case 58:return this.popState(),this.pushState("NOTE_ID"),59;case 59:return this.popState(),this.pushState("NOTE_ID"),60;case 60:this.popState(),this.pushState("FLOATING_NOTE");break;case 61:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";case 62:break;case 63:return"NOTE_TEXT";case 64:return i()?(this.popState(),"ID"):void 0;case 65:return i()?(this.popState(),this.pushState("NOTE_TEXT"),24):void 0;case 66:return this.popState(),r.yytext=r.yytext.substr(2).trim(),31;case 67:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),31;case 68:return 6;case 69:return 6;case 70:return 16;case 71:return 57;case 72:return i()?24:void 0;case 73:return r.yytext=r.yytext.trim(),14;case 74:return 15;case 75:return 28;case 76:return 58;case 77:return 5;case 78:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,55,56,57,71,72,73,74,75,76],inclusive:!1},FLOATING_NOTE_ID:{rules:[64],inclusive:!1},FLOATING_NOTE:{rules:[61,62,63],inclusive:!1},NOTE_TEXT:{rules:[66,67],inclusive:!1},NOTE_ID:{rules:[65],inclusive:!1},NOTE:{rules:[58,59,60],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,54,57,68,69,70,71,72,73,74,76,77,78],inclusive:!0}}};return F})();gt.lexer=Jt;function lt(){this.yy={}}return d(lt,"Parser"),lt.prototype=gt,gt.Parser=lt,new lt})();Dt.parser=Dt;var Pe=Dt,de="TB",Ft="TB",It="dir",q="state",J="root",$t="relation",ue="classDef",pe="style",ye="applyClass",et="default",Yt="divider",Pt="fill:none",Gt="fill: #333",jt="c",Wt="markdown",Mt="normal",bt="rect",Et="rectWithTitle",fe="stateStart",ge="stateEnd",At="divider",wt="roundedWithTitle",Se="note",me="noteGroup",st="statediagram",ke="state",Te=`${st}-${ke}`,zt="transition",_e="note",be="note-edge",Ee=`${zt} ${be}`,De=`${st}-${_e}`,$e="cluster",xe=`${st}-${$e}`,Ce="cluster-alt",ve=`${st}-${Ce}`,Vt="parent",Xt="note",Le="state",xt="----",Ie=`${xt}${Xt}`,Ot=`${xt}${Vt}`,Ht=d((t,e=Ft)=>{if(!t.doc)return e;let n=e;for(const s of t.doc)s.stmt==="dir"&&(n=s.value);return n},"getDir"),Ae=d(function(t,e){return e.db.getClasses()},"getClasses"),we=d(async function(t,e,n,s){k.info("REF0:"),k.info("Drawing state diagram (v2)",e);const{securityLevel:h,state:o,layout:f}=N();s.db.extract(s.db.getRootDocV2());const S=s.db.getData(),l=Zt(e,h);S.type=s.type,S.layoutAlgorithm=f,S.nodeSpacing=(o==null?void 0:o.nodeSpacing)||50,S.rankSpacing=(o==null?void 0:o.rankSpacing)||50,N().look==="neo"?S.markers=["barbNeo"]:S.markers=["barb"],S.diagramId=e,await ee(S,l);const g=8;try{(typeof s.db.getLinks=="function"?s.db.getLinks():new Map).forEach((E,b)=>{var C;const x=typeof b=="string"?b:typeof(b==null?void 0:b.id)=="string"?b.id:"";if(!x){k.warn("⚠️ Invalid or missing stateId from key:",JSON.stringify(b));return}const O=(C=l.node())==null?void 0:C.querySelectorAll("g");let I;if(O==null||O.forEach(v=>{var B;((B=v.textContent)==null?void 0:B.trim())===x&&(I=v)}),!I){k.warn("⚠️ Could not find node matching text:",x);return}const R=I.parentNode;if(!R){k.warn("⚠️ Node has no parent, cannot wrap:",x);return}const D=document.createElementNS("http://www.w3.org/2000/svg","a"),u=E.url.replace(/^"+|"+$/g,"");if(D.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",u),D.setAttribute("target","_blank"),E.tooltip){const v=E.tooltip.replace(/^"+|"+$/g,"");D.setAttribute("title",v)}R.replaceChild(D,I),D.appendChild(I),k.info("🔗 Wrapped node in <a> tag for:",x,E.url)})}catch(E){k.error("❌ Error injecting clickable links:",E)}se.insertTitle(l,"statediagramTitleText",(o==null?void 0:o.titleTopMargin)??25,s.db.getDiagramTitle()),te(l,g,st,(o==null?void 0:o.useMaxWidth)??!0)},"draw"),Ge={getClasses:Ae,draw:we,getDir:Ht},yt=new Map,W=0;function ft(t="",e=0,n="",s=xt){const h=n!==null&&n.length>0?`${s}${n}`:"";return`${Le}-${t}${h}-${e}`}d(ft,"stateDomId");var Oe=d((t,e,n,s,h,o,f,S)=>{k.trace("items",e),e.forEach(l=>{switch(l.stmt){case q:tt(t,l,n,s,h,o,f,S);break;case et:tt(t,l,n,s,h,o,f,S);break;case $t:{tt(t,l.state1,n,s,h,o,f,S),tt(t,l.state2,n,s,h,o,f,S);const g=f==="neo",E={id:"edge"+W,start:l.state1.id,end:l.state2.id,arrowhead:"normal",arrowTypeEnd:g?"arrow_barb_neo":"arrow_barb",style:Pt,labelStyle:"",label:X.sanitizeText(l.description??"",N()),arrowheadStyle:Gt,labelpos:jt,labelType:Wt,thickness:Mt,classes:zt,look:f};h.push(E),W++}break}})},"setupDoc"),Nt=d((t,e=Ft)=>{let n=e;if(t.doc)for(const s of t.doc)s.stmt==="dir"&&(n=s.value);return n},"getDir");function Z(t,e,n){if(!e.id||e.id==="</join></fork>"||e.id==="</choice>")return;e.cssClasses&&(Array.isArray(e.cssCompiledStyles)||(e.cssCompiledStyles=[]),e.cssClasses.split(" ").forEach(h=>{const o=n.get(h);o&&(e.cssCompiledStyles=[...e.cssCompiledStyles??[],...o.styles])}));const s=t.find(h=>h.id===e.id);s?Object.assign(s,e):t.push(e)}d(Z,"insertOrUpdateNode");function Ut(t){var e;return((e=t==null?void 0:t.classes)==null?void 0:e.join(" "))??""}d(Ut,"getClassesFromDbInfo");function Kt(t){return(t==null?void 0:t.styles)??[]}d(Kt,"getStylesFromDbInfo");var tt=d((t,e,n,s,h,o,f,S)=>{var O,I,R;const l=e.id,g=n.get(l),E=Ut(g),b=Kt(g),x=N();if(k.info("dataFetcher parsedItem",e,g,b),l!=="root"){let D=bt;e.start===!0?D=fe:e.start===!1&&(D=ge),e.type!==et&&(D=e.type),yt.get(l)||yt.set(l,{id:l,shape:D,description:X.sanitizeText(l,x),cssClasses:`${E} ${Te}`,cssStyles:b});const u=yt.get(l);e.description&&(Array.isArray(u.description)?(u.shape=Et,u.description.push(e.description)):(O=u.description)!=null&&O.length&&u.description.length>0?(u.shape=Et,u.description===l?u.description=[e.description]:u.description=[u.description,e.description]):(u.shape=bt,u.description=e.description),u.description=X.sanitizeTextOrArray(u.description,x)),((I=u.description)==null?void 0:I.length)===1&&u.shape===Et&&(u.type==="group"?u.shape=wt:u.shape=bt),!u.type&&e.doc&&(k.info("Setting cluster for XCX",l,Nt(e)),u.type="group",u.isGroup=!0,u.dir=Nt(e),u.shape=e.type===Yt?At:wt,u.cssClasses=`${u.cssClasses} ${xe} ${o?ve:""}`);const C={labelStyle:"",shape:u.shape,label:u.description,cssClasses:u.cssClasses,cssCompiledStyles:[],cssStyles:u.cssStyles,id:l,dir:u.dir,domId:ft(l,W),type:u.type,isGroup:u.type==="group",padding:8,rx:10,ry:10,look:f,labelType:"markdown"};if(C.shape===At&&(C.label=""),t&&t.id!=="root"&&(k.trace("Setting node ",l," to be child of its parent ",t.id),C.parentId=t.id),C.centerLabel=!0,e.note){const v={labelStyle:"",shape:Se,label:e.note.text,labelType:"markdown",cssClasses:De,cssStyles:[],cssCompiledStyles:[],id:l+Ie+"-"+W,domId:ft(l,W,Xt),type:u.type,isGroup:u.type==="group",padding:(R=x.flowchart)==null?void 0:R.padding,look:f,position:e.note.position},B=l+Ot,M={labelStyle:"",shape:me,label:e.note.text,cssClasses:u.cssClasses,cssStyles:[],id:l+Ot,domId:ft(l,W,Vt),type:"group",isGroup:!0,padding:16,look:f,position:e.note.position};W++,M.id=B,v.parentId=B,Z(s,M,S),Z(s,v,S),Z(s,C,S);let G=l,j=v.id;e.note.position==="left of"&&(G=v.id,j=l),h.push({id:G+"-"+j,start:G,end:j,arrowhead:"none",arrowTypeEnd:"",style:Pt,labelStyle:"",classes:Ee,arrowheadStyle:Gt,labelpos:jt,labelType:Wt,thickness:Mt,look:f})}else Z(s,C,S)}e.doc&&(k.trace("Adding nodes children "),Oe(e,e.doc,n,s,h,!o,f,S))},"dataFetcher"),Ne=d(()=>{yt.clear(),W=0},"reset"),$={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Rt=d(()=>new Map,"newClassesList"),Bt=d(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),ut=d(t=>JSON.parse(JSON.stringify(t)),"clone"),pt,je=(pt=class{constructor(t){this.version=t,this.nodes=[],this.edges=[],this.rootDoc=[],this.classes=Rt(),this.documents={root:Bt()},this.currentDocument=this.documents.root,this.startEndCount=0,this.dividerCnt=0,this.links=new Map,this.getAccTitle=ie,this.setAccTitle=re,this.getAccDescription=ae,this.setAccDescription=ne,this.setDiagramTitle=oe,this.getDiagramTitle=le,this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this)}extract(t){this.clear(!0);for(const s of Array.isArray(t)?t:t.doc)switch(s.stmt){case q:this.addState(s.id.trim(),s.type,s.doc,s.description,s.note);break;case $t:this.addRelation(s.state1,s.state2,s.description);break;case ue:this.addStyleClass(s.id.trim(),s.classes);break;case pe:this.handleStyleDef(s);break;case ye:this.setCssClass(s.id.trim(),s.styleClass);break;case"click":this.addLink(s.id,s.url,s.tooltip);break}const e=this.getStates(),n=N();Ne(),tt(void 0,this.getRootDocV2(),e,this.nodes,this.edges,!0,n.look,this.classes);for(const s of this.nodes)if(Array.isArray(s.label)){if(s.description=s.label.slice(1),s.isGroup&&s.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${s.id}]`);s.label=s.label[0]}}handleStyleDef(t){const e=t.id.trim().split(","),n=t.styleClass.split(",");for(const s of e){let h=this.getState(s);if(!h){const o=s.trim();this.addState(o),h=this.getState(o)}h&&(h.styles=n.map(o=>{var f;return(f=o.replace(/;/g,""))==null?void 0:f.trim()}))}}setRootDoc(t){k.info("Setting root doc",t),this.rootDoc=t,this.version===1?this.extract(t):this.extract(this.getRootDocV2())}docTranslator(t,e,n){if(e.stmt===$t){this.docTranslator(t,e.state1,!0),this.docTranslator(t,e.state2,!1);return}if(e.stmt===q&&(e.id===$.START_NODE?(e.id=t.id+(n?"_start":"_end"),e.start=n):e.id=e.id.trim()),e.stmt!==J&&e.stmt!==q||!e.doc)return;const s=[];let h=[];for(const o of e.doc)if(o.type===Yt){const f=ut(o);f.doc=ut(h),s.push(f),h=[]}else h.push(o);if(s.length>0&&h.length>0){const o={stmt:q,id:ce(),type:"divider",doc:ut(h)};s.push(ut(o)),e.doc=s}e.doc.forEach(o=>this.docTranslator(e,o,!0))}getRootDocV2(){return this.docTranslator({id:J,stmt:J},{id:J,stmt:J,doc:this.rootDoc},!0),{id:J,doc:this.rootDoc}}addState(t,e=et,n=void 0,s=void 0,h=void 0,o=void 0,f=void 0,S=void 0){const l=t==null?void 0:t.trim();if(!this.currentDocument.states.has(l))k.info("Adding state ",l,s),this.currentDocument.states.set(l,{stmt:q,id:l,descriptions:[],type:e,doc:n,note:h,classes:[],styles:[],textStyles:[]});else{const g=this.currentDocument.states.get(l);if(!g)throw new Error(`State not found: ${l}`);g.doc||(g.doc=n),g.type||(g.type=e)}if(s&&(k.info("Setting state description",l,s),(Array.isArray(s)?s:[s]).forEach(g=>this.addDescription(l,g.trim()))),h){const g=this.currentDocument.states.get(l);if(!g)throw new Error(`State not found: ${l}`);g.note=h,g.note.text=X.sanitizeText(g.note.text,N())}o&&(k.info("Setting state classes",l,o),(Array.isArray(o)?o:[o]).forEach(g=>this.setCssClass(l,g.trim()))),f&&(k.info("Setting state styles",l,f),(Array.isArray(f)?f:[f]).forEach(g=>this.setStyle(l,g.trim()))),S&&(k.info("Setting state styles",l,f),(Array.isArray(S)?S:[S]).forEach(g=>this.setTextStyle(l,g.trim())))}clear(t){this.nodes=[],this.edges=[],this.documents={root:Bt()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Rt(),t||(this.links=new Map,he())}getState(t){return this.currentDocument.states.get(t)}getStates(){return this.currentDocument.states}logDocuments(){k.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(t,e,n){this.links.set(t,{url:e,tooltip:n}),k.warn("Adding link",t,e,n)}getLinks(){return this.links}startIdIfNeeded(t=""){return t===$.START_NODE?(this.startEndCount++,`${$.START_TYPE}${this.startEndCount}`):t}startTypeIfNeeded(t="",e=et){return t===$.START_NODE?$.START_TYPE:e}endIdIfNeeded(t=""){return t===$.END_NODE?(this.startEndCount++,`${$.END_TYPE}${this.startEndCount}`):t}endTypeIfNeeded(t="",e=et){return t===$.END_NODE?$.END_TYPE:e}addRelationObjs(t,e,n=""){const s=this.startIdIfNeeded(t.id.trim()),h=this.startTypeIfNeeded(t.id.trim(),t.type),o=this.startIdIfNeeded(e.id.trim()),f=this.startTypeIfNeeded(e.id.trim(),e.type);this.addState(s,h,t.doc,t.description,t.note,t.classes,t.styles,t.textStyles),this.addState(o,f,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.currentDocument.relations.push({id1:s,id2:o,relationTitle:X.sanitizeText(n,N())})}addRelation(t,e,n){if(typeof t=="object"&&typeof e=="object")this.addRelationObjs(t,e,n);else if(typeof t=="string"&&typeof e=="string"){const s=this.startIdIfNeeded(t.trim()),h=this.startTypeIfNeeded(t),o=this.endIdIfNeeded(e.trim()),f=this.endTypeIfNeeded(e);this.addState(s,h),this.addState(o,f),this.currentDocument.relations.push({id1:s,id2:o,relationTitle:n?X.sanitizeText(n,N()):void 0})}}addDescription(t,e){var h;const n=this.currentDocument.states.get(t),s=e.startsWith(":")?e.replace(":","").trim():e;(h=n==null?void 0:n.descriptions)==null||h.push(X.sanitizeText(s,N()))}cleanupLabel(t){return t.startsWith(":")?t.slice(2).trim():t.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(t,e=""){this.classes.has(t)||this.classes.set(t,{id:t,styles:[],textStyles:[]});const n=this.classes.get(t);e&&n&&e.split($.STYLECLASS_SEP).forEach(s=>{const h=s.replace(/([^;]*);/,"$1").trim();if(RegExp($.COLOR_KEYWORD).exec(s)){const o=h.replace($.FILL_KEYWORD,$.BG_FILL).replace($.COLOR_KEYWORD,$.FILL_KEYWORD);n.textStyles.push(o)}n.styles.push(h)})}getClasses(){return this.classes}setCssClass(t,e){t.split(",").forEach(n=>{var h;let s=this.getState(n);if(!s){const o=n.trim();this.addState(o),s=this.getState(o)}(h=s==null?void 0:s.classes)==null||h.push(e)})}setStyle(t,e){var n,s;(s=(n=this.getState(t))==null?void 0:n.styles)==null||s.push(e)}setTextStyle(t,e){var n,s;(s=(n=this.getState(t))==null?void 0:n.textStyles)==null||s.push(e)}getDirectionStatement(){return this.rootDoc.find(t=>t.stmt===It)}getDirection(){var t;return((t=this.getDirectionStatement())==null?void 0:t.value)??de}setDirection(t){const e=this.getDirectionStatement();e?e.value=t:this.rootDoc.unshift({stmt:It,value:t})}trimColon(t){return t.startsWith(":")?t.slice(1).trim():t.trim()}getData(){const t=N();return{nodes:this.nodes,edges:this.edges,other:{},config:t,direction:Ht(this.getRootDocV2())}}getConfig(){return N().state}},d(pt,"StateDB"),pt.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3},pt),Re=d(t=>`
defs [id$="-barbEnd"] {
    fill: ${t.transitionColor};
    stroke: ${t.transitionColor};
  }
g.stateGroup text {
  fill: ${t.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${t.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${t.stateLabelColor};
}

g.stateGroup rect {
  fill: ${t.mainBkg};
  stroke: ${t.nodeBorder};
}

g.stateGroup line {
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.transition {
  stroke: ${t.transitionColor};
  stroke-width: ${t.strokeWidth||1};
  fill: none;
}

.stateGroup .composit {
  fill: ${t.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${t.noteBorderColor};
  fill: ${t.noteBkgColor};

  text {
    fill: ${t.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${t.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${t.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
  background-color: ${t.edgeLabelBackground};
  p {
    background-color: ${t.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${t.edgeLabelBackground};
    fill: ${t.edgeLabelBackground};
  }
  text-align: center;
}
.edgeLabel .label text {
  fill: ${t.transitionLabelColor||t.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${t.transitionLabelColor||t.tertiaryTextColor};
}

.stateLabel text {
  fill: ${t.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node .fork-join {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node circle.state-end {
  fill: ${t.innerEndBackground};
  stroke: ${t.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${t.compositeBackground||t.background};
  // stroke: ${t.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${t.stateBkg||t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}
.node polygon {
  fill: ${t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};;
  stroke-width: ${t.strokeWidth||1}px;
}
[id$="-barbEnd"] {
  fill: ${t.lineColor};
}

.statediagram-cluster rect {
  fill: ${t.compositeTitleBackground};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}

.cluster-label, .nodeLabel {
  color: ${t.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${t.stateBorder||t.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${t.compositeBackground||t.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${t.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${t.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${t.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${t.lineColor};
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${t.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${t.mainBkg};
  stroke: ${t.useGradient?"url("+t.svgId+"-gradient)":t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth??1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${t.radius}px;
  ry: ${t.radius}px;
  filter: ${t.dropShadow?t.dropShadow.replace("url(#drop-shadow)",`url(${t.svgId}-drop-shadow)`):"none"}
}
`,"getStyles"),We=Re;export{je as M,We as U,Ge as V,Pe as Y};
