import React, { useState } from 'react';

const IntroPage = ({ onEnter }) => {
  const [showGuide, setShowGuide] = useState(false);

  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <>
      <style>{`
        html, body { 
          margin: 0; 
          padding: 0; 
          overflow-x: hidden; 
          overflow-y: auto !important; 
          height: auto !important; 
        }
        #root { 
          height: auto !important; 
          min-height: 100vh; 
        }
        
        @keyframes fadeInUp { 
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0); 
          } 
        }
        
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        
        .section-card {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: box-shadow 0.2s ease;
        }
        
        .section-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        
        @media (max-width: 768px) {
          .content-grid { 
            grid-template-columns: 1fr !important; 
          }
        }
      `}</style>

      <div style={{ 
        background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)', 
        minHeight: '100vh', 
        padding: '0' 
      }}>
        {/* Header Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          padding: '30px 20px 25px',
          borderBottom: '3px solid #3498db'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Title */}
            <h1 style={{ 
              fontSize: '42px', 
              fontWeight: '700', 
              marginBottom: '10px', 
              color: '#ffffff', 
              letterSpacing: '-0.5px',
              textAlign: 'left',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              Service Research Compass 2027
            </h1>
            
            {/* Subtitle */}
            <p style={{ 
              fontSize: '16px', 
              color: '#ecf0f1', 
              marginBottom: '0',
              lineHeight: '1.5',
              maxWidth: '800px',
              animation: 'fadeInUp 0.6s ease-out 0.1s both'
            }}>
              Discover emerging service research priorities and interdisciplinary opportunities predicted to shape the field by 2027
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '25px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Overview Section */}
          <div className="section-card" style={{ 
            marginBottom: '20px',
            animation: 'fadeInUp 0.6s ease-out 0.3s both'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2c3e50', 
              marginBottom: '10px',
              borderBottom: '2px solid #3498db',
              paddingBottom: '6px'
            }}>
              What Can You Discover?
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#555', 
              lineHeight: '1.6',
              marginBottom: '10px'
            }}>
            Which research topics will converge in service science by 2027? 
            This platform answers that question by analyzing co-occurrence patterns from leading service research journals.
            Our link prediction model identifies concept pairs that don't yet appear together—but are likely to emerge as important research themes.
            </p>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '6px',
              borderLeft: '4px solid #3498db',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                <strong>Methodology:</strong> We extract hierarchical concepts from thousands of service research papers, 
                construct co-occurrence networks, and apply link prediction to forecast future connections.
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div style={{ 
            marginBottom: '20px',
            animation: 'fadeInUp 0.6s ease-out 0.4s both'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2c3e50', 
              marginBottom: '12px'
            }}>
              Key Features
            </h2>
            
            <div className="content-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px'
            }}>
              {/* Feature 1 */}
              <div className="section-card" style={{ margin: 0 }}>
                <div style={{ 
                  fontSize: '28px', 
                  marginBottom: '8px',
                  color: '#3498db'
                }}>
                  📊
                </div>
                <h3 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  marginBottom: '6px' 
                }}>
                  Top Predicted Pairs
                </h3>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666', 
                  lineHeight: '1.5',
                  margin: 0 
                }}>
                  Explore concept pairs ranked by prediction confidence. 
                  Expand each pair to see paper counts, dominant fields, and child concepts for deeper context.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="section-card" style={{ margin: 0 }}>
                <div style={{ 
                  fontSize: '28px', 
                  marginBottom: '8px',
                  color: '#27ae60'
                }}>
                  🌐
                </div>
                <h3 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  marginBottom: '6px' 
                }}>
                  Community Network
                </h3>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666', 
                  lineHeight: '1.5',
                  margin: 0 
                }}>
                  Compare predicted (2027) vs. current networks side-by-side. 
                  Click nodes or edges to filter and discover specific inter-community connections.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="section-card" style={{ margin: 0 }}>
                <div style={{ 
                  fontSize: '28px', 
                  marginBottom: '8px',
                  color: '#e67e22'
                }}>
                  🧭
                </div>
                <h3 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  marginBottom: '6px' 
                }}>
                  Community Ranking
                </h3>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666', 
                  lineHeight: '1.5',
                  margin: 0 
                }}>
                  Ranked community pairs comparing predicted and current connections.
                  Identify Consolidating, Accelerating, Stabilizing and Exploring research themes through Matrix Analysis. 
                  Find where your research area is heading.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Guide Toggle & PDF Download */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            animation: 'fadeInUp 0.6s ease-out 0.5s both',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <a
              href="/Service_Research_Compass_2027_User_Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                fontSize: '14px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
              }}
            >
              <span style={{ fontSize: '16px' }}>📄</span>
              Download PDF Guide
            </a>
          </div>

          {/* Detailed Guide Content */}
          <div style={{
            maxHeight: showGuide ? '10000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out, opacity 0.3s ease',
            opacity: showGuide ? 1 : 0
          }}>
            {showGuide && (
              <div style={{ marginBottom: '20px' }}>
                
                {/* Component 1: Top Predicted Concept Pairs */}
                <div className="section-card">
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#2c3e50', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#3498db' }}>📊</span>
                    Top Predicted Concept Pairs
                  </h3>
                  
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
                    <p style={{ marginBottom: '10px' }}>
                      Displays concept pairs ranked by prediction score (0-100), showing links likely to emerge by 2027.
                    </p>
                    
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '12px', 
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}>
                      <strong style={{ color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
                        Pair Information (Click to expand):
                      </strong>
                      <ul style={{ margin: '6px 0', paddingLeft: '18px', fontSize: '12px' }}>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Prediction Score:</strong> Model's prediction probability scaled from 0 to 100
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Paper Count:</strong> Number of distinct papers containing each concept
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Dominant Field:</strong> Primary research field (shown as percentage)
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Community Assignment:</strong> Thematic cluster label via K-means + LLM
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Child Concepts:</strong> Hierarchical narrower terms (≥2 occurrences)
                        </li>
                        <li>
                          <strong>Sub-child Concepts:</strong> Third-level terms (expandable)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Component 2: Concept Community Network */}
                <div className="section-card">
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#2c3e50', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#27ae60' }}>🌐</span>
                    Concept Community Network
                  </h3>
                  
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
                    <p style={{ marginBottom: '10px' }}>
                      Force-directed graph showing relationships between service research concept communities.
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ 
                        background: '#e8f5e9', 
                        padding: '10px', 
                        borderRadius: '6px',
                        border: '1px solid #c8e6c9'
                      }}>
                        <strong style={{ color: '#27ae60', display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                          Predicted Network
                        </strong>
                        <div style={{ fontSize: '12px' }}>
                          Future predictions by 2027
                          <br/>
                          <em>Filter:</em> Top N pairs (50-2000)
                        </div>
                      </div>
                      
                      <div style={{ 
                        background: '#e3f2fd', 
                        padding: '10px', 
                        borderRadius: '6px',
                        border: '1px solid #bbdefb'
                      }}>
                        <strong style={{ color: '#2196f3', display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                          Current Network
                        </strong>
                        <div style={{ fontSize: '12px' }}>
                          Existing connections (2021-2024)
                          <br/>
                          <em>Filter:</em> Year range
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#fff3e0', 
                      padding: '10px', 
                      borderRadius: '6px',
                      border: '1px solid #ffe0b2',
                      marginTop: '10px'
                    }}>
                      <strong style={{ color: '#e67e22', display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                        Interactive Features:
                      </strong>
                      <ul style={{ margin: '4px 0', paddingLeft: '18px', fontSize: '12px' }}>
                        <li style={{ marginBottom: '3px' }}>
                          <strong>Click Node:</strong> Filter by single community
                        </li>
                        <li style={{ marginBottom: '3px' }}>
                          <strong>Click Edge:</strong> Filter by community pair
                        </li>
                        <li style={{ marginBottom: '3px' }}>
                          <strong>Drag:</strong> Reposition nodes
                        </li>
                        <li>
                          <strong>Zoom/Pan:</strong> Mouse wheel/drag
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Component 3: Community Pair Ranking */}
                <div className="section-card">
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#2c3e50', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#e67e22' }}>📈</span>
                    Community Pair Ranking
                  </h3>
                  
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
                    <p style={{ marginBottom: '10px' }}>
                      Ordered list by connection strength (# of concept pairs in each community pair).
                    </p>
                    
                    <div style={{ 
                      background: '#e8eaf6', 
                      padding: '10px', 
                      borderRadius: '6px',
                      border: '1px solid #c5cae9'
                    }}>
                      <strong style={{ color: '#5e35b1', display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                        Matrix Categories:
                      </strong>
                      <div style={{ fontSize: '12px', color: '#555' }}>
                        🟢 <strong>Emerging:</strong> High predicted, low current<br/>
                        🔴 <strong>Declining:</strong> Low predicted, high current<br/>
                        🔵 <strong>Stable-Strong:</strong> High in both<br/>
                        ⚪ <strong>Stable-Weak:</strong> Low in both
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Controls */}
                <div className="section-card">
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#2c3e50', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#9b59b6' }}>⚙️</span>
                    Global Controls
                  </h3>
                  
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '10px'
                    }}>
                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '10px', 
                        borderRadius: '6px'
                      }}>
                        <strong style={{ color: '#2c3e50', display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                          Dataset Selection
                        </strong>
                        <div style={{ fontSize: '12px' }}>
                          <strong>FT50 Data</strong> vs <strong>Service Data</strong>
                          <br/>Each has its own trained model
                        </div>
                      </div>
                      
                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '10px', 
                        borderRadius: '6px'
                      }}>
                        <strong style={{ color: '#2c3e50', display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                          Edge Weight Mode
                        </strong>
                        <div style={{ fontSize: '12px' }}>
                          <strong>Count:</strong> Pair count<br/>
                          <strong>Weighted:</strong> Score sum
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="section-card" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#ffffff', 
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>💡</span>
                    Best Practices
                  </h3>
                  
                  <ul style={{ 
                    fontSize: '12px', 
                    lineHeight: '1.6',
                    paddingLeft: '18px',
                    margin: 0,
                    color: '#f0f0f0'
                  }}>
                    <li style={{ marginBottom: '5px' }}>
                      Begin with network visualization to understand community structure
                    </li>
                    <li style={{ marginBottom: '5px' }}>
                      Use community ranking to identify strongest relationships
                    </li>
                    <li style={{ marginBottom: '5px' }}>
                      Apply filters via network clicks for specific communities
                    </li>
                    <li style={{ marginBottom: '5px' }}>
                      Compare Predicted vs Current to identify emerging trends
                    </li>
                    <li style={{ marginBottom: '5px' }}>
                      Explore child concepts for hierarchical understanding
                    </li>
                    <li>
                      Use Matrix Analysis to categorize relationship dynamics
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Enter Button */}
          <div style={{ 
            textAlign: 'center',
            animation: 'fadeInUp 0.6s ease-out 0.6s both'
          }}>
            <button 
              onClick={onEnter} 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                padding: '16px 40px', 
                fontSize: '16px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                fontWeight: '600', 
                letterSpacing: '0.5px', 
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                textTransform: 'uppercase'
              }} 
              onMouseEnter={(e) => { 
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
              }} 
              onMouseLeave={(e) => { 
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              Enter Dashboard →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '25px 20px', 
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          borderTop: '1px solid #e1e8ed',
          marginTop: '20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '20px',
              marginBottom: '12px',
              flexWrap: 'wrap'
            }}>
              <img 
                src="/kaist.png" 
                alt="KAIST College of Business" 
                style={{ 
                  height: '28px', 
                  width: 'auto',
                  objectFit: 'contain',
                  opacity: 0.7
                }} 
              />
              <div style={{ 
                width: '1px', 
                height: '20px', 
                background: '#cbd5e0' 
              }}></div>
              <img 
                src="/asu.png" 
                alt="ASU W. P. Carey School of Business" 
                style={{ 
                  height: '28px', 
                  width: 'auto',
                  objectFit: 'contain',
                  opacity: 0.7
                }} 
              />
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#718096', 
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              KAIST College of Business · ASU W. P. Carey School of Business
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#a0aec0' 
            }}>
              © 2025 Service Research Compass 2027. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntroPage;