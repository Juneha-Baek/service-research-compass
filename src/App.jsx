import React, { useState, useEffect, useMemo } from 'react';
import { loadAllData } from './utils/dataLoader';
import {
  getTopPredictedPairs,
  getCommunityPairRanking,
  getCommunityPairRankingWithComparison,
  filterByCommunityPairClick,
  filterByCommunity,
  getConceptCommunitiesNetwork,
  filterFormattedByCommunityPair,
  filterFormattedByCommunity
} from './utils/dataProcessors';
import NetworkGraph from './components/NetworkGraph';
import ConceptPairsList from './components/ConceptPairsList';
import CommunityRanking from './components/CommunityRanking';
import IntroPage from './components/IntroPage';
import Tooltip from './components/Tooltip';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [dataSource, setDataSource] = useState('ft50'); // 'ft50' or 'service'
  const [rawData, setRawData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [childRelations, setChildRelations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedPairs, setDisplayedPairs] = useState([]);
  const [expandedPairs, setExpandedPairs] = useState(new Map());
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [filterMode, setFilterMode] = useState(null); // null, 'pair', 'community', or 'matrix'
  const [matrixCategory, setMatrixCategory] = useState(null); // 'High-High', 'High-Low', etc.
  
  const [topN, setTopN] = useState(1000);
  const [topNMode, setTopNMode] = useState('1000');
  const [customTopN, setCustomTopN] = useState(1000);
  const [weightMode, setWeightMode] = useState('count');
  const [showPreviousNetwork, setShowPreviousNetwork] = useState(false);
  const [hideBottomNodes, setHideBottomNodes] = useState(0);
  const [topPredictedPairs, setTopPredictedPairs] = useState([]);
  const [rankingMode, setRankingMode] = useState('predicted'); // 'predicted' or 'rising'
  
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // Resizable panel widths
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [topRightHeight, setTopRightHeight] = useState(66); // percentage of right panel
  
  // Matrix가 열리면 하단 패널 확대
  React.useEffect(() => {
    if (isMatrixOpen) {
      setTopRightHeight(50); // 네트워크를 50%로 줄여서 CommunityRanking 영역 확대
    } else {
      setTopRightHeight(66); // 원래대로 복구
    }
  }, [isMatrixOpen]);

  // Year filter states
  const [yearFilter, setYearFilter] = useState('all');
  const [customStartYear, setCustomStartYear] = useState(2000);
  const [customEndYear, setCustomEndYear] = useState(2024);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { csvData, previousData: prevData, childRelations: relations } = await loadAllData(dataSource);
        
        setRawData(csvData);
        setPreviousData(prevData);
        setChildRelations(relations);
        
        const topPairs = getTopPredictedPairs(csvData, topN);
        setDisplayedPairs(topPairs);
        setTopPredictedPairs(topPairs);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataSource]);

  // Extract all unique communities and create fixed color mapping
  const communityColorMap = useMemo(() => {
    const allCommunities = new Set();
    
    // Extract from rawData
    rawData.forEach(row => {
      if (row.c1_community) allCommunities.add(row.c1_community);
      if (row.c2_community) allCommunities.add(row.c2_community);
    });
    
    // Extract from previousData
    previousData.forEach(row => {
      if (row.c1_community) allCommunities.add(row.c1_community);
      if (row.c2_community) allCommunities.add(row.c2_community);
    });
    
    // Sort alphabetically for consistent ordering
    const sortedCommunities = Array.from(allCommunities).sort();
    
    // Extended color palette (d3.schemeCategory10 + additional colors)
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
      '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
      '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
    ];
    
    // Create color map
    const colorMap = {};
    sortedCommunities.forEach((community, index) => {
      colorMap[community] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [rawData, previousData]);

  useEffect(() => {
    if (selectedCommunities.length === 0 && rawData.length > 0) {
      const topPairs = getTopPredictedPairs(rawData, topN);
      setDisplayedPairs(topPairs);
      setTopPredictedPairs(topPairs);
    }
  }, [topN, rawData, selectedCommunities]);

  // Apply year filter to previous data
  const filteredPreviousData = useMemo(() => {
    if (yearFilter === 'all') return previousData;
    
    let startYear, endYear;
    if (yearFilter === 'last5') {
      startYear = 2020;
      endYear = 2024;
    } else if (yearFilter === 'last10') {
      startYear = 2015;
      endYear = 2024;
    } else if (yearFilter === 'custom') {
      startYear = customStartYear;
      endYear = customEndYear;
    } else {
      return previousData;
    }
    
    return previousData.filter(row => {
      const year = row.publication_year;
      return year && year >= startYear && year <= endYear;
    });
  }, [previousData, yearFilter, customStartYear, customEndYear]);

  // Select network source data
  const networkSourceData = showPreviousNetwork ? filteredPreviousData : rawData;

  const networkFilteredData = useMemo(() => {
    if (!networkSourceData || networkSourceData.length === 0) return [];
    
    const count = showPreviousNetwork ? networkSourceData.length : topN;
    return getTopPredictedPairs(networkSourceData, count);
  }, [networkSourceData, topN, showPreviousNetwork]);

  const networkData = useMemo(() => {
    if (!networkFilteredData || networkFilteredData.length === 0) {
      return { nodes: [], links: [] };
    }
    
    const dataForNetwork = networkFilteredData.map(pair => ({
      c1_community: pair.community1,
      c2_community: pair.community2,
      pred: pair.prediction_score
    }));
    
    return getConceptCommunitiesNetwork(dataForNetwork, weightMode);
  }, [networkFilteredData, weightMode]);

  const communityRanking = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    if (!filteredPreviousData || filteredPreviousData.length === 0) return [];
    
    // 1. Get top N predicted pairs for concentration calculation
    const topPredictedData = getTopPredictedPairs(rawData, topN);
    
    // Data for ranking (only top N)
    const dataForRanking = topPredictedData.map(pair => ({
      c1_community: pair.community1,
      c2_community: pair.community2,
      concept1: pair.concept1,
      concept2: pair.concept2,
      pred: pair.prediction_score
    }));
    
    // 2. Get filtered previous data (with year filter applied)
    const previousDataForRanking = filteredPreviousData.map(row => ({
      c1_community: row.c1_community,
      c2_community: row.c2_community
    }));
    
    // 3. Combine: Get comprehensive ranking with comparison
    //    This will include all community pairs from both topN and previous
    const fullRanking = getCommunityPairRankingWithComparison(
      dataForRanking,  // topN predicted pairs
      previousDataForRanking,  // all previous pairs
      weightMode
    );
    
    // Calculate previous ranking (sort by previous_count)
    const previousRanking = [...fullRanking]
      .filter(item => item.previous_count > 0)
      .sort((a, b) => b.previous_count - a.previous_count)
      .map((item, index) => ({
        pairKey: `${item.community1}|||${item.community2}`,
        previousRank: index + 1
      }));
    
    const previousRankMap = {};
    previousRanking.forEach(item => {
      previousRankMap[item.pairKey] = item.previousRank;
    });
    
    // Sort based on ranking mode
    let sorted;
    if (rankingMode === 'rising') {
      sorted = [...fullRanking].sort((a, b) => b.rise - a.rise);
    } else if (rankingMode === 'previous') {
      // Sort by previous count
      sorted = [...fullRanking]
        .filter(item => item.previous_count > 0)
        .sort((a, b) => b.previous_count - a.previous_count);
    } else {
      // predicted mode - sort by predicted count
      sorted = [...fullRanking].sort((a, b) => b.predicted_count - a.predicted_count);
    }
    
    // Add rank and previous rank
    const rankedData = sorted.map((item, index) => {
      const pairKey = `${item.community1}|||${item.community2}`;
      const previousRank = previousRankMap[pairKey];
      const currentRank = index + 1;
      
      let rankChange = null;
      if (previousRank) {
        rankChange = previousRank - currentRank; // positive means moved up
      }
      
      return {
        ...item,
        rank: currentRank,
        previousRank: previousRank || null,
        rankChange: rankChange
      };
    });
    
    return { ranked: rankedData, full: fullRanking };
  }, [rawData, filteredPreviousData, topN, weightMode, rankingMode]);

  // Calculate matrix categories map for concept pairs
  const communityPairCategories = useMemo(() => {
    if (!communityRanking || !communityRanking.full) return {};
    
    const pairsWithBothData = communityRanking.full.filter(
      item => item.previous_count >= 0 && item.predicted_count >= 0
    );
    
    if (pairsWithBothData.length === 0) return {};
    
    const predictedConcentrations = pairsWithBothData
      .map(item => item.predicted_concentration)
      .sort((a, b) => a - b);
    const previousConcentrations = pairsWithBothData
      .map(item => item.previous_concentration)
      .sort((a, b) => a - b);
    
    const getMedian = (sortedArray) => {
      const length = sortedArray.length;
      const mid = Math.floor(length / 2);
      if (length % 2 === 0) {
        return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
      } else {
        return sortedArray[mid];
      }
    };
    
    const predictedMedian = getMedian(predictedConcentrations);
    const previousMedian = getMedian(previousConcentrations);
    
    const categoriesMap = {};
    
    pairsWithBothData.forEach(item => {
      const pairKey = `${item.community1}|||${item.community2}`;
      const highPredicted = item.predicted_concentration > predictedMedian;
      const highPrevious = item.previous_concentration > previousMedian;
      
      let category;
      if (highPredicted && highPrevious) {
        category = { label: 'Consolidating', color: '#27ae60' };
      } else if (highPredicted && !highPrevious) {
        category = { label: 'Accelerating', color: '#3498db' };
      } else if (!highPredicted && highPrevious) {
        category = { label: 'Stabilizing', color: '#e67e22' };
      } else {
        category = { label: 'Exploring', color: '#95a5a6' };
      }
      
      categoriesMap[pairKey] = category;
    });
    
    return categoriesMap;
  }, [communityRanking]);

  const handleToggleExpand = React.useCallback((pair) => {
    const newExpanded = new Map(expandedPairs);
    if (newExpanded.has(pair.rank)) {
      newExpanded.delete(pair.rank);
    } else {
      newExpanded.set(pair.rank, [pair.community1, pair.community2]);
    }
    setExpandedPairs(newExpanded);
    
    const allHighlightedCommunities = new Set();
    newExpanded.forEach((communities) => {
      communities.forEach(comm => allHighlightedCommunities.add(comm));
    });
    setHighlightedNodes(Array.from(allHighlightedCommunities));
  }, [expandedPairs]);

  const handleCommunityPairClick = (community1, community2) => {
    const filtered = filterFormattedByCommunityPair(topPredictedPairs, community1, community2);
    setDisplayedPairs(filtered);
    setSelectedCommunities([community1, community2]);
    setHighlightedNodes([community1, community2]);
    setFilterMode('pair');
    setMatrixCategory(null);
  };

  const handleMatrixCategoryClick = (categoryPairs, categoryName) => {
    // Extract all community pairs from the category
    const communityPairSet = new Set();
    categoryPairs.forEach(item => {
      communityPairSet.add(item.community1);
      communityPairSet.add(item.community2);
    });
    
    // Filter top predicted pairs that belong to any of these community pairs
    const filtered = topPredictedPairs.filter(pair => {
      return categoryPairs.some(catItem => 
        (catItem.community1 === pair.community1 && catItem.community2 === pair.community2) ||
        (catItem.community1 === pair.community2 && catItem.community2 === pair.community1)
      );
    });
    
    setDisplayedPairs(filtered);
    setSelectedCommunities(Array.from(communityPairSet));
    setHighlightedNodes(Array.from(communityPairSet));
    setFilterMode('matrix');
    setMatrixCategory(categoryName);
  };

  const handleNodeClick = (communityId) => {
    const filtered = filterFormattedByCommunity(topPredictedPairs, communityId);
    setDisplayedPairs(filtered);
    setSelectedCommunities([communityId]);
    setHighlightedNodes([communityId]);
    setFilterMode('community');
    setMatrixCategory(null);
  };

  const handleReset = () => {
    setDisplayedPairs(topPredictedPairs);
    setSelectedCommunities([]);
    setHighlightedNodes([]);
    setExpandedPairs(new Map());
    setFilterMode(null);
    setMatrixCategory(null);
  };

  const handleMatrixToggle = (isOpen) => {
    setIsMatrixOpen(isOpen);
  };

  // Horizontal resizer (left-right panels)
  const handleHorizontalResize = React.useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;
    
    const onMouseMove = (moveEvent) => {
      const container = document.querySelector('[data-main-container]');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerRect.width) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 30), 70);
      
      setLeftPanelWidth(newWidth);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [leftPanelWidth]);

  // Vertical resizer (top-bottom in right panel)
  const handleVerticalResize = React.useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = topRightHeight;
    
    const onMouseMove = (moveEvent) => {
      const container = document.querySelector('[data-right-panel]');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const deltaY = moveEvent.clientY - startY;
      const deltaPercent = (deltaY / containerRect.height) * 100;
      const newHeight = Math.min(Math.max(startHeight + deltaPercent, 40), 80);
      
      setTopRightHeight(newHeight);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [topRightHeight]);

  if (showIntro) {
    return <IntroPage onEnter={() => setShowIntro(false)} />;
  }

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e0e0e0',
            borderTop: '5px solid #27ae60',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <div style={{ fontSize: '18px', color: '#555' }}>Loading data...</div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#e74c3c', marginTop: 0 }}>Error Loading Data</h2>
          <p style={{ color: '#555' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Make sure the following files are in the <code>public/</code> folder:
          </p>
          <ul style={{ fontSize: '14px', color: '#7f8c8d' }}>
            <li>top_predicted_pairs.csv</li>
            <li>previous_concept_pairs.csv</li>
            <li>child_relationships.json</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f5f5'
    }}>
      <div style={{
        background: '#2c3e50',
        color: 'white',
        padding: '15px 20px',
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span
          onClick={() => setShowIntro(true)}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderBottom = '2px solid white';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderBottom = '2px solid transparent';
          }}
        >
          Service Research Forecast
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Data Source Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              gap: '0',
              border: '3px solid #ffffff',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#1a252f',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
            <button
              onClick={() => setDataSource('ft50')}
              style={{
                padding: '10px 24px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                background: dataSource === 'ft50' ? '#3498db' : '#1a252f',
                color: 'white',
                transition: 'all 0.2s ease',
                borderRight: '2px solid #2c3e50',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (dataSource !== 'ft50') e.target.style.background = '#2c3e50';
              }}
              onMouseLeave={(e) => {
                if (dataSource !== 'ft50') e.target.style.background = '#1a252f';
              }}
            >
              FT50 Data
            </button>
            <button
              onClick={() => setDataSource('service')}
              style={{
                padding: '10px 24px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                background: dataSource === 'service' ? '#e74c3c' : '#1a252f',
                color: 'white',
                transition: 'all 0.2s ease',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (dataSource !== 'service') e.target.style.background = '#2c3e50';
              }}
              onMouseLeave={(e) => {
                if (dataSource !== 'service') e.target.style.background = '#1a252f';
              }}
            >
              Service Data
            </button>
            </div>
            <div style={{ marginLeft: '-2px' }}>
              <Tooltip 
                text={`When you click the Data Selection button and switch between datasets, the system displays prediction results that were trained on that specific dataset. Each dataset has its own trained model, so switching datasets shows you different prediction outcomes based on different training data.

              - FT50 Data: 5,892 Service research papers from Financial Times Top 50 journals and 799 papers from JSR
              - Service Data: 11,170 papers from Top 8 Service Research journals`}
                position="bottom"
              />
            </div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.8 }}>
            Predicted: {rawData.length} | Current: {previousData.length} | Network: {networkFilteredData.length} pairs, {networkData.nodes.length} communities
          </div>
        </div>
      </div>

      <div 
        data-main-container
        style={{
          flex: 1,
          display: 'flex',
          gap: '0',
          padding: '15px',
          overflow: 'hidden',
          alignItems: 'flex-start'
        }}>
        <div style={{ width: `${leftPanelWidth}%`, display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>
                Top Predicted Concept Pairs
              </h2>
              <Tooltip 
                text={`Concept pairs ranked by prediction score (likelihood of connection by 2027).

              【Key Metrics】
              - Rank: Position based on Prediction Score
              - Concept Pair: Two concepts predicted to connect (currently not co-occurring)
              - Prediction Score (0-100): Model's probability scaled to 0-100. Higher = more likely
              - Matrix Category: 2×2 classification (Accelerating/Stabilizing/Consolidating/Exploring)

              【Click to Expand Details】
              - Paper Count: Number of papers containing this concept
              - Dominant Field: Primary research field (shown as %)
              - Community Label: Thematic cluster via K-means + GPT-4o-mini labeling

              【Child Concepts】
              Hierarchical narrower terms extracted from papers:
              - Child: Appears ≥2 times (relaxed to ≥1 if none qualify)
              - Sub-child: Third-level terms (click ▶ to expand)`}
                position="bottom"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              {selectedCommunities.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  background: filterMode === 'matrix' 
                    ? 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  animation: 'fadeIn 0.3s ease-in'
                }}>
                  <span style={{ 
                    fontSize: '16px', 
                    color: 'white', 
                    fontWeight: '700',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    FILTERED
                  </span>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ 
                      fontSize: '14px', 
                      color: 'white', 
                      fontWeight: '600',
                      letterSpacing: '0.3px'
                    }}>
                      {filterMode === 'matrix' ? (
                        <>
                          {matrixCategory === 'High-High' && 'Consolidating'}
                          {matrixCategory === 'High-Low' && 'Accelerating'}
                          {matrixCategory === 'Low-High' && 'Stabilizing'}
                          {matrixCategory === 'Low-Low' && 'Exploring'}
                        </>
                      ) : (
                        selectedCommunities.join(' ↔ ')
                      )}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                    }}
                    title="Clear filter"
                  >
                    ✕
                  </button>
                </div>
              )}
              <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: '600' }}>
                {displayedPairs.length} pairs
              </span>
            </div>
          </div>

          <ConceptPairsList
            pairs={displayedPairs}
            expandedPairs={expandedPairs}
            onToggleExpand={handleToggleExpand}
            childRelations={childRelations}
            colorMap={communityColorMap}
            isFiltered={selectedCommunities.length > 0}
            selectedCommunities={selectedCommunities}
            communityPairCategories={communityPairCategories}
          />
        </div>

        {/* Horizontal Resizer */}
        <div
          onMouseDown={handleHorizontalResize}
          style={{
            width: '8px',
            cursor: 'col-resize',
            background: 'transparent',
            position: 'relative',
            flexShrink: 0,
            margin: '0 4px'
          }}
        >
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '60px',
            background: '#bdc3c7',
            borderRadius: '2px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#3498db'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#bdc3c7'}
          />
        </div>

        <div data-right-panel style={{ width: `${100 - leftPanelWidth}%`, display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
          <div style={{
            height: `${topRightHeight}%`,
            background: 'white',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>
                  Concept Communities Network
                </h2>
                <Tooltip 
                  text={`Network visualization of community relationships.

                【What is a Community?】
                Thematic clusters of semantically similar concepts. Each concept is embedded using allenai/specter, then grouped via K-means clustering. Community labels are generated by GPT-4o-mini for interpretability.

                【Nodes】
                - Each node = one community
                - Size: Proportional to number of concept pairs (larger = more pairs)

                【Edges】
                - Connections between communities
                - Thickness: Proportional to connection strength (# of concept pairs linking them)

                【Interactive Features】
                - Click Node: Filter concept pairs by single community
                - Click Edge: Filter pairs connecting two specific communities
                - Drag Nodes: Rearrange layout for better visualization`}
                  position="bottom"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Network Type Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  display: 'flex',
                  gap: '0',
                  border: '2px solid #bdc3c7',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'white'
                }}>
                  <button
                    onClick={() => {
                      setShowPreviousNetwork(false);
                      setYearFilter('all');
                    }}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: !showPreviousNetwork ? '#3498db' : 'white',
                      color: !showPreviousNetwork ? 'white' : '#7f8c8d',
                      transition: 'all 0.2s ease',
                      borderRight: '1px solid #bdc3c7'
                    }}
                    onMouseEnter={(e) => {
                      if (showPreviousNetwork) e.target.style.background = '#ecf0f1';
                    }}
                    onMouseLeave={(e) => {
                      if (showPreviousNetwork) e.target.style.background = 'white';
                    }}
                  >
                    Predicted
                  </button>
                  <button
                    onClick={() => setShowPreviousNetwork(true)}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: showPreviousNetwork ? '#27ae60' : 'white',
                      color: showPreviousNetwork ? 'white' : '#7f8c8d',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!showPreviousNetwork) e.target.style.background = '#ecf0f1';
                    }}
                    onMouseLeave={(e) => {
                      if (!showPreviousNetwork) e.target.style.background = 'white';
                    }}
                  >
                    Current
                  </button>
                </div>
                <Tooltip 
                  text={`【Predicted Network】
                Future connections forecasted by link prediction model based on historical patterns.
                - Top N Pairs: Filter by top N highest-scoring pairs
                - Hide Nodes: Hide low-frequency communities for cleaner view

                【Current Network】
                Existing co-occurrences from published service research papers.
                - Year Range: Filter by publication year (default: 2000-2024) for temporal analysis
                `}
                  position="bottom"
                />
                </div>
                
                {/* Year Filter - Previous mode only */}
                {showPreviousNetwork && (
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '2px solid #bdc3c7',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: 'white',
                      color: '#2c3e50'
                    }}
                  >
                    <option value="all">All Years</option>
                    <option value="last5">Last 5 Years (2020-2024)</option>
                    <option value="last10">Last 10 Years (2015-2024)</option>
                    <option value="custom">Custom Range</option>
                  </select>
                )}
                
                {/* Custom Year Range */}
                {showPreviousNetwork && yearFilter === 'custom' && (
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={customStartYear}
                      onChange={(e) => setCustomStartYear(Number(e.target.value))}
                      min="2000"
                      max="2024"
                      style={{
                        width: '70px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '2px solid #bdc3c7',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c3e50'
                      }}
                      placeholder="Start"
                    />
                    <span style={{ color: '#7f8c8d', fontSize: '13px', fontWeight: '600' }}>-</span>
                    <input
                      type="number"
                      value={customEndYear}
                      onChange={(e) => setCustomEndYear(Number(e.target.value))}
                      min="2000"
                      max="2024"
                      style={{
                        width: '70px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '2px solid #bdc3c7',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c3e50'
                      }}
                      placeholder="End"
                    />
                  </div>
                )}
                
                {/* Top N selector - Predicted mode only */}
                {!showPreviousNetwork && (
                  <>
                    <select
                      value={topNMode}
                      onChange={(e) => {
                        const mode = e.target.value;
                        setTopNMode(mode);
                        if (mode === '1000') {
                          setTopN(1000);
                        } else if (mode === '5000') {
                          setTopN(5000);
                        } else if (mode === '10000') {
                          setTopN(10000);
                        } else if (mode === 'all') {
                          setTopN(rawData.length);
                        } else if (mode === 'custom') {
                          setTopN(customTopN);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '2px solid #bdc3c7',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: 'white',
                        color: '#2c3e50'
                      }}
                    >
                      <option value="1000">Top 1000</option>
                      <option value="5000">Top 5000</option>
                      <option value="10000">Top 10000</option>
                      <option value="all">All ({rawData.length})</option>
                      <option value="custom">Custom</option>
                    </select>
                    
                    {topNMode === 'custom' && (
                      <input
                        type="number"
                        value={customTopN}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCustomTopN(value);
                          setTopN(value);
                        }}
                        min="1"
                        max={rawData.length}
                        style={{
                          width: '90px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '2px solid #bdc3c7',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#2c3e50'
                        }}
                        placeholder="Top N"
                      />
                    )}
                  </>
                )}
                
                {/* Hide Bottom Nodes */}
                <select
                  value={hideBottomNodes}
                  onChange={(e) => setHideBottomNodes(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '2px solid #bdc3c7',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: 'white',
                    color: '#2c3e50'
                  }}
                  title="Hide communities with fewest pairs"
                >
                  <option value={0}>Show All Nodes</option>
                  <option value={3}>Hide Bottom 3</option>
                  <option value={5}>Hide Bottom 5</option>
                  <option value={10}>Hide Bottom 10</option>
                </select>
                
          
              </div>
            </div>
            <NetworkGraph
              data={networkData}
              highlightedNodes={highlightedNodes}
              onNodeClick={handleNodeClick}
              onLinkClick={handleCommunityPairClick}
              hideBottomNodes={hideBottomNodes}
              colorMap={communityColorMap}
            />
          </div>

          {/* Vertical Resizer */}
          <div
            onMouseDown={handleVerticalResize}
            style={{
              height: '8px',
              cursor: 'row-resize',
              background: 'transparent',
              position: 'relative',
              flexShrink: 0,
              margin: '4px 0'
            }}
          >
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '4px',
              background: '#bdc3c7',
              borderRadius: '2px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#3498db'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#bdc3c7'}
            />
          </div>

          <div style={{ height: `${100 - topRightHeight}%`, display: 'flex', flexDirection: 'column'}}>
            <CommunityRanking
              ranking={communityRanking.ranked}
              fullRanking={communityRanking.full}
              selectedCommunities={selectedCommunities}
              onItemClick={handleCommunityPairClick}
              onReset={handleReset}
              rankingMode={rankingMode}
              onRankingModeChange={setRankingMode}
              onMatrixCategoryClick={handleMatrixCategoryClick}
              onMatrixToggle={handleMatrixToggle}
            />
          </div>
        </div>
      </div>
      
      <style>{`
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
      `}</style>
    </div>
  );
};

export default App;