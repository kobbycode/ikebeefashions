import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
  const siteName = "IKEBEE Luxury Fashion House";
  const defaultDescription = "IKEBEE is a dialogue between the echoes of our ancestors and the rhythm of tomorrow. Premium Ghanaian textiles and bespoke fashion.";
  const defaultImage = "https://ikebee-admin-panel-2026.web.app/logo.jpeg";
  
  return (
    <Helmet>
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || "https://ikebee.com"} />
      <meta property="og:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || "https://ikebee.com"} />
      <meta property="twitter:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;
