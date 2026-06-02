import { motion } from 'framer-motion';

const LegalPage = ({ title, subtitle, sections }) => (
  <div className="pt-32 pb-section-gap px-4 sm:px-8 md:px-margin-edge max-w-3xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <span className="font-hanken text-label-sm text-secondary uppercase tracking-[0.4em] mb-4 block">
        {subtitle}
      </span>
      <h1 className="font-bodoni text-4xl sm:text-headline-lg text-primary mb-4">{title}</h1>
      <div className="w-12 h-[1px] bg-secondary mb-12"></div>
      <div className="space-y-10">
        {sections.map((s, i) => (
          <div key={i}>
            {s.heading && (
              <h2 className="font-bodoni text-headline-md text-primary mb-4">{s.heading}</h2>
            )}
            <p className="font-hanken text-body-md text-on-surface-variant leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export const Sustainability = () => (
  <LegalPage
    title="Our Commitment to Sustainability"
    subtitle="Maison — Ethics"
    sections={[
      { body: "At IKEBEE, sustainability is not a marketing strategy — it is the foundation on which every garment is built. We believe that true luxury is responsible luxury." },
      { heading: "Locally Sourced Materials", body: "Every textile we use is sourced directly from Ghanaian weaving communities. By eliminating long supply chains, we reduce our carbon footprint while ensuring our artisans are paid fairly for their craft." },
      { heading: "Small-Batch Production", body: "We intentionally produce in small batches to avoid overstock and waste. Every piece in our collection is made to order or in extremely limited quantities." },
      { heading: "Artisan Partnerships", body: "We maintain long-term partnerships with over 15 master artisans and weaving cooperatives across Ghana, providing stable income and preserving crafts that are in danger of being lost." },
      { heading: "Our Future Commitments", body: "By 2026, we aim to achieve a fully carbon-neutral production process and publish an annual transparency report on our supply chain, wages, and environmental impact." },
    ]}
  />
);

export const Shipping = () => (
  <LegalPage
    title="Shipping & Returns"
    subtitle="Maison — Logistics"
    sections={[
      { body: "We ship our collections worldwide. Given the bespoke nature of our garments, please allow adequate lead times for your order to be crafted to perfection." },
      { heading: "Ready-to-Wear", body: "Ready-to-wear pieces are typically dispatched within 5–7 business days from our Accra atelier. International shipping to Europe and North America takes 7–14 business days." },
      { heading: "Bespoke Orders", body: "Bespoke commissions require 6–10 weeks for creation from the point of material confirmation. You will receive updates at each stage of the process." },
      { heading: "Returns Policy", body: "We accept returns on ready-to-wear items within 14 days of receipt, provided the garment is unworn and in original condition. Bespoke items are non-refundable as they are crafted exclusively for you." },
      { heading: "Contact Our Concierge", body: "For all shipping enquiries, please contact our concierge team at concierge@ikebee.com or via our WhatsApp concierge service." },
    ]}
  />
);

export const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    subtitle="Maison — Legal"
    sections={[
      { body: "IKEBEE respects your privacy. This policy explains how we collect, use, and protect your personal information when you interact with our website and services." },
      { heading: "Information We Collect", body: "We collect information you provide directly — such as your name, email address, and consultation details. We also collect standard web analytics data to improve your experience on our site." },
      { heading: "How We Use Your Information", body: "Your data is used solely to process orders, respond to consultations, and send you editorial updates you have opted into. We never sell your personal information to third parties." },
      { heading: "Data Security", body: "All personal data is stored securely and encrypted. We use industry-standard SSL protocols to protect information transmitted through our website." },
      { heading: "Your Rights", body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at privacy@ikebee.com." },
    ]}
  />
);

export const Terms = () => (
  <LegalPage
    title="Terms of Service"
    subtitle="Maison — Legal"
    sections={[
      { body: "By accessing the IKEBEE website and placing orders, you agree to the following terms and conditions. Please read them carefully." },
      { heading: "Intellectual Property", body: "All content on this website — including photography, editorial copy, and brand assets — is the exclusive property of IKEBEE Fashion House and may not be reproduced without written consent." },
      { heading: "Orders & Payment", body: "All prices are displayed in Ghana Cedis (GHS) unless otherwise stated. Payment is required in full prior to the commencement of any bespoke commission." },
      { heading: "Accuracy of Information", body: "We endeavour to ensure that all product descriptions and images are accurate. However, colours may vary slightly due to screen calibration differences." },
      { heading: "Governing Law", body: "These terms are governed by the laws of the Republic of Ghana. Any disputes shall be resolved in the courts of Accra, Ghana." },
    ]}
  />
);

export const Accessories = () => (
  <div className="pt-32 pb-section-gap px-4 sm:px-8 md:px-margin-edge max-w-container-max mx-auto">
    <div className="text-center max-w-2xl mx-auto py-section-gap">
      <span className="font-hanken text-label-sm text-secondary uppercase tracking-[0.4em] mb-6 block">Coming Soon</span>
      <h1 className="font-bodoni text-display-xl text-primary italic mb-6">Accessories</h1>
      <div className="w-12 h-[1px] bg-secondary mx-auto mb-8"></div>
      <p className="font-hanken text-body-lg text-on-surface-variant leading-relaxed">
        Our curated accessories collection — hand-crafted leather goods, woven bags, and ancestral jewellery — is arriving soon. Join our inner circle to be the first to know.
      </p>
    </div>
  </div>
);
