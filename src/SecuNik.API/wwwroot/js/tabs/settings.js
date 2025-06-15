export function initTab(analysis) {
    setupSettingsForm();
    loadUserSettings();
    setupEventListeners();
}

export function render() {
    const settingsTab = document.getElementById('settingsTab');
    if (!settingsTab) return;

    settingsTab.innerHTML = `
        <div class="section-header">
            <h2><i data-feather="settings" aria-hidden="true"></i> Settings & Configuration</h2>
            <div class="header-actions">
                <button class="btn btn-secondary" id="resetSettingsBtn">
                    <i data-feather="refresh-ccw"></i> Reset to Defaults
                </button>
                <button class="btn btn-secondary" id="exportSettingsBtn">
                    <i data-feather="download"></i> Export Settings
                </button>
                <button class="btn btn-secondary" id="importSettingsBtn">
                    <i data-feather="upload"></i> Import Settings
                </button>
                <button class="btn btn-primary" id="saveSettingsBtn">
                    <i data-feather="save"></i> Save Settings
                </button>
            </div>
        </div>
        
        <div class="section-content">
            <div class="settings-grid">
                <!-- Analysis Settings -->
                <div class="settings-section">
                    <div class="section-title">
                        <h3><i data-feather="cpu"></i> Analysis Configuration</h3>
                        <p>Configure how SecuNik analyzes your security data</p>
                    </div>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="aiModeSelect">AI Analysis Mode</label>
                            <select id="aiModeSelect" class="form-control">
                                <option value="auto">Automatic - Let AI choose best approach</option>
                                <option value="enhanced">Enhanced - Maximum AI capabilities</option>
                                <option value="standard">Standard - Balanced analysis</option>
                                <option value="basic">Basic - Minimal AI processing</option>
                                <option value="disabled">Disabled - No AI analysis</option>
                            </select>
                            <small class="help-text">Controls the level of AI-powered analysis and threat detection</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="analysisDepthSelect">Analysis Depth</label>
                            <select id="analysisDepthSelect" class="form-control">
                                <option value="quick">Quick Scan - Fast overview</option>
                                <option value="standard">Standard Analysis - Recommended</option>
                                <option value="deep">Deep Analysis - Thorough examination</option>
                                <option value="comprehensive">Comprehensive - Maximum detail</option>
                                <option value="forensic">Forensic - Legal-grade analysis</option>
                            </select>
                            <small class="help-text">Determines thoroughness of security analysis</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="confidenceThreshold">Confidence Threshold</label>
                            <input type="range" id="confidenceThreshold" class="form-range" 
                                   min="0.1" max="1.0" step="0.05" value="0.8">
                            <div class="range-value">
                                <span>Low (0.1)</span>
                                <span id="confidenceValue">0.8</span>
                                <span>High (1.0)</span>
                            </div>
                            <small class="help-text">Minimum confidence level for threat detection (higher = fewer false positives)</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="timeoutSettings">Analysis Timeout (minutes)</label>
                            <input type="number" id="timeoutSettings" class="form-control" 
                                   min="1" max="60" value="15">
                            <small class="help-text">Maximum time to spend on analysis before timeout</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="includeTimelineCheck" checked>
                                <span class="checkmark"></span>
                                Generate Timeline Analysis
                            </label>
                            <small class="help-text">Create chronological timeline of security events</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="executiveSummaryCheck" checked>
                                <span class="checkmark"></span>
                                Generate Executive Summary
                            </label>
                            <small class="help-text">Create high-level summary for management reporting</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="enableForensicsCheck" checked>
                                <span class="checkmark"></span>
                                Enable Forensic Analysis
                            </label>
                            <small class="help-text">Perform detailed forensic examination of evidence</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="threatIntelCheck" checked>
                                <span class="checkmark"></span>
                                Use Threat Intelligence
                            </label>
                            <small class="help-text">Cross-reference findings with threat intelligence feeds</small>
                        </div>
                    </div>
                </div>
                
                <!-- Display Settings -->
                <div class="settings-section">
                    <div class="section-title">
                        <h3><i data-feather="monitor"></i> Display & Interface</h3>
                        <p>Customize the appearance and behavior of the dashboard</p>
                    </div>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="themeSelect">Color Theme</label>
                            <select id="themeSelect" class="form-control">
                                <option value="professional">Professional Dark (Default)</option>
                                <option value="light">Light Mode</option>
                                <option value="high-contrast">High Contrast</option>
                                <option value="cyber">Cyber Blue</option>
                                <option value="forensic">Forensic Green</option>
                            </select>
                            <small class="help-text">Choose your preferred color scheme</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="fontSizeSelect">Font Size</label>
                            <select id="fontSizeSelect" class="form-control">
                                <option value="small">Small</option>
                                <option value="medium">Medium (Default)</option>
                                <option value="large">Large</option>
                                <option value="extra-large">Extra Large</option>
                            </select>
                            <small class="help-text">Adjust text size for better readability</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="dashboardLayout">Dashboard Layout</label>
                            <select id="dashboardLayout" class="form-control">
                                <option value="compact">Compact View</option>
                                <option value="standard">Standard View (Default)</option>
                                <option value="detailed">Detailed View</option>
                                <option value="executive">Executive View</option>
                            </select>
                            <small class="help-text">Choose how dashboard widgets are arranged</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="animationsCheck" checked>
                                <span class="checkmark"></span>
                                Enable Animations
                            </label>
                            <small class="help-text">Show smooth transitions and animated effects</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="autoCollapseCheck">
                                <span class="checkmark"></span>
                                Auto-collapse Sidebar
                            </label>
                            <small class="help-text">Automatically hide sidebar on smaller screens</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="showTooltipsCheck" checked>
                                <span class="checkmark"></span>
                                Show Detailed Tooltips
                            </label>
                            <small class="help-text">Display helpful tooltips when hovering over elements</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="notificationDuration">Notification Duration (seconds)</label>
                            <input type="number" id="notificationDuration" class="form-control" 
                                   min="1" max="30" value="5">
                            <small class="help-text">How long notifications stay visible</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="refreshInterval">Auto-refresh Interval (seconds)</label>
                            <input type="number" id="refreshInterval" class="form-control" 
                                   min="0" max="300" value="0">
                            <small class="help-text">Automatic data refresh (0 = disabled)</small>
                        </div>
                    </div>
                </div>
                
                <!-- Export & Reporting Settings -->
                <div class="settings-section">
                    <div class="section-title">
                        <h3><i data-feather="file-text"></i> Export & Reporting</h3>
                        <p>Configure how reports and data exports are generated</p>
                    </div>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="exportFormatSelect">Default Export Format</label>
                            <select id="exportFormatSelect" class="form-control">
                                <option value="pdf">PDF Report (Recommended)</option>
                                <option value="json">JSON Data</option>
                                <option value="csv">CSV Export</option>
                                <option value="xml">XML Format</option>
                                <option value="html">HTML Report</option>
                            </select>
                            <small class="help-text">Default format for exported reports</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="reportTemplate">Report Template</label>
                            <select id="reportTemplate" class="form-control">
                                <option value="executive">Executive Summary</option>
                                <option value="technical">Technical Report</option>
                                <option value="forensic">Forensic Analysis</option>
                                <option value="compliance">Compliance Report</option>
                                <option value="custom">Custom Template</option>
                            </select>
                            <small class="help-text">Choose the structure and style of exported reports</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="includeRawDataCheck">
                                <span class="checkmark"></span>
                                Include Raw Data in Exports
                            </label>
                            <small class="help-text">Add original log data to exports (increases file size)</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="compressExportsCheck" checked>
                                <span class="checkmark"></span>
                                Compress Large Exports
                            </label>
                            <small class="help-text">Automatically compress exports larger than 10MB</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="includeChartsCheck" checked>
                                <span class="checkmark"></span>
                                Include Charts and Visualizations
                            </label>
                            <small class="help-text">Add visual charts to PDF and HTML exports</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="autoExportCheck">
                                <span class="checkmark"></span>
                                Auto-export Analysis Results
                            </label>
                            <small class="help-text">Automatically save reports after analysis completion</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="exportLocation">Export Location</label>
                            <input type="text" id="exportLocation" class="form-control" 
                                   value="Downloads/SecuNik-Reports" placeholder="Downloads/SecuNik-Reports">
                            <small class="help-text">Default folder for exported files</small>
                        </div>
                    </div>
                </div>
                
                <!-- Security & Privacy Settings -->
                <div class="settings-section">
                    <div class="section-title">
                        <h3><i data-feather="shield"></i> Security & Privacy</h3>
                        <p>Configure security and data protection settings</p>
                    </div>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="sessionTimeoutSelect">Session Timeout</label>
                            <select id="sessionTimeoutSelect" class="form-control">
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour (Default)</option>
                                <option value="120">2 hours</option>
                                <option value="240">4 hours</option>
                                <option value="480">8 hours</option>
                                <option value="0">Never timeout</option>
                            </select>
                            <small class="help-text">Automatically log out after inactivity</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="encryptionLevel">Data Encryption Level</label>
                            <select id="encryptionLevel" class="form-control">
                                <option value="none">None (Not recommended)</option>
                                <option value="basic">Basic (AES-128)</option>
                                <option value="standard">Standard (AES-256)</option>
                                <option value="military">Military Grade (AES-256-GCM)</option>
                            </select>
                            <small class="help-text">Encryption level for stored analysis data</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="encryptLocalDataCheck" checked>
                                <span class="checkmark"></span>
                                Encrypt Local Data Storage
                            </label>
                            <small class="help-text">Encrypt analysis data stored in browser</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="clearOnExitCheck">
                                <span class="checkmark"></span>
                                Clear Analysis Data on Exit
                            </label>
                            <small class="help-text">Remove all analysis data when closing the application</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="auditLoggingCheck" checked>
                                <span class="checkmark"></span>
                                Enable Audit Logging
                            </label>
                            <small class="help-text">Log user actions for compliance and security</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="anonymizeDataCheck">
                                <span class="checkmark"></span>
                                Anonymize Sensitive Data
                            </label>
                            <small class="help-text">Automatically redact PII from analysis results</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="dataRetentionSelect">Data Retention Period</label>
                            <select id="dataRetentionSelect" class="form-control">
                                <option value="1">1 day</option>
                                <option value="7">7 days</option>
                                <option value="30">30 days (Default)</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                                <option value="0">Keep forever</option>
                            </select>
                            <small class="help-text">How long to keep analysis data</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="backupFrequency">Backup Frequency</label>
                            <select id="backupFrequency" class="form-control">
                                <option value="none">No backups</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly (Default)</option>
                                <option value="monthly">Monthly</option>
                            </select>
                            <small class="help-text">Automatic backup schedule for analysis data</small>
                        </div>
                    </div>
                </div>
                
                <!-- Performance Settings -->
                <div class="settings-section">
                    <div class="section-title">
                        <h3><i data-feather="zap"></i> Performance & Resources</h3>
                        <p>Optimize system performance and resource usage</p>
                    </div>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="maxFileSize">Maximum File Size (MB)</label>
                            <input type="number" id="maxFileSize" class="form-control" 
                                   min="1" max="500" value="50">
                            <small class="help-text">Maximum size for uploaded evidence files</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="maxConcurrentAnalyses">Max Concurrent Analyses</label>
                            <input type="number" id="maxConcurrentAnalyses" class="form-control" 
                                   min="1" max="10" value="3">
                            <small class="help-text">Maximum number of simultaneous analyses</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="memoryLimit">Memory Limit (MB)</label>
                            <input type="number" id="memoryLimit" class="form-control" 
                                   min="512" max="8192" value="2048">
                            <small class="help-text">Maximum memory usage for analysis</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="enableCachingCheck" checked>
                                <span class="checkmark"></span>
                                Enable Smart Caching
                            </label>
                            <small class="help-text">Cache analysis results for faster subsequent loads</small>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="lowPowerModeCheck">
                                <span class="checkmark"></span>
                                Low Power Mode
                            </label>
                            <small class="help-text">Reduce CPU usage and extend battery life</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="workerThreads">Worker Threads</label>
                            <input type="number" id="workerThreads" class="form-control" 
                                   min="1" max="16" value="4">
                            <small class="help-text">Number of background processing threads</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Settings Status -->
            <div class="settings-status" id="settingsStatus" style="display: none;">
                <div class="status-message"></div>
            </div>
            
            <!-- Advanced Settings -->
            <div class="advanced-settings" id="advancedSettings" style="display: none;">
                <h3>Advanced Configuration</h3>
                <div class="form-group">
                    <label for="configJson">Raw Configuration (JSON)</label>
                    <textarea id="configJson" class="form-control" rows="10"></textarea>
                    <small class="help-text">Direct JSON configuration for advanced users</small>
                </div>
                <button class="btn btn-secondary" id="showAdvancedBtn">Show Advanced Settings</button>
            </div>
        </div>
    `;

    // Re-initialize after rendering
    initTab();
    feather.replace();
}

