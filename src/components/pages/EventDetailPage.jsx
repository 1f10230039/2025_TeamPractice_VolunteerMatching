// ボランティア詳細ページコンポーネント
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaYenSign,
  FaUsers,
  FaBuilding,
  FaLink,
  FaInfoCircle,
  FaRoute,
  FaSuitcase,
  FaTshirt,
  FaCheckCircle,
  FaRegCheckCircle,
  FaHeart,
  FaRegHeart,
  FaLightbulb,
  FaThumbsUp,
  FaComments,
  FaChalkboardTeacher,
  FaTwitter,
  FaLine,
  FaMapMarkedAlt,
  FaCaretDown,
  FaMap,
  FaPenFancy,
  FaTimes,
} from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";
import ConfirmApplyModal from "../events/ConfirmApplyModal";
import EventImageGallery from "../events/EventImageGallery";

// --- インラインSVGアイコン ---
const HeartIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
  </svg>
);
const RegHeartIcon = () => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"
      fill="currentColor"
    ></path>
  </svg>
);

// --- Emotion ---

// ページ全体のラッパー
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5fafc;
  padding-bottom: 120px;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

// パンくずリストを固定するためのラッパー
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5fafc;
`;

// メインコンテンツエリア
const MainContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px;
`;

// --- ヘッダーセクション ---
const EventHeader = styled.div`
  margin-bottom: 32px;
`;

// カテゴリタグのコンテナ
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

// カテゴリタグ
const Tag = styled.span`
  display: inline-block;
  background-color: #e6f2ff;
  color: #007bff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
`;

// イベントタイトル
const EventTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.3;
  color: #333;

  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

// 主催者名
const Organizer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #666;
  font-weight: 500;
`;

// 各詳細情報のセクション
const DetailSection = styled.section`
  margin-bottom: 32px;
`;

// 情報グリッド
const InfoGrid = styled.dl`
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 24px;
  border-radius: 8px;
  padding: 8px 0;
  margin: 0;

  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
`;

// 情報のラベル
const InfoLabel = styled.dt`
  font-weight: bold;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  align-self: flex-start;
  padding-top: 4px;

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
    color: #888;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    font-size: 1rem;
    color: #333;
    margin-top: 24px;
    margin-bottom: 8px;

    &:first-of-type {
      margin-top: 0;
    }
  }
`;

// 情報の値（ddタグ）
const InfoValue = styled.dd`
  font-size: 1rem;
  color: #333;
  line-height: 1.8;
  margin: 0;
  word-break: break-word;

  @media (max-width: 600px) {
    padding-left: 4px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #eee;

    &:last-of-type {
      border-bottom: none;
    }
  }
`;

// --- クイックサマリー ---
const QuickSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 40px;
`;

// サマリーカード
const SummaryCard = styled.div`
  background-color: white;
  padding: 10px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(122, 211, 232, 0.15);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

//  アイコン部分
const SummaryIcon = styled.div`
  font-size: 1.5rem;
  color: #4a90e2;
  background-color: #f0f8ff;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ラベル部分
const SummaryLabel = styled.span`
  font-size: 0.85rem;
  color: #888;
  font-weight: 600;
  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

// 値部分
const SummaryValue = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

// --- 魅力・経験セクション ---
const HighlightSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  padding: 32px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  /* タイプ別スタイル */
  ${props =>
    props.type === "appeal"
      ? `
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 1px solid #90caf9;
    color: #0d47a1;
  `
      : `
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 1px solid #90caf9;
    color: #0d47a1;
  `}
`;

const HighlightText = styled.p`
  font-size: 1.05rem;
  line-height: 1.8;
  white-space: pre-wrap;
  font-weight: 500;
`;

// 外部リンク
const WebsiteLink = styled(Link)`
  color: #007bff;
  text-decoration: underline;
  word-break: break-all;
  transition: color 0.2s ease;

  &:hover {
    color: #0056b3;
  }
`;

