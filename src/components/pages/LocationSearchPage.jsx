// 場所から検索ページコンポーネント
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styled from "@emotion/styled";
import Breadcrumbs from "../common/Breadcrumbs";
import {
  FiCheck,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";

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
const PageContainer = styled.div`
  padding: 24px;
  padding-bottom: 100px;
  max-width: 800px;
  margin: 0 auto;
`;

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

const RegionSection = styled.div`
  margin-bottom: 32px;
`;

const RegionLabel = styled.h3`
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 12px;
  font-weight: 600;
  padding-left: 4px;
`;

const PrefGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
`;

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

const CitySelectionArea = styled.div`
  background-color: #f8fbff;
  border: 2px solid #e1efff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
  position: relative;

  @media (max-width: 600px) {
    padding: 16px;
  }

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

const CityAreaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #cce4ff;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`;

const HeaderTitle = styled.h4`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CloseLabel = styled.span`
  font-size: 0.85rem;
  color: #4a90e2;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: bold;
`;

const CityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

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

const BottomCloseButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #cce4ff;
  color: #4a90e2;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f8ff;
  }
`;

const FloatingFooter = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 600px;
  margin: 0 auto;
  z-index: 100;
`;

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

  const [activePrefCode, setActivePrefCode] = useState(null);
  const [selectedPrefCodes, setSelectedPrefCodes] = useState([]);
  const [selectedCityCodes, setSelectedCityCodes] = useState([]);
  const [citiesCache, setCitiesCache] = useState({});
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  const handlePrefClick = async prefCode => {
    if (activePrefCode === prefCode) {
      setActivePrefCode(null);
      return;
    }
    setActivePrefCode(prefCode);

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

  const togglePrefSelection = prefCode => {
    const code = parseInt(prefCode, 10);
    setSelectedPrefCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

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

        const selectedPrefNames = prefectures
          .filter(p =>
            selectedPrefCodes.includes(parseInt(p["prefecture-code"], 10))
          )
          .map(p => p.name);

        const selectedCityNames = [];
        Object.values(citiesCache)
          .flat()
          .forEach(city => {
            if (selectedCityCodes.includes(parseInt(city["city-code"], 10))) {
              selectedCityNames.push(city.name);
            }
          });

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
            console.error("Count Error:", error);
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedPrefCodes.length > 0)
      params.set("prefs", selectedPrefCodes.join(","));
    if (selectedCityCodes.length > 0)
      params.set("cities", selectedCityCodes.join(","));

    router.push(`/search/location-results?${params.toString()}`);
  };

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

              {regionPrefs.map(pref => {
                if (activePrefCode !== pref["prefecture-code"]) return null;
                const pCode = parseInt(pref["prefecture-code"], 10);
                const isPrefChecked = selectedPrefCodes.includes(pCode);

                return (
                  <CitySelectionArea key={`area-${pCode}`}>
                    <CityAreaHeader onClick={() => setActivePrefCode(null)}>
                      <HeaderTitle>
                        <FiMapPin color="#4a90e2" /> {pref.name}
                      </HeaderTitle>
                      <CloseLabel>
                        閉じる <FiChevronUp />
                      </CloseLabel>
                    </CityAreaHeader>

                    {/* 県全体を選択するオプション */}
                    <div style={{ marginBottom: "12px" }}>
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

                    {/* 市町村リスト */}
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

                        <BottomCloseButton
                          onClick={() => setActivePrefCode(null)}
                        >
                          閉じる
                        </BottomCloseButton>
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
                {hitCount}件のボランティアを表示する
              </>
            )}
          </SearchButton>
        </FloatingFooter>
      )}
    </>
  );
}
