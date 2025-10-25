'use client';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';

// Emotionのスタイルをどこに挿入するかを管理するための設定
export default function EmotionRegistry({ children }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  // サーバーサイドでHTMLにスタイルを挿入するためのフック
  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    );
  });

  // CacheProviderでラップして、子コンポーネントでEmotionが使えるようにする
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}