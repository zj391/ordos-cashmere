import { useTranslation } from 'react-i18next';
import { ArrowRight, MessageCircle, Mail } from 'lucide-react';

interface CTASectionProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'minimal' | 'inline';
  align?: 'left' | 'center' | 'right';
}

export default function CTASection({
  title,
  description,
  variant = 'default',
  align = 'center',
}: CTASectionProps) {
  const { t } = useTranslation();

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const buttonContainerClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  if (variant === 'inline') {
    return (
      <div className="inline-flex gap-3 flex-wrap">
        <a
          href="https://wa.me/8615661853999"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors text-sm"
        >
          <MessageCircle size={16} />
          {t('cta.whatsapp')}
        </a>
        <a
          href="mailto:dongxiaocashmere@erdosdx.com"
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-border transition-colors text-sm"
        >
          <Mail size={16} />
          {t('cta.email')}
        </a>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`${alignClass}`}>
        <a
          href="/products/"
          className="inline-flex items-center gap-2 text-accent font-semibold hover:text-[#C9A227] transition-colors group"
        >
          {t('cta.exploreProducts')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    );
  }

  return (
    <div className={alignClass}>
      {title && <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h3>}
      {description && <p className="text-lg text-muted-foreground mb-8 max-w-2xl">{description}</p>}
      <div className={`flex ${buttonContainerClass} gap-4 flex-wrap`}>
        <a
          href="https://wa.me/8615661853999"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center gap-2"
        >
          <MessageCircle size={18} />
          {t('cta.getQuoteWhatsApp')}
        </a>
        <a
          href="/faq/"
          className="px-8 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-border transition-colors inline-flex items-center gap-2"
        >
          {t('cta.viewFaq')}
          <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}