// 共有セクション
const ShareSection = styled.div`
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #eee;
  text-align: center;
`;

// 共有ラベル
const ShareLabel = styled.p`
  font-weight: bold;
  color: #666;
  margin-bottom: 16px;
  font-size: 0.95rem;
`;

// 共有ボタンのコンテナ
const ShareButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

// 共有リンクボタン
const ShareLinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  text-decoration: none;
  transition:
    transform 0.2s,
    opacity 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

// Google Maps 埋め込みコンテナ
const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid #eee;
  background-color: #f0f0f0;
`;

// 地図リンク
const MapLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  margin-bottom: 16px;
  color: #007bff;
  font-size: 0.9rem;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// --- 詳細情報セクション ---
const DetailContainer = styled.section`
  background-color: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-bottom: 32px;

  @media (max-width: 600px) {
    padding: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "";
    width: 6px;
    height: 28px;
    background: linear-gradient(to bottom, #68b5d5, #4a90e2);
    border-radius: 3px;
    display: block;
  }
`;

const SectionContent = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
`;

// --- アクションメニュー ---
const ActionMenu = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  justify-content: center;
`;

// アクションボタンのコンテナ
const ActionContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  gap: 16px;
`;

// お気に入りボタン
const FavoriteButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 20px;
  border: 2px solid ${props => (props.isFavorite ? "#ff758c" : "#eee")};
  background-color: ${props => (props.isFavorite ? "#fff0f3" : "#fff")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.6rem;
  color: ${props => (props.isFavorite ? "#ff758c" : "#ccc")};

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
`;

// 応募ボタン
const ApplyButton = styled.button`
  flex-grow: 1;
  height: 60px;
  border-radius: 20px;
  border: none;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 600px) {
    font-size: 1rem;
  }

  ${props =>
    props.isApplied
      ? `
    background: linear-gradient(135deg, #42e695 0%, #3bb2b8 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #ff9a9e 0%, #ff6a88 100%);
      box-shadow: 0 8px 20px rgba(255, 106, 136, 0.4);
    }
  `
      : `
    background: linear-gradient(135deg, #68B5D5 0%, #4A90E2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3);
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

const ActivityLinkButton = styled.span`
  display: inline-block;
  margin-top: 8px;
  color: #007bff;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #0056b3;
  }
`;

// --- 次のアクションカード ---
const NextActionCard = styled.div`
  margin-top: 24px;
  padding: 24px;
  background-color: #f8fbff;
  border: 2px dashed #4a90e2;
  border-radius: 16px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    background-color: #eef6ff;
    box-shadow: 0 8px 20px rgba(74, 144, 226, 0.15);
  }

  &::before {
    content: "RECOMMENDED";
    position: absolute;
    top: 0;
    right: 0;
    background-color: #ff9f43;
    color: white;
    font-size: 0.6rem;
    font-weight: bold;
    padding: 4px 12px;
    border-radius: 0 0 0 8px;
  }
`;

const NextActionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 800;
  color: #4a90e2;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const NextActionText = styled.p`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const NextActionButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #4a90e2;
  border: 2px solid #4a90e2;
  border-radius: 30px;
  font-weight: 700;
  transition: all 0.2s;

  ${NextActionCard}:hover & {
    background-color: #4a90e2;
    color: white;
  }
