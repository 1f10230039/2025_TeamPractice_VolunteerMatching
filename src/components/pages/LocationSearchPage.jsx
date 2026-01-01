"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Breadcrumbs from "../common/Breadcrumbs";
import { FiCheck, FiMapPin, FiChevronDown, FiChevronUp } from "react-icons/fi";

// --- 地域区分の定義 ---
const REGIONS = [
  { name: "北海道・東北", range: [1, 7] },
  { name: "関東", range: [8, 14] },
  { name: "中部", range: [15, 23] },
  { name: "近畿", range: [24, 30] },
  { name: "中国・四国", range: [31, 39] },
  { name: "九州・沖縄", range: [40, 47] },
];

// --- Emotion Styles ---

// ページ全体のコンテナ
const PageContainer = styled.div`
  padding: 24px;
  padding-bottom: 100px;
  max-width: 800px;
  margin: 0 auto;
`;

// セクションタイトル
const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: bold;
  color: #4a90e2;
  margin-top: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    display: block;
    width: 4px;
    height: 20px;
    background-color: #4a90e2;
    border-radius: 2px;
  }
`;

// 地域セクション
const RegionSection = styled.div`
  margin-bottom: 32px;
`;

// 地域ラベル
const RegionLabel = styled.h3`
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 12px;
  font-weight: 600;
  padding-left: 4px;
`;

// 都道府県ボタンのグリッド
const PrefGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
`;

// 都道府県ボタン
const PrefButton = styled.button`
  position: relative;
  padding: 12px 8px;
  border-radius: 12px;
  border: 2px solid ${props => (props.isActive ? "#4a90e2" : "#eee")};
  background-color: ${props => (props.isActive ? "#eaf4ff" : "#fff")};
  color: ${props => (props.isActive ? "#4a90e2" : "#555")};
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  /* 選択中マーク */
  ${props =>
    props.isSelected &&
    `
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
    &:hover {
      background-color: #357abd;
    }
  `}
`;

// 市町村選択エリア
const CitySelectionArea = styled.div`
  background-color: #f8fbff;
  border: 2px solid #e1efff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// 市町村のグリッド
const CityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

// チェックボックスラベル
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: white;
  border: 1px solid ${props => (props.isChecked ? "#4a90e2" : "#eee")};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s;

  &:hover {
    background-color: #f0f8ff;
  }
`;

// 固定フッターボタン
const FloatingFooter = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 600px;
  margin: 0 auto;
  z-index: 100;
