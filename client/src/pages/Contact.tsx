import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    product: '',
    quantity: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast.success(t('contact.toastSuccess'));
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      product: '',
      quantity: '',
      message: '',
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact DONGXIAO® CASHMERE | B2B Wholesale Inquiries</title>
        <meta name="description" content="Get in touch with DONGXIAO® CASHMERE for wholesale pricing, custom orders, and B2B solutions. WhatsApp, email, and contact form available." />
        <meta property="og:title" content="Contact DONGXIAO® CASHMERE | B2B Wholesale Inquiries" />
        <meta property="og:description" content="Get in touch with DONGXIAO® CASHMERE for wholesale pricing, custom orders, and B2B solutions. WhatsApp, email, and contact form available." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact DONGXIAO® CASHMERE | B2B Wholesale Inquiries" />
        <meta name="twitter:description" content="Get in touch with DONGXIAO® CASHMERE for wholesale pricing, custom orders, and B2B solutions. WhatsApp, email, and contact form available." />
      </Helmet>
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl mb-4">{t('contact.section.pageTitle')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('contact.section.pageDescription')}
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* WhatsApp */}
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Phone className="text-accent mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-2">{t('contact.section.whatsappTitle')}</h3>
              <a href="https://wa.me/8615661853999" target="_blank" rel="noopener noreferrer" className="text-muted-foreground mb-2 hover:text-accent transition-colors block">
                +86 156 6185 3999
              </a>
              <p className="text-sm text-muted-foreground">{t('contact.section.fastResponse')}</p>
            </div>

            {/* Email */}
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Mail className="text-accent mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-2">{t('contact.section.emailTitle')}</h3>
              <a href="mailto:dongxiaocashmere@erdosdx.com" className="text-muted-foreground mb-2 hover:text-accent transition-colors block">
                dongxiaocashmere@erdosdx.com
              </a>
              <p className="text-sm text-muted-foreground">{t('contact.section.respondWithin')}</p>
            </div>

            {/* Location */}
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <MapPin className="text-accent mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-2">{t('contact.section.locationTitle')}</h3>
              <p className="text-muted-foreground mb-2">{t('contact.section.innerMongolia')}</p>
              <p className="text-sm text-muted-foreground">{t('contact.section.factoryName')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl text-center mb-12">{t('contact.section.sendMessageTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2">
                  {t('contact.section.fullName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('contact.section.yourName')}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  {t('contact.section.emailAddress')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('contact.section.yourEmail')}
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-semibold mb-2">
                  {t('contact.section.companyName')}
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('contact.section.yourCompany')}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                  {t('contact.section.phoneNumber')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('contact.section.yourPhone')}
                />
              </div>

              {/* Product Interest */}
              <div>
                <label htmlFor="product" className="block text-sm font-semibold mb-2">
                  {t('contact.section.productInterest')}
                </label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">{t('contact.section.selectProduct')}</option>
                  <option value="hats">{t('contact.section.cashmereHats')}</option>
                  <option value="sweaters">{t('contact.section.sweatersKnitwear')}</option>
                  <option value="scarves">{t('contact.section.scarvesWraps')}</option>
                  <option value="accessories">{t('contact.section.accessories')}</option>
                  <option value="yarn">{t('contact.section.cashmereYarn')}</option>
                  <option value="other">{t('contact.section.other')}</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold mb-2">
                  {t('contact.section.estimatedQuantity')}
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('contact.section.quantityPlaceholder')}
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  {t('contact.section.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder={t('contact.section.messagePlaceholder')}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-md font-semibold hover:bg-[#C9A227] transition-colors flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {t('contact.section.sendInquiry')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}