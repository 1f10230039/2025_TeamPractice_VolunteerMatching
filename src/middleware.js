// src/middleware.js

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  // レスポンスの初期化
  console.log("👮‍♂️ Middleware is running! Path:", request.nextUrl.pathname);
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // クッキーを読み取る
        getAll() {
          return request.cookies.getAll();
        },
        // クッキーをセット・削除する
        setAll(cookiesToSet) {
          // リクエストにもクッキーを反映させる
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );

          // レスポンスを作り直してクッキーを反映させる
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // レスポンスにクッキーを書き込む
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() を呼ぶことで、セッションをリフレッシュし、
  // 確実に最新のAuth状態をクッキーに反映させます
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // 画像や静的ファイル以外の全てのリクエストでミドルウェアを動かす設定
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
