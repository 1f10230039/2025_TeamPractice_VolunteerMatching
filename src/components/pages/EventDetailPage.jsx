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
} from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";
import ConfirmApplyModal from "../events/ConfirmApplyModal";
import EventImageGallery from "../events/EventImageGallery";

// ==========================================
// Emotion Styles (スタイル定義)
// ==========================================

// ページ全体のラッパー（下部固定バーの分だけ余白を確保）
const PageWrapper = styled.div`
  padding-bottom: 80px;
`;

// 画面下部に固定される「お気に入り・応募ボタン」のバー
const ActionMenu = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 50;
`;

// お気に入りボタン（ハートマーク）
const FavoriteButton = styled.button`
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  width: 56px;
  height: 56px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  & > svg {
    width: 24px;
    height: 24px;
    color: ${props => (props.isFavorite ? "#e74c3c" : "#555")};
    transition: color 0.2s ease;
  }
`;

// 応募ボタン（「応募する」または「応募済み」）
const ApplyButton = styled.button`
  flex-grow: 1;
  padding: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;

  /* isApplied(応募済み)かどうかで色を変える */
  background-color: ${props => (props.isApplied ? "#5cb85c" : "#007bff")};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => (props.isApplied ? "#4cae4c" : "#0056b3")};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// コンテンツのメインエリア（幅制限と中央寄せ）
const MainContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

// カテゴリタグ（例: "教育", "環境"）
const Tag = styled.span`
  display: inline-block;
  background-color: #e0eafc;
  color: #0056b3;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 12px;
`;

// イベントタイトル
const EventTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

// 主催者名
const Organizer = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 各詳細情報のセクション（ブロック）
const DetailSection = styled.section`
  margin-bottom: 32px;
`;

// セクションの見出し（募集要項、詳細など）
const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  & svg {
    color: #007bff;
    font-size: 1.1rem;
  }
`;

// 情報グリッド（ラベルと値のペアを表示するレイアウト）
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 20px;
  background-color: #fcfcfc;
`;

// 情報のラベル（左側）
const InfoLabel = styled.dt`
  font-weight: bold;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;

  & > svg {
    width: 1rem;
    height: 1rem;
    color: #888;
    flex-shrink: 0;
  }
`;

// 情報の値（右側）
const InfoValue = styled.dd`
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin: 0;
`;

// 文章コンテンツ（改行を反映）
const SectionContent = styled.div`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  white-space: pre-wrap;
`;

// ポップなカード（「ボランティアの魅力」用）
const PopCard = styled.div`
  background-color: ${props => props.bgColor || "#f9f9f9"};
  border: 2px solid ${props => props.borderColor || "transparent"};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

// アイコン用の丸い背景
const IconCircle = styled.div`
  background-color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  & svg {
    width: 28px;
    height: 28px;
    color: ${props => props.iconColor || "#333"};
  }
`;

const PopCardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => props.textColor || "#333"};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PopCardText = styled.div`
  font-size: 1.2rem;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
`;

// 吹き出しレイアウト（「得られる経験」用）
const BubbleWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

// 吹き出しの本体（三角形のしっぽ付き）
const BubbleContent = styled.div`
  position: relative;
  background-color: #e3f2fd;
  color: #333;
  padding: 24px;
  border-radius: 12px;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &::before {
    content: "";
    position: absolute;
    top: 20px;
    left: -12px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 12px 8px 0;
    border-color: transparent #e3f2fd transparent transparent;
  }
`;

// 話している人のアイコン
const SpeakerIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #0277bd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 5px;

  & svg {
    color: #fff;
    width: 24px;
    height: 24px;
  }
`;

const BubbleTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: bold;
  color: #01579b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
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

// 共有リンクボタン（丸型アイコンボタン）
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
  background-color: #f0f0f0; /* ロード中などの背景 */
`;

// 地図リンク
const MapLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  color: #007bff;
  font-size: 0.9rem;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// ==========================================
// ユーティリティ関数
// ==========================================

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

// ==========================================
// コンポーネント本体
// ==========================================

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
      case "keyword":
        crumbList = [
          { label: "キーワードから探す", href: "/search/keyword" },
          { label: "検索結果", href: `/search/keyword-results?q=${q || ""}` },
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

  const placeholderImage =
    "https://placehold.co/800x400/e0e0e0/777?text=No+Image";

  /**
   * お気に入りボタンの処理
   * favorites テーブルに対して INSERT (登録) または DELETE (解除) を行う
   */
  const handleToggleFavorite = async e => {
    e.preventDefault();
    if (isFavoriteLoading) return;

    // 未ログイン時の誘導
    if (!user) {
      if (
        confirm(
          "お気に入り機能を使うにはログインが必要です。\nログインページに移動しますか？"
        )
      ) {
        router.push("/login");
      }
      return;
    }

    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        // 登録解除 (DELETE)
        const { error } = await supabase
          .from("favorites")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsFavorite(false);
      } else {
        // 新規登録 (INSERT)
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
        // 応募キャンセル (DELETE)
        const { error } = await supabase
          .from("applications")
          .delete()
          .match({ user_id: user.id, event_id: id });
        if (error) throw error;
        setIsApplied(false);
        alert("応募をキャンセルしました。");
      } else {
        // 応募登録 (INSERT)
        const { error } = await supabase
          .from("applications")
          .insert({ user_id: user.id, event_id: id });
        if (error) throw error;

        // 応募成功
        setIsApplied(true);

        try {
          // ユーザーのプロフィール情報を取得（名前を使いたいから）
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();

          const userName = profile?.name || "ゲスト";

          // APIにデータを送る
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventName: name, // イベント名
              applicantEmail: user.email, // 応募者のメアド (Auth情報から)
              applicantName: userName, // 応募者の名前 (profilesから)
            }),
          });

          console.log("メール送信リクエスト完了");
        } catch (mailError) {
          // メールが送れなくても、応募自体は成功してるからアラートは出さないでおく
          // (または console.error だけしておく)
          console.error("メール送信エラー:", mailError);
        }

        alert("応募が完了しました！確認メールを送信しました。");
      }
    } catch (error) {
      console.error("応募状態の更新エラー:", error.message);
      alert("処理に失敗しました。");
    } finally {
      setIsApplyLoading(false);
      setIsModalOpen(false);
    }
  };

  /**
   * 応募ボタンが押された時の処理
   * 状態に応じて適切な確認モーダルを表示する
   */
  const handleApplyButtonPress = e => {
    e.preventDefault();
    if (isApplyLoading || isFavoriteLoading) return;

    // 未ログイン時の誘導
    if (!user) {
      if (
        confirm(
          "応募するにはログインが必要です。\nログインページに移動しますか？"
        )
      ) {
        router.push("/login");
      }
      return;
    }

    // 応募済みならキャンセル、未応募なら確認モーダル
    if (isApplied) {
      setModalContent({
        title: "応募のキャンセル",
        body: "応募を取り消しますか？",
        confirmText: "取り消す",
        isDestructive: true,
      });
      setIsModalOpen(true);
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
      setIsModalOpen(true);
    }
  };

  return (
    <PageWrapper>
      <ActionMenu>
        {/* お気に入りボタン */}
        <FavoriteButton
          isFavorite={isFavorite}
          onClick={handleToggleFavorite}
          disabled={isFavoriteLoading || isApplyLoading}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>

        {/* 応募ボタン */}
        <ApplyButton
          isApplied={isApplied}
          onClick={handleApplyButtonPress}
          disabled={isFavoriteLoading}
        >
          {isApplied ? (
            <>
              <FaCheckCircle />
              応募済み
            </>
          ) : (
            <>
              <FaRegCheckCircle />
              このボランティアに応募する
            </>
          )}
        </ApplyButton>
      </ActionMenu>

      <Breadcrumbs crumbs={crumbs} baseCrumb={baseCrumb} />

      <MainContent>
        {tag && <Tag>{tag}</Tag>}
        <EventTitle>{name || "無題のイベント"}</EventTitle>
        {organaizer && (
          <Organizer>
            <FaBuilding /> {organaizer}
          </Organizer>
        )}

        {/* 画像ギャラリーコンポーネントの挿入 */}
        <EventImageGallery mainImageUrl={image_url} subImages={event_images} />

        {/* 各詳細セクション (省略なし) */}
        {long_description && (
          <DetailSection>
            <SectionTitle>
              <FaInfoCircle /> ボランティア詳細
            </SectionTitle>
            <SectionContent>{long_description}</SectionContent>
          </DetailSection>
        )}

        {appeal && (
          <DetailSection>
            <PopCard bgColor="#fff8e1" borderColor="#ffe082">
              <IconCircle iconColor="#ff8f00">
                <FaThumbsUp />
              </IconCircle>
              <div>
                <PopCardTitle textColor="#ff6f00">
                  ボランティアの魅力
                </PopCardTitle>
                <PopCardText>{appeal}</PopCardText>
              </div>
            </PopCard>
          </DetailSection>
        )}

        {experience && (
          <DetailSection>
            <BubbleWrapper>
              <SpeakerIcon>
                <FaChalkboardTeacher />
              </SpeakerIcon>
              <BubbleContent>
                <BubbleTitle>
                  <FaLightbulb /> 得られる経験・スキル
                </BubbleTitle>
                <SectionContent>{experience}</SectionContent>
              </BubbleContent>
            </BubbleWrapper>
          </DetailSection>
        )}

        <DetailSection>
          <SectionTitle>
            <FaCalendarAlt /> 募集要項
          </SectionTitle>
          <InfoGrid>
            <InfoLabel>
              <FaCalendarAlt />
              日時
            </InfoLabel>
            <InfoValue>
              {formatDateTime(start_datetime)} 〜 {formatDateTime(end_datetime)}
            </InfoValue>
            <InfoLabel>
              <FaMapMarkerAlt />
              場所
            </InfoLabel>
            <InfoValue>{place || "未定"}</InfoValue>
            {access && (
              <>
                <InfoLabel>
                  <FaRoute />
                  アクセス
                </InfoLabel>
                <InfoValue>{access}</InfoValue>
              </>
            )}
            <InfoLabel>
              <FaYenSign />
              費用
            </InfoLabel>
            <InfoValue>
              {fee === 0 ? "無料" : fee ? `${fee.toLocaleString()}円` : "未定"}
            </InfoValue>

            <InfoLabel>
              <FaUsers />
              定員
            </InfoLabel>
            <InfoValue>{capacity ? `${capacity}名` : "特に指定なし"}</InfoValue>
          </InfoGrid>
        </DetailSection>

        {latitude && longitude && (
          <DetailSection>
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
          </DetailSection>
        )}

        {(selection_flow || belongings || clothing) && (
          <DetailSection>
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
          </DetailSection>
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
          <DetailSection>
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
          </DetailSection>
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

      <ConfirmApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleToggleApply}
        isLoading={isApplyLoading}
        title={modalContent.title}
        body={modalContent.body}
        confirmText={modalContent.confirmText}
        isDestructive={modalContent.isDestructive}
      />
    </PageWrapper>
  );
}
