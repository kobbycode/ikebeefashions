import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/api';
import { products as localProducts } from '../data/products';

export const formatGHS = (price) => {
  if (price == null) return '';
  if (typeof price === 'string' && price.startsWith('GHS')) return price;
  const num = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : Number(price);
  if (isNaN(num)) return String(price);
  return `GHS ${num.toLocaleString('en-US')}`;
};

const makeSlug = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setProducts(localProducts);
        } else {
          const liveProducts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const detailsArray = Array.isArray(data.details)
              ? data.details
              : data.details
                ? [data.details]
                : [];
            return {
              id: doc.id,
              ...data,
              price: formatGHS(data.price),
              slug: data.slug || makeSlug(data.title || data.name),
              img: data.img || data.image || '',
              detailImg: data.detailImg || data.img || data.image || '',
              galleryImgs: data.galleryImgs && data.galleryImgs.length
                ? data.galleryImgs
                : [data.img || data.image || ''],
              description: data.description || (detailsArray.length ? detailsArray[0] : ''),
              details: detailsArray,
              type: data.type || 'Ready-to-Wear',
              season: data.season || '',
              artisan: data.artisan || '',
              sizes: data.sizes && data.sizes.length
                ? data.sizes
                : ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
              span: data.span || 'md:col-span-4 md:row-span-1',
              isNew: data.isNew || false,
              tag: data.tag || '',
            };
          });
          setProducts(liveProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(localProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductBySlug = (slug) => {
    return products.find(p => p.slug === slug);
  };

  return { products, loading, getProductBySlug };
};