function setupSettingsForm() {
    // Add event listeners for real-time updates
    const confidenceSlider = document.getElementById('confidenceThreshold');
    if (confidenceSlider) {
        confidenceSlider.addEventListener('input', (e) => {
            const valueDisplay = document.getElementById('confidenceValue');
            if (valueDisplay) {
                valueDisplay.textContent = e.target.value;
            }
        });
    }

    // Show/hide advanced settings
    const showAdvancedBtn = document.getElementById('showAdvancedBtn');
    const advancedSettings = document.getElementById('advancedSettings');
    if (showAdvancedBtn && advancedSettings) {
        showAdvancedBtn.addEventListener('click', () => {
            const isVisible = advancedSettings.style.display !== 'none';
            advancedSettings.style.display = isVisible ? 'none' : 'block';
            showAdvancedBtn.textContent = isVisible ? 'Show Advanced Settings' : 'Hide Advanced Settings';
        });
    }
}

function loadUserSettings() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard) return;

    // Load from localStorage first, then apply dashboard settings
    let settings = {};
    try {
        const saved = localStorage.getItem('secuNikSettings');
        if (saved) {
            settings = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
    }

    // Merge with dashboard settings
    settings = { ...settings, ...dashboard.settings };

    // Apply all settings to form elements
    const settingsMap = {
        // Analysis settings
        'aiModeSelect': settings.aiMode || 'auto',
        'analysisDepthSelect': settings.analysisDepth || 'standard',
        'confidenceThreshold': settings.confidenceThreshold || 0.8,
        'timeoutSettings': settings.analysisTimeout || 15,

        // Display settings
        'themeSelect': settings.theme || 'professional',
        'fontSizeSelect': settings.fontSize || 'medium',
        'dashboardLayout': settings.dashboardLayout || 'standard',
        'notificationDuration': settings.notificationDuration || 5,
        'refreshInterval': settings.refreshInterval || 0,

        // Export settings
        'exportFormatSelect': settings.exportFormat || 'pdf',
        'reportTemplate': settings.reportTemplate || 'executive',
        'exportLocation': settings.exportLocation || 'Downloads/SecuNik-Reports',

        // Security settings
        'sessionTimeoutSelect': settings.sessionTimeout || 60,
        'encryptionLevel': settings.encryptionLevel || 'standard',
        'dataRetentionSelect': settings.dataRetention || 30,
        'backupFrequency': settings.backupFrequency || 'weekly',

        // Performance settings
        'maxFileSize': settings.maxFileSize || 50,
        'maxConcurrentAnalyses': settings.maxConcurrentAnalyses || 3,
        'memoryLimit': settings.memoryLimit || 2048,
        'workerThreads': settings.workerThreads || 4
    };

    // Apply text/select inputs
    Object.entries(settingsMap).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.value = value;

            // Update confidence value display
            if (id === 'confidenceThreshold') {
                const valueDisplay = document.getElementById('confidenceValue');
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
            }
        }
    });

    // Apply checkboxes
    const checkboxMap = {
        'includeTimelineCheck': settings.includeTimeline !== false,
        'executiveSummaryCheck': settings.executiveSummary !== false,
        'enableForensicsCheck': settings.enableForensics !== false,
        'threatIntelCheck': settings.threatIntel !== false,
        'animationsCheck': settings.animations !== false,
        'autoCollapseCheck': settings.autoCollapse === true,
        'showTooltipsCheck': settings.showTooltips !== false,
        'includeRawDataCheck': settings.includeRawData === true,
        'compressExportsCheck': settings.compressExports !== false,
        'includeChartsCheck': settings.includeCharts !== false,
        'autoExportCheck': settings.autoExport === true,
        'encryptLocalDataCheck': settings.encryptLocalData !== false,
        'clearOnExitCheck': settings.clearOnExit === true,
        'auditLoggingCheck': settings.auditLogging !== false,
        'anonymizeDataCheck': settings.anonymizeData === true,
        'enableCachingCheck': settings.enableCaching !== false,
        'lowPowerModeCheck': settings.lowPowerMode === true
    };

    Object.entries(checkboxMap).forEach(([id, checked]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = checked;
        }
    });

    // Update advanced JSON config
    const configJson = document.getElementById('configJson');
    if (configJson) {
        configJson.value = JSON.stringify(settings, null, 2);
    }
}

