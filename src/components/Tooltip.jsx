import React, { useState } from 'react';

const Tooltip = ({ text, position = 'top', maxWidth = '320px' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipStyles = {
    container: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '6px'
    },
    icon: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      background: '#cbd5e0',
      color: '#2c3e50',
      fontSize: '11px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'help',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      border: '1px solid #a0aec0'
    },
    iconHover: {
      background: '#3498db',
      color: 'white',
      borderColor: '#3498db',
      transform: 'scale(1.1)'
    },
    tooltip: {
      position: 'absolute',
      background: '#2c3e50',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      lineHeight: '1.6',
      whiteSpace: 'pre-line',  // ← 여기! 'normal' → 'pre-line'
      width: maxWidth,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      zIndex: 1000,
      pointerEvents: 'none',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transition: 'opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease',
      ...(position === 'top' ? {
        bottom: '100%',
        left: '50%',
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(4px)',
        marginBottom: '10px'
      } : position === 'bottom' ? {
        top: '100%',
        left: '50%',
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-4px)',
        marginTop: '10px'
      } : position === 'left' ? {
        right: '100%',
        top: '50%',
        transform: isVisible ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(4px)',
        marginRight: '10px'
      } : {
        left: '100%',
        top: '50%',
        transform: isVisible ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-4px)',
        marginLeft: '10px'
      })
    },
    arrow: {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
      ...(position === 'top' ? {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '7px 7px 0 7px',
        borderColor: '#2c3e50 transparent transparent transparent'
      } : position === 'bottom' ? {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '0 7px 7px 7px',
        borderColor: 'transparent transparent #2c3e50 transparent'
      } : position === 'left' ? {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: '7px 0 7px 7px',
        borderColor: 'transparent transparent transparent #2c3e50'
      } : {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: '7px 7px 7px 0',
        borderColor: 'transparent #2c3e50 transparent transparent'
      })
    }
  };

  return (
    <div 
      style={tooltipStyles.container}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div style={{
        ...tooltipStyles.icon,
        ...(isVisible ? tooltipStyles.iconHover : {})
      }}>
        i
      </div>
      <div style={tooltipStyles.tooltip}>
        {text}
        <div style={tooltipStyles.arrow} />
      </div>
    </div>
  );
};

export default Tooltip;