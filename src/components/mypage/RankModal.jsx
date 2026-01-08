// ランクモーダルコンポーネント
"use client";

import styled from "@emotion/styled";
import { FaTimes, FaTrophy, FaMedal, FaCrown } from "react-icons/fa";

// --- ランク定義 ---
export const RANK_DEFINITIONS = [
  {
    name: "BRONZE",
    label: "ブロンズ",
    min: 0,
    icon: <FaMedal />,
    color: "#cd7f32",
    bg: "linear-gradient(135deg, #e6d0b3 0%, #cd7f32 100%)",
    desc: "ボランティアの旅はここから始まる！まずは3件を目指そう！",
  },
  {
    name: "SILVER",
    label: "シルバー",
    min: 3,
    icon: <FaMedal />,
    color: "#c0c0c0",
    bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    desc: "活動に慣れてきた証。継続は力なり！",
  },
  {
    name: "GOLD",
    label: "ゴールド",
    min: 6,
    icon: <FaTrophy />,
    color: "#ffd700",
    bg: "linear-gradient(135deg, #fff3b0 0%, #ca26ff 0%, #ffd700 100%)",
    desc: "地域に欠かせない存在。素晴らしい貢献度です！",
  },
  {
    name: "PLATINUM",
    label: "プラチナ",
    min: 11,
    icon: <FaCrown />,
    color: "#e5e4e2",
    bg: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    desc: "もはや伝説級。あなたはボランティアの鏡です！",
  },
];

// --- Emotion Styles ---
// オーバーレイスタイル
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// モーダルコンテナ
const ModalContainer = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 32px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// 閉じるボタン
const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f0f0f0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    transform: rotate(90deg);
  }
`;

// タイトルスタイル
const Title = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(to right, #68b5d5, #4a90e2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

// サブタイトルスタイル
const SubTitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 24px;
`;

// ランクリストコンテナ
const RankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// ランクアイテムスタイル
const RankItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 2px solid ${props => (props.isCurrent ? props.color : "transparent")};
  background: ${props => (props.isCurrent ? "#fff" : "#f9f9f9")};
  box-shadow: ${props =>
    props.isCurrent ? `0 4px 15px ${props.color}40` : "none"};
  position: relative;
  overflow: hidden;

  /* 現在のランクの場合の背景装飾 */
  ${props =>
    props.isCurrent &&
    `
    &::before {
      content: "YOU";
      position: absolute;
      right: -10px;
      top: -5px;
      background: ${props.color};
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 4px 20px;
      transform: rotate(15deg);
    }
  `}
`;

// ランクアイコンボックス
const RankIconBox = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

// ランク情報コンテナ
const RankInfo = styled.div`
  flex-grow: 1;
`;

// ランク名スタイル
const RankName = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  color: #333;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ランク必要件数スタイル
const RankReq = styled.span`
  font-size: 0.8rem;
  background-color: #eee;
  padding: 2px 8px;
  border-radius: 10px;
  color: #555;
`;

// ランク説明スタイル
const RankDesc = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

// --- コンポーネント本体 ---
// ランクモーダルコンポーネント
export default function RankModal({ isOpen, onClose, currentCount }) {
  // もしモーダルが閉じている場合は何もレンダリングしない
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>

        <Title>会員ランクシステム</Title>
        <SubTitle>
          ボランティアへの応募数に応じてランクアップ！
          <br />
          現在あなたは <strong>{currentCount}件</strong> 応募済みです。
        </SubTitle>

        <RankList>
          {RANK_DEFINITIONS.map((rank, index) => {
            // 現在のランクかどうか判定
            const nextRank = RANK_DEFINITIONS[index + 1];
            const isCurrent =
              currentCount >= rank.min &&
              (!nextRank || currentCount < nextRank.min);

            return (
              <RankItem
                key={rank.name}
                isCurrent={isCurrent}
                color={rank.color}
              >
                <RankIconBox bg={rank.bg}>{rank.icon}</RankIconBox>
                <RankInfo>
                  <RankName>
                    {rank.label}
                    <RankReq>{rank.min}件〜</RankReq>
                  </RankName>
                  <RankDesc>{rank.desc}</RankDesc>
                </RankInfo>
              </RankItem>
            );
          })}
        </RankList>
      </ModalContainer>
    </Overlay>
  );
}
