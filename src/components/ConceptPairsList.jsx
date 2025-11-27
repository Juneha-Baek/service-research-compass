import React, { useState } from 'react';
import ConceptPairItem from './ConceptPairItem';

const ConceptPairsList = ({ pairs, expandedPairs, onToggleExpand, childRelations, colorMap = {}, isFiltered = false, selectedCommunities = [], communityPairCategories = {} }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(pairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPairs = pairs.slice(startIndex, endIndex);
  
  // 페이지 변경 핸들러
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  // pairs가 변경되면 첫 페이지로
  React.useEffect(() => {
    setCurrentPage(1);
  }, [pairs.length]);
  
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* 리스트 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        minHeight: 0
      }}>
        {currentPairs.map(pair => {
          // expandedPairs가 Map이므로 has()로 확인
          const isExpanded = expandedPairs.has(pair.rank);
          
          return (
            <ConceptPairItem
              key={`${pair.concept1}-${pair.concept2}-${pair.rank}`}
              pair={pair}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              childRelations={childRelations}
              colorMap={colorMap}
              isFiltered={isFiltered}
              selectedCommunities={selectedCommunities}
              communityPairCategories={communityPairCategories}
            />
          );
        })}
      </div>
      
      {/* 페이지네이션 컨트롤 */}
      {totalPages > 1 && (
        <div style={{
          padding: '12px 15px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa',
          flexShrink: 0
        }}>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: currentPage === 1 ? '#e0e0e0' : '#27ae60',
              color: currentPage === 1 ? '#999' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            ← Previous
          </button>
          
          <div style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* 페이지 번호 버튼들 */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  style={{
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: '4px',
                    background: currentPage === pageNum ? '#27ae60' : 'white',
                    color: currentPage === pageNum ? 'white' : '#2c3e50',
                    cursor: 'pointer',
                    fontWeight: currentPage === pageNum ? '700' : '500',
                    fontSize: '12px',
                    minWidth: '32px',
                    border: currentPage === pageNum ? 'none' : '1px solid #ddd'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <span style={{ color: '#7f8c8d', fontSize: '12px', marginLeft: '4px' }}>
              / {totalPages}
            </span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: currentPage === totalPages ? '#e0e0e0' : '#27ae60',
              color: currentPage === totalPages ? '999' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ConceptPairsList;