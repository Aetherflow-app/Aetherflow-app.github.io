// Dashboard JavaScript functionality

// Admin users that are allowed to access the dashboard
const ADMIN_USERS = [
    'godcorn001@gmail.com' // 添加更多管理员邮箱，以逗号分隔
];

// Cloud Run API 端点基础 URL
let apiBaseUrl = '';

// DOM元素引用
const accessDeniedSection = document.getElementById('access-denied');
const dashboardContent = document.getElementById('dashboard-content');
const authPromptButton = document.getElementById('auth-prompt');
const timeRangeSelect = document.getElementById('time-range');

// 图表实例存储
let charts = {
    growth: null,
    engagement: null,
    featureUsage: null,
    revenue: null
};

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 Firebase (从 auth.js 调用)
    if (typeof initFirebase === 'function') {
        initFirebase();
    }
    
    // 设置 API 端点
    setupApiEndpoint();
    
    // 监听认证状态
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    
    // 设置事件监听器
    setupEventListeners();
});

// 设置 API 端点
function setupApiEndpoint() {
    const hostname = window.location.hostname;
    
    if (hostname === 'dev.aetherflow-app.com') {
        // 开发环境 - 需要部署开发环境的API
        apiBaseUrl = 'https://analytics-api-dev-303735099560.asia-east2.run.app';
        console.log('[Dashboard] 使用开发环境 API 端点:', apiBaseUrl);
    } else if (hostname === 'aetherflow-app.com') {
        // 生产环境
        apiBaseUrl = 'https://analytics-api-423266303314.asia-east2.run.app';
        console.log('[Dashboard] 使用生产环境 API 端点:', apiBaseUrl);
    } else {
        // 本地开发环境，使用生产 API
        apiBaseUrl = 'https://analytics-api-423266303314.asia-east2.run.app';
        console.log('[Dashboard] 本地开发环境，使用生产 API 端点:', apiBaseUrl);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 认证提示按钮点击事件
    if (authPromptButton) {
        authPromptButton.addEventListener('click', function() {
            if (typeof showAuthModal === 'function') {
                showAuthModal();
            }
        });
    }
    
    // 时间范围选择改变事件
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const days = parseInt(this.value);
            loadDashboardData(days);
        });
    }
}

// 处理认证状态变更
function handleAuthStateChanged(user) {
    if (user && isAdmin(user.email)) {
        // 用户是管理员，显示看板
        console.log('[Dashboard] 管理员已登录:', user.email);
        showDashboard();
        const days = parseInt(timeRangeSelect.value);
        loadDashboardData(days);
    } else {
        // 用户不是管理员或未登录，显示访问拒绝页面
        console.log('[Dashboard] 非管理员用户或未登录');
        showAccessDenied();
    }
}

// 检查用户是否为管理员
function isAdmin(email) {
    return ADMIN_USERS.includes(email);
}

// 显示访问拒绝页面
function showAccessDenied() {
    if (accessDeniedSection) accessDeniedSection.style.display = 'block';
    if (dashboardContent) dashboardContent.style.display = 'none';
}

// 显示看板内容
function showDashboard() {
    if (accessDeniedSection) accessDeniedSection.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
}

// 加载看板数据
async function loadDashboardData(days) {
    try {
        showLoadingState();
        
        // 获取用户 ID Token 用于认证 API 调用
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        
        // 并行加载所有数据
        const [growthData, engagementData, featureData, revenueData, feedbackData] = await Promise.all([
            fetchData(`${apiBaseUrl}/api/growth?days=${days}`, idToken),
            fetchData(`${apiBaseUrl}/api/engagement?days=${days}`, idToken),
            fetchData(`${apiBaseUrl}/api/features?days=${days}`, idToken),
            fetchData(`${apiBaseUrl}/api/revenue?days=${days}`, idToken),
            fetchData(`${apiBaseUrl}/api/feedback?limit=10`, idToken)
        ]);
        
        // 更新 UI
        updateGrowthMetrics(growthData);
        updateEngagementMetrics(engagementData);
        updateFeatureUsage(featureData);
        updateRevenueMetrics(revenueData);
        updateFeedback(feedbackData);
        
        console.log('[Dashboard] 数据加载完成');
    } catch (error) {
        console.error('[Dashboard] 加载数据失败:', error);
        showErrorState(error);
    }
}

