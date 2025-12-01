import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Tooltip 컴포넌트
 * 
 * @param {string} position - 위치 옵션:
 *   기본: 'top', 'bottom', 'left', 'right'
 *   복합: 'top-left', 'top-right', 'bottom-left', 'bottom-right',
 *         'left-top', 'left-bottom', 'right-top', 'right-bottom'
 */
const Tooltip = ({ text, position = 'top', maxWidth = '320px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const iconRef = useRef(null);

  useEffect(() => {
    if (isVisible && iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const tooltipWidth = parseInt(maxWidth);
      const offset = 10;
      const padding = 15;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top, left;
      let transform = '';
      let arrowPosition = {};

      // 복합 위치 파싱
      const [primary, secondary] = position.split('-');

      switch (primary) {
        case 'top':
          top = iconRect.top - offset;
          transform = 'translateY(-100%)';
          
          if (secondary === 'left') {
            left = iconRect.left;
            arrowPosition = { left: Math.min(20, iconRect.width / 2) + 'px' };
          } else if (secondary === 'right') {
            left = iconRect.right;
            transform += ' translateX(-100%)';
            arrowPosition = { right: Math.min(20, iconRect.width / 2) + 'px' };
          } else {
            left = iconRect.left + iconRect.width / 2;
            transform += ' translateX(-50%)';
            arrowPosition = { left: '50%', transform: 'translateX(-50%)' };
          }
          break;

        case 'bottom':
          top = iconRect.bottom + offset;
          
          if (secondary === 'left') {
            left = iconRect.left;
            arrowPosition = { left: Math.min(20, iconRect.width / 2) + 'px' };
          } else if (secondary === 'right') {
            left = iconRect.right;
            transform = 'translateX(-100%)';
            arrowPosition = { right: Math.min(20, iconRect.width / 2) + 'px' };
          } else {
            left = iconRect.left + iconRect.width / 2;
            transform = 'translateX(-50%)';
            arrowPosition = { left: '50%', transform: 'translateX(-50%)' };
          }
          break;

        case 'left':
          left = iconRect.left - offset;
          transform = 'translateX(-100%)';
          
          if (secondary === 'top') {
            top = iconRect.top;
            arrowPosition = { top: Math.min(20, iconRect.height / 2) + 'px' };
          } else if (secondary === 'bottom') {
            top = iconRect.bottom;
            transform += ' translateY(-100%)';
            arrowPosition = { bottom: Math.min(20, iconRect.height / 2) + 'px' };
          } else {
            top = iconRect.top + iconRect.height / 2;
            transform += ' translateY(-50%)';
            arrowPosition = { top: '50%', transform: 'translateY(-50%)' };
          }
          break;

        case 'right':
          left = iconRect.right + offset;
          
          if (secondary === 'top') {
            top = iconRect.top;
            arrowPosition = { top: Math.min(20, iconRect.height / 2) + 'px' };
          } else if (secondary === 'bottom') {
            top = iconRect.bottom;
            transform = 'translateY(-100%)';
            arrowPosition = { bottom: Math.min(20, iconRect.height / 2) + 'px' };
          } else {
            top = iconRect.top + iconRect.height / 2;
            transform = 'translateY(-50%)';
            arrowPosition = { top: '50%', transform: 'translateY(-50%)' };
          }
          break;

        default:
          top = iconRect.top - offset;
          left = iconRect.left + iconRect.width / 2;
          transform = 'translateY(-100%) translateX(-50%)';
          arrowPosition = { left: '50%', transform: 'translateX(-50%)' };
      }

      setTooltipStyle({
        position: 'fixed',
        top: top,
        left: left,
        transform: transform,
        background: '#2c3e50',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '6px',
        fontSize: '13px',
        lineHeight: '1.6',
        whiteSpace: 'pre-line',
        width: maxWidth,
        maxWidth: `calc(100vw - ${padding * 2}px)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: 1,
        visibility: 'visible',
        transition: 'opacity 0.15s ease',
      });

      setArrowStyle(getArrowStyle(primary, arrowPosition));
    }
  }, [isVisible, position, maxWidth]);

  const getArrowStyle = (primary, customPosition = {}) => {
    const baseStyle = {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
    };

    switch (primary) {
      case 'top':
        return {
          ...baseStyle,
          top: '100%',
          borderWidth: '7px 7px 0 7px',
          borderColor: '#2c3e50 transparent transparent transparent',
          ...customPosition,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: '100%',
          borderWidth: '0 7px 7px 7px',
          borderColor: 'transparent transparent #2c3e50 transparent',
          ...customPosition,
        };
      case 'left':
        return {
          ...baseStyle,
          left: '100%',
          borderWidth: '7px 0 7px 7px',
          borderColor: 'transparent transparent transparent #2c3e50',
          ...customPosition,
        };
      case 'right':
        return {
          ...baseStyle,
          right: '100%',
          borderWidth: '7px 7px 7px 0',
          borderColor: 'transparent #2c3e50 transparent transparent',
          ...customPosition,
        };
      default:
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '7px 7px 0 7px',
          borderColor: '#2c3e50 transparent transparent transparent',
        };
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

  const hiddenStyle = {
    position: 'fixed',
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    zIndex: -1,
  };

  const tooltipContent = (
    <div style={isVisible ? tooltipStyle : hiddenStyle}>
      {text}
      {isVisible && <div style={arrowStyle} />}
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