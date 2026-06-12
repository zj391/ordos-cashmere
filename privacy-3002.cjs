const http = require('http');
const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Privacy Policy - DONGXIAO Cashmere</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.6;color:#333}
h1{color:#1a1a1a;border-bottom:2px solid #c9a96e;padding-bottom:.5rem}
h2{margin-top:2rem;color:#2a2a2a}
section{margin-bottom:1.5rem}
a{color:#c9a96e}
.updated{color:#666;font-size:.9rem}
</style>
</head>
<body>
<h1>Privacy Policy</h1>
<p class="updated">Last updated: 2026-01-01</p>
<section><h2>Information We Collect</h2><p>We collect information you provide directly: name, email, phone, company info, and any content you choose to provide.</p></section>
<section><h2>How We Use Your Information</h2><p>We use information to: process orders, respond to inquiries, send product updates and marketing communications (with consent), and improve services.</p></section>
<section><h2>Information Sharing</h2><p>We do not sell or rent personal information. We may share with service providers who assist our business, subject to confidentiality obligations.</p></section>
<section><h2>Data Retention</h2><p>We retain information as long as your account is active or needed for services. Some information may be retained longer as required by law.</p></section>
<section><h2>Your Rights</h2><p>You have the right to: access, correct, delete your personal data, object to processing, and data portability. Contact: dongxiaocashmere@erdosdx.com</p></section>
<section><h2>Data Security</h2><p>We implement appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction.</p></section>
<section><h2>Cookies</h2><p>We use cookies to: keep you logged in, remember preferences, understand website usage, and deliver relevant ads. You can control cookies via browser settings.</p></section>
<section><h2>Third-Party Services</h2><p>Our website may contain links to third-party websites. We are not responsible for their privacy practices.</p></section>
<section><h2>Children's Privacy</h2><p>Our services are not intended for individuals under 18. We do not knowingly collect information from children.</p></section>
<section><h2>Contact Us</h2><p>Email: dongxiaocashmere@erdosdx.com<br>WhatsApp: +86 156 6185 3999<br>Address: Inner Mongolia, China</p></section>
</body></html>`;

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
}).listen(3002, () => console.log('Privacy server: http://localhost:3002/privacy-policy'));