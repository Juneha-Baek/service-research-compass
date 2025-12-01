import React from 'react';
import Tooltip from './Tooltip';

const CommunityRanking = ({ ranking, fullRanking, selectedCommunities, onItemClick, onReset, rankingMode, onRankingModeChange, onMatrixCategoryClick, onMatrixToggle }) => {
  const [showMatrix, setShowMatrix] = React.useState(false);
  
  // Notify parent when matrix is toggled
  const handleMatrixToggle = () => {
    const newShowMatrix = !showMatrix;
    setShowMatrix(newShowMatrix);
    if (onMatrixToggle) {
      onMatrixToggle(newShowMatrix);
    }
  };
  
  // Calculate median for matrix categorization - use fullRanking instead of ranking
  const getMatrixCategories = () => {
    const pairsWithBothData = fullRanking.filter(item => item.previous_count >= 0 && item.predicted_count >= 0);
    
    if (pairsWithBothData.length === 0) return null;
    
    const predictedConcentrations = pairsWithBothData.map(item => item.predicted_concentration).sort((a, b) => a - b);
    const previousConcentrations = pairsWithBothData.map(item => item.previous_concentration).sort((a, b) => a - b);
    
    // Calculate statistically accurate median
    const getMedian = (sortedArray) => {
      const length = sortedArray.length;
      const mid = Math.floor(length / 2);
      
      if (length % 2 === 0) {
        // Even: average of middle two values
        return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
      } else {
        // Odd: middle value
        return sortedArray[mid];
      }
    };
    
    const predictedMedian = getMedian(predictedConcentrations);
    const previousMedian = getMedian(previousConcentrations);
    
    const categories = {
      'High-High': [],
      'Low-High': [],
      'High-Low': [],
      'Low-Low': []
    };
    
    pairsWithBothData.forEach(item => {
      const highPredicted = item.predicted_concentration > predictedMedian;
      const highPrevious = item.previous_concentration > previousMedian;
      
      if (highPredicted && highPrevious) {
        categories['High-High'].push(item);
      } else if (!highPredicted && highPrevious) {
        categories['Low-High'].push(item);
      } else if (highPredicted && !highPrevious) {
        categories['High-Low'].push(item);
      } else {
        categories['Low-Low'].push(item);
      }
    });
    
    // Sort each category
    // High-High: by predicted concentration (descending) - most core first
    categories['High-High'].sort((a, b) => b.predicted_concentration - a.predicted_concentration);
    
    // High-Low (Emerging): by rise (descending) - fastest growing first
    categories['High-Low'].sort((a, b) => b.rise - a.rise);
    
    // Low-High (Declining): by rise (ascending) - fastest declining first
    categories['Low-High'].sort((a, b) => a.rise - b.rise);
    
    // Low-Low: by predicted concentration (descending) - relatively less peripheral first
    categories['Low-Low'].sort((a, b) => b.predicted_concentration - a.predicted_concentration);
    
    return { categories, predictedMedian, previousMedian };
  };
  
  const matrixData = getMatrixCategories();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '10px',
      overflow: 'hidden'
    }}>
      {/* 헤더 - 고정 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>
            {showMatrix ? 'Matrix Analysis' : 'Community Pair Ranking'}
          </h2>
            <Tooltip 
              text={showMatrix 
                ? `2×2 classification of community pairs based on predicted vs. current connection strength (median-split).

            【Categories】
            - Accelerating: High predicted, Low current → Emerging research frontiers
            - Stabilizing: Low predicted, High current → Maturing relationships
            - Consolidating: High in both → Core research pillars
            - Exploring: Low in both → Potential spaces for novel research`
                : `Community pairs ranked by connection strength (# of concept pairs linking them).

            【Displayed Metrics】
            - Community Pair: Community A × Community B
            - Rank: Position based on connection strength
            - Rank Change: Difference compared to the other network (in parentheses)
            - Pairs Count: Number of concept pairs connecting the two communities
            - Percentage: Share of total edges in the network

            【Interaction】
            - Click a pair to filter concept pairs list (same as clicking edge in network)
            - Use Predicted/Current buttons to switch ranking basis

            Note: Network filters (Top N, Year Range) automatically recalculate rankings.`}
              position="top"
            />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Matrix Analysis Button */}
          {matrixData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleMatrixToggle}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                background: showMatrix ? '#9b59b6' : '#ecf0f1',
                color: showMatrix ? 'white' : '#7f8c8d',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!showMatrix) e.target.style.background = '#bdc3c7';
              }}
              onMouseLeave={(e) => {
                if (!showMatrix) e.target.style.background = '#ecf0f1';
              }}
            >
              {showMatrix ? 'Show Ranking' : 'Matrix Analysis'}
            </button>
              {!showMatrix && (
                <Tooltip 
                  text={`2×2 classification of community pairs based on predicted vs. current connection strength (median-split).

                【Categories】
                - Accelerating: High predicted, Low current → Emerging research frontiers
                - Stabilizing: Low predicted, High current → Maturing relationships
                - Consolidating: High in both → Core research pillars
                - Exploring: Low in both → Potential spaces for novel research`}
                  position="bottom"
                />
              )}
            </div>
          )}
          {/* Ranking Mode Toggle - only show when not in matrix view */}
          {!showMatrix && (
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
                onClick={() => onRankingModeChange('predicted')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: rankingMode === 'predicted' ? '#3498db' : 'white',
                  color: rankingMode === 'predicted' ? 'white' : '#7f8c8d',
                  transition: 'all 0.2s ease',
                  borderRight: '1px solid #bdc3c7'
                }}
                onMouseEnter={(e) => {
                  if (rankingMode !== 'predicted') e.target.style.background = '#ecf0f1';
                }}
                onMouseLeave={(e) => {
                  if (rankingMode !== 'predicted') e.target.style.background = 'white';
                }}
              >
                Predicted Connection
              </button>
              <button
                onClick={() => onRankingModeChange('previous')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: rankingMode === 'previous' ? '#27ae60' : 'white',
                  color: rankingMode === 'previous' ? 'white' : '#7f8c8d',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (rankingMode !== 'previous') e.target.style.background = '#ecf0f1';
                }}
                onMouseLeave={(e) => {
                  if (rankingMode !== 'previous') e.target.style.background = 'white';
                }}
              >
                Current Connection
              </button>
            </div>
            <Tooltip 
              text="Predicted Strength: ranked by future prediction | Current Strength: ranked by current co-occurrence data."
              position="left"
            />
            </div>
          )}
        </div>
      </div>

      {/* Matrix View - 전체 영역 차지 */}
      {showMatrix && matrixData && (
        <div style={{
          flex: 1,
          minHeight: 0,
          background: 'white',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '10px',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* High-High (Top Left) - Consolidating */}
            <div style={{
              border: '2px solid #27ae60',
              borderRadius: '6px',
              padding: '12px',
              background: '#e8f8f5',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div 
                onClick={() => onMatrixCategoryClick(matrixData.categories['High-High'], 'High-High')}
                style={{
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#27ae60',
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(39, 174, 96, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>Consolidating</span>
                <span style={{ fontSize: '12px', background: '#27ae60', color: 'white', padding: '2px 8px', borderRadius: '3px' }}>
                  {matrixData.categories['High-High'].length}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '8px', flexShrink: 0 }}>
                High Predicted & High Current
              </div>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {matrixData.categories['High-High'].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onItemClick(item.community1, item.community2)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #d5f4e6',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fff4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {item.community1} ↔ {item.community2}
                    <div style={{ fontSize: '10px', color: '#95a5a6', marginTop: '2px' }}>
                      P:{item.predicted_concentration.toFixed(2)}% / Pr:{item.previous_concentration.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Low (Top Right) - Accelerating */}
            <div style={{
              border: '2px solid #3498db',
              borderRadius: '6px',
              padding: '12px',
              background: '#ebf5fb',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div 
                onClick={() => onMatrixCategoryClick(matrixData.categories['High-Low'], 'High-Low')}
                style={{
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#3498db',
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>Accelerating</span>
                <span style={{ fontSize: '12px', background: '#3498db', color: 'white', padding: '2px 8px', borderRadius: '3px' }}>
                  {matrixData.categories['High-Low'].length}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '8px', flexShrink: 0 }}>
                High Predicted & Low Current
              </div>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {matrixData.categories['High-Low'].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onItemClick(item.community1, item.community2)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #d6eaf8',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f8ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {item.community1} ↔ {item.community2}
                    <div style={{ fontSize: '10px', color: '#95a5a6', marginTop: '2px' }}>
                      P:{item.predicted_concentration.toFixed(2)}% / Pr:{item.previous_concentration.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low-High (Bottom Left) - Stabilizing */}
            <div style={{
              border: '2px solid #e67e22',
              borderRadius: '6px',
              padding: '12px',
              background: '#fef5e7',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div 
                onClick={() => onMatrixCategoryClick(matrixData.categories['Low-High'], 'Low-High')}
                style={{
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#e67e22',
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(230, 126, 34, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>Stabilizing</span>
                <span style={{ fontSize: '12px', background: '#e67e22', color: 'white', padding: '2px 8px', borderRadius: '3px' }}>
                  {matrixData.categories['Low-High'].length}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '8px', flexShrink: 0 }}>
                Low Predicted & High Current
              </div>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {matrixData.categories['Low-High'].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onItemClick(item.community1, item.community2)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #fdebd0',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fffaf0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {item.community1} ↔ {item.community2}
                    <div style={{ fontSize: '10px', color: '#95a5a6', marginTop: '2px' }}>
                      P:{item.predicted_concentration.toFixed(2)}% / Pr:{item.previous_concentration.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low-Low (Bottom Right) - Exploring */}
            <div style={{
              border: '2px solid #95a5a6',
              borderRadius: '6px',
              padding: '12px',
              background: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div 
                onClick={() => onMatrixCategoryClick(matrixData.categories['Low-Low'], 'Low-Low')}
                style={{
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#95a5a6',
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(149, 165, 166, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>Exploring</span>
                <span style={{ fontSize: '12px', background: '#95a5a6', color: 'white', padding: '2px 8px', borderRadius: '3px' }}>
                  {matrixData.categories['Low-Low'].length}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '8px', flexShrink: 0 }}>
                Low Predicted & Low Current
              </div>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {matrixData.categories['Low-Low'].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onItemClick(item.community1, item.community2)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #ecf0f1',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {item.community1} ↔ {item.community2}
                    <div style={{ fontSize: '10px', color: '#95a5a6', marginTop: '2px' }}>
                      P:{item.predicted_concentration.toFixed(2)}% / Pr:{item.previous_concentration.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#7f8c8d',
            textAlign: 'center',
            paddingTop: '10px',
            marginTop: '10px',
            borderTop: '1px solid #e0e0e0',
            flexShrink: 0
          }}>
            Median Split - Predicted: {matrixData.predictedMedian.toFixed(2)}% | Current: {matrixData.previousMedian.toFixed(2)}%
          </div>
        </div>
      )}

      {/* 리스트 - Matrix가 닫혀있을 때만 표시 */}
      {!showMatrix && (
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: 'white',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {ranking.map(item => {
            const isSelected = selectedCommunities.includes(item.community1) && 
                             selectedCommunities.includes(item.community2);
            
            return (
              <div
                key={item.rank}
                onClick={() => onItemClick(item.community1, item.community2)}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  background: isSelected ? '#e8f5e9' : 'white',
                  transition: 'background 0.2s',
                  borderRadius: '4px',
                  marginBottom: '2px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                  {item.rank}. {item.community1} ↔ {item.community2}
                </div>
                
                {rankingMode === 'predicted' ? (
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600' }}>Rank: #{item.rank}</span>
                      {item.previousRank && (
                        <>
                          {item.rankChange !== null && item.rankChange !== 0 && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: item.rankChange > 0 ? '#27ae60' : '#e74c3c'
                            }}>
                              ({item.rankChange > 0 ? '↑' : '↓'}{Math.abs(item.rankChange)})
                            </span>
                          )}
                        </>
                      )}
                      {!item.previousRank && item.previous_count === 0 && (
                        <span style={{ fontSize: '11px', color: '#95a5a6' }}>(New)</span>
                      )}
                    </div>
                    <div>
                      <span style={{ fontWeight: '600' }}>Predicted:</span> {item.predicted_count} pairs ({item.predicted_concentration.toFixed(2)}%)
                      {item.previous_count > 0 && (
                        <span style={{ marginLeft: '8px' }}>
                          | <span style={{ fontWeight: '600' }}>Current:</span> {item.previous_count} pairs ({item.previous_concentration.toFixed(2)}%)
                        </span>
                      )}
                    </div>
                  </div>
                ) : rankingMode === 'previous' ? (
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600' }}>Rank: #{item.rank}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: '600' }}>Current:</span> {item.previous_count} pairs ({item.previous_concentration.toFixed(2)}%)
                      <span style={{ marginLeft: '8px' }}>
                        | <span style={{ fontWeight: '600' }}>Predicted:</span> {item.predicted_count} pairs ({item.predicted_concentration.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#7f8c8d' }}>
                        Rise: <span style={{ 
                          fontWeight: '700',
                          color: item.rise > 0 ? '#27ae60' : (item.rise < 0 ? '#e74c3c' : '#7f8c8d')
                        }}>
                          {item.rise > 0 ? '+' : ''}{item.rise.toFixed(2)}%
                        </span>
                      </span>
                    </div>
                    <div style={{ color: '#95a5a6', fontSize: '11px', marginTop: '2px' }}>
                      Predicted: {item.predicted_concentration.toFixed(2)}% ({item.predicted_count}) | Current: {item.previous_concentration.toFixed(2)}% ({item.previous_count})
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityRanking;