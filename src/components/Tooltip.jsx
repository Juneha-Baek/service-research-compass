import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const Tooltip = ({ text, position = 'top', maxWidth = '320px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  useEffect(() => {
    if (isVisible && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const tooltipWidth = parseInt(maxWidth);
      const tooltipHeight = 150; // 대략적인 높이 추정
      const offset = 10;

      let top, left;

      switch (position) {
        case 'top':
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - offset;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + offset;
          break;
        default:
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position, maxWidth]);

  const getTooltipStyle = () => {
    const baseStyle = {
      position: 'fixed',
      background: '#2c3e50',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      lineHeight: '1.6',
      whiteSpace: 'pre-line',
      width: maxWidth,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      zIndex: 99999,
      pointerEvents: 'none',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transition: 'opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          bottom: `calc(100vh - ${tooltipPosition.top}px)`,
          left: tooltipPosition.left,
          transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(4px)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-4px)',
        };
      case 'left':
        return {
          ...baseStyle,
          top: tooltipPosition.top,
          right: `calc(100vw - ${tooltipPosition.left}px)`,
          transform: isVisible ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(4px)',
        };
      case 'right':
        return {
          ...baseStyle,
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: isVisible ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-4px)',
        };
      default:
        return baseStyle;
    }
  };

  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '7px 7px 0 7px',
          borderColor: '#2c3e50 transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 7px 7px 7px',
          borderColor: 'transparent transparent #2c3e50 transparent',
        };
      case 'left':
        return {
          ...baseStyle,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '7px 0 7px 7px',
          borderColor: 'transparent transparent transparent #2c3e50',
        };
      case 'right':
        return {
          ...baseStyle,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '7px 7px 7px 0',
          borderColor: 'transparent #2c3e50 transparent transparent',
        };
      default:
        return baseStyle;
    }
  };

  const iconStyles = {
    container: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '6px',
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
      border: '1px solid #a0aec0',
    },
    iconHover: {
      background: '#3498db',
      color: 'white',
      borderColor: '#3498db',
      transform: 'scale(1.1)',
    },
  };

  const tooltipContent = (
    <div style={getTooltipStyle()}>
      {text}
      <div style={getArrowStyle()} />
    </div>
  );

  return (
    <div
      style={iconStyles.container}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div
        ref={iconRef}
        style={{
          ...iconStyles.icon,
          ...(isVisible ? iconStyles.iconHover : {}),
        }}
      >
        i
      </div>
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </div>
  );
};

export default Tooltip;