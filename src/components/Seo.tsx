import { useLocation } from 'react-router-dom';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
}

const Seo: React.FC<SeoProps> = ({ title, description, image }) => {
  const location = useLocation();
  const defaultTitle = 'Elite House - Imobiliária em Piracicaba';
  const defaultDescription = 'Encontre o imóvel dos seus sonhos com a Elite House. Imobiliária especializada em Piracicaba.';
  const defaultImage = '/src/img/icon.png';

  const getTitle = () => {
    if (!title) return defaultTitle;
    return `${title} | ${defaultTitle}`;
  };

  return (
    <>
      <title>{getTitle()}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta property="og:title" content={getTitle()} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={window.location.href} />
      <meta name="twitter:title" content={getTitle()} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </>
  );
};

export default Seo;
