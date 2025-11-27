import React, { useState } from 'react';

const ConceptPairItem = ({ 
  pair, 
  isExpanded, 
  onToggleExpand, 
  childRelations,
  colorMap = {},
  isFiltered = false,
  selectedCommunities = [],
  communityPairCategories = {}  // { 'community1|||community2': { label, color } }
}) => {
  const [showAllChildren1, setShowAllChildren1] = useState(false);
  const [showAllChildren2, setShowAllChildren2] = useState(false);
  const [expandedSubchildren1, setExpandedSubchildren1] = useState({});
  const [expandedSubchildren2, setExpandedSubchildren2] = useState({});
  
  const INITIAL_CHILD_COUNT = 20;
  
  // Subchild를 펼치거나 접는 함수
  const toggleSubchild = (concept, childName, setExpandedState) => {
    setExpandedState(prev => ({
      ...prev,
      [childName]: !prev[childName]
    }));
  };
  
  // Child 데이터를 렌더링하는 헬퍼 함수
  const renderChildItem = (childName, idx, concept, expandedSubchildren, setExpandedState) => {
    const childData = childRelations[concept]?.[childName];
    const hasSubchildren = childData?.subchildren && childData.subchildren.length > 0;
    const isExpanded = expandedSubchildren[childName];
    
    return (
      <div key={idx} style={{ marginBottom: '4px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '13px',
          color: '#555',
          paddingLeft: '4px'
        }}>
          {/* 모든 항목에 동일한 너비의 공간 확보 */}
          <div style={{ width: '20px', display: 'inline-block' }}>
            {hasSubchildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubchild(concept, childName, setExpandedState);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '12px',
                  color: '#3498db',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ▶
              </button>
            ) : (
              <span style={{ fontSize: '13px' }}>•</span>
            )}
          </div>
          <span style={{ marginLeft: '4px' }}>
            {childName}
          </span>
        </div>
        
        {/* Subchildren */}
        {isExpanded && hasSubchildren && (
          <div style={{
            marginLeft: '28px',
            marginTop: '4px',
            paddingLeft: '6px',
            borderLeft: '2px solid #e0e0e0'
          }}>
            {childData.subchildren.map((subchild, subIdx) => (
              <div key={subIdx} style={{
                fontSize: '12px',
                color: '#777',
                marginBottom: '1px'
              }}>
                ◦ {subchild}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Get matrix category for this concept pair's community pair
  const pairKey = `${pair.community1}|||${pair.community2}`;
  const reversePairKey = `${pair.community2}|||${pair.community1}`;
  const matrixCategory = communityPairCategories[pairKey] || communityPairCategories[reversePairKey];
  
  // Determine if this is a node filter (1 community) or edge filter (2 communities)
  const isNodeFilter = selectedCommunities.length === 1;
  const isEdgeFilter = selectedCommunities.length === 2;
  
  // For node filter: only color the concept that belongs to the selected community
  // For edge filter: color both concepts
  let color1 = '#2c3e50'; // default black
  let color2 = '#2c3e50'; // default black
  
  if (isFiltered) {
    if (isNodeFilter) {
      // Only color the concept if it belongs to the selected community
      if (selectedCommunities.includes(pair.community1)) {
        color1 = colorMap[pair.community1] || '#2c3e50';
      }
      if (selectedCommunities.includes(pair.community2)) {
        color2 = colorMap[pair.community2] || '#2c3e50';
      }
    } else if (isEdgeFilter) {
      // Color both concepts in edge filter
      color1 = colorMap[pair.community1] || '#2c3e50';
      color2 = colorMap[pair.community2] || '#2c3e50';
    }
  }
  
  return (
    <div 
      style={{
        border: isExpanded ? '2px solid #3498db' : '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '10px',
        cursor: 'pointer',
        background: isExpanded ? '#f8f9fa' : 'white',
        transition: 'all 0.2s'
      }}
      onClick={() => onToggleExpand(pair)}
      onMouseEnter={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.background = '#f8f9fa';
          e.currentTarget.style.borderColor = '#3498db';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#e0e0e0';
        }
      }}
    >
      {/* Header with arrow - colored concept names based on filter type */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: '16px',
          flex: 1
        }}>
          <span style={{ color: '#7f8c8d' }}>{pair.rank}. </span>
          <span style={{ 
            color: '#2c3e50', 
            fontWeight: 'bold',
            borderBottom: isFiltered && (isEdgeFilter || selectedCommunities.includes(pair.community1)) 
              ? `2px solid ${colorMap[pair.community1] || '#95a5a6'}` 
              : 'none',
            paddingBottom: '2px'
          }}>{pair.concept1}</span>
          <span style={{ color: '#7f8c8d' }}> ↔ </span>
          <span style={{ 
            color: '#2c3e50', 
            fontWeight: 'bold',
            borderBottom: isFiltered && (isEdgeFilter || selectedCommunities.includes(pair.community2)) 
              ? `2px solid ${colorMap[pair.community2] || '#95a5a6'}` 
              : 'none',
            paddingBottom: '2px'
          }}>{pair.concept2}</span>
        </div>
        <div style={{
          fontSize: '18px',
          color: '#27ae60',
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          marginLeft: '8px'
        }}>
          ▼
        </div>
      </div>
      
      {/* Prediction Score & Matrix Category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>
          Score: {pair.prediction_score.toFixed(1)}
        </div>
        {matrixCategory && (
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: matrixCategory.color,
            background: `${matrixCategory.color}15`,
            padding: '2px 6px',
            borderRadius: '3px',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            border: `1px solid ${matrixCategory.color}40`
          }}>
            {matrixCategory.label}
          </div>
        )}
      </div>

      {/* 확장된 상세 정보 */}
      {isExpanded && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '2px solid #3498db'
        }}>
          {/* Concept 메타데이터 - 2컬럼 */}
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {/* Concept 1 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>
                Papers: {pair.concept1_freq}
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>
                Main Field: {pair.concept1_field.trim()} ({(pair.concept1_field_ratio * 100).toFixed(0)}%)
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#2c3e50',
                fontWeight: '700',
                background: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                borderLeft: `4px solid ${colorMap[pair.community1] || '#95a5a6'}`,
                display: 'inline-block',
                marginTop: '4px'
              }}>
                {pair.community1.trim()}
              </div>
            </div>

            {/* Concept 2 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>
                Papers: {pair.concept2_freq}
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>
                Main Field: {pair.concept2_field.trim()} ({(pair.concept2_field_ratio * 100).toFixed(0)}%)
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#2c3e50',
                fontWeight: '700',
                background: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                borderLeft: `4px solid ${colorMap[pair.community2] || '#95a5a6'}`,
                display: 'inline-block',
                marginTop: '4px'
              }}>
                {pair.community2.trim()}
              </div>
            </div>
          </div>

          {/* Child Concepts */}
          <div style={{
            fontWeight: 'bold',
            color: '#000000ff',
            marginBottom: '10px',
            fontSize: '15px'
          }}>
            Child Concepts
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Left Column - Concept 1 */}
            <div style={{ 
              flex: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '10px',
              background: 'white'
            }}>
              <div style={{
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '8px',
                fontSize: '14px',
                paddingBottom: '6px',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {pair.concept1}
              </div>
              {childRelations[pair.concept1] && Object.keys(childRelations[pair.concept1]).length > 0 ? (
                <>
                  {Object.keys(childRelations[pair.concept1])
                    .slice(0, showAllChildren1 ? undefined : INITIAL_CHILD_COUNT)
                    .map((childName, idx) => 
                      renderChildItem(childName, idx, pair.concept1, expandedSubchildren1, setExpandedSubchildren1)
                    )}
                  {Object.keys(childRelations[pair.concept1]).length > INITIAL_CHILD_COUNT && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllChildren1(!showAllChildren1);
                      }}
                      style={{
                        fontSize: '12px',
                        color: '#27ae60',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontWeight: '600',
                        textDecoration: 'underline'
                      }}
                    >
                      {showAllChildren1 
                        ? `Show less` 
                        : `Show ${Object.keys(childRelations[pair.concept1]).length - INITIAL_CHILD_COUNT} more...`}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                  No child concepts found
                </div>
              )}
            </div>

            {/* Right Column - Concept 2 */}
            <div style={{ 
              flex: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '10px',
              background: 'white'
            }}>
              <div style={{
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '8px',
                fontSize: '14px',
                paddingBottom: '6px',
                borderBottom: '2px solid #e8f5e9'
              }}>
                {pair.concept2}
              </div>
              {childRelations[pair.concept2] && Object.keys(childRelations[pair.concept2]).length > 0 ? (
                <>
                  {Object.keys(childRelations[pair.concept2])
                    .slice(0, showAllChildren2 ? undefined : INITIAL_CHILD_COUNT)
                    .map((childName, idx) => 
                      renderChildItem(childName, idx, pair.concept2, expandedSubchildren2, setExpandedSubchildren2)
                    )}
                  {Object.keys(childRelations[pair.concept2]).length > INITIAL_CHILD_COUNT && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllChildren2(!showAllChildren2);
                      }}
                      style={{
                        fontSize: '12px',
                        color: '#27ae60',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontWeight: '600',
                        textDecoration: 'underline'
                      }}
                    >
                      {showAllChildren2 
                        ? `Show less` 
                        : `Show ${Object.keys(childRelations[pair.concept2]).length - INITIAL_CHILD_COUNT} more...`}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                  No child concepts found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptPairItem;