import { createServer } from "http";

const texts = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated",
    sections: [
      { heading: "Information We Collect", body: "We collect information you provide directly to us, including: name, email address, phone number, company information, and any other information you choose to provide when contacting us or placing an order." },
      { heading: "How We Use Your Information", body: "We use the information we collect to: process and fulfill orders, respond to your inquiries, send you product updates and marketing communications (with your consent), and improve our services." },
      { heading: "Information Sharing", body: "We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our business, subject to confidentiality obligations." },
      { heading: "Data Retention", body: "We retain your information for as long as your account is active or as needed to provide you services. We may retain certain information for longer periods as required by law." },
      { heading: "Your Rights", body: "You have the right to: access your personal data, correct inaccurate data, delete your personal data, object to processing of your personal data, and data portability. To exercise these rights, contact us at dongxiaocashmere@erdosdx.com." },
      { heading: "Data Security", body: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction." },
      { heading: "Cookies", body: "We use cookies and similar technologies to: keep you logged in, remember your preferences, understand how you use our website, and deliver relevant advertisements. You can control cookies through your browser settings." },
      { heading: "Third-Party Services", body: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies." },
      { heading: "Children's Privacy", body: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children." },
      { heading: "Contact Us", body: "If you have any questions about this Privacy Policy, please contact us:" },
    ],
    contact: { email: "dongxiaocashmere@erdosdx.com", whatsapp: "+86 156 6185 3999", address: "Inner Mongolia, China" }
  },
  zh: {
    title: "隐私政策",
    lastUpdated: "最后更新",
    sections: [
      { heading: "信息收集", body: "我们收集您直接向我们提供的信息，包括：姓名、电子邮件地址、电话号码、公司信息，以及您在联系我们或下订单时选择提供的任何其他信息。" },
      { heading: "信息使用方式", body: "我们使用收集的信息来：处理和履行订单、回复您的询问、向您发送产品更新和营销通讯（在您同意的情况下），以及改进我们的服务。" },
      { heading: "信息共享", body: "我们不会将您的个人信息出售、交易或出租给第三方。我们可能会与服务提供商共享您的信息，以帮助我们运营业务，但须遵守保密义务。" },
      { heading: "数据保留", body: "我们会保留您的信息，只要您的账户处于活跃状态或我们需要为您提供服务。我们可能会根据法律要求保留某些信息更长时间。" },
      { heading: "您的权利", body: "您有权：访问您的个人数据、更正不准确的数据、删除您的个人数据、反对处理您的个人数据，以及数据可携带性。如要行使这些权利，请通过 dongxiaocashmere@erdosdx.com 联系我们。" },
      { heading: "数据安全", body: "我们实施适当的技术和组织措施，保护您的个人数据免受未经授权的访问、更改、披露或销毁。" },
      { heading: "Cookie", body: "我们使用 Cookie 和类似技术来：让您保持登录状态、记住您的偏好、了解您如何使用我们的网站，以及投放相关广告。您可以通过浏览器设置控制 Cookie。" },
      { heading: "第三方服务", body: "我们的网站可能包含指向第三方网站的链接。我们不对这些第三方的隐私惯例负责。我们鼓励您阅读他们的隐私政策。" },
      { heading: "儿童隐私", body: "我们的服务不面向18岁以下的个人。我们不会故意收集儿童的个人信息。" },
      { heading: "联系我们", body: "如果您对本隐私政策有任何疑问，请联系我们：" },
    ],
    contact: { email: "dongxiaocashmere@erdosdx.com", whatsapp: "+86 156 6185 3999", address: "中国内蒙古" }
  }
};

function renderPage(lang) {
  const t = texts[lang] || texts.en;
  const sectionsHtml = t.sections.map(s =>
    `<section><h2>${s.heading}</h2><p>${s.body}</p></section>`
  ).join("\n");
  const isZh = lang === "zh";
  const contactHtml = isZh
    ? `<p>邮箱: ${t.contact.email}<br>WhatsApp: ${t.contact.whatsapp}<br>地址: ${t.contact.address}</p>`
    : `<p>Email: ${t.contact.email}<br>WhatsApp: ${t.contact.whatsapp}<br>Address: ${t.contact.address}</p>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - DONGXIAO Cashmere</title>
  <meta name="description" content="${t.title} - DONGXIAO Cashmere, Premium wholesale cashmere products from Inner Mongolia.">
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem 1rem; line-height: 1.7; color: #1a1a1a; background: #fafafa; }
    .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; border-bottom: 3px solid #c9a96e; padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
    .updated { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
    h2 { color: #2a2a2a; margin-top: 1.5rem; font-size: 1.1rem; }
    section { margin-bottom: 1rem; }
    section p { color: #444; margin: 0.5rem 0; }
    .contact-box { background: #f9f5ed; padding: 1rem; border-radius: 6px; margin-top: 2rem; border-left: 4px solid #c9a96e; }
    .lang-switch { text-align: right; margin-bottom: 1rem; }
    .lang-switch a { color: #c9a96e; text-decoration: none; margin-left: 1rem; font-size: 0.9rem; }
    .lang-switch a:hover { text-decoration: underline; }
    footer { text-align: center; margin-top: 2rem; color: #888; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="lang-switch">
      <a href="?lang=en">English</a>
      <a href="?lang=zh">中文</a>
    </div>
    <h1>${t.title}</h1>
    <p class="updated">${t.lastUpdated}: 2026-01-01</p>
    ${sectionsHtml}
    <div class="contact-box">
      <h2>${t.sections[t.sections.length-1].heading}</h2>
      ${contactHtml}
    </div>
    <footer>DONGXIAO® CASHMERE — Since 2002</footer>
  </div>
</body>
</html>`;
}

const PORT = 3001;
createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === "/privacy-policy") {
    const lang = url.searchParams.get("lang") || "en";
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderPage(lang));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
}).listen(PORT, () => {
  console.log(`Privacy Policy server running:`);
  console.log(`  http://localhost:${PORT}/privacy-policy        (English)`);
  console.log(`  http://localhost:${PORT}/privacy-policy?lang=zh (中文)`);
});