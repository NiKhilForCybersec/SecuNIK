export function initTab(analysis) {
    setupHelpContent();
    setupSearchFunctionality();
    setupNavigationHandlers();
    setupInteractiveElements();
}

export function render() {
    const helpTab = document.getElementById('helpTab');
    if (!helpTab) return;

    helpTab.innerHTML = `
        <div class="section-header">
            <h2><i data-feather="help-circle" aria-hidden="true"></i> Help & Documentation</h2>
            <div class="header-actions">
                <div class="help-search-container">
                    <div class="search-box">
                        <input type="text" id="helpSearch" placeholder="Search help topics, features, or issues..." class="form-control">
                        <i data-feather="search" class="search-icon"></i>
                    </div>
                    <div class="search-suggestions" id="searchSuggestions"></div>
                </div>
                <button class="btn btn-secondary" id="printHelpBtn">
                    <i data-feather="printer"></i> Print Guide
                </button>
                <button class="btn btn-primary" id="contactSupportBtn">
                    <i data-feather="headphones"></i> Contact Support
                </button>
            </div>
        </div>
        
        <div class="section-content">
            <div class="help-layout">
                <!-- Help Navigation Sidebar -->
                <nav class="help-navigation" id="helpNavigation">
                    <div class="nav-header">
                        <h3>Documentation</h3>
                        <button class="nav-toggle" id="navToggle">
                            <i data-feather="menu"></i>
                        </button>
                    </div>
                    
                    <div class="nav-content" id="navContent">
                        <div class="nav-section">
                            <h4><i data-feather="play-circle"></i> Getting Started</h4>
                            <ul class="help-nav-list">
                                <li><a href="#quick-start" class="help-nav-link active" data-category="getting-started">
                                    <i data-feather="zap"></i> Quick Start Guide
                                </a></li>
                                <li><a href="#file-upload" class="help-nav-link" data-category="getting-started">
                                    <i data-feather="upload"></i> Uploading Evidence Files
                                </a></li>
                                <li><a href="#analysis-overview" class="help-nav-link" data-category="getting-started">
                                    <i data-feather="search"></i> Understanding Analysis Results
                                </a></li>
                                <li><a href="#navigation" class="help-nav-link" data-category="getting-started">
                                    <i data-feather="compass"></i> Navigation Basics
                                </a></li>
                                <li><a href="#first-analysis" class="help-nav-link" data-category="getting-started">
                                    <i data-feather="target"></i> Your First Analysis
                                </a></li>
                            </ul>
                        </div>
                        
                        <div class="nav-section">
                            <h4><i data-feather="grid"></i> Dashboard Features</h4>
                            <ul class="help-nav-list">
                                <li><a href="#dashboard" class="help-nav-link" data-category="features">
                                    <i data-feather="pie-chart"></i> Dashboard Overview
                                </a></li>
                                <li><a href="#events" class="help-nav-link" data-category="features">
                                    <i data-feather="alert-triangle"></i> Security Events
                                </a></li>
                                <li><a href="#iocs" class="help-nav-link" data-category="features">
                                    <i data-feather="target"></i> IOC Detection
                                </a></li>
                                <li><a href="#forensics" class="help-nav-link" data-category="features">
                                    <i data-feather="microscope"></i> Forensic Analysis
                                </a></li>
                                <li><a href="#threat-intel" class="help-nav-link" data-category="features">
                                    <i data-feather="shield"></i> Threat Intelligence
                                </a></li>
                                <li><a href="#timeline" class="help-nav-link" data-category="features">
                                    <i data-feather="clock"></i> Timeline Analysis
                                </a></li>
                                <li><a href="#cases" class="help-nav-link" data-category="features">
                                    <i data-feather="folder"></i> Case Management
                                </a></li>
                            </ul>
                        </div>
                        
                        <div class="nav-section">
                            <h4><i data-feather="cpu"></i> Advanced Features</h4>
                            <ul class="help-nav-list">
                                <li><a href="#ai-analysis" class="help-nav-link" data-category="advanced">
                                    <i data-feather="brain"></i> AI-Powered Analysis
                                </a></li>
                                <li><a href="#export-reports" class="help-nav-link" data-category="advanced">
                                    <i data-feather="download"></i> Exporting Reports
                                </a></li>
                                <li><a href="#settings" class="help-nav-link" data-category="advanced">
                                    <i data-feather="settings"></i> Configuration
                                </a></li>
                                <li><a href="#api" class="help-nav-link" data-category="advanced">
                                    <i data-feather="code"></i> API Integration
                                </a></li>
                                <li><a href="#automation" class="help-nav-link" data-category="advanced">
                                    <i data-feather="play"></i> Automation & Workflows
                                </a></li>
                                <li><a href="#performance" class="help-nav-link" data-category="advanced">
                                    <i data-feather="activity"></i> Performance Optimization
                                </a></li>
                            </ul>
                        </div>
                        
                        <div class="nav-section">
                            <h4><i data-feather="life-buoy"></i> Support</h4>
                            <ul class="help-nav-list">
                                <li><a href="#troubleshooting" class="help-nav-link" data-category="support">
                                    <i data-feather="tool"></i> Troubleshooting
                                </a></li>
                                <li><a href="#faq" class="help-nav-link" data-category="support">
                                    <i data-feather="help-circle"></i> FAQ
                                </a></li>
                                <li><a href="#keyboard-shortcuts" class="help-nav-link" data-category="support">
                                    <i data-feather="command"></i> Keyboard Shortcuts
                                </a></li>
                                <li><a href="#video-tutorials" class="help-nav-link" data-category="support">
                                    <i data-feather="video"></i> Video Tutorials
                                </a></li>
                                <li><a href="#release-notes" class="help-nav-link" data-category="support">
                                    <i data-feather="bookmark"></i> Release Notes
                                </a></li>
                                <li><a href="#contact" class="help-nav-link" data-category="support">
                                    <i data-feather="mail"></i> Contact Support
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </nav>
                
                <!-- Help Content Area -->
                <main class="help-content" id="helpContentArea">
                    <div class="content-wrapper">
                        <!-- Quick Start Guide (Default) -->
                        <div class="help-article active" id="quick-start">
                            <div class="article-header">
                                <h1><i data-feather="zap"></i> Quick Start Guide</h1>
                                <div class="article-meta">
                                    <span class="reading-time">5 min read</span>
                                    <span class="difficulty beginner">Beginner</span>
                                </div>
                            </div>
                            
                            <p class="lead">Welcome to SecuNik Professional! This guide will help you perform your first cybersecurity analysis in under 5 minutes.</p>
                            
                            <div class="video-container">
                                <div class="video-placeholder">
                                    <i data-feather="play-circle" class="video-icon"></i>
                                    <span>Watch: Quick Start Tutorial (3:42)</span>
                                </div>
                            </div>
                            
                            <div class="steps-container">
                                <div class="step-item completed" data-step="1">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h3>Upload Your Evidence Files</h3>
                                        <p>Start by uploading your security evidence files. SecuNik supports a wide range of formats:</p>
                                        
                                        <div class="format-categories">
                                            <div class="format-category">
                                                <h4><i data-feather="monitor"></i> Windows Logs</h4>
                                                <ul>
                                                    <li><code>.evtx</code> - Windows Event Log (Vista+)</li>
                                                    <li><code>.evt</code> - Legacy Windows Event Log</li>
                                                </ul>
                                            </div>
                                            <div class="format-category">
                                                <h4><i data-feather="terminal"></i> Unix/Linux Logs</h4>
                                                <ul>
                                                    <li><code>.log</code> - System Log Files</li>
                                                    <li><code>.syslog</code> - Syslog Format</li>
                                                    <li><code>.wtmp/.utmp/.btmp</code> - Login Records</li>
                                                    <li><code>.lastlog</code> - Last Login Information</li>
                                                </ul>
                                            </div>
                                            <div class="format-category">
                                                <h4><i data-feather="globe"></i> Network Data</h4>
                                                <ul>
                                                    <li><code>.pcap</code> - Packet Capture</li>
                                                    <li><code>.pcapng</code> - Next Generation Capture</li>
                                                </ul>
                                            </div>
                                            <div class="format-category">
                                                <h4><i data-feather="database"></i> Structured Data</h4>
                                                <ul>
                                                    <li><code>.csv</code> - Comma Separated Values</li>
                                                    <li><code>.json</code> - JavaScript Object Notation</li>
                                                    <li><code>.txt</code> - Plain Text Logs</li>
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div class="tip-box">
                                            <i data-feather="lightbulb"></i>
                                            <div>
                                                <strong>Pro Tip:</strong> You can drag and drop multiple files at once. SecuNik will analyze them together for comprehensive insights.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-item" data-step="2">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h3>Monitor Analysis Progress</h3>
                                        <p>Once you upload a file, SecuNik automatically begins analysis:</p>
                                        <ul>
                                            <li><strong>Parsing</strong> - Extracting data from your evidence files</li>
                                            <li><strong>Pattern Recognition</strong> - Identifying security events and anomalies</li>
                                            <li><strong>AI Analysis</strong> - Machine learning threat detection</li>
                                            <li><strong>IOC Detection</strong> - Finding indicators of compromise</li>
                                            <li><strong>Report Generation</strong> - Creating executive summaries</li>
                                        </ul>
                                        
                                        <div class="progress-example">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: 75%"></div>
                                            </div>
                                            <span class="progress-text">Analyzing... 75% complete</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-item" data-step="3">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h3>Review Dashboard Results</h3>
                                        <p>The dashboard provides an immediate overview of your security posture:</p>
                                        
                                        <div class="dashboard-preview">
                                            <div class="preview-card">
                                                <h4>Quick Stats</h4>
                                                <div class="stat-items">
                                                    <div class="stat-item critical">
                                                        <span class="stat-value">3</span>
                                                        <span class="stat-label">Critical Events</span>
                                                    </div>
                                                    <div class="stat-item warning">
                                                        <span class="stat-value">15</span>
                                                        <span class="stat-label">Total Events</span>
                                                    </div>
                                                    <div class="stat-item info">
                                                        <span class="stat-value">7</span>
                                                        <span class="stat-label">IOCs Detected</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-item" data-step="4">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h3>Investigate Findings</h3>
                                        <p>Use the various tabs to dive deeper into specific aspects:</p>
                                        
                                        <div class="tab-guide">
                                            <div class="tab-item">
                                                <i data-feather="alert-triangle"></i>
                                                <div>
                                                    <strong>Events</strong> - Review individual security events with detailed context
                                                </div>
                                            </div>
                                            <div class="tab-item">
                                                <i data-feather="target"></i>
                                                <div>
                                                    <strong>IOCs</strong> - Examine indicators of compromise and threat signatures
                                                </div>
                                            </div>
                                            <div class="tab-item">
                                                <i data-feather="clock"></i>
                                                <div>
                                                    <strong>Timeline</strong> - Understand the sequence and timing of events
                                                </div>
                                            </div>
                                            <div class="tab-item">
                                                <i data-feather="microscope"></i>
                                                <div>
                                                    <strong>Forensics</strong> - Deep dive into digital artifacts and evidence chains
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-item" data-step="5">
                                    <div class="step-number">5</div>
                                    <div class="step-content">
                                        <h3>Generate Reports & Take Action</h3>
                                        <p>Export professional reports and create incident cases:</p>
                                        
                                        <div class="action-buttons">
                                            <button class="btn btn-primary demo-btn">
                                                <i data-feather="download"></i> Generate PDF Report
                                            </button>
                                            <button class="btn btn-secondary demo-btn">
                                                <i data-feather="folder-plus"></i> Create Incident Case
                                            </button>
                                            <button class="btn btn-secondary demo-btn">
                                                <i data-feather="share"></i> Export IOCs
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="next-steps">
                                <h3>What's Next?</h3>
                                <div class="next-step-cards">
                                    <a href="#file-upload" class="next-step-card">
                                        <i data-feather="upload"></i>
                                        <h4>Learn File Upload Options</h4>
                                        <p>Detailed guide on supported formats and best practices</p>
                                    </a>
                                    <a href="#dashboard" class="next-step-card">
                                        <i data-feather="pie-chart"></i>
                                        <h4>Explore Dashboard Features</h4>
                                        <p>Understand all dashboard widgets and metrics</p>
                                    </a>
                                    <a href="#ai-analysis" class="next-step-card">
                                        <i data-feather="brain"></i>
                                        <h4>AI Analysis Deep Dive</h4>
                                        <p>Maximize the power of AI-driven threat detection</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- File Upload Help -->
                        <div class="help-article" id="file-upload">
                            <div class="article-header">
                                <h1><i data-feather="upload"></i> Uploading Evidence Files</h1>
                                <div class="article-meta">
                                    <span class="reading-time">3 min read</span>
                                    <span class="difficulty beginner">Beginner</span>
                                </div>
                            </div>
                            
                            <div class="file-size-warning">
                                <i data-feather="info"></i>
                                <div>
                                    <strong>File Size Limit:</strong> Maximum 50 MB per file. For larger files, consider splitting or compressing them first.
                                </div>
                            </div>
                            
                            <h2>Upload Methods</h2>
                            <div class="upload-methods">
                                <div class="method-card">
                                    <i data-feather="mouse-pointer"></i>
                                    <h3>Drag & Drop</h3>
                                    <p>Simply drag files from your file explorer and drop them onto the upload zone in the header.</p>
                                    <div class="method-demo">
                                        <div class="upload-zone-demo">
                                            <i data-feather="upload-cloud"></i>
                                            <span>Drop Evidence Files Here</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="method-card">
                                    <i data-feather="folder"></i>
                                    <h3>Click to Browse</h3>
                                    <p>Click on the upload zone to open a file browser and select your evidence files.</p>
                                    <button class="btn btn-secondary demo-btn">
                                        <i data-feather="folder-open"></i> Browse Files
                                    </button>
                                </div>
                            </div>
                            
                            <h2>Supported File Formats</h2>
                            <div class="format-table">
                                <table class="help-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Extensions</th>
                                            <th>Description</th>
                                            <th>Analysis Features</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Windows Event Logs</strong></td>
                                            <td><code>.evtx</code>, <code>.evt</code></td>
                                            <td>Windows security and system event logs</td>
                                            <td>Full event parsing, user analysis, logon tracking</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Unix/Linux Logs</strong></td>
                                            <td><code>.log</code>, <code>.syslog</code>, <code>.wtmp</code>, <code>.utmp</code>, <code>.btmp</code></td>
                                            <td>System logs and authentication records</td>
                                            <td>Authentication analysis, system events, user sessions</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Network Captures</strong></td>
                                            <td><code>.pcap</code>, <code>.pcapng</code></td>
                                            <td>Network packet capture files</td>
                                            <td>Protocol analysis, traffic patterns, IOC detection</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Structured Data</strong></td>
                                            <td><code>.csv</code>, <code>.json</code>, <code>.txt</code></td>
                                            <td>Structured log data and exports</td>
                                            <td>Custom field mapping, pattern recognition</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <h2>Best Practices</h2>
                            <div class="best-practices">
                                <div class="practice-item">
                                    <i data-feather="check-circle" class="success"></i>
                                    <div>
                                        <h4>Use Original Files</h4>
                                        <p>Upload original, unmodified log files for the most accurate analysis.</p>
                                    </div>
                                </div>
                                <div class="practice-item">
                                    <i data-feather="check-circle" class="success"></i>
                                    <div>
                                        <h4>Include Context</h4>
                                        <p>Upload related files together (e.g., security logs + system logs) for comprehensive analysis.</p>
                                    </div>
                                </div>
                                <div class="practice-item">
                                    <i data-feather="check-circle" class="success"></i>
                                    <div>
                                        <h4>Check File Integrity</h4>
                                        <p>Ensure files aren't corrupted before upload. SecuNik will validate file integrity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Dashboard Overview -->
                        <div class="help-article" id="dashboard">
                            <div class="article-header">
                                <h1><i data-feather="pie-chart"></i> Dashboard Overview</h1>
                                <div class="article-meta">
                                    <span class="reading-time">7 min read</span>
                                    <span class="difficulty intermediate">Intermediate</span>
                                </div>
                            </div>
                            
                            <p class="lead">The SecuNik dashboard provides a comprehensive overview of your security analysis results at a glance.</p>
                            
                            <h2>Quick Stats Cards</h2>
                            <div class="dashboard-section">
                                <div class="stat-explanation">
                                    <div class="stat-card-demo critical">
                                        <div class="demo-stat-value">3</div>
                                        <div class="demo-stat-label">Critical Events</div>
                                    </div>
                                    <div class="explanation">
                                        <h4>Critical Events</h4>
                                        <p>High-severity security events requiring <strong>immediate attention</strong>. These typically include:</p>
                                        <ul>
                                            <li>Successful privilege escalations</li>
                                            <li>Confirmed malware detections</li>
                                            <li>Data exfiltration attempts</li>
                                            <li>Unauthorized administrative access</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class="stat-explanation">
                                    <div class="stat-card-demo warning">
                                        <div class="demo-stat-value">15</div>
                                        <div class="demo-stat-label">Total Events</div>
                                    </div>
                                    <div class="explanation">
                                        <h4>Total Security Events</h4>
                                        <p>Complete count of all security-relevant events detected across all severity levels.</p>
                                    </div>
                                </div>
                                
                                <div class="stat-explanation">
                                    <div class="stat-card-demo info">
                                        <div class="demo-stat-value">7</div>
                                        <div class="demo-stat-label">IOCs Detected</div>
                                    </div>
                                    <div class="explanation">
                                        <h4>Indicators of Compromise</h4>
                                        <p>Artifacts identified through pattern matching and threat intelligence correlation.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <h2>Risk Assessment Gauge</h2>
                            <div class="gauge-explanation">
                                <div class="gauge-demo">
                                    <svg width="120" height="120">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#ff4444" stroke-width="8" 
                                                stroke-dasharray="188" stroke-dashoffset="47" transform="rotate(-90 60 60)"/>
                                        <text x="60" y="70" text-anchor="middle" font-size="20" font-weight="bold">75%</text>
                                    </svg>
                                </div>
                                <div class="gauge-details">
                                    <h4>AI-Calculated Risk Score</h4>
                                    <p>Our machine learning algorithms analyze multiple factors to provide an overall risk assessment:</p>
                                    <ul>
                                        <li><strong>Event Severity</strong> - Weight of detected security events</li>
                                        <li><strong>IOC Confidence</strong> - Reliability of threat indicators</li>
                                        <li><strong>Pattern Analysis</strong> - Behavioral anomaly detection</li>
                                        <li><strong>Temporal Correlation</strong> - Timing and sequence analysis</li>
                                    </ul>
                                    
                                    <div class="risk-levels">
                                        <div class="risk-level minimal">0-39%: Minimal Risk</div>
                                        <div class="risk-level low">40-59%: Low Risk</div>
                                        <div class="risk-level medium">60-79%: Medium Risk</div>
                                        <div class="risk-level high">80-100%: High Risk</div>
                                    </div>
                                </div>
                            </div>
                            
                            <h2>Dashboard Widgets</h2>
                            <div class="widget-grid">
                                <div class="widget-card">
                                    <h4><i data-feather="brain"></i> AI Summary</h4>
                                    <p>Executive summary generated by AI analysis, including key findings and confidence metrics.</p>
                                </div>
                                <div class="widget-card">
                                    <h4><i data-feather="alert-triangle"></i> Top Threats</h4>
                                    <p>Most prevalent threat types with severity breakdown and event counts.</p>
                                </div>
                                <div class="widget-card">
                                    <h4><i data-feather="activity"></i> Timeline Preview</h4>
                                    <p>Mini timeline showing event distribution over the last 24 hours.</p>
                                </div>
                                <div class="widget-card">
                                    <h4><i data-feather="target"></i> IOC Categories</h4>
                                    <p>Breakdown of detected indicators by type with confidence levels.</p>
                                </div>
                                <div class="widget-card">
                                    <h4><i data-feather="cpu"></i> System Performance</h4>
                                    <p>Real-time analysis performance metrics including CPU, memory, and processing speed.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- FAQ Section -->
                        <div class="help-article" id="faq">
                            <div class="article-header">
                                <h1><i data-feather="help-circle"></i> Frequently Asked Questions</h1>
                            </div>
                            
                            <div class="faq-container">
                                <div class="faq-category">
                                    <h2>General Questions</h2>
                                    
                                    <div class="faq-item">
                                        <div class="faq-question">
                                            <h3>What file formats does SecuNik support?</h3>
                                            <i data-feather="chevron-down"></i>
                                        </div>
                                        <div class="faq-answer">
                                            <p>SecuNik supports a wide range of security log formats including:</p>
                                            <ul>
                                                <li><strong>Windows:</strong> .evtx, .evt (Event Logs)</li>
                                                <li><strong>Linux/Unix:</strong> .log, .syslog, .wtmp, .utmp, .btmp</li>
                                                <li><strong>Network:</strong> .pcap, .pcapng (Packet Captures)</li>
                                                <li><strong>Structured:</strong> .csv, .json, .txt</li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div class="faq-item">
                                        <div class="faq-question">
                                            <h3>How accurate is the AI analysis?</h3>
                                            <i data-feather="chevron-down"></i>
                                        </div>
                                        <div class="faq-answer">
                                            <p>Our AI models are trained on extensive cybersecurity datasets and achieve industry-leading accuracy rates:</p>
                                            <ul>
                                                <li><strong>Threat Detection:</strong> 94.7% accuracy</li>
                                                <li><strong>False Positive Rate:</strong> Less than 2%</li>
                                                <li><strong>IOC Identification:</strong> 96.2% precision</li>
                                            </ul>
                                            <p>Each finding includes a confidence score to help you assess reliability.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="faq-item">
                                        <div class="faq-question">
                                            <h3>Can I export analysis results?</h3>
                                            <i data-feather="chevron-down"></i>
                                        </div>
                                        <div class="faq-answer">
                                            <p>Yes! SecuNik offers multiple export formats:</p>
                                            <ul>
                                                <li><strong>PDF Reports:</strong> Professional executive summaries</li>
                                                <li><strong>JSON Data:</strong> Complete analysis results</li>
                                                <li><strong>CSV Exports:</strong> Tabular data for further analysis</li>
                                                <li><strong>IOC Lists:</strong> STIX/TAXII compatible formats</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="faq-category">
                                    <h2>Technical Questions</h2>
                                    
                                    <div class="faq-item">
                                        <div class="faq-question">
                                            <h3>Is my data secure?</h3>
                                            <i data-feather="chevron-down"></i>
                                        </div>
                                        <div class="faq-answer">
                                            <p>Security and privacy are our top priorities:</p>
                                            <ul>
                                                <li><strong>Local Processing:</strong> Analysis runs in your browser when possible</li>
                                                <li><strong>Encryption:</strong> All data transmission uses AES-256 encryption</li>
                                                <li><strong>No Storage:</strong> Files are not permanently stored on our servers</li>
                                                <li><strong>Privacy:</strong> No personal data is collected or retained</li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div class="faq-item">
                                        <div class="faq-question">
                                            <h3>How long does analysis take?</h3>
                                            <i data-feather="chevron-down"></i>
                                        </div>
                                        <div class="faq-answer">
                                            <p>Analysis time depends on file size and complexity:</p>
                                            <ul>
                                                <li><strong>Small files (< 1MB):</strong> 5-15 seconds</li>
                                                <li><strong>Medium files (1-10MB):</strong> 30 seconds - 2 minutes</li>
                                                <li><strong>Large files (10-50MB):</strong> 2-10 minutes</li>
                                            </ul>
                                            <p>AI analysis and deep forensics may add additional processing time.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Troubleshooting -->
                        <div class="help-article" id="troubleshooting">
                            <div class="article-header">
                                <h1><i data-feather="tool"></i> Troubleshooting Guide</h1>
                            </div>
                            
                            <div class="troubleshoot-section">
                                <h2>Common Issues</h2>
                                
                                <div class="issue-card">
                                    <h3><i data-feather="upload"></i> File Upload Problems</h3>
                                    <div class="symptoms">
                                        <h4>Symptoms:</h4>
                                        <ul>
                                            <li>File upload fails or hangs</li>
                                            <li>"Unsupported format" error</li>
                                            <li>Upload progress stuck at 0%</li>
                                        </ul>
                                    </div>
                                    <div class="solutions">
                                        <h4>Solutions:</h4>
                                        <ol>
                                            <li><strong>Check file size:</strong> Ensure file is under 50MB</li>
                                            <li><strong>Verify format:</strong> Confirm file extension is supported</li>
                                            <li><strong>Clear browser cache:</strong> Try hard refresh (Ctrl+F5)</li>
                                            <li><strong>Disable extensions:</strong> Try in incognito/private mode</li>
                                            <li><strong>Check connection:</strong> Ensure stable internet connection</li>
                                        </ol>
                                    </div>
                                </div>
                                
                                <div class="issue-card">
                                    <h3><i data-feather="clock"></i> Analysis Taking Too Long</h3>
                                    <div class="symptoms">
                                        <h4>Symptoms:</h4>
                                        <ul>
                                            <li>Analysis stuck at same percentage</li>
                                            <li>No progress after 15+ minutes</li>
                                            <li>Browser becomes unresponsive</li>
                                        </ul>
                                    </div>
                                    <div class="solutions">
                                        <h4>Solutions:</h4>
                                        <ol>
                                            <li><strong>Check file size:</strong> Large files take more time</li>
                                            <li><strong>Reduce analysis depth:</strong> Use Quick scan in settings</li>
                                            <li><strong>Close other tabs:</strong> Free up system resources</li>
                                            <li><strong>Try smaller file:</strong> Split large files if possible</li>
                                            <li><strong>Restart browser:</strong> Clear memory and try again</li>
                                        </ol>
                                    </div>
                                </div>
                                
                                <div class="issue-card">
                                    <h3><i data-feather="x-circle"></i> No Results Displayed</h3>
                                    <div class="symptoms">
                                        <h4>Symptoms:</h4>
                                        <ul>
                                            <li>Dashboard shows zero events</li>
                                            <li>Analysis completes but no data</li>
                                            <li>Empty tabs or error messages</li>
                                        </ul>
                                    </div>
                                    <div class="solutions">
                                        <h4>Solutions:</h4>
                                        <ol>
                                            <li><strong>Verify file content:</strong> Ensure file contains analyzable data</li>
                                            <li><strong>Check format compatibility:</strong> Some files may need conversion</li>
                                            <li><strong>Lower confidence threshold:</strong> Adjust in settings</li>
                                            <li><strong>Enable more analysis options:</strong> Turn on AI analysis</li>
                                            <li><strong>Try different file:</strong> Test with known good sample</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="browser-compatibility">
                                <h2>Browser Compatibility</h2>
                                <div class="browser-grid">
                                    <div class="browser-item supported">
                                        <i data-feather="chrome"></i>
                                        <div>
                                            <strong>Chrome 90+</strong>
                                            <span class="status">Fully Supported</span>
                                        </div>
                                    </div>
                                    <div class="browser-item supported">
                                        <i data-feather="firefox"></i>
                                        <div>
                                            <strong>Firefox 88+</strong>
                                            <span class="status">Fully Supported</span>
                                        </div>
                                    </div>
                                    <div class="browser-item supported">
                                        <i data-feather="safari"></i>
                                        <div>
                                            <strong>Safari 14+</strong>
                                            <span class="status">Fully Supported</span>
                                        </div>
                                    </div>
                                    <div class="browser-item supported">
                                        <i data-feather="edge"></i>
                                        <div>
                                            <strong>Edge 90+</strong>
                                            <span class="status">Fully Supported</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Contact Support -->
                        <div class="help-article" id="contact">
                            <div class="article-header">
                                <h1><i data-feather="headphones"></i> Contact Support</h1>
                            </div>
                            
                            <div class="contact-grid">
                                <div class="contact-card">
                                    <div class="contact-icon">
                                        <i data-feather="mail"></i>
                                    </div>
                                    <h3>Technical Support</h3>
                                    <p>For technical issues, bug reports, and troubleshooting assistance</p>
                                    <div class="contact-info">
                                        <a href="mailto:support@secunik.com" class="btn btn-primary">
                                            <i data-feather="mail"></i> support@secunik.com
                                        </a>
                                        <div class="response-time">
                                            <i data-feather="clock"></i>
                                            <span>Response time: 2-4 hours</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="contact-card">
                                    <div class="contact-icon">
                                        <i data-feather="briefcase"></i>
                                    </div>
                                    <h3>Sales & Licensing</h3>
                                    <p>For licensing questions, enterprise solutions, and pricing information</p>
                                    <div class="contact-info">
                                        <a href="mailto:sales@secunik.com" class="btn btn-secondary">
                                            <i data-feather="briefcase"></i> sales@secunik.com
                                        </a>
                                        <div class="response-time">
                                            <i data-feather="clock"></i>
                                            <span>Response time: 1-2 business days</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="contact-card">
                                    <div class="contact-icon">
                                        <i data-feather="book-open"></i>
                                    </div>
                                    <h3>Documentation</h3>
                                    <p>Comprehensive guides, API documentation, and developer resources</p>
                                    <div class="contact-info">
                                        <a href="#" class="btn btn-secondary">
                                            <i data-feather="external-link"></i> docs.secunik.com
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="contact-card">
                                    <div class="contact-icon">
                                        <i data-feather="users"></i>
                                    </div>
                                    <h3>Community Forum</h3>
                                    <p>Connect with other users, share experiences, and get community support</p>
                                    <div class="contact-info">
                                        <a href="#" class="btn btn-secondary">
                                            <i data-feather="message-circle"></i> community.secunik.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="system-info">
                                <h3>System Information</h3>
                                <p>Include this information when contacting support:</p>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <strong>SecuNik Version:</strong>
                                        <span>Professional v2.1.0</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Build Date:</strong>
                                        <span>${new Date().toISOString().split('T')[0]}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Browser:</strong>
                                        <span id="userAgent">${navigator.userAgent.split('(')[0]}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Platform:</strong>
                                        <span>${navigator.platform}</span>
                                    </div>
                                </div>
                                
                                <button class="btn btn-secondary" id="copySystemInfo">
                                    <i data-feather="copy"></i> Copy System Info
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `;

    // Re-initialize after rendering
    initTab();
    feather.replace();
}

