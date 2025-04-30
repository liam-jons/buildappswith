import React, { useState } from 'react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StandardMarkDown } from "@ant/chat/components/StandardMarkDown";

const COLORS = { RED: '#B54369', PURPLE: '#4D44AB', BLUE: '#1B67B2', BLACK: '#202020', GREEN: '#568C1C', ORANGE: '#C77F1A' };
const PLOT_CAPTION_STYLE = "text-sm font-semibold text-center text-gray-600 px-10";
const MARKDOWN_STYLE = "py-3 px-10 flex flex-col gap-3 overflow-hidden research-report-content";

const blockCitations = [];

const BuildappswithReport = () => {
  const [activeSection, setActiveSection] = useState('overview');
  
  const platformComponents = [
    { name: 'Builder Marketplace', value: 25, description: 'Where clients connect with validated builders based on specific skills and reputation metrics' },
    { name: 'AI Learning Hub', value: 20, description: 'Educational resources teaching practical AI skills through interactive, project-based learning' },
    { name: 'Builder Profiles', value: 15, description: 'Comprehensive profiles showcasing validated credentials, portfolios, and success metrics' },
    { name: 'Community Exchange', value: 15, description: 'Collaborative environment facilitating knowledge sharing and networking' },
    { name: 'Timeline of AI', value: 10, description: 'Interactive visualization of AI capabilities showing evolution and practical applications' },
    { name: 'Ecosystem Integration', value: 5, description: 'Connecting users with existing tools while tracking referral relationships' },
    { name: 'Skill Evolution', value: 5, description: 'Tracking how AI skills emerge, mature, and become automated over time' },
    { name: 'Sustainability Framework', value: 5, description: 'Tracking environmental impact and promoting responsible AI development' },
  ];
  
  const validationTiers = [
    { name: 'Tier 1: Entry', metrics: 3, requirements: 'Identity verification, basic competency quiz, reviewed code sample' },
    { name: 'Tier 2: Established', metrics: 7, requirements: 'Previous project outcomes, technical assessment, client feedback' },
    { name: 'Tier 3: Expert', metrics: 12, requirements: 'Specialized expertise certification, long-term impact tracking, verified business outcomes' },
  ];
  
  const developmentPhases = [
    { name: 'Phase 1: Foundation', months: '1-6', focus: 'Core platform, initial builder recruitment, basic learning paths' },
    { name: 'Phase 2: Expansion', months: '7-12', focus: 'Enhanced validation, expanded skill tree, deeper integration' },
    { name: 'Phase 3: Enrichment', months: '13-18', focus: 'Complete validation framework, mentorship, collaboration features' },
    { name: 'Phase 4: Scaling', months: '19-24', focus: 'Advanced matching, specialized verticals, expanded mobile experience' },
  ];
  
  const marketSegments = [
    { name: 'Small Business', users: 45, color: COLORS.BLUE },
    { name: 'Learners', users: 30, color: COLORS.GREEN },
    { name: 'Builders', users: 15, color: COLORS.PURPLE },
    { name: 'Enterprise', users: 10, color: COLORS.ORANGE },
  ];
  
  const skillEvolutionData = [
    { year: '2023', emerging: 40, core: 30, transitioning: 20, archived: 10 },
    { year: '2024', emerging: 35, core: 35, transitioning: 20, archived: 10 },
    { year: '2025', emerging: 30, core: 40, transitioning: 20, archived: 10 },
    { year: '2026', emerging: 25, core: 45, transitioning: 20, archived: 10 },
    { year: '2027', emerging: 20, core: 50, transitioning: 20, archived: 10 },
  ];
  
  const revenueProjection = [
    { year: 2025, marketplace: 300000, education: 150000, community: 50000 },
    { year: 2026, marketplace: 650000, education: 300000, community: 150000 },
    { year: 2027, marketplace: 1250000, education: 600000, community: 350000 },
    { year: 2028, marketplace: 2200000, education: 1100000, community: 700000 },
  ];
  
  return (
    <div className="flex justify-center min-h-screen antialiased relative" style={{ backgroundColor: "white", color: "#202020" }}>
      <div className="w-full max-w-4xl">
        <StandardMarkDown 
          blockCitations={blockCitations} 
          className={MARKDOWN_STYLE} 
          text={`# Buildappswith: Democratizing AI Through Human-Centered Design`} 
        />
        
        <div className="w-full flex flex-wrap justify-center mb-6">
          <button 
            onClick={() => setActiveSection('overview')} 
            className={`px-4 py-2 m-1 rounded-md font-medium text-sm ${activeSection === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Platform Overview
          </button>
          <button 
            onClick={() => setActiveSection('architecture')} 
            className={`px-4 py-2 m-1 rounded-md font-medium text-sm ${activeSection === 'architecture' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            System Architecture
          </button>
          <button 
            onClick={() => setActiveSection('validation')} 
            className={`px-4 py-2 m-1 rounded-md font-medium text-sm ${activeSection === 'validation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Validation System
          </button>
          <button 
            onClick={() => setActiveSection('timeline')} 
            className={`px-4 py-2 m-1 rounded-md font-medium text-sm ${activeSection === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Development Timeline
          </button>
        </div>
        
        {activeSection === 'overview' && (
          <>
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Platform Vision & Mission

Buildappswith represents a transformative opportunity to democratize AI application development through a human-centered approach. The platform creates a dual-purpose ecosystem that:

1. **Connects clients with verified builders** for affordable custom AI solutions
2. **Provides accessible education resources** that empower anyone to understand and leverage AI effectively

Operating on a "race to the top" model, Buildappswith incentivizes quality, knowledge-sharing, and tangible outcomes while addressing the critical gap between rapidly advancing AI capabilities and widespread practical understanding.`} 
            />
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Core Platform Components`} 
            />
            
            <div className="mb-6 px-10">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={platformComponents}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {platformComponents.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const component = platformComponents.find(c => c.name === name);
                      return [component?.description || '', name];
                    }}
                  />
                  <Legend iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={PLOT_CAPTION_STYLE} 
              text={`Relative focus and resource allocation across platform components`} 
            />
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Target Market Segments

Buildappswith serves four primary user segments through tailored experiences and value propositions:`} 
            />
            
            <div className="px-10 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketSegments.map((segment, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm" style={{ borderColor: segment.color }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: segment.color }}>{segment.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full" style={{ width: `${segment.users}%`, backgroundColor: segment.color }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">{segment.users}%</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {segment.name === 'Small Business' && "Seeking affordable custom AI solutions to improve operations and stay competitive"}
                      {segment.name === 'Learners' && "Individuals looking to develop AI literacy and practical application skills"}
                      {segment.name === 'Builders' && "AI developers seeking a quality-focused platform to showcase skills and find clients"}
                      {segment.name === 'Enterprise' && "Larger organizations requiring specialized AI integration and training"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Key Value Propositions

### For Clients (Small Businesses & Individuals)
- **Affordable Access**: Custom AI solutions at a fraction of traditional development costs
- **Transparent Quality**: Builder selection based on validated metrics rather than subjective ratings
- **Practical Understanding**: AI literacy resources tailored to specific business needs

### For Learners (Career Transitioners & Aspiring Developers)
- **Practical Skills**: Project-based learning focused on real-world applications
- **Clear Progression**: Visual skill tree showing advancement from basics to specialization
- **Community Support**: Collaborative environment for knowledge sharing and networking

### For Builders (Experienced Developers)
- **Quality Recognition**: Validation system that rewards expertise and outcomes
- **Steady Opportunities**: Client matching based on verified capabilities
- **Professional Growth**: Mentorship and teaching opportunities that enhance reputation`} 
            />
          </>
        )}
        
        {activeSection === 'architecture' && (
          <>
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## System Architecture Overview

Buildappswith implements a modern, scalable architecture designed for both current needs and future growth:`} 
            />
            
            <div className="px-10 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-blue-700">Frontend Architecture</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>Next.js application with Server Components</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>React framework with TypeScript</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>Magic UI components for visual appeal</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>Server-side rendering for SEO and performance</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-green-700">Backend Services</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      <span>Serverless API endpoints for dynamic operations</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      <span>Database abstraction layer for flexibility</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      <span>Authentication with Clerk integration</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      <span>Analytics and metrics collection systems</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-purple-700">Infrastructure Approach</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      <span>Cloud-native deployment for scalability</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      <span>Edge caching for global performance</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      <span>Containerized services for consistency</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      <span>Green hosting partners for sustainability</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-red-700">Integration Framework</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      <span>REST API with comprehensive documentation</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      <span>Webhook system for real-time notifications</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      <span>OAuth flows for third-party connections</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      <span>Analytics tracking for attribution</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Business Model & Revenue Streams

The platform implements a sustainable business model with diversified revenue streams:`} 
            />
            
            <div className="px-10 mb-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={revenueProjection}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Revenue (£)', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                  <Legend iconType="square" />
                  <Bar dataKey="marketplace" name="Marketplace Transactions" fill={COLORS.BLUE} />
                  <Bar dataKey="education" name="Educational Content" fill={COLORS.GREEN} />
                  <Bar dataKey="community" name="Community Features" fill={COLORS.PURPLE} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={PLOT_CAPTION_STYLE} 
              text={`Projected revenue growth across primary business streams (2025-2028)`} 
            />
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Skill Evolution Tracking

The platform tracks how AI skills emerge, mature, and become automated over time, helping users focus on developing the most valuable competencies:`} 
            />
            
            <div className="px-10 mb-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={skillEvolutionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Skill Distribution (%)', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip />
                  <Legend iconType="square" />
                  <Line type="linear" dataKey="emerging" name="Emerging Skills" stroke={COLORS.GREEN} dot={{ r: 0 }} activeDot={{ r: 6 }} strokeWidth={1.5} />
                  <Line type="linear" dataKey="core" name="Core Skills" stroke={COLORS.BLUE} dot={{ r: 0 }} activeDot={{ r: 6 }} strokeWidth={1.5} />
                  <Line type="linear" dataKey="transitioning" name="Transitioning Skills" stroke={COLORS.ORANGE} dot={{ r: 0 }} activeDot={{ r: 6 }} strokeWidth={1.5} />
                  <Line type="linear" dataKey="archived" name="Archived Skills" stroke={COLORS.RED} dot={{ r: 0 }} activeDot={{ r: 6 }} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={PLOT_CAPTION_STYLE} 
              text={`Projected evolution of AI skill categories over time`} 
            />
          </>
        )}
        
        {activeSection === 'validation' && (
          <>
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Validation System Architecture

The platform's trust architecture is built on four foundational principles:

1. **Objective Over Subjective**: Focusing on measurable outcomes rather than opinion-based ratings
2. **Progressive Verification**: Starting with basic validation and increasing requirements as Builders gain prominence
3. **Transparent Methodology**: Making all validation criteria and processes visible to all users
4. **Educational Context**: Helping clients understand what metrics mean for their specific needs`} 
            />
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Tiered Validation Framework`} 
            />
            
            <div className="px-10 mb-6">
              <div className="grid grid-cols-1 gap-4">
                {validationTiers.map((tier, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: Object.values(COLORS)[index % Object.values(COLORS).length] }}>
                      {tier.name}
                    </h3>
                    <div className="flex items-center mb-3">
                      <div className="text-sm mr-4">Validation Metrics: <strong>{tier.metrics}</strong></div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${(tier.metrics / 12) * 100}%`, 
                            backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">Requirements:</p>
                      <p className="text-gray-700">{tier.requirements}</p>
                    </div>
                    <div className="mt-3 text-sm">
                      <p className="font-semibold">Key Safeguards:</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {index === 0 && (
                          <>
                            <li>Maximum project value caps</li>
                            <li>Milestone-based payment structure</li>
                            <li>Enhanced platform oversight</li>
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <li>Success rate tracking</li>
                            <li>Performance metrics verification</li>
                            <li>Client verification prompts</li>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <li>Long-term impact verification</li>
                            <li>Business outcome documentation</li>
                            <li>Community validation from peers</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Validation Metrics Definitions

Each validation metric has specific criteria and calculation methodologies:

### Success Rate
- Definition: Percentage of projects meeting all client requirements
- Calculation: (Successful Projects / Total Projects) × 100
- Verification: Client confirmation of requirements fulfillment

### On-Time Delivery
- Definition: Percentage of milestones completed by agreed deadlines
- Calculation: (On-Time Milestones / Total Milestones) × 100
- Verification: System-tracked milestone approvals

### App Performance
- Definition: Measurable usage and effectiveness statistics
- Calculation: Varies by application type (downloads, active users, etc.)
- Verification: Integration with analytics platforms

### Business Impact
- Definition: Quantifiable improvement in client business metrics
- Calculation: Percentage changes in revenue, efficiency, or other KPIs
- Verification: Client-provided before/after data

### Entrepreneurs Created
- Definition: New businesses launched through Builder's applications
- Calculation: Count of verified business formations
- Verification: Business registration documentation`} 
            />
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Anti-Gaming Mechanisms

Protections against manipulation of the validation system:

### Statistical Analysis
- Pattern detection for unusual rating clusters
- Time-based analysis of rapid metric changes
- Network analysis for circular endorsements
- Outlier identification in performance claims

### Progressive Requirements
- Increasing evidence standards for higher-tier claims
- Multiple verification sources for significant metrics
- Time-delayed confirmation of sustained outcomes
- Periodic re-validation of established credentials

### Transparency Safeguards
- Public visibility of validation methodologies
- Clear data sourcing for all displayed metrics
- Detailed explanation of calculation methods
- Version history of profile changes and validations`} 
            />
          </>
        )}
        
        {activeSection === 'timeline' && (
          <>
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Development Roadmap

The implementation plan follows a phased approach to gradually build and scale the platform:`} 
            />
            
            <div className="px-10 mb-6">
              <div className="relative">
                {developmentPhases.map((phase, index) => (
                  <div key={index} className="mb-8 flex">
                    <div className="flex flex-col items-center mr-4">
                      <div 
                        className="rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                      >
                        {index + 1}
                      </div>
                      {index < developmentPhases.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="bg-white rounded-lg border p-4 shadow-sm flex-1">
                      <h3 className="text-lg font-semibold mb-1">{phase.name}</h3>
                      <div className="text-sm text-gray-500 mb-2">Months {phase.months}</div>
                      <p className="text-gray-700">{phase.focus}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {index === 0 && (
                          <>
                            <div className="bg-gray-100 rounded p-2 text-sm">Core marketplace functionality</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Initial builder recruitment</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Basic learning paths</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Simple validation system</div>
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <div className="bg-gray-100 rounded p-2 text-sm">Enhanced validation system</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Expanded skill tree</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Improved project tracking</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Advanced analytics</div>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <div className="bg-gray-100 rounded p-2 text-sm">Full validation framework</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Skill evolution tracking</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Mentorship features</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">External tool integrations</div>
                          </>
                        )}
                        {index === 3 && (
                          <>
                            <div className="bg-gray-100 rounded p-2 text-sm">Advanced matching algorithms</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Industry-specific verticals</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Community governance</div>
                            <div className="bg-gray-100 rounded p-2 text-sm">Enhanced mobile experience</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Success Metrics Framework

The platform's progress will be measured across multiple dimensions:

### Business Performance KPIs
- User acquisition by persona type
- Daily and monthly active users
- Project volume and completion rates
- Revenue growth across streams

### Mission Fulfillment Metrics
- AI literacy improvement rates
- Socioeconomic diversity of users
- Technical barrier reduction measurements
- Career advancement attribution

### Validation System Effectiveness
- Correlation between validation metrics and outcomes
- False positive and negative rates
- User confidence in validation indicators
- Dispute resolution effectiveness

### Learning Effectiveness
- Completion rates for learning paths
- Skill retention over time
- Knowledge application confidence
- Career impact measurements`} 
            />
            
            <StandardMarkDown 
              blockCitations={blockCitations} 
              className={MARKDOWN_STYLE} 
              text={`## Next Steps

### MVP Focus Areas
1. Implement landing page with clear value proposition
2. Develop Liam Jons' profile as marketplace foundation
3. Create "How It Works" educational content
4. Build basic session booking functionality
5. Establish AI tools curation with guidance

### Long-Term Vision
Building toward a comprehensive platform that serves as the trusted household name in AI education and application development, creating a virtuous cycle where learners become builders, successful builders become mentors, and the ecosystem continuously expands its capabilities.`} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BuildappswithReport;
