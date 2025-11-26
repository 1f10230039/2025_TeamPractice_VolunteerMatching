// src/components/pages/EventDetailPage.jsx
"use client";

import { useState } from "react";
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
  FaChalkboardTeacher, // ★追加: 先生/メンターっぽいアイコン
} from "react-icons/fa";
import Breadcrumbs from "../common/Breadcrumbs";
// ★1. モーダルコンポーネントをインポート
import ConfirmApplyModal from "../events/ConfirmApplyModal";

// --- スタイル定義 ---

// ページ全体
const PageWrapper = styled.div`
  /* 応募バーがfixed配置されるため、その分の高さを確保 */
  padding-bottom: 80px;
`;

// 応募・お気に入りボタン用の固定バー
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

  /* ★ 修正: PC用の@mediaブロックを削除し、常に下部固定に */
`;

// お気に入りボタン (EventsCard.jsxから流用)
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
  }
`;

// 応募ボタン
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

  /* 応募状態に応じてスタイルを変更 */
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

// --- ページ本体のスタイル ---
const MainContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

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

const EventTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Organizer = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MainImage = styled(Image)`
  width: 100%;
  height: auto;
  max-height: 400px;
  border-radius: 12px;
  object-fit: cover;
  background-color: #f0f0f0;
  margin-bottom: 24px;
`;

// 各セクション (募集要項、詳細など)
const DetailSection = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  /* ★ 修正: 応募ボタンと区別するため、ボーダー色をグレーに変更 */
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

// 募集要項のテーブル風レイアウト
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 20px;
  background-color: #fcfcfc;
`;

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

const InfoValue = styled.dd`
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin: 0;
`;

const SectionContent = styled.div`
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  white-space: pre-wrap;
`;

// ▼▼▼ ポップな表示用（ボランティアの魅力用） ▼▼▼
const PopCard = styled.div`
  background-color: ${props => props.bgColor || "#f9f9f9"};
  border: 2px solid ${props => props.borderColor || "transparent"};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const IconCircle = styled.div`
  background-color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

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

// ▼▼▼ 【ここを追加】 吹き出しスタイル（得られる経験用） ▼▼▼

const BubbleWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

// 吹き出しのしっぽ（左向き）を作るための設定
const BubbleContent = styled.div`
  position: relative;
  background-color: #e3f2fd; /* 薄い青 */
  color: #333;
  padding: 24px;
  border-radius: 12px;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  /* しっぽ部分 */
  &::before {
    content: "";
    position: absolute;
    top: 20px;       /* 上から20pxの位置 */
    left: -12px;     /* 左に突き出す */
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 12px 8px 0; /* 三角形を作る */
    border-color: transparent #e3f2fd transparent transparent;
  }
`;

// 話している人のアイコン枠
const SpeakerIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #0277bd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 5px; /* 吹き出しの上端と位置合わせ */
  
  & svg {
    color: #fff;
    width: 24px;
    height: 24px;
  }
`;

// 吹き出し内の見出し
const BubbleTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: bold;
  color: #01579b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;
// ▲▲▲ 【ここまで追加】 ▲▲▲


const WebsiteLink = styled(Link)`
  color: #007bff;
  text-decoration: underline;
  word-break: break-all;
  transition: color 0.2s ease;

  &:hover {
    color: #0056b3;
  }
`;

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

  const [isApplyLoading, setIsApplyLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    body: "",
    confirmText: "",
    isDestructive: false,
  });

  if (!event) {
    return <div>イベント情報を読み込み中...</div>;
  }

  const {
    id,
    name,
    tag,
    image_url,
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
    favorite,
    applied,
    experience,
    appeal,
    review,
  } = event;

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

  const handleToggleFavorite = async e => {
    e.preventDefault();
    if (isFavoriteLoading) return;
    setIsFavoriteLoading(true);

    const newFavoriteStatus = !favorite;
    const { error } = await supabase
      .from("events")
      .update({ favorite: newFavoriteStatus })
      .eq("id", id);
    if (error) {
      console.error("お気に入り更新エラー:", error.message);
      alert("お気に入りの更新に失敗しました。");
    } else {
      router.refresh();
    }
    setIsFavoriteLoading(false);
  };

  const handleToggleApply = async () => {
    if (isApplyLoading) return;
    setIsApplyLoading(true);
    const newApplyStatus = !applied;
    try {
      const { error } = await supabase
        .from("events")
        .update({ applied: newApplyStatus })
        .eq("id", id);
      if (error) {
        throw error;
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("応募状態の更新エラー:", error.message);
      alert("応募状態の更新に失敗しました。");
    } finally {
      setIsApplyLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleApplyButtonPress = e => {
    e.preventDefault();
    if (isApplyLoading || isFavoriteLoading) return;
    if (applied) {
      handleToggleApply();
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
        <FavoriteButton
          isFavorite={favorite}
          onClick={handleToggleFavorite}
          disabled={isFavoriteLoading || isApplyLoading}
        >
          {favorite ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>
        <ApplyButton
          isApplied={applied}
          onClick={handleApplyButtonPress}
          disabled={isFavoriteLoading}
        >
          {applied ? (
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

        <MainImage
          src={image_url || placeholderImage}
          alt={name || "イベント画像"}
          width={800}
          height={400}
          priority
        />

        {/* --- ボランティア詳細 --- */}
        {long_description && (
          <DetailSection>
            <SectionTitle><FaInfoCircle /> ボランティア詳細</SectionTitle>
            <SectionContent>{long_description}</SectionContent>
          </DetailSection>
        )}

        {/* --- ボランティアの魅力 (カード形式) --- */}
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

        {/* ▼▼▼ 吹き出し形式に変更: 得られる経験 ▼▼▼ */}
        {experience && (
          <DetailSection>
            <BubbleWrapper>
              {/* アイコン: メンターっぽいFaChalkboardTeacherを使用 */}
              <SpeakerIcon>
                <FaChalkboardTeacher />
              </SpeakerIcon>
              
              <BubbleContent>
                <BubbleTitle>
                  <FaLightbulb /> 得られる経験・スキル
                </BubbleTitle>
                {/* テキストはそのまま改行も反映 */}
                <SectionContent>{experience}</SectionContent>
              </BubbleContent>
            </BubbleWrapper>
          </DetailSection>
        )}
        {/* ▲▲▲ 変更ここまで ▲▲▲ */}

        {/* --- 募集要項 --- */}
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

        {/* --- ボランティア詳細 --- */}
        {long_description && (
          <DetailSection>
            <SectionTitle>ボランティア詳細</SectionTitle>
            <SectionContent>{long_description}</SectionContent>
          </DetailSection>
        )}

        {/* --- 応募情報 --- */}
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

        {/* --- 口コミ・体験談 --- */}
        {review && (
          <DetailSection>
            <SectionTitle>
              <FaComments /> 口コミ・体験談
            </SectionTitle>
            <div style={{ 
              backgroundColor: "#f5f5f5", 
              padding: "20px", 
              borderRadius: "12px", 
              borderLeft: "4px solid #aaa" 
            }}>
              <SectionContent>{review}</SectionContent>
            </div>
          </DetailSection>
        )}

        {/* --- 主催者情報 --- */}
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
      </MainContent>

      {/* ★7. モーダルコンポーネントをここに追加 */}
      <ConfirmApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleToggleApply}
        isLoading={isApplyLoading}
        // state からモーダルの内容を動的に渡す
        title={modalContent.title}
        body={modalContent.body}
        confirmText={modalContent.confirmText}
        isDestructive={modalContent.isDestructive}
      />
    </PageWrapper>
  );
}