function setupHelpContent() {
    // Content is rendered in the render() function
    setupInteractiveDemo();
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('helpSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (!searchInput) return;

    const searchableContent = collectSearchableContent();

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            hideSearchSuggestions();
            clearSearchHighlights();
            return;
        }

        const results = searchContent(query, searchableContent);
        showSearchSuggestions(results);
        highlightSearchResults(query);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => hideSearchSuggestions(), 200);
    });
}

function setupNavigationHandlers() {
    const navLinks = document.querySelectorAll('.help-nav-link');
    const navToggle = document.getElementById('navToggle');
    const navContent = document.getElementById('navContent');

    // Navigation link handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href').substring(1);
            showHelpArticle(targetId);

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Track page view for analytics
            trackHelpPageView(targetId);
        });
    });

    // Mobile navigation toggle
    if (navToggle && navContent) {
        navToggle.addEventListener('click', () => {
            navContent.classList.toggle('mobile-visible');
        });
    }
}

function setupInteractiveElements() {
    // FAQ expandable items
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');

        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';

            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.faq-answer').style.display = 'none';
                    otherItem.querySelector('.faq-question i').style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current item
            answer.style.display = isOpen ? 'none' : 'block';
            icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    });

    // Demo button handlers
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.textContent.trim();
            showDemoAction(action);
        });
    });

    // Copy system info handler
    const copySystemInfo = document.getElementById('copySystemInfo');
    if (copySystemInfo) {
        copySystemInfo.addEventListener('click', () => {
            copySystemInfoToClipboard();
        });
    }

    // Print help handler
    const printHelpBtn = document.getElementById('printHelpBtn');
    if (printHelpBtn) {
        printHelpBtn.addEventListener('click', () => {
            printHelpGuide();
        });
    }

    // Contact support handler
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    if (contactSupportBtn) {
        contactSupportBtn.addEventListener('click', () => {
            showHelpArticle('contact');
        });
    }
}

