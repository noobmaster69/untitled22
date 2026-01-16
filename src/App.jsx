import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Top 10 companies sorted by total revenue (descending) with regional breakdown
const rawData = [
    { name: "OES Equipment", total: 863892.55, DC: 26052.63, MD: 67007.55, VA: 770832.37 },
    { name: "Rand Construction Corp", total: 394373.59, DC: 248969.50, MD: 39571.17, VA: 105832.92 },
    { name: "HITT Contracting Inc", total: 381038.07, DC: 140983.16, MD: 99710.27, VA: 140344.64 },
    { name: "Hensel Phelps Construction Co", total: 324702.92, DC: 0, MD: 0, VA: 324702.92 },
    { name: "James G. Davis", total: 280491.30, DC: 151302.32, MD: 30807.89, VA: 98381.09 },
    { name: "JE Richards, Inc", total: 221991.57, DC: 0, MD: 64979.90, VA: 157011.67 },
    { name: "GCS-Sigal", total: 178627.29, DC: 10280.00, MD: 109079.81, VA: 59267.48 },
    { name: "Winmar Construction, Inc", total: 139643.44, DC: 67900.09, MD: 0, VA: 71743.35 },
    { name: "D-Watts", total: 138745.51, DC: 103769.96, MD: 2756.00, VA: 32219.55 },
    { name: "HBW Construction", total: 134662.83, DC: 9400.35, MD: 37739.40, VA: 87523.08 },
];

const monthlyTotals = [
    { month: 'Jan', amount: 643432.05 },
    { month: 'Feb', amount: 659090.45 },
    { month: 'Mar', amount: 739853.53 },
    { month: 'Apr', amount: 790205.79 },
    { month: 'May', amount: 728601.01 },
    { month: 'Jun', amount: 757666.09 },
    { month: 'Jul', amount: 841419.51 },
    { month: 'Aug', amount: 840641.16 },
    { month: 'Sep', amount: 792290.36 },
    { month: 'Oct', amount: 938913.16 },
    { month: 'Nov', amount: 678820.25 },
    { month: 'Dec', amount: 782167.15 },
];

// Regional totals calculated from the data
const regionalData = [
    { name: 'Virginia', value: 4039874.23, color: '#2d5a2d', abbr: 'VA' },
    { name: 'Maryland', value: 2802547.89, color: '#4a8c4a', abbr: 'MD' },
    { name: 'Washington DC', value: 2348315.14, color: '#7bc47b', abbr: 'DC' },
];

const COLORS = ['#1a3d1a', '#2d5a2d', '#3d7a3d', '#4a8c4a', '#5ba85b', '#6bc46b', '#8fd98f', '#b3e8b3', '#d4f4d4', '#e8f8e8'];

const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const formatCurrencyShort = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(10, 31, 10, 0.95)',
                border: '1px solid #3d7a3d',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <p style={{ color: '#d4f4d4', fontWeight: 600, marginBottom: '4px', fontFamily: 'DM Sans' }}>{label}</p>
                <p style={{ color: '#6bc46b', fontSize: '14px', fontFamily: 'DM Mono' }}>
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const RegionalTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
                background: 'rgba(10, 31, 10, 0.95)',
                border: '1px solid #3d7a3d',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <p style={{ color: '#d4f4d4', fontWeight: 600, marginBottom: '4px', fontFamily: 'DM Sans' }}>{data.name}</p>
                <p style={{ color: '#6bc46b', fontSize: '14px', fontFamily: 'DM Mono' }}>
                    {formatCurrency(data.value)}
                </p>
                <p style={{ color: '#4a8c4a', fontSize: '12px', fontFamily: 'DM Mono' }}>
                    {((data.value / 9193100.51) * 100).toFixed(1)}% of total
                </p>
            </div>
        );
    }
    return null;
};