`;

// 検索ボタン
const SearchButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #68b5d5 0%, #4a90e2 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.5);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// --- Component ---

export default function LocationSearchPage({ initialPrefectures }) {
  const router = useRouter();
  const prefectures = initialPrefectures || [];

  // --- State ---
  // 1. アクティブな都道府県（市町村リストを表示している県）
  const [activePrefCode, setActivePrefCode] = useState(null);

  // 2. 「都道府県ごと」選択リスト (例: [13, 14])
  const [selectedPrefCodes, setSelectedPrefCodes] = useState([]);

  // 3. 「市町村」選択リスト (例: [13101, 13102])
  const [selectedCityCodes, setSelectedCityCodes] = useState([]);

  // 4. 表示用の市町村データキャッシュ
  const [citiesCache, setCitiesCache] = useState({});
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // 5. 検索ヒット件数
  const [hitCount, setHitCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  // --- Actions ---

  // 都道府県ボタンを押した時
  const handlePrefClick = async prefCode => {
    // すでにアクティブなら閉じる
    if (activePrefCode === prefCode) {
      setActivePrefCode(null);
      return;
    }

    // アクティブにする
    setActivePrefCode(prefCode);

    // キャッシュになければ取得
    if (!citiesCache[prefCode]) {
      setIsLoadingCities(true);
      const { data } = await supabase
        .from("cities")
        .select("*")
        .eq("prefecture-code", prefCode)
        .order("city-code", { ascending: true });

      setCitiesCache(prev => ({ ...prev, [prefCode]: data || [] }));
      setIsLoadingCities(false);
    }
  };

  // 「この都道府県全体を選択」のトグル
  const togglePrefSelection = prefCode => {
    const code = parseInt(prefCode, 10);
    setSelectedPrefCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code); // 解除
      } else {
        return [...prev, code]; // 追加
      }
    });
  };

  // 市町村のトグル
  const toggleCitySelection = cityCode => {
    const code = parseInt(cityCode, 10);
    setSelectedCityCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // --- リアルタイム件数取得 (useEffect) ---
  useEffect(() => {
    const fetchCount = async () => {
      setIsCounting(true);

      if (selectedPrefCodes.length === 0 && selectedCityCodes.length === 0) {
        setHitCount(0);
        setIsCounting(false);
        return;
      }

      try {
        let query = supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        // 1. 選択された都道府県の名前を取得
        const selectedPrefNames = prefectures
          .filter(p =>
            selectedPrefCodes.includes(parseInt(p["prefecture-code"], 10))
          )
          .map(p => p.name);

        // 2. 選択された市町村の名前を取得 (キャッシュから探す)
        const selectedCityNames = [];
        Object.values(citiesCache)
          .flat()
          .forEach(city => {
            if (selectedCityCodes.includes(parseInt(city["city-code"], 10))) {
              selectedCityNames.push(city.name);
            }
          });

        // 3. OR条件の組み立て
        let orConditions = [];
        if (selectedPrefNames.length > 0) {
          const prefString = selectedPrefNames.map(n => `"${n}"`).join(",");
          orConditions.push(`prefectures.in.(${prefString})`);
        }
        if (selectedCityNames.length > 0) {
          const cityString = selectedCityNames.map(n => `"${n}"`).join(",");
          orConditions.push(`city.in.(${cityString})`);
        }

        if (orConditions.length > 0) {
          query = query.or(orConditions.join(","));
          const { count, error } = await query;
          if (!error) {
            setHitCount(count || 0);
          } else {
            console.error("Count Error:", error); // エラー確認用
          }
        } else {
          setHitCount(0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsCounting(false);
      }
    };

    const timer = setTimeout(fetchCount, 500);
    return () => clearTimeout(timer);
  }, [selectedPrefCodes, selectedCityCodes, citiesCache, prefectures]);

  // 検索実行
  const handleSearch = () => {
    // クエリパラメータの作成
    const params = new URLSearchParams();
    if (selectedPrefCodes.length > 0)
      params.set("prefs", selectedPrefCodes.join(","));
    if (selectedCityCodes.length > 0)
      params.set("cities", selectedCityCodes.join(","));

    router.push(`/search/location-results?${params.toString()}`);
  };

  // パンくず
  const crumbs = [{ label: "場所から探す", href: "/search/location" }];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <PageContainer>
        <SectionTitle>
          <FiMapPin /> エリアを選択してください
        </SectionTitle>

        {REGIONS.map(region => {
          const regionPrefs = prefectures.filter(pref => {
            const code = parseInt(pref["prefecture-code"], 10);
            return code >= region.range[0] && code <= region.range[1];
          });
          if (regionPrefs.length === 0) return null;

          return (
            <RegionSection key={region.name}>
              <RegionLabel>{region.name}</RegionLabel>
              <PrefGrid>
                {regionPrefs.map(pref => {
                  const pCode = parseInt(pref["prefecture-code"], 10);
                  const isFullySelected = selectedPrefCodes.includes(pCode);
                  const isActive = activePrefCode === pref["prefecture-code"];

                  return (
                    <div
                      key={pCode}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <PrefButton
                        isActive={isActive}
                        isSelected={isFullySelected}
                        onClick={() => handlePrefClick(pref["prefecture-code"])}
                      >
                        {pref.name}
                        {isActive ? (
                          <FiChevronUp size={12} />
                        ) : (
                          <FiChevronDown size={12} />
                        )}
                      </PrefButton>
                    </div>
                  );
                })}
              </PrefGrid>

              {/* アクティブな県があれば、その下に市町村リストを展開 */}
              {regionPrefs.map(pref => {
                if (activePrefCode !== pref["prefecture-code"]) return null;
                const pCode = parseInt(pref["prefecture-code"], 10);
                const isPrefChecked = selectedPrefCodes.includes(pCode);

                return (
                  <CitySelectionArea key={`area-${pCode}`}>
                    {/* 1. 県全体を選択するオプション */}
                    <div
                      style={{
                        marginBottom: "16px",
                        paddingBottom: "12px",
                        borderBottom: "1px dashed #ccc",
                      }}
                    >
                      <CheckboxLabel isChecked={isPrefChecked}>
                        <input
                          type="checkbox"
                          checked={isPrefChecked}
                          onChange={() =>
                            togglePrefSelection(pref["prefecture-code"])
                          }
                          style={{
                            width: "18px",
                            height: "18px",
                            accentColor: "#4a90e2",
                          }}
                        />
                        <strong>{pref.name}全域</strong>
                      </CheckboxLabel>
                    </div>

                    {/* 2. 市町村リスト */}
                    {isLoadingCities ? (
                      <p style={{ color: "#666", fontSize: "0.9rem" }}>
                        読み込み中...
                      </p>
                    ) : (
                      <>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "8px",
                          }}
                        >
                          ※特定の市町村だけ絞り込む場合はこちら
                        </p>
                        <CityGrid>
                          {citiesCache[activePrefCode]?.map(city => {
                            const cCode = parseInt(city["city-code"], 10);
                            const isCityChecked =
                              selectedCityCodes.includes(cCode);
                            return (
                              <CheckboxLabel
                                key={cCode}
                                isChecked={isCityChecked}
                              >
                                <input
                                  type="checkbox"
                                  checked={isCityChecked}
                                  onChange={() =>
                                    toggleCitySelection(city["city-code"])
                                  }
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    accentColor: "#4a90e2",
                                  }}
                                />
                                {city.name}
                              </CheckboxLabel>
                            );
                          })}
                        </CityGrid>
                      </>
                    )}
                  </CitySelectionArea>
                );
              })}
            </RegionSection>
          );
        })}
      </PageContainer>

      {/* 固定フッターボタン */}
      {(selectedPrefCodes.length > 0 || selectedCityCodes.length > 0) && (
        <FloatingFooter>
          <SearchButton onClick={handleSearch} disabled={isCounting}>
            {isCounting ? (
              "件数を確認中..."
            ) : (
              <>
                <FiCheck size={20} />
                {hitCount}件のイベントを表示する
              </>
            )}
          </SearchButton>
        </FloatingFooter>
      )}
    </>
  );
}