function setupEventListeners() {
    // Save Settings Button
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }

    // Reset Settings Button
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }

    // Export Settings Button
    const exportBtn = document.getElementById('exportSettingsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSettings);
    }

    // Import Settings Button
    const importBtn = document.getElementById('importSettingsBtn');
    if (importBtn) {
        importBtn.addEventListener('click', importSettings);
    }

    // Real-time theme changes
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }

    // Real-time animation toggle
    const animationsCheck = document.getElementById('animationsCheck');
    if (animationsCheck) {
        animationsCheck.addEventListener('change', (e) => {
            toggleAnimations(e.target.checked);
        });
    }

    // Real-time font size changes
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            applyFontSize(e.target.value);
        });
    }

    // Auto-save on certain changes
    const autoSaveElements = ['themeSelect', 'fontSizeSelect', 'animationsCheck'];
    autoSaveElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                setTimeout(saveSettings, 500); // Auto-save after 500ms
            });
        }
    });
}

function saveSettings() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard) return;

    try {
        const settings = collectAllSettings();

        // Update dashboard settings
        dashboard.settings = { ...dashboard.settings, ...settings };

        // Save to localStorage
        localStorage.setItem('secuNikSettings', JSON.stringify(settings));

        // Apply settings immediately
        applySettings(settings);

        // Show success message
        showSettingsStatus('Settings saved successfully!', 'success');
        dashboard.showNotification('Settings saved successfully', 'success');

    } catch (error) {
        console.error('Failed to save settings:', error);
        showSettingsStatus('Failed to save settings: ' + error.message, 'error');
        dashboard.showNotification('Failed to save settings', 'error');
    }
}