export default function ConstructionAnalytics() {
    const [hoveredCompany, setHoveredCompany] = useState(null);
    const [activeRegion, setActiveRegion] = useState(null);

    const quarterlyData = [
        { quarter: 'Q1', amount: 2042376.03 },
        { quarter: 'Q2', amount: 2276472.89 },
        { quarter: 'Q3', amount: 2474351.03 },
        { quarter: 'Q4', amount: 2399900.56 },
    ];

    // Top companies by region
    const topByRegion = {
        VA: [
            { name: "OES Equipment", amount: 770832.37 },
            { name: "Hensel Phelps", amount: 324702.92 },
            { name: "JE Richards", amount: 157011.67 },
        ],
        MD: [
            { name: "GCS-Sigal", amount: 109079.81 },
            { name: "BP Environmental", amount: 106820.90 },
            { name: "HITT Contracting", amount: 99710.27 },
        ],
        DC: [
            { name: "Rand Construction", amount: 248969.50 },
            { name: "James G. Davis", amount: 151302.32 },
            { name: "HITT Contracting", amount: 140983.16 },
        ]
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a1f0a 0%, #1a3d1a 50%, #0a1f0a 100%)',
            fontFamily: "'DM Sans', sans-serif",
            color: '#d4f4d4',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&display=swap');
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-card {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        
        .chart-container {
          animation: fadeInUp 0.8s ease-out forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
        
        .glow {
          box-shadow: 0 0 60px rgba(61, 122, 61, 0.2);
        }
        
        .company-row:hover {
          background: rgba(61, 122, 61, 0.2) !important;
          transform: translateX(8px);
        }
        
        .region-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        @media (max-width: 768px) {
          .company-row:hover {
            transform: translateX(0);
          }
          .region-card:hover {
            transform: translateY(0);
          }
        }
      `}</style>

            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-200px',
                right: '-200px',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(61, 122, 61, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-300px',
                left: '-200px',
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(91, 168, 91, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <header style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 6vw, 56px)',
                        fontWeight: 700,
                        margin: 0,
                        background: 'linear-gradient(135deg, #b3e8b3 0%, #4a8c4a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}>
                        2025 Revenue Analytics
                    </h1>
                    <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '12px',
                        color: '#6bc46b',
                        padding: '4px 10px',
                        background: 'rgba(61, 122, 61, 0.3)',
                        borderRadius: '20px',
                        border: '1px solid rgba(91, 168, 91, 0.3)'
                    }}>
            DMV REGION
          </span>
                </div>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(14px, 3vw, 18px)',
                    color: '#6bc46b',
                    margin: 0,
                    fontWeight: 400
                }}>
                    Construction & Contracting Services — DC • Maryland • Virginia
                </p>
            </header>

            {/* Key Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
                position: 'relative',
                zIndex: 1
            }}>
                {[
                    { label: 'Total Revenue', value: '$9.19M', sub: 'YTD 2025', icon: '◆' },
                    { label: 'Top Region', value: 'Virginia', sub: '$4.04M (44%)', icon: '▲' },
                    { label: 'Peak Month', value: 'October', sub: '$938.9K', icon: '◇' },
                    { label: 'Active Clients', value: '456', sub: 'Companies', icon: '●' },
                ].map((stat, i) => (
                    <div key={i} className="stat-card glow" style={{
                        background: 'linear-gradient(145deg, rgba(26, 61, 26, 0.8) 0%, rgba(10, 31, 10, 0.9) 100%)',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid rgba(61, 122, 61, 0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            fontSize: '20px',
                            color: 'rgba(91, 168, 91, 0.3)'
                        }}>{stat.icon}</div>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '10px',
                            color: '#6bc46b',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            margin: '0 0 8px 0'
                        }}>{stat.label}</p>
                        <p style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(24px, 5vw, 36px)',
                            fontWeight: 700,
                            margin: '0 0 4px 0',
                            color: '#d4f4d4'
                        }}>{stat.value}</p>
                        <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            color: '#4a8c4a',
                            margin: 0
                        }}>{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Regional Breakdown Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '32px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Pie Chart */}
                <div className="chart-container glow" style={{
                    background: 'linear-gradient(145deg, rgba(26, 61, 26, 0.8) 0%, rgba(10, 31, 10, 0.9) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(61, 122, 61, 0.4)'
                }}>
                    <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        fontWeight: 600,
                        margin: '0 0 20px 0',
                        color: '#d4f4d4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
            <span style={{
                width: '8px',
                height: '8px',
                background: '#7bc47b',
                borderRadius: '50%',
                display: 'inline-block'
            }}></span>
                        Revenue by Region
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={regionalData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveRegion(index)}
                                onMouseLeave={() => setActiveRegion(null)}
                            >
                                {regionalData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke={activeRegion === index ? '#d4f4d4' : 'transparent'}
                                        strokeWidth={2}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<RegionalTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {regionalData.map((region, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: region.color }}></div>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6bc46b' }}>
                  {region.abbr}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Cards Container */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    {[
                        { name: 'Virginia', abbr: 'VA', amount: 4039874.23, pct: 43.9, color: '#2d5a2d', top: topByRegion.VA },
                        { name: 'Maryland', abbr: 'MD', amount: 2802547.89, pct: 30.5, color: '#4a8c4a', top: topByRegion.MD },
                        { name: 'Washington DC', abbr: 'DC', amount: 2348315.14, pct: 25.5, color: '#7bc47b', top: topByRegion.DC },
                    ].map((region, i) => (
                        <div key={i} className="chart-container region-card" style={{
                            background: 'linear-gradient(145deg, rgba(26, 61, 26, 0.8) 0%, rgba(10, 31, 10, 0.9) 100%)',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid rgba(61, 122, 61, 0.4)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <p style={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: '10px',
                                        color: '#6bc46b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        margin: '0 0 4px 0'
                                    }}>{region.name}</p>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 'clamp(20px, 4vw, 28px)',
                                        fontWeight: 700,
                                        margin: 0,
                                        color: '#d4f4d4'
                                    }}>{formatCurrencyShort(region.amount)}</p>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `linear-gradient(135deg, ${region.color}40 0%, ${region.color}20 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: region.color,
                                    border: `1px solid ${region.color}40`
                                }}>
                                    {region.abbr}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                height: '5px',
                                background: 'rgba(61, 122, 61, 0.2)',
                                borderRadius: '3px',
                                marginBottom: '12px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${region.pct}%`,
                                    background: region.color,
                                    borderRadius: '3px'
                                }}></div>
                            </div>
                            <p style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '11px',
                                color: '#4a8c4a',
                                margin: '0 0 12px 0'
                            }}>{region.pct}% of total</p>

                            {/* Top 3 in region */}
                            <div style={{ borderTop: '1px solid rgba(61, 122, 61, 0.3)', paddingTop: '10px' }}>
                                <p style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '9px',
                                    color: '#4a8c4a',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    margin: '0 0 6px 0'
                                }}>Top Performers</p>
                                {region.top.map((company, j) => (
                                    <div key={j} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '3px 0',
                                        borderBottom: j < 2 ? '1px solid rgba(61, 122, 61, 0.15)' : 'none'
                                    }}>
                    <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        color: '#d4f4d4',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '80px'
                    }}>{company.name}</span>
                                        <span style={{
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '10px',
                                            color: region.color
                                        }}>{formatCurrencyShort(company.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '32px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Monthly Trend */}
                <div className="chart-container glow" style={{
                    background: 'linear-gradient(145deg, rgba(26, 61, 26, 0.8) 0%, rgba(10, 31, 10, 0.9) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(61, 122, 61, 0.4)'
                }}>
                    <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        fontWeight: 600,
                        margin: '0 0 20px 0',
                        color: '#d4f4d4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
            <span style={{
                width: '8px',
                height: '8px',
                background: '#5ba85b',
                borderRadius: '50%',
                display: 'inline-block'
            }}></span>
                        Monthly Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={monthlyTotals}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5ba85b" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#5ba85b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6bc46b', fontSize: 10, fontFamily: 'DM Mono' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6bc46b', fontSize: 10, fontFamily: 'DM Mono' }}
                                tickFormatter={formatCurrencyShort}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#5ba85b"
                                strokeWidth={2}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quarterly Breakdown */}
                <div className="chart-container glow" style={{
                    background: 'linear-gradient(145deg, rgba(26, 61, 26, 0.8) 0%, rgba(10, 31, 10, 0.9) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(61, 122, 61, 0.4)'
                }}>
                    <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        fontWeight: 600,
                        margin: '0 0 20px 0',
                        color: '#d4f4d4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
            <span style={{
                width: '8px',
                height: '8px',
                background: '#7bc47b',
                borderRadius: '50%',
                display: 'inline-block'
            }}></span>
                        Quarterly Performance
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={quarterlyData} barSize={40}>
                            <XAxis
                                dataKey="quarter"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6bc46b', fontSize: 10, fontFamily: 'DM Mono' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6bc46b', fontSize: 10, fontFamily: 'DM Mono' }}
                                tickFormatter={formatCurrencyShort}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                {quarterlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Clients */}
            <div className="chart-container glow" style={{
                background: 'linear-gradient(145deg, rgba(26, 61, 26, 0.8) 0%, rgba(10, 31, 10, 0.9) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(61, 122, 61, 0.4)',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        fontWeight: 600,
                        margin: 0,
                        color: '#d4f4d4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
            <span style={{
                width: '8px',
                height: '8px',
                background: '#8fd98f',
                borderRadius: '50%',
                display: 'inline-block'
            }}></span>
                        Top 10 Clients
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#7bc47b' }}></div>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6bc46b' }}>DC</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#4a8c4a' }}></div>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6bc46b' }}>MD</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2d5a2d' }}></div>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6bc46b' }}>VA</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {rawData.map((company, i) => (
                        <div
                            key={i}
                            className="company-row"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                background: hoveredCompany === i ? 'rgba(61, 122, 61, 0.2)' : 'rgba(10, 31, 10, 0.5)',
                                borderRadius: '10px',
                                border: '1px solid rgba(61, 122, 61, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={() => setHoveredCompany(i)}
                            onMouseLeave={() => setHoveredCompany(null)}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: `linear-gradient(135deg, ${COLORS[i + 2]} 0%, ${COLORS[i + 3]} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#d4f4d4',
                                flexShrink: 0
                            }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    margin: '0 0 6px 0',
                                    color: '#d4f4d4',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>{company.name}</p>
                                {/* Stacked regional bar */}
                                <div style={{
                                    height: '6px',
                                    background: 'rgba(61, 122, 61, 0.2)',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                    display: 'flex'
                                }}>
                                    {company.DC > 0 && (
                                        <div style={{
                                            height: '100%',
                                            width: `${(company.DC / company.total) * 100}%`,
                                            background: '#7bc47b'
                                        }} title={`DC: ${formatCurrencyShort(company.DC)}`}></div>
                                    )}
                                    {company.MD > 0 && (
                                        <div style={{
                                            height: '100%',
                                            width: `${(company.MD / company.total) * 100}%`,
                                            background: '#4a8c4a'
                                        }} title={`MD: ${formatCurrencyShort(company.MD)}`}></div>
                                    )}
                                    {company.VA > 0 && (
                                        <div style={{
                                            height: '100%',
                                            width: `${(company.VA / company.total) * 100}%`,
                                            background: '#2d5a2d'
                                        }} title={`VA: ${formatCurrencyShort(company.VA)}`}></div>
                                    )}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    margin: 0,
                                    color: '#d4f4d4'
                                }}>{formatCurrencyShort(company.total)}</p>
                                <p style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '10px',
                                    margin: '2px 0 0 0',
                                    color: '#4a8c4a'
                                }}>{((company.total / 9193100.51) * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(61, 122, 61, 0.3)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                zIndex: 1
            }}>
                <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: '#4a8c4a',
                    margin: 0
                }}>
                    Data Period: Jan — Dec 2025
                </p>
                <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: '#4a8c4a',
                    margin: 0
                }}>
                    14,362 Transactions • 456 Clients
                </p>
            </footer>
        </div>
    );
}