function setupInteractiveDemo() {
    // Add interactive elements to the quick start guide
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach((step, index) => {
        step.addEventListener('click', () => {
            highlightStep(index + 1);
        });
    });
}

function showHelpArticle(articleId) {
    const articles = document.querySelectorAll('.help-article');
    articles.forEach(article => {
        article.classList.remove('active');
        if (article.id === articleId) {
            article.classList.add('active');
            article.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Update URL hash
    if (history.replaceState) {
        history.replaceState(null, '', `#help-${articleId}`);
    }
}

function collectSearchableContent() {
    const articles = document.querySelectorAll('.help-article');
    const searchableContent = [];

    articles.forEach(article => {
        const title = article.querySelector('h1')?.textContent || '';
        const content = article.textContent.toLowerCase();
        const id = article.id;

        searchableContent.push({
            id,
            title,
            content,
            element: article
        });
    });

    return searchableContent;
}

function searchContent(query, content) {
    return content.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.includes(query)
    ).slice(0, 5);
}

function showSearchSuggestions(results) {
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;

    if (results.length === 0) {
        suggestions.innerHTML = '<div class="no-results">No results found</div>';
    } else {
        suggestions.innerHTML = results.map(result => `
            <div class="suggestion-item" onclick="showHelpArticle('${result.id}')">
                <div class="suggestion-title">${result.title}</div>
                <div class="suggestion-snippet">${getSnippet(result.content, 60)}</div>
            </div>
        `).join('');
    }

    suggestions.style.display = 'block';
}

function hideSearchSuggestions() {
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

function highlightSearchResults(query) {
    // This would highlight search terms in the content
    // Implementation would depend on specific requirements
}

function clearSearchHighlights() {
    // Clear any search highlighting
}

function getSnippet(content, maxLength) {
    return content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content;
}

function highlightStep(stepNumber) {
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((step, index) => {
        if (index + 1 <= stepNumber) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    });
}

function showDemoAction(action) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Demo: ${action} clicked`, 'info', 2000);
}

function copySystemInfoToClipboard() {
    const systemInfo = `
SecuNik Professional v2.1.0
Build Date: ${new Date().toISOString().split('T')[0]}
Browser: ${navigator.userAgent}
Platform: ${navigator.platform}
Language: ${navigator.language}
Screen: ${screen.width}x${screen.height}
Memory: ${performance.memory ? Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB' : 'Unknown'}
    `.trim();

    navigator.clipboard.writeText(systemInfo).then(() => {
        window.secuNikDashboard?.showNotification('System information copied to clipboard', 'success');
    }).catch(() => {
        window.secuNikDashboard?.showNotification('Failed to copy system information', 'error');
    });
}

function printHelpGuide() {
    const printWindow = window.open('', '_blank');
    const helpContent = document.getElementById('helpContentArea').innerHTML;

    printWindow.document.write(`
        <html>
        <head>
            <title>SecuNik Help Guide</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .help-article { page-break-before: always; }
                .help-article:first-child { page-break-before: auto; }
                h1, h2, h3 { color: #333; }
                .faq-answer { display: block !important; }
                .demo-btn, .contact-card { display: none; }
            </style>
        </head>
        <body>
            <h1>SecuNik Professional Help Guide</h1>
            ${helpContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

function trackHelpPageView(pageId) {
    // Analytics tracking would go here
    console.log(`Help page viewed: ${pageId}`);
}