function collectAllSettings() {
    return {
        // Analysis settings
        aiMode: document.getElementById('aiModeSelect')?.value || 'auto',
        analysisDepth: document.getElementById('analysisDepthSelect')?.value || 'standard',
        confidenceThreshold: parseFloat(document.getElementById('confidenceThreshold')?.value || 0.8),
        analysisTimeout: parseInt(document.getElementById('timeoutSettings')?.value || 15),
        includeTimeline: document.getElementById('includeTimelineCheck')?.checked ?? true,
        executiveSummary: document.getElementById('executiveSummaryCheck')?.checked ?? true,
        enableForensics: document.getElementById('enableForensicsCheck')?.checked ?? true,
        threatIntel: document.getElementById('threatIntelCheck')?.checked ?? true,

        // Display settings
        theme: document.getElementById('themeSelect')?.value || 'professional',
        fontSize: document.getElementById('fontSizeSelect')?.value || 'medium',
        dashboardLayout: document.getElementById('dashboardLayout')?.value || 'standard',
        animations: document.getElementById('animationsCheck')?.checked ?? true,
        autoCollapse: document.getElementById('autoCollapseCheck')?.checked ?? false,
        showTooltips: document.getElementById('showTooltipsCheck')?.checked ?? true,
        notificationDuration: parseInt(document.getElementById('notificationDuration')?.value || 5),
        refreshInterval: parseInt(document.getElementById('refreshInterval')?.value || 0),

        // Export settings
        exportFormat: document.getElementById('exportFormatSelect')?.value || 'pdf',
        reportTemplate: document.getElementById('reportTemplate')?.value || 'executive',
        includeRawData: document.getElementById('includeRawDataCheck')?.checked ?? false,
        compressExports: document.getElementById('compressExportsCheck')?.checked ?? true,
        includeCharts: document.getElementById('includeChartsCheck')?.checked ?? true,
        autoExport: document.getElementById('autoExportCheck')?.checked ?? false,
        exportLocation: document.getElementById('exportLocation')?.value || 'Downloads/SecuNik-Reports',

        // Security settings
        sessionTimeout: parseInt(document.getElementById('sessionTimeoutSelect')?.value || 60),
        encryptionLevel: document.getElementById('encryptionLevel')?.value || 'standard',
        encryptLocalData: document.getElementById('encryptLocalDataCheck')?.checked ?? true,
        clearOnExit: document.getElementById('clearOnExitCheck')?.checked ?? false,
        auditLogging: document.getElementById('auditLoggingCheck')?.checked ?? true,
        anonymizeData: document.getElementById('anonymizeDataCheck')?.checked ?? false,
        dataRetention: parseInt(document.getElementById('dataRetentionSelect')?.value || 30),
        backupFrequency: document.getElementById('backupFrequency')?.value || 'weekly',

        // Performance settings
        maxFileSize: parseInt(document.getElementById('maxFileSize')?.value || 50),
        maxConcurrentAnalyses: parseInt(document.getElementById('maxConcurrentAnalyses')?.value || 3),
        memoryLimit: parseInt(document.getElementById('memoryLimit')?.value || 2048),
        enableCaching: document.getElementById('enableCachingCheck')?.checked ?? true,
        lowPowerMode: document.getElementById('lowPowerModeCheck')?.checked ?? false,
        workerThreads: parseInt(document.getElementById('workerThreads')?.value || 4)
    };
}

