import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {/* empty */}
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-32 flex items-center justify-center bg-background">
      <div className="animate-pulse text-white/50 uppercase tracking-widest text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background px-margin-edge">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h1 className="font-bodoni text-display-sm text-primary mb-2">The Journal</h1>
        <p className="font-hanken text-body-md text-on-surface-variant mb-12">Thoughts, stories, and ideas from IKEBEE</p>
        {posts.length === 0 ? (
          <p className="text-center text-white/40 py-20 uppercase tracking-widest text-sm">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-12">
            {posts.map((post, idx) => (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={post.id}
                className="border-b border-white/10 pb-12 last:border-0"
              >
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover mb-6" />
                )}
                <h2 className="font-bodoni text-display-xs text-primary mb-2">{post.title}</h2>
                <p className="font-hanken text-xs text-secondary uppercase tracking-widest mb-6">
                  {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
                <div className="font-hanken text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">{post.content}</div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Blog;
