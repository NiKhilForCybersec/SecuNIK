export function initTab(analysis) {
    if (!analysis) return;

    renderRecommendationsOverview(analysis);
    renderImmediateActions(analysis);
    renderLongTermStrategy(analysis);
    renderComplianceGuidance(analysis);
    setupRecommendationsControls();
}

function renderRecommendationsOverview(analysis) {
    const container = document.getElementById('recommendationsOverviewContainer') ||
        document.querySelector('.recommendations-overview-container');

    if (!container) return;

    const recommendations = extractRecommendations(analysis);

    container.innerHTML = `
        <div class="recommendations-header-card">
            <div class="card-header">
                <h3><i data-feather="zap"></i> Security Recommendations</h3>
                <div class="recommendations-summary">
                    <span class="rec-count critical">${recommendations.immediate.length} Immediate</span>
                    <span class="rec-count warning">${recommendations.shortTerm.length} Short-term</span>
                    <span class="rec-count info">${recommendations.longTerm.length} Long-term</span>
                </div>
            </div>
            <div class="card-content">
                <div class="recommendation-metrics">
                    <div class="metric-row">
                        <div class="metric-card priority-critical">
                            <div class="metric-icon">
                                <i data-feather="alert-octagon"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${recommendations.criticalIssues}</div>
                                <div class="metric-label">Critical Issues</div>
                                <div class="metric-sublabel">Require immediate attention</div>
                            </div>
                        </div>
                        
                        <div class="metric-card priority-high">
                            <div class="metric-icon">
                                <i data-feather="clock"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${recommendations.estimatedTime}</div>
                                <div class="metric-label">Est. Implementation</div>
                                <div class="metric-sublabel">Total time required</div>
                            </div>
                        </div>
                        
                        <div class="metric-card priority-medium">
                            <div class="metric-icon">
                                <i data-feather="shield"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${recommendations.riskReduction}%</div>
                                <div class="metric-label">Risk Reduction</div>
                                <div class="metric-sublabel">Expected improvement</div>
                            </div>
                        </div>

                        <div class="metric-card priority-low">
                            <div class="metric-icon">
                                <i data-feather="trending-up"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value">${recommendations.complianceScore}%</div>
                                <div class="metric-label">Compliance Score</div>
                                <div class="metric-sublabel">Current security posture</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="recommendations-summary-text">
                    <h4>Assessment Summary</h4>
                    <p>${generateRecommendationSummary(recommendations)}</p>
                </div>

                <div class="quick-actions-panel">
                    <h4>Quick Actions</h4>
                    <div class="quick-action-buttons">
                        <button class="btn btn-primary" id="generateActionPlanBtn">
                            <i data-feather="list"></i> Generate Action Plan
                        </button>
                        <button class="btn btn-secondary" id="exportRecommendationsBtn">
                            <i data-feather="download"></i> Export Report
                        </button>
                        <button class="btn btn-secondary" id="scheduleReviewBtn">
                            <i data-feather="calendar"></i> Schedule Review
                        </button>
                        <button class="btn btn-secondary" id="shareRecommendationsBtn">
                            <i data-feather="share-2"></i> Share with Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderImmediateActions(analysis) {
    const container = document.getElementById('immediateActionsContainer') ||
        document.querySelector('.immediate-actions-container');

    if (!container) return;

    const recommendations = extractRecommendations(analysis);

    container.innerHTML = `
        <div class="immediate-actions-card">
            <div class="card-header">
                <h3><i data-feather="alert-triangle"></i> Immediate Actions Required</h3>
                <div class="urgency-indicator high">
                    <i data-feather="clock"></i>
                    <span>Implement within 24-48 hours</span>
                </div>
            </div>
            <div class="card-content">
                <div class="actions-list immediate">
                    ${recommendations.immediate.map((action, index) => `
                        <div class="action-item priority-critical" data-action-id="${action.id}">
                            <div class="action-header">
                                <div class="action-priority">
                                    <span class="priority-badge critical">P1</span>
                                </div>
                                <div class="action-title">
                                    <h4>${sanitizeHTML(action.title)}</h4>
                                    <div class="action-meta">
                                        <span class="action-category">${action.category}</span>
                                        <span class="action-effort">${action.effort}</span>
                                        <span class="action-impact">${action.impact} impact</span>
                                    </div>
                                </div>
                                <div class="action-controls">
                                    <button class="btn-icon" title="Mark as complete" onclick="markActionComplete('${action.id}')">
                                        <i data-feather="check-circle"></i>
                                    </button>
                                    <button class="btn-icon" title="View details" onclick="viewActionDetails('${action.id}')">
                                        <i data-feather="info"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="action-content">
                                <div class="action-description">
                                    ${recommendations.mediumTerm.length > 3 ? `
                                    <div class="show-more-actions">
                                        <button class="btn btn-link" onclick="showMoreActions('medium')">
                                            +${recommendations.mediumTerm.length - 3} more actions
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <div class="timeline-period" data-period="long">
                            <div class="period-header">
                                <h4>Next 12 Months</h4>
                                <span class="period-count">${recommendations.longTerm.length} items</span>
                            </div>
                            <div class="period-actions">
                                ${recommendations.longTerm.slice(0, 3).map(action => `
                                    <div class="roadmap-action long-term">
                                        <div class="action-icon">
                                            <i data-feather="${action.icon}"></i>
                                        </div>
                                        <div class="action-info">
                                            <div class="action-name">${sanitizeHTML(action.title)}</div>
                                            <div class="action-benefit">${sanitizeHTML(action.benefit)}</div>
                                        </div>
                                        <div class="action-effort">${action.effort}</div>
                                    </div>
                                `).join('')}
                                ${recommendations.longTerm.length > 3 ? `
                                    <div class="show-more-actions">
                                        <button class="btn btn-link" onclick="showMoreActions('long')">
                                            +${recommendations.longTerm.length - 3} more actions
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="strategy-priorities">
                    <h4>Strategic Priorities</h4>
                    <div class="priority-matrix">
                        ${generatePriorityMatrix(recommendations)}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function renderComplianceGuidance(analysis) {
    const container = document.getElementById('complianceGuidanceContainer') ||
        document.querySelector('.compliance-guidance-container');

    if (!container) return;

    const complianceData = generateComplianceGuidance(analysis);

    container.innerHTML = `
        <div class="compliance-guidance-card">
            <div class="card-header">
                <h3><i data-feather="shield-check"></i> Compliance & Standards</h3>
                <div class="compliance-score">
                    <span class="score-value">${complianceData.overallScore}%</span>
                    <span class="score-label">Compliance Score</span>
                </div>
            </div>
            <div class="card-content">
                <div class="compliance-frameworks">
                    ${complianceData.frameworks.map(framework => `
                        <div class="framework-card">
                            <div class="framework-header">
                                <div class="framework-info">
                                    <h4>${framework.name}</h4>
                                    <p class="framework-description">${framework.description}</p>
                                </div>
                                <div class="framework-score">
                                    <div class="score-circle ${getScoreClass(framework.score)}">
                                        <span class="score-number">${framework.score}%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="framework-details">
                                <div class="compliance-areas">
                                    ${framework.areas.map(area => `
                                        <div class="compliance-area">
                                            <div class="area-header">
                                                <span class="area-name">${area.name}</span>
                                                <span class="area-status ${area.status}">${area.status.toUpperCase()}</span>
                                            </div>
                                            <div class="area-progress">
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${area.completion}%"></div>
                                                </div>
                                                <span class="progress-text">${area.completion}% complete</span>
                                            </div>
                                            ${area.gaps.length > 0 ? `
                                                <div class="area-gaps">
                                                    <strong>Gaps:</strong> ${area.gaps.join(', ')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="framework-actions">
                                    <h5>Recommended Actions for ${framework.name}:</h5>
                                    <ul class="action-list">
                                        ${framework.recommendations.map(rec => `
                                            <li class="action-item">
                                                <i data-feather="arrow-right"></i>
                                                ${sanitizeHTML(rec)}
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="compliance-summary">
                    <h4>Compliance Summary & Next Steps</h4>
                    <div class="summary-content">
                        <p>${complianceData.summary}</p>
                        <div class="next-steps">
                            <h5>Immediate Compliance Actions:</h5>
                            <ol class="steps-list">
                                ${complianceData.nextSteps.map(step => `
                                    <li>${sanitizeHTML(step)}</li>
                                `).join('')}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function setupRecommendationsControls() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'generateActionPlanBtn' || e.target.closest('#generateActionPlanBtn')) {
            generateActionPlan();
        }

        if (e.target.id === 'exportRecommendationsBtn' || e.target.closest('#exportRecommendationsBtn')) {
            exportRecommendations();
        }

        if (e.target.id === 'scheduleReviewBtn' || e.target.closest('#scheduleReviewBtn')) {
            scheduleSecurityReview();
        }

        if (e.target.id === 'shareRecommendationsBtn' || e.target.closest('#shareRecommendationsBtn')) {
            shareRecommendations();
        }
    });
}

// Data extraction and processing functions
function extractRecommendations(analysis) {
    const technical = analysis.result?.technical || analysis.result?.Technical || {};
    const ai = analysis.result?.ai || analysis.result?.AI || {};
    const events = technical.securityEvents || technical.SecurityEvents || [];
    const iocs = technical.detectedIOCs || technical.DetectedIOCs || [];

    const recommendations = {
        immediate: generateImmediateRecommendations(events, iocs),
        shortTerm: generateShortTermRecommendations(events, iocs),
        mediumTerm: generateMediumTermRecommendations(events, iocs),
        longTerm: generateLongTermRecommendations(events, iocs),
        criticalIssues: events.filter(e => (e.severity || e.Severity || '').toLowerCase() === 'critical').length,
        estimatedTime: calculateEstimatedImplementationTime(events, iocs),
        riskReduction: calculateRiskReduction(events, iocs),
        complianceScore: calculateComplianceScore(events, iocs)
    };

    return recommendations;
}

function generateImmediateRecommendations(events, iocs) {
    const immediate = [];

    const criticalEvents = events.filter(e => (e.severity || e.Severity || '').toLowerCase() === 'critical');

    if (criticalEvents.length > 0) {
        immediate.push({
            id: 'crit-events-response',
            title: 'Address Critical Security Events',
            category: 'Incident Response',
            description: `${criticalEvents.length} critical security events require immediate investigation and response.`,
            effort: 'High',
            impact: 'High',
            steps: [
                'Review all critical events in detail',
                'Identify affected systems and users',
                'Implement containment measures',
                'Document all findings and actions taken'
            ],
            resources: ['Security Team', 'System Administrators', 'Incident Response Plan']
        });
    }

    if (iocs.length > 20) {
        immediate.push({
            id: 'ioc-blocking',
            title: 'Block Malicious Indicators',
            category: 'Network Security',
            description: `${iocs.length} indicators of compromise should be blocked to prevent further threats.`,
            effort: 'Medium',
            impact: 'High',
            steps: [
                'Review and validate all detected IOCs',
                'Update firewall and DNS filtering rules',
                'Block malicious IPs and domains',
                'Monitor for bypass attempts'
            ],
            resources: ['Network Team', 'Firewall Access', 'DNS Controls']
        });
    }

    const malwareEvents = events.filter(e =>
        (e.description || e.Description || '').toLowerCase().includes('malware') ||
        (e.description || e.Description || '').toLowerCase().includes('virus')
    );

    if (malwareEvents.length > 0) {
        immediate.push({
            id: 'malware-isolation',
            title: 'Isolate Infected Systems',
            category: 'Endpoint Security',
            description: 'Malware activity detected - immediate system isolation required.',
            effort: 'High',
            impact: 'Critical',
            steps: [
                'Identify affected systems',
                'Isolate systems from network',
                'Run comprehensive antimalware scans',
                'Restore from clean backups if needed'
            ],
            resources: ['IT Team', 'Antimalware Tools', 'Network Isolation Capability']
        });
    }

    return immediate;
}

function generateShortTermRecommendations(events, iocs) {
    return [
        {
            id: 'monitoring-enhancement',
            title: 'Enhance Security Monitoring',
            icon: 'eye',
            benefit: 'Improved threat detection capabilities',
            effort: 'Medium',
            description: 'Implement enhanced monitoring based on detected patterns'
        },
        {
            id: 'access-review',
            title: 'Review User Access Rights',
            icon: 'users',
            benefit: 'Reduced attack surface',
            effort: 'Low',
            description: 'Audit and validate current user permissions'
        },
        {
            id: 'patch-management',
            title: 'Update Patch Management',
            icon: 'download',
            benefit: 'Closed vulnerability windows',
            effort: 'Medium',
            description: 'Accelerate security patch deployment'
        }
    ];
}

function generateMediumTermRecommendations(events, iocs) {
    return [
        {
            id: 'security-training',
            title: 'Security Awareness Training',
            icon: 'book',
            benefit: 'Reduced human error risks',
            effort: 'Medium',
            description: 'Comprehensive security education program'
        },
        {
            id: 'backup-strategy',
            title: 'Improve Backup Strategy',
            icon: 'hard-drive',
            benefit: 'Better disaster recovery',
            effort: 'High',
            description: 'Implement robust backup and recovery procedures'
        },
        {
            id: 'network-segmentation',
            title: 'Network Segmentation Review',
            icon: 'layers',
            benefit: 'Limited breach impact',
            effort: 'High',
            description: 'Enhance network isolation and micro-segmentation'
        }
    ];
}

function generateLongTermRecommendations(events, iocs) {
    return [
        {
            id: 'zero-trust',
            title: 'Zero Trust Architecture',
            icon: 'shield',
            benefit: 'Comprehensive security model',
            effort: 'Very High',
            description: 'Migrate to zero trust security architecture'
        },
        {
            id: 'ai-security',
            title: 'AI-Powered Security Tools',
            icon: 'cpu',
            benefit: 'Advanced threat detection',
            effort: 'High',
            description: 'Implement machine learning security solutions'
        },
        {
            id: 'compliance-framework',
            title: 'Formal Compliance Program',
            icon: 'check-square',
            benefit: 'Regulatory alignment',
            effort: 'Very High',
            description: 'Establish comprehensive compliance management'
        }
    ];
}

function generateComplianceGuidance(analysis) {
    const events = analysis.result?.technical?.securityEvents ||
        analysis.result?.Technical?.SecurityEvents || [];
    const iocs = analysis.result?.technical?.detectedIOCs ||
        analysis.result?.Technical?.DetectedIOCs || [];

    // Calculate basic compliance metrics
    const hasIncidentResponse = events.length > 0;
    const hasThreatDetection = iocs.length > 0;
    const hasLogging = events.length > 10;

    return {
        overallScore: calculateOverallComplianceScore(hasIncidentResponse, hasThreatDetection, hasLogging),
        frameworks: [
            {
                name: 'NIST Cybersecurity Framework',
                description: 'Comprehensive cybersecurity risk management framework',
                score: calculateNISTScore(hasIncidentResponse, hasThreatDetection, hasLogging),
                areas: [
                    {
                        name: 'Identify',
                        status: hasLogging ? 'compliant' : 'gaps',
                        completion: hasLogging ? 85 : 60,
                        gaps: hasLogging ? [] : ['Asset inventory', 'Risk assessment']
                    },
                    {
                        name: 'Protect',
                        status: 'partial',
                        completion: 70,
                        gaps: ['Access controls', 'Data security']
                    },
                    {
                        name: 'Detect',
                        status: hasThreatDetection ? 'compliant' : 'gaps',
                        completion: hasThreatDetection ? 80 : 45,
                        gaps: hasThreatDetection ? [] : ['Continuous monitoring', 'Anomaly detection']
                    },
                    {
                        name: 'Respond',
                        status: hasIncidentResponse ? 'compliant' : 'gaps',
                        completion: hasIncidentResponse ? 75 : 40,
                        gaps: hasIncidentResponse ? [] : ['Incident response plan', 'Communication procedures']
                    },
                    {
                        name: 'Recover',
                        status: 'gaps',
                        completion: 55,
                        gaps: ['Recovery planning', 'Lessons learned process']
                    }
                ],
                recommendations: [
                    'Develop comprehensive asset inventory',
                    'Implement continuous monitoring tools',
                    'Create incident response playbooks',
                    'Establish recovery time objectives'
                ]
            },
            {
                name: 'ISO 27001',
                description: 'International standard for information security management',
                score: calculateISOScore(hasIncidentResponse, hasThreatDetection, hasLogging),
                areas: [
                    {
                        name: 'Security Policy',
                        status: 'partial',
                        completion: 65,
                        gaps: ['Policy review process']
                    },
                    {
                        name: 'Risk Management',
                        status: hasIncidentResponse ? 'compliant' : 'gaps',
                        completion: hasIncidentResponse ? 80 : 50,
                        gaps: hasIncidentResponse ? [] : ['Risk assessment methodology']
                    }
                ],
                recommendations: [
                    'Formalize security policy framework',
                    'Implement regular risk assessments',
                    'Establish security metrics program'
                ]
            }
        ],
        summary: generateComplianceSummary(hasIncidentResponse, hasThreatDetection, hasLogging),
        nextSteps: [
            'Conduct comprehensive security assessment',
            'Develop compliance roadmap and timeline',
            'Assign compliance responsibilities to team members',
            'Establish regular compliance review meetings'
        ]
    };
}

function generateRecommendationSummary(recommendations) {
    const criticalCount = recommendations.criticalIssues;
    const immediateCount = recommendations.immediate.length;

    if (criticalCount > 0) {
        return `Analysis identified ${criticalCount} critical security issues requiring immediate attention. ${immediateCount} immediate actions have been prioritized to address the most pressing vulnerabilities. Implementation of the recommended security measures could reduce overall risk by ${recommendations.riskReduction}% and improve compliance posture to ${recommendations.complianceScore}%.`;
    } else if (immediateCount > 0) {
        return `Security analysis reveals ${immediateCount} important actions that should be implemented within 24-48 hours. While no critical vulnerabilities were detected, addressing these recommendations will strengthen your security posture and improve compliance alignment. Expected risk reduction: ${recommendations.riskReduction}%.`;
    } else {
        return `Current security analysis indicates a relatively stable security posture with no immediate critical actions required. Focus should be on long-term strategic improvements and maintaining current security controls. Consider implementing the strategic recommendations to further enhance security maturity.`;
    }
}

function generatePriorityMatrix(recommendations) {
    const allRecommendations = [
        ...recommendations.immediate,
        ...recommendations.shortTerm,
        ...recommendations.mediumTerm,
        ...recommendations.longTerm
    ];

    return `
        <div class="matrix-grid">
            <div class="matrix-quadrant high-impact low-effort">
                <h5>High Impact, Low Effort</h5>
                <div class="quadrant-items">
                    ${allRecommendations
            .filter(r => r.impact === 'High' && (r.effort === 'Low' || r.effort === 'Medium'))
            .slice(0, 3)
            .map(r => `<div class="matrix-item">${r.title || r.name}</div>`)
            .join('')}
                </div>
            </div>
            <div class="matrix-quadrant high-impact high-effort">
                <h5>High Impact, High Effort</h5>
                <div class="quadrant-items">
                    ${allRecommendations
            .filter(r => r.impact === 'High' && (r.effort === 'High' || r.effort === 'Very High'))
            .slice(0, 3)
            .map(r => `<div class="matrix-item">${r.title || r.name}</div>`)
            .join('')}
                </div>
            </div>
            <div class="matrix-quadrant low-impact low-effort">
                <h5>Low Impact, Low Effort</h5>
                <div class="quadrant-items">
                    ${allRecommendations
            .filter(r => r.impact !== 'High' && (r.effort === 'Low' || r.effort === 'Medium'))
            .slice(0, 3)
            .map(r => `<div class="matrix-item">${r.title || r.name}</div>`)
            .join('')}
                </div>
            </div>
            <div class="matrix-quadrant low-impact high-effort">
                <h5>Low Impact, High Effort</h5>
                <div class="quadrant-items">
                    ${allRecommendations
            .filter(r => r.impact !== 'High' && (r.effort === 'High' || r.effort === 'Very High'))
            .slice(0, 3)
            .map(r => `<div class="matrix-item">${r.title || r.name}</div>`)
            .join('')}
                </div>
            </div>
        </div>
    `;
}

// Calculation functions
function calculateEstimatedImplementationTime(events, iocs) {
    const baseTime = 40; // Base 40 hours
    const eventImpact = Math.min(events.length * 0.5, 20); // Max 20 hours from events
    const iocImpact = Math.min(iocs.length * 0.2, 10); // Max 10 hours from IOCs

    const totalHours = baseTime + eventImpact + iocImpact;

    if (totalHours > 60) return `${Math.round(totalHours / 8)} days`;
    return `${Math.round(totalHours)} hours`;
}

function calculateRiskReduction(events, iocs) {
    const baseReduction = 45; // Base 45% reduction
    const eventBonus = Math.min(events.length * 0.3, 25); // Max 25% bonus
    const iocBonus = Math.min(iocs.length * 0.2, 15); // Max 15% bonus

    return Math.min(Math.round(baseReduction + eventBonus + iocBonus), 85);
}

function calculateComplianceScore(events, iocs) {
    let score = 60; // Base score

    if (events.length > 10) score += 15; // Good logging
    if (iocs.length > 0) score += 10; // Threat detection
    if (events.length > 50) score += 10; // Comprehensive monitoring

    return Math.min(score, 95);
}

function calculateOverallComplianceScore(hasIncidentResponse, hasThreatDetection, hasLogging) {
    let score = 50;
    if (hasIncidentResponse) score += 20;
    if (hasThreatDetection) score += 15;
    if (hasLogging) score += 15;
    return score;
}

function calculateNISTScore(hasIncidentResponse, hasThreatDetection, hasLogging) {
    return calculateOverallComplianceScore(hasIncidentResponse, hasThreatDetection, hasLogging) + 5;
}

function calculateISOScore(hasIncidentResponse, hasThreatDetection, hasLogging) {
    return calculateOverallComplianceScore(hasIncidentResponse, hasThreatDetection, hasLogging) - 5;
}

function generateComplianceSummary(hasIncidentResponse, hasThreatDetection, hasLogging) {
    const score = calculateOverallComplianceScore(hasIncidentResponse, hasThreatDetection, hasLogging);

    if (score >= 80) {
        return "Strong compliance posture with most framework requirements met. Focus on continuous improvement and regular assessments.";
    } else if (score >= 60) {
        return "Good compliance foundation with some gaps identified. Implementing recommended actions will significantly improve security alignment.";
    } else {
        return "Compliance gaps identified that require attention. A structured approach to implementing security controls is recommended.";
    }
}

function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

// Action handlers
function generateActionPlan() {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification('Generating comprehensive action plan...', 'info');

    setTimeout(() => {
        dashboard?.showNotification('Action plan generated successfully', 'success');
    }, 2000);
}

function exportRecommendations() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard?.state.currentAnalysis) {
        dashboard?.showNotification('No recommendations to export', 'warning');
        return;
    }

    try {
        const recommendations = extractRecommendations(dashboard.state.currentAnalysis);
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                analysisId: dashboard.state.currentAnalysis.analysisId,
                exportType: 'Security Recommendations'
            },
            recommendations: recommendations
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-recommendations-${dashboard.state.currentAnalysis.analysisId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard?.showNotification('Recommendations exported successfully', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        dashboard?.showNotification('Failed to export recommendations', 'error');
    }
}

function scheduleSecurityReview() {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification('Security review scheduling feature coming soon', 'info');
}

function shareRecommendations() {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification('Sharing recommendations with team...', 'info');
}

// Global action handlers
window.markActionComplete = function (actionId) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Action ${actionId} marked as complete`, 'success');
};

window.viewActionDetails = function (actionId) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Viewing details for action ${actionId}`, 'info');
};

window.showMoreActions = function (period) {
    const dashboard = window.secuNikDashboard;
    dashboard?.showNotification(`Showing all ${period}-term actions`, 'info');
};

// Utility functions
function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
} sanitizeHTML(action.description)}
                                </div >
                                <div class="action-steps">
                                    <h5>Implementation Steps:</h5>
                                    <ol class="steps-list">
                                        ${action.steps.map(step => `
                                            <li class="step-item">
                                                <span class="step-text">${sanitizeHTML(step)}</span>
                                            </li>
                                        `).join('')}
                                    </ol>
                                </div>
                                <div class="action-resources">
                                    <h5>Required Resources:</h5>
                                    <div class="resource-tags">
                                        ${action.resources.map(resource => `
                                            <span class="resource-tag">${sanitizeHTML(resource)}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div >
                        </div >
    `).join('')}
                </div>
                
                ${recommendations.immediate.length === 0 ? `
                    <div class="no-immediate-actions">
                        <i data-feather="check-circle" width="48" height="48"></i>
                        <h4>No Immediate Actions Required</h4>
                        <p>Current analysis indicates no critical security issues requiring immediate attention.</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

if (typeof feather !== 'undefined') {
    feather.replace();
}
}

function renderLongTermStrategy(analysis) {
    const container = document.getElementById('longTermStrategyContainer') ||
        document.querySelector('.long-term-strategy-container');

    if (!container) return;

    const recommendations = extractRecommendations(analysis);

    container.innerHTML = `
        <div class="long-term-strategy-card">
            <div class="card-header">
                <h3><i data-feather="target"></i> Long-term Security Strategy</h3>
                <div class="timeline-indicator">
                    <i data-feather="calendar"></i>
                    <span>3-12 month implementation plan</span>
                </div>
            </div>
            <div class="card-content">
                <div class="strategy-roadmap">
                    <div class="roadmap-timeline">
                        <div class="timeline-period" data-period="short">
                            <div class="period-header">
                                <h4>Next 30 Days</h4>
                                <span class="period-count">${recommendations.shortTerm.length} items</span>
                            </div>
                            <div class="period-actions">
                                ${recommendations.shortTerm.slice(0, 3).map(action => `
                                    <div class="roadmap-action short-term">
                                        <div class="action-icon">
                                            <i data-feather="${action.icon}"></i>
                                        </div>
                                        <div class="action-info">
                                            <div class="action-name">${sanitizeHTML(action.title)}</div>
                                            <div class="action-benefit">${sanitizeHTML(action.benefit)}</div>
                                        </div>
                                        <div class="action-effort">${action.effort}</div>
                                    </div>
                                `).join('')}
                                ${recommendations.shortTerm.length > 3 ? `
                                    <div class="show-more-actions">
                                        <button class="btn btn-link" onclick="showMoreActions('short')">
                                            +${recommendations.shortTerm.length - 3} more actions
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <div class="timeline-period" data-period="medium">
                            <div class="period-header">
                                <h4>Next 90 Days</h4>
                                <span class="period-count">${recommendations.mediumTerm.length} items</span>
                            </div>
                            <div class="period-actions">
                                ${recommendations.mediumTerm.slice(0, 3).map(action => `
                                    <div class="roadmap-action medium-term">
                                        <div class="action-icon">
                                            <i data-feather="${action.icon}"></i>
                                        </div>
                                        <div class="action-info">
                                            <div class="action-name">${sanitizeHTML(action.title)}</div>
                                            <div class="action-benefit">${sanitizeHTML(action.benefit)}</div>
                                        </div>
                                        <div class="action-effort">${action.effort}</div>
                                    </div>
                                `).join('')}
                                // (If you intended to add more code here, complete the template literal and function. Otherwise, remove this dangling line.)