function resetSettings() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard) return;

    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
        return;
    }

    const defaultSettings = getDefaultSettings();

    dashboard.settings = defaultSettings;
    localStorage.setItem('secuNikSettings', JSON.stringify(defaultSettings));

    loadUserSettings();
    applySettings(defaultSettings);

    showSettingsStatus('Settings reset to defaults', 'success');
    dashboard.showNotification('Settings reset to defaults', 'success');
}

function getDefaultSettings() {
    return {
        // Analysis defaults
        aiMode: 'auto',
        analysisDepth: 'standard',
        confidenceThreshold: 0.8,
        analysisTimeout: 15,
        includeTimeline: true,
        executiveSummary: true,
        enableForensics: true,
        threatIntel: true,

        // Display defaults
        theme: 'professional',
        fontSize: 'medium',
        dashboardLayout: 'standard',
        animations: true,
        autoCollapse: false,
        showTooltips: true,
        notificationDuration: 5,
        refreshInterval: 0,

        // Export defaults
        exportFormat: 'pdf',
        reportTemplate: 'executive',
        includeRawData: false,
        compressExports: true,
        includeCharts: true,
        autoExport: false,
        exportLocation: 'Downloads/SecuNik-Reports',

        // Security defaults
        sessionTimeout: 60,
        encryptionLevel: 'standard',
        encryptLocalData: true,
        clearOnExit: false,
        auditLogging: true,
        anonymizeData: false,
        dataRetention: 30,
        backupFrequency: 'weekly',

        // Performance defaults
        maxFileSize: 50,
        maxConcurrentAnalyses: 3,
        memoryLimit: 2048,
        enableCaching: true,
        lowPowerMode: false,
        workerThreads: 4
    };
}