`;

// リンク用のスタイル
const formatDateTime = isoString => {
  if (!isoString) return "未定";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "日付形式エラー";
  }
};

export default function EventDetailPage({ event, source, q, codes }) {
  const router = useRouter();

  // ローディング状態
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // ユーザーごとのステータス管理 (お気に入り済みか？応募済みか？)
  const [isFavorite, setIsFavorite] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [user, setUser] = useState(null);

  // シェア用のURL
  const [shareUrl, setShareUrl] = useState("");

  // 応募確認モーダルの状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    body: "",
    confirmText: "",
    isDestructive: false,
  });

  const [modalStep, setModalStep] = useState("confirm");
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  /**
   * 初期ロード時に実行される処理
   * ログインユーザー情報を取得し、「お気に入り済み」「応募済み」かどうかを
   * それぞれのテーブル (favorites, applications) に問い合わせて確認する。
   */
  useEffect(() => {
    const checkStatus = async () => {
      // 1. ログインユーザー取得
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // シェア用のURLをセット（クライアント側で実行）
      setShareUrl(window.location.href);

      // 未ログインまたはイベント情報がなければ終了
      if (!currentUser || !event) return;

      // 2. お気に入り状態の確認 (favoritesテーブル)
      const { data: favData } = await supabase
        .from("favorites")
        .select("id")
        .match({ user_id: currentUser.id, event_id: event.id })
        .maybeSingle(); // 0件か1件かを確認

      setIsFavorite(!!favData); // データがあれば true (お気に入り済み)

      // 3. 応募状態の確認 (applicationsテーブル)
      const { data: appData } = await supabase
        .from("applications")
        .select("id")
        .match({ user_id: currentUser.id, event_id: event.id })
        .maybeSingle();

      setIsApplied(!!appData); // データがあれば true (応募済み)
    };

    checkStatus();
  }, [event]);

  if (!event) {
    return <div>イベント情報を読み込み中...</div>;
  }

  // イベント情報の展開 (props から)
  const {
    id,
    name,
    tag,
    tags,
    image_url,
    event_images,
    start_datetime,
    end_datetime,
    place,
    access,
    fee,
    capacity,
    organaizer,
    long_description,
    website_url,
    belongings,
    clothing,
    selection_flow,
    experience,
    appeal,
    review,
    latitude,
    longitude,
  } = event;

  const displayTags = tags || (tag ? [{ name: tag }] : []);

  // シェア用テキストの作成
  const shareText = `ボランティア募集: ${name} に参加しよう！`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    shareUrl
  )}`;

  // パンくずリストの生成ロジック
  // どの画面から遷移してきたか(source)によって親ページを変える
  const { baseCrumb, crumbs } = (() => {
    let base = { label: "ホーム", href: "/" };
    const thisPageCrumb = {
      label: name || "イベント詳細",
      href: `/events/${id}`,
    };
    let crumbList = [];
    switch (source) {
      case "mylist":
        base = { label: "マイリスト", href: "/mylist" };
        crumbList = [thisPageCrumb];
        break;

      // 管理画面から来た場合
      case "admin":
        base = { label: "マイページ", href: "/mypage" };
        crumbList = [
          {
            label: "ボランティア管理",
            href: "/volunteer-registration/admin/events",
          },
          thisPageCrumb,
        ];
        break;

      case "keyword":
        crumbList = [
          { label: "キーワードから探す", href: "/search/keyword" },
          { label: "検索結果", href: `/search/results?q=${q || ""}` },
          thisPageCrumb,
        ];
        break;
      case "location":
        crumbList = [
          { label: "場所から探す", href: "/search/location" },
          {
            label: "検索結果",
            href: `/search/location-results?codes=${codes || ""}`,
          },
          thisPageCrumb,
        ];
        break;
      default:
        crumbList = [thisPageCrumb];
        break;
    }
    return { baseCrumb: base, crumbs: crumbList };
  })();

  const handleToggleFavorite = async e => {
    e.preventDefault();
    if (isFavoriteLoading) return;
    if (!user) {
      if (
        confirm(
          "お気に入り機能を使うにはログインが必要です。\nログインページに移動しますか？"
        )
      ) {
        window.location.href = "/login";
      }
      return;
    }
    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("お気に入り更新エラー:", error.message);
      alert("処理に失敗しました。");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  /**
   * 応募処理の実行 (モーダルでOKされた後に呼ばれる)
   * applications テーブルに対して INSERT (応募) または DELETE (キャンセル) を行う
   */
  const handleToggleApply = async () => {
    if (isApplyLoading) return;

    if (!user) {
      alert("応募するにはログインが必要です。");
      setIsModalOpen(false);
      return;
    }

    setIsApplyLoading(true);

    try {
      if (isApplied) {
        // --- キャンセル処理 (DELETE) ---
        const { error } = await supabase
          .from("applications")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;

        setIsApplied(false);

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();
          const userName = profile?.name || "ゲスト";

          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventName: name,
              applicantEmail: user.email,
              applicantName: userName,
              type: "cancel",
            }),
          });

          console.log("キャンセルメール送信リクエスト完了");
        } catch (mailError) {
          console.error("メール送信エラー:", mailError);
        }

        alert("応募をキャンセルしました。");
        setIsModalOpen(false); // キャンセルの時は普通に閉じる
      } else {
        // --- 応募登録 (INSERT) ---
        const { error } = await supabase
          .from("applications")
          .insert({ user_id: user.id, event_id: id });
        if (error) throw error;

        setIsApplied(true);

        // メール送信処理 (エラーでも続行するのでcatchのみ)
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();
          const userName = profile?.name || "ゲスト";
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventName: name,
              applicantEmail: user.email,
              applicantName: userName,
            }),
          });
        } catch (mailError) {
          console.error("メール送信エラー:", mailError);
        }

        // モーダルを成功モードに切り替える
        setModalStep("success");
      }
    } catch (error) {
      console.error("応募状態の更新エラー:", error.message);
      alert("処理に失敗しました。");
      setIsModalOpen(false); // エラー時は閉じる
    } finally {
      setIsApplyLoading(false);
    }
  };

  /**
   * 応募ボタンが押された時の処理
   */
  const handleApplyButtonPress = e => {
    e.preventDefault();
    if (isApplyLoading || isFavoriteLoading) return;
    if (!user) {
      /* ...ログイン誘導... */ return;
    }

    // 毎回確認モードからスタート
    setModalStep("confirm");

    if (isApplied) {
      setModalContent({
        title: "応募のキャンセル",
        body: "応募を取り消しますか？",
        confirmText: "取り消す",
        isDestructive: true,
      });
    } else {
      setModalContent({
        title: "応募の確認",
        body: (
          <>
            「<strong>{name || "このイベント"}</strong>
            」に応募します。よろしいですか？
          </>
        ),
        confirmText: "応募する",
        isDestructive: false,
      });
    }
    setIsModalOpen(true);
  };

  // モーダルの中身（body）を定義
  const modalBodyContent = (
    <div>
      <p>このボランティアに応募しますか？</p>
      <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "#666" }}>
        ※ 応募が完了すると、主催者に通知が送信されます。
      </p>
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f0f8ff",
          borderRadius: "8px",
        }}
      >
        <p style={{ fontSize: "0.9rem", marginBottom: "8px" }}>
          <strong>活動記録の準備</strong>
        </p>
        <p style={{ fontSize: "0.85rem", color: "#555" }}>
          参加し終わったら、忘れないうちに記録を付けましょう！
        </p>
        <Link
          href={`/activity-log/new?prefill_title=${encodeURIComponent(name)}&prefill_date=${event.start_datetime ? event.start_datetime.split("T")[0] : ""}`}
          passHref
        >
          <ActivityLinkButton>
            活動記録の下書きを作成する &gt;
          </ActivityLinkButton>
        </Link>
      </div>
    </div>
  );

  const successBodyContent = (
    <div>
      {/* メインの完了メッセージ */}
      <p style={{ textAlign: "center", color: "#666", marginBottom: "10px" }}>
        主催者に通知メールを送信しました。
        <br />
        当日の詳細連絡をお待ちください。
      </p>

      {/* 誘導カード */}
      <Link
        href={`/activity-log/new?prefill_title=${encodeURIComponent(name)}&prefill_date=${event.start_datetime ? event.start_datetime.split("T")[0] : ""}`}
        passHref
        style={{ textDecoration: "none" }}
      >
        <NextActionCard>
          <NextActionTitle>
            <FaPenFancy /> 活動記録の下書きを作る
          </NextActionTitle>

          <NextActionText>
            今のうちに下書きを作っておくと、
            <br />
            <strong>「ガクチカ」</strong>や<strong>「振り返り」</strong>が
            <br />
            もっと楽になります！
          </NextActionText>

          <NextActionButton>今すぐ下書きを作成する &gt;</NextActionButton>
        </NextActionCard>
      </Link>
    </div>
  );

  return (
    <PageWrapper>
      <StickyHeader>
        <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />
      </StickyHeader>

      <MainContent>
        {/* ヘッダーエリア */}
        <EventHeader>
          {displayTags.length > 0 && (
            <TagContainer>
              {displayTags.map((t, index) => (
                <Tag key={index}>{t.name || t}</Tag>
              ))}
            </TagContainer>
          )}
          <EventTitle>{name || "無題のイベント"}</EventTitle>
          {organaizer && <Organizer>主催: {organaizer}</Organizer>}
        </EventHeader>

        {/* ギャラリー */}
        <EventImageGallery mainImageUrl={image_url} subImages={event_images} />

        {/* クイックサマリー */}
        <QuickSummaryGrid>
          <SummaryCard>
            <SummaryIcon>
              <FaCalendarAlt />
            </SummaryIcon>
            <div>
              <SummaryLabel>日時</SummaryLabel>
              <br />
              <SummaryValue>
                {formatDateTime(start_datetime)}
                <br />～ {formatDateTime(end_datetime)}
              </SummaryValue>
            </div>
          </SummaryCard>
          <SummaryCard>
            <SummaryIcon>
              <FaMapMarkerAlt />
            </SummaryIcon>
            <div>
              <SummaryLabel>場所</SummaryLabel>
              <br />
              <SummaryValue>{place || "未定"}</SummaryValue>
            </div>
          </SummaryCard>
          <SummaryCard>
            <SummaryIcon>
              <FaYenSign />
            </SummaryIcon>
            <div>
              <SummaryLabel>費用</SummaryLabel>
              <br />
              <SummaryValue>
                {fee === 0 ? "無料" : `${fee?.toLocaleString()}円`}
              </SummaryValue>
            </div>
          </SummaryCard>
          <SummaryCard>
            <SummaryIcon>
              <FaUsers />
            </SummaryIcon>
            <div>
              <SummaryLabel>定員</SummaryLabel>
              <br />
              <SummaryValue>
                {capacity ? `${capacity}名` : "指定なし"}
              </SummaryValue>
            </div>
          </SummaryCard>
        </QuickSummaryGrid>

        {/* 魅力 & 経験 */}
        {(appeal || experience) && (
          <HighlightSection>
            {appeal && (
              <HighlightCard type="appeal">
                <SectionTitle>
                  <FaThumbsUp /> 魅力ポイント
                </SectionTitle>
                <HighlightText>{appeal}</HighlightText>
              </HighlightCard>
            )}
            {experience && (
              <HighlightCard type="experience">
                <SectionTitle>
                  <FaLightbulb /> 得られる経験
                </SectionTitle>
                <HighlightText>{experience}</HighlightText>
              </HighlightCard>
            )}
          </HighlightSection>
        )}

        {/* 詳細テキスト */}
        {long_description && (
          <DetailContainer>
            <SectionTitle>
              <FaInfoCircle /> イベント詳細
            </SectionTitle>
            <SectionContent>{long_description}</SectionContent>
          </DetailContainer>
        )}

        {latitude && longitude && (
          <DetailContainer>
            <SectionTitle>
              <FaMapMarkedAlt /> アクセスマップ
            </SectionTitle>
            <MapContainer>
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=ja&z=15&output=embed`}
                allowFullScreen
                title="Google Maps"
              ></iframe>
            </MapContainer>
            <MapLink
              href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Googleマップで大きな地図を見る ↗
            </MapLink>
            <InfoGrid>
              <InfoLabel>
                <FaMapMarkerAlt />
                アクセス情報
              </InfoLabel>
              <InfoValue>{access || "情報なし"}</InfoValue>
            </InfoGrid>
          </DetailContainer>
        )}

        {(selection_flow || belongings || clothing) && (
          <DetailContainer>
            <SectionTitle>
              <FaSuitcase /> 応募情報
            </SectionTitle>
            <InfoGrid>
              {selection_flow && (
                <>
                  <InfoLabel>
                    <FaInfoCircle />
                    選考
                  </InfoLabel>
                  <InfoValue>{selection_flow}</InfoValue>
                </>
              )}
              {belongings && (
                <>
                  <InfoLabel>
                    <FaSuitcase />
                    持ち物
                  </InfoLabel>
                  <InfoValue>{belongings}</InfoValue>
                </>
              )}
              {clothing && (
                <>
                  <InfoLabel>
                    <FaTshirt />
                    服装
                  </InfoLabel>
                  <InfoValue>{clothing}</InfoValue>
                </>
              )}
            </InfoGrid>
          </DetailContainer>
        )}

        {review && (
          <DetailSection>
            <SectionTitle>
              <FaComments /> 口コミ・体験談
            </SectionTitle>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "20px",
                borderRadius: "12px",
                borderLeft: "4px solid #aaa",
              }}
            >
              <SectionContent>{review}</SectionContent>
            </div>
          </DetailSection>
        )}

        {(organaizer || website_url) && (
          <DetailContainer>
            <SectionTitle>
              <FaBuilding /> 主催者情報
            </SectionTitle>
            <InfoGrid>
              <InfoLabel>
                <FaBuilding />
                主催者
              </InfoLabel>
              <InfoValue>{organaizer || "情報なし"}</InfoValue>

              {website_url && (
                <>
                  <InfoLabel>
                    <FaLink />
                    公式サイト
                  </InfoLabel>
                  <InfoValue>
                    <WebsiteLink
                      href={website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {website_url}
                    </WebsiteLink>
                  </InfoValue>
                </>
              )}
            </InfoGrid>
          </DetailContainer>
        )}

        <ShareSection>
          <ShareLabel>友達にシェア</ShareLabel>
          <ShareButtonsContainer>
            <ShareLinkButton
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: "#1DA1F2" }}
            >
              <FaTwitter />
            </ShareLinkButton>
            <ShareLinkButton
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: "#06C755" }}
            >
              <FaLine />
            </ShareLinkButton>
          </ShareButtonsContainer>
        </ShareSection>
      </MainContent>

      <ActionMenu>
        <ActionContainer>
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? <HeartIcon /> : <RegHeartIcon />}
          </FavoriteButton>
          <ApplyButton
            isApplied={isApplied}
            onClick={handleApplyButtonPress}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
          >
            {isApplied ? (
              isHoveringButton ? (
                <>
                  <FaTimes /> 応募を取り消す
                </>
              ) : (
                <>
                  <FaCheckCircle /> 応募済み
                </>
              )
            ) : (
              <>
                <FaRegCheckCircle /> このボランティアに応募する
              </>
            )}
          </ApplyButton>
        </ActionContainer>
      </ActionMenu>
      <ConfirmApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // 成功モードなら「閉じる」だけ、確認モードなら「応募処理」を実行
        onConfirm={
          modalStep === "success"
            ? () => setIsModalOpen(false)
            : handleToggleApply
        }
        // 成功モードならタイトルなどを書き換え
        title={
          modalStep === "success"
            ? "応募が完了しました！"
            : modalContent.title || "応募の確認"
        }
        body={
          modalStep === "success"
            ? successBodyContent
            : modalContent.body || "よろしいですか？"
        }
        confirmText={
          modalStep === "success"
            ? "閉じる"
            : modalContent.confirmText || "応募する"
        }
        isDestructive={
          modalStep === "success" ? false : modalContent.isDestructive
        }
        isLoading={isApplyLoading}
        showCancel={modalStep !== "success"}
      />
    </PageWrapper>
  );
}