// 通用数据获取函数
async function fetchData(url, idToken) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[Dashboard] 获取数据失败 (${url}):`, error);
        throw error;
    }
}

// 显示加载状态
function showLoadingState() {
    document.querySelectorAll('.metric-value').forEach(el => {
        el.textContent = '...';
    });
    
    document.querySelectorAll('.loading-message').forEach(el => {
        el.style.display = 'block';
        el.textContent = 'Loading data...';
    });
}

// 显示错误状态
function showErrorState(error) {
    console.error('[Dashboard] 显示错误状态:', error);
    
    document.querySelectorAll('.metric-value').forEach(el => {
        el.textContent = '-';
    });
    
    document.querySelectorAll('.loading-message').forEach(el => {
        el.textContent = 'Failed to load data. Please try again later.';
        el.style.display = 'block';
    });
    
    // 显示用户友好的错误消息
    if (error.message.includes('401')) {
        alert('Authentication failed. Please sign in again.');
    } else if (error.message.includes('403')) {
        alert('Access denied. You need admin privileges to view this dashboard.');
    } else {
        alert(`Failed to load dashboard data: ${error.message}`);
    }
}

// 更新增长指标
function updateGrowthMetrics(data) {
    // 更新数字指标
    document.getElementById('total-users').textContent = formatNumber(data.totalUsers);
    document.getElementById('new-users').textContent = formatNumber(data.newUsers);
    document.getElementById('conversion-rate').textContent = formatPercent(data.conversionRate);
    
    // 更新图表
    if (data.timeline && data.timeline.length > 0) {
        updateChart('growth-chart', charts.growth, {
            labels: data.timeline.map(item => formatDate(item.date)),
            datasets: [
                {
                    label: 'Total Users',
                    data: data.timeline.map(item => item.totalUsers),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'New Users',
                    data: data.timeline.map(item => item.newUsers),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        });
    } else {
        // 如果没有时间线数据，显示空图表
        clearChart('growth-chart');
    }
}

// 更新参与度指标
function updateEngagementMetrics(data) {
    // 更新数字指标
    document.getElementById('active-users').textContent = formatNumber(data.activeUsers);
    document.getElementById('retention-rate').textContent = formatPercent(data.retentionRate);
    document.getElementById('avg-session').textContent = formatTime(data.avgSessionTime);
    
    // 更新图表
    if (data.timeline && data.timeline.length > 0) {
        updateChart('engagement-chart', charts.engagement, {
            labels: data.timeline.map(item => formatDate(item.date)),
            datasets: [
                {
                    label: 'Active Users',
                    data: data.timeline.map(item => item.activeUsers),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Retention Rate',
                    data: data.timeline.map(item => item.retentionRate * 100), // 转换为百分比
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        }, true);
    } else {
        clearChart('engagement-chart');
    }
}

// 更新功能使用情况
function updateFeatureUsage(data) {
    // 更新图表
    const ctx = document.getElementById('feature-usage-chart');
    
    if (charts.featureUsage) {
        charts.featureUsage.destroy();
    }
    
    if (data.features && data.features.length > 0) {
        charts.featureUsage = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.features.map(item => item.name),
                datasets: [{
                    data: data.features.map(item => item.count),
                    backgroundColor: [
                        '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                        '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.formattedValue || '';
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // 显示无数据消息
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        const container = ctx.parentElement;
        container.innerHTML = '<p class="loading-message">No feature usage data available yet.</p>';
    }
}

// 更新收入指标
function updateRevenueMetrics(data) {
    // 更新数字指标
    document.getElementById('pro-users').textContent = formatNumber(data.proUsers);
    document.getElementById('monthly-revenue').textContent = formatCurrency(data.monthlyRevenue);
    document.getElementById('annual-revenue').textContent = formatCurrency(data.annualRevenue);
    
    // 更新图表
    if (data.timeline && data.timeline.length > 0) {
        updateChart('revenue-chart', charts.revenue, {
            labels: data.timeline.map(item => formatDate(item.date)),
            datasets: [
                {
                    label: 'Revenue',
                    data: data.timeline.map(item => item.revenue),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Pro Users',
                    data: data.timeline.map(item => item.proUsers),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        }, true);
    } else {
        clearChart('revenue-chart');
    }
}

// 更新用户反馈
function updateFeedback(data) {
    const container = document.getElementById('feedback-container');
    
    if (!container) return;
    
    if (!data.items || data.items.length === 0) {
        container.innerHTML = '<p class="loading-message">No feedback data available yet.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    data.items.forEach(item => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        
        const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-user">${item.userName || 'Anonymous User'}</span>
                <span class="feedback-date">${formatDate(item.date)}</span>
            </div>
            <div class="feedback-rating">
                <span class="star">${stars}</span>
            </div>
            <p class="feedback-text">${item.text}</p>
        `;
        
        container.appendChild(feedbackItem);
    });
}

// 清空图表
function clearChart(chartId) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    // 销毁现有图表
    switch(chartId) {
        case 'growth-chart':
            if (charts.growth) {
                charts.growth.destroy();
                charts.growth = null;
            }
            break;
        case 'engagement-chart':
            if (charts.engagement) {
                charts.engagement.destroy();
                charts.engagement = null;
            }
            break;
        case 'revenue-chart':
            if (charts.revenue) {
                charts.revenue.destroy();
                charts.revenue = null;
            }
            break;
    }
    
    // 显示无数据消息
    const container = ctx.parentElement;
    container.innerHTML = '<p class="loading-message">No historical data available yet.</p>';
}

// 更新图表通用函数
function updateChart(chartId, chartInstance, data, dualAxis = false) {
    const ctx = document.getElementById(chartId);
    
    if (!ctx) return;
    
    if (chartInstance) {
        chartInstance.data = data;
        chartInstance.update();
    } else {
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        };
        
        if (dualAxis) {
            options.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false
                },
                beginAtZero: true
            };
        }
        
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
        
        // 存储图表实例以便更新
        switch(chartId) {
            case 'growth-chart':
                charts.growth = chartInstance;
                break;
            case 'engagement-chart':
                charts.engagement = chartInstance;
                break;
            case 'revenue-chart':
                charts.revenue = chartInstance;
                break;
        }
    }
}

// 格式化工具函数
function formatNumber(num) {
    if (num === undefined || num === null) return '-';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

function formatPercent(num) {
    if (num === undefined || num === null) return '-';
    return (num * 100).toFixed(1) + '%';
}

function formatCurrency(num) {
    if (num === undefined || num === null) return '-';
    return '$' + formatNumber(num);
}

function formatTime(seconds) {
    if (seconds === undefined || seconds === null) return '-';
    
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) {
        return seconds.toFixed(0) + 's';
    } else {
        return minutes + 'm ' + (seconds % 60).toFixed(0) + 's';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
} 