function exportSettings() {
    const dashboard = window.secuNikDashboard;
    if (!dashboard) return;

    try {
        const settings = collectAllSettings();
        const exportData = {
            version: '2.1.0',
            exportedAt: new Date().toISOString(),
            settings: settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secunik-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard.showNotification('Settings exported successfully', 'success');
    } catch (error) {
        console.error('Settings export failed:', error);
        dashboard.showNotification('Failed to export settings', 'error');
    }
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.settings) {
                throw new Error('Invalid settings file format');
            }

            const dashboard = window.secuNikDashboard;
            dashboard.settings = { ...dashboard.settings, ...importData.settings };
            localStorage.setItem('secuNikSettings', JSON.stringify(importData.settings));

            loadUserSettings();
            applySettings(importData.settings);

            dashboard.showNotification('Settings imported successfully', 'success');
        } catch (error) {
            console.error('Settings import failed:', error);
            window.secuNikDashboard?.showNotification('Failed to import settings: ' + error.message, 'error');
        }
    };

    input.click();
}

function applySettings(settings) {
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
    toggleAnimations(settings.animations);

    // Apply other settings as needed
    if (settings.refreshInterval > 0) {
        setupAutoRefresh(settings.refreshInterval);
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Apply theme-specific CSS classes
    document.body.className = document.body.className.replace(/theme-\w+/, '');
    document.body.classList.add(`theme-${theme}`);
}

function applyFontSize(fontSize) {
    document.documentElement.setAttribute('data-font-size', fontSize);

    const sizeMap = {
        'small': '14px',
        'medium': '16px',
        'large': '18px',
        'extra-large': '20px'
    };

    document.documentElement.style.setProperty('--base-font-size', sizeMap[fontSize] || '16px');
}

function toggleAnimations(enabled) {
    document.documentElement.style.setProperty('--transition-normal', enabled ? '0.3s ease' : 'none');
    document.documentElement.style.setProperty('--transition-fast', enabled ? '0.15s ease' : 'none');
    document.documentElement.setAttribute('data-animations', enabled);
}

function setupAutoRefresh(interval) {
    // Clear existing interval
    if (window.secuNikAutoRefreshInterval) {
        clearInterval(window.secuNikAutoRefreshInterval);
    }

    if (interval > 0) {
        window.secuNikAutoRefreshInterval = setInterval(() => {
            const dashboard = window.secuNikDashboard;
            if (dashboard && dashboard.state.currentAnalysis) {
                // Refresh dashboard data
                dashboard.refreshDashboard();
            }
        }, interval * 1000);
    }
}

function showSettingsStatus(message, type) {
    const status = document.getElementById('settingsStatus');
    if (!status) return;

    const messageEl = status.querySelector('.status-message');
    if (messageEl) {
        messageEl.textContent = message;
        status.className = `settings-status ${type}`;
        status.style.display = 'block';

        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}