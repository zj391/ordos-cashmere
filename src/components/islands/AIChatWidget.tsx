/**
 * AI 24h 双语智能客服聊天窗口
 * 由 FloatingChatButtons 按钮触发打开
 * 通过 /api/chat 调用 LLM（OpenRouter/Manus Forge/DeepSeek 任一）
 *
 * 6 国 i18n：内部 messages 多语言
 */
import { useState, useRef, useEffect } from 'react';
import React from 'react';

interface Props {
  locale: string;
}

const I18N: Record<string, {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  poweredBy: string;
  offline: string;
  escalateWa: string;
  escalateWc: string;
  openInWa: string;
  wechatIdLabel: string;
  errorOffline: string;
}> = {
  en: {
    title: 'Chat with DONGXIAO®',
    subtitle: 'AI assistant · Replies in seconds · B2B wholesale',
    placeholder: 'Ask about MOQ, lead time, samples, factory audit…',
    send: 'Send',
    poweredBy: 'AI assistant may make errors. For formal quotes please use the inquiry form.',
    offline: 'AI chat is offline. Reach us directly:',
    escalateWa: 'Chat on WhatsApp',
    escalateWc: 'WeChat: ',
    openInWa: 'Open WhatsApp',
    wechatIdLabel: 'WeChat ID',
    errorOffline: 'AI service unavailable. Please try WhatsApp.',
  },
  cn: {
    title: '在线咨询 DONGXIAO®',
    subtitle: 'AI 助理 · 秒级回复 · B2B 批发',
    placeholder: '询问 MOQ、交期、样品、验厂…',
    send: '发送',
    poweredBy: 'AI 回答仅供参考。正式报价请使用询盘表单。',
    offline: 'AI 客服暂时不可用，请直接联系我们：',
    escalateWa: 'WhatsApp 咨询',
    escalateWc: '微信号：',
    openInWa: '打开 WhatsApp',
    wechatIdLabel: '微信',
    errorOffline: 'AI 服务暂不可用，请使用 WhatsApp。',
  },
  de: {
    title: 'Chat mit DONGXIAO®',
    subtitle: 'KI-Assistent · Antwort in Sekunden · B2B-Großhandel',
    placeholder: 'Fragen zu MOQ, Lieferzeit, Muster, Werksaudit…',
    send: 'Senden',
    poweredBy: 'KI kann Fehler machen. Für formelle Angebote bitte Anfrageformular nutzen.',
    offline: 'KI-Chat offline. Kontaktieren Sie uns direkt:',
    escalateWa: 'WhatsApp-Chat',
    escalateWc: 'WeChat:',
    openInWa: 'WhatsApp öffnen',
    wechatIdLabel: 'WeChat-ID',
    errorOffline: 'KI-Dienst nicht verfügbar. Bitte WhatsApp nutzen.',
  },
  fr: {
    title: 'Discuter avec DONGXIAO®',
    subtitle: 'Assistant IA · Réponse en secondes · B2B gros',
    placeholder: 'Demandez MOQ, délai, échantillons, audit d\'usine…',
    send: 'Envoyer',
    poweredBy: 'L\'IA peut faire des erreurs. Pour devis formel utilisez le formulaire.',
    offline: 'Chat IA hors ligne. Contactez-nous directement :',
    escalateWa: 'Discuter sur WhatsApp',
    escalateWc: 'WeChat :',
    openInWa: 'Ouvrir WhatsApp',
    wechatIdLabel: 'ID WeChat',
    errorOffline: 'Service IA indisponible. Utilisez WhatsApp.',
  },
  ja: {
    title: 'DONGXIAO® とチャット',
    subtitle: 'AI アシスタント · 即時返信 · B2B 卸売',
    placeholder: 'MOQ、リードタイム、サンプル、工場監査について…',
    send: '送信',
    poweredBy: 'AI の回答は参考です。正式見積もりは問い合わせフォームをご利用ください。',
    offline: 'AI チャットオフライン。以下からご連絡ください：',
    escalateWa: 'WhatsApp で相談',
    escalateWc: 'WeChat：',
    openInWa: 'WhatsApp を開く',
    wechatIdLabel: 'WeChat ID',
    errorOffline: 'AI サービス利用不可。WhatsApp をご利用ください。',
  },
  kr: {
    title: 'DONGXIAO® 와 채팅',
    subtitle: 'AI 어시스턴트 · 즉시 응답 · B2B 도매',
    placeholder: 'MOQ, 리드타임, 샘플, 공장 심사에 대해…',
    send: '보내기',
    poweredBy: 'AI 답변은 참고용입니다. 정식 견적은 문의 양식을 이용하세요.',
    offline: 'AI 채팅 오프라인. 직접 연락 주세요:',
    escalateWa: 'WhatsApp 상담',
    escalateWc: 'WeChat:',
    openInWa: 'WhatsApp 열기',
    wechatIdLabel: 'WeChat ID',
    errorOffline: 'AI 서비스 불가. WhatsApp을 이용해 주세요.',
  },
};

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const GREETINGS: Record<string, string> = {
  en: 'Hello! I\'m the DONGXIAO® AI assistant. I can answer questions about MOQ, lead times, sampling, certifications, and our Ordos factory. How can I help?',
  cn: '您好！我是 DONGXIAO® AI 助理。可以回答 MOQ、交期、样品、资质、鄂尔多斯工厂相关问题。请问需要什么帮助？',
  de: 'Hallo! Ich bin der DONGXIAO® KI-Assistent. Ich beantworte Fragen zu MOQ, Lieferzeiten, Mustern, Zertifizierungen und unserer Ordos-Fabrik. Wie kann ich helfen?',
  fr: 'Bonjour ! Je suis l\'assistant IA DONGXIAO®. Je réponds aux questions sur MOQ, délais, échantillons, certifications et notre usine d\'Ordos. Comment puis-je aider ?',
  ja: 'こんにちは！DONGXIAO® AI アシスタントです。MOQ、リードタイム、サンプル、認証、オルドス工場についてお答えします。ご用件は？',
  kr: '안녕하세요! DONGXIAO® AI 어시스턴트입니다. MOQ, 리드타임, 샘플, 인증, 오르도스 공장에 대한 질문에 답할 수 있습니다. 무엇을 도와드릴까요?',
};

const SUGGESTED: Record<string, string[]> = {
  en: ['What is your MOQ?', 'Lead time for raw material?', 'Do you offer samples?', 'Factory audit welcome?'],
  cn: ['起订量多少？', '原料交期多久？', '可以提供样品吗？', '可以验厂吗？'],
  de: ['Was ist Ihre MOQ?', 'Lieferzeit für Rohmaterial?', 'Bieten Sie Muster an?', 'Werksaudit möglich?'],
  fr: ['Quel est votre MOQ ?', 'Délai pour matière première ?', 'Proposez-vous des échantillons ?', 'Audit d\'usine possible ?'],
  ja: ['MOQはいくらですか？', '原料のリードタイムは？', 'サンプルは提供可能ですか？', '工場監査は可能ですか？'],
  kr: ['MOQ가 얼마인가요?', '원료 리드타임은?', '샘플 제공되나요?', '공장 심사 가능한가요?'],
};

export default function AIChatWidget({ locale }: Props) {
  const t = I18N[locale] || I18N.en;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: GREETINGS[locale] || GREETINGS.en, ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // 监听全局事件：双按钮触发打开聊天
  useEffect(() => {
    function onOpen() { setOpen(true); }
    window.addEventListener('hermes:open-ai-chat', onOpen as any);
    return () => window.removeEventListener('hermes:open-ai-chat', onOpen as any);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: trimmed, ts: Date.now() }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setOffline(false);

    // 立刻加一个空的 assistant 消息（流式输出容器）
    const placeholderIdx = next.length;
    setMessages([...next, { role: 'assistant', content: '', ts: Date.now() }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === 'llm_not_configured') {
          setOffline(true);
          setMessages((cur) => {
            const copy = [...cur];
            copy[placeholderIdx] = { role: 'assistant', content: t.offline, ts: Date.now() };
            return copy;
          });
        } else {
          setMessages((cur) => {
            const copy = [...cur];
            copy[placeholderIdx] = { role: 'assistant', content: t.errorOffline, ts: Date.now() };
            return copy;
          });
        }
        return;
      }

      // 打字机效果：逐字显示 AI 回复
      const full = data.reply || '...';
      const CHARS_PER_TICK = 3;  // 每 tick 显示 3 字符
      const TICK_MS = 18;        // 每 tick 18ms（≈180 字符/秒，接近自然阅读速度）
      let i = 0;
      const tick = () => {
        i = Math.min(i + CHARS_PER_TICK, full.length);
        setMessages((cur) => {
          const copy = [...cur];
          copy[placeholderIdx] = { role: 'assistant', content: full.slice(0, i), ts: Date.now() };
          return copy;
        });
        if (i < full.length) setTimeout(tick, TICK_MS);
      };
      tick();
    } catch (e) {
      setMessages((cur) => {
        const copy = [...cur];
        copy[placeholderIdx] = { role: 'assistant', content: t.errorOffline, ts: Date.now() };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* 聊天窗口（不再独立显示浮动按钮，由 FloatingChatButtons 的 AI 入口触发） */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-2rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{t.title}</div>
              <div className="text-xs opacity-80 truncate">{t.subtitle}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="ml-2 w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-card">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-3 py-2 rounded-2xl rounded-bl-sm text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                </div>
              </div>
            )}
            {/* Suggested prompts (only at start) */}
            {messages.length <= 1 && (
              <div className="grid grid-cols-1 gap-2 pt-2">
                {(SUGGESTED[locale] || SUGGESTED.en).map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => send(s)}
                    disabled={busy}
                    className="text-left text-xs px-3 py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {/* Offline escalation */}
            {offline && (
              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me/8613800000000?text=Hi%20DONGXIAO%20Cashmere"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                >
                  💬 {t.escalateWa}
                </a>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                disabled={busy}
                className="flex-1 px-3 py-2 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.send}
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-2 leading-snug">{t.poweredBy}</div>
          </form>
        </div>
      )}
    </>
  );
}
