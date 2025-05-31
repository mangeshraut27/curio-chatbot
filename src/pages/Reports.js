import React, { useState, useEffect } from 'react';
import './Reports.css';
import { logError, addBreadcrumb } from '../utils/sentry';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateConfig, setGenerateConfig] = useState({
    count: 3,
    animalType: 'random',
    urgency: 'random',
    location: 'random'
  });

  // Enhanced dummy report data with more variety
  const dummyReports = [
    {
      id: 'REP-2025-001',
      date: '2025-01-29',
      time: '14:30',
      type: 'Injured Stray Dog',
      location: 'Andheri West, Mumbai, Maharashtra',
      coordinates: { lat: 19.1454, lng: 72.8691 },
      urgency: 'high',
      status: 'resolved',
      reporter: 'Priya Sharma',
      reporterContact: '+91 98765 43210',
      description: 'Large stray dog with visible leg injury near Metro Station. Dog unable to walk properly, appears to be in severe pain.',
      animalDetails: {
        type: 'dog',
        breed: 'Indian Pariah Dog',
        age: 'adult',
        condition: 'injured',
        injuries: ['Fractured left hind leg', 'Minor abrasions'],
        behavior: 'calm but lethargic'
      },
      actionTaken: 'Dog rescued by Animal Aid Mumbai. Transported to veterinary hospital for X-ray and treatment. Surgery performed successfully.',
      ngoInvolved: 'Animal Aid Mumbai',
      veterinarian: 'Dr. Rajesh Khanna',
      outcome: 'Dog recovered fully after 3 weeks of treatment. Relocated to safe community area after vaccination.',
      followUp: 'Monthly check-ups scheduled. Community feeding arranged.',
      aiGenerated: false
    },
    {
      id: 'REP-2025-002',
      date: '2025-01-28',
      time: '09:15',
      type: 'Sick Cat',
      location: 'Koramangala, Bangalore, Karnataka',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      urgency: 'medium',
      status: 'in-progress',
      reporter: 'Amit Patel',
      reporterContact: '+91 87654 32109',
      description: 'Young cat showing signs of respiratory distress and not eating. Found near apartment complex.',
      animalDetails: {
        type: 'cat',
        breed: 'domestic short hair',
        age: 'young',
        condition: 'sick',
        symptoms: ['Labored breathing', 'Loss of appetite', 'Discharge from eyes'],
        behavior: 'lethargic, hiding'
      },
      actionTaken: 'Cat taken to Compassion Unlimited Plus Action (CUPA). Diagnosed with upper respiratory infection.',
      ngoInvolved: 'CUPA Bangalore',
      veterinarian: 'Dr. Suparna Ganguly',
      outcome: 'Under treatment with antibiotics and supportive care.',
      followUp: 'Daily monitoring for 1 week. Adoption process initiated.',
      aiGenerated: false
    },
    {
      id: 'REP-2025-003',
      date: '2025-01-27',
      time: '18:45',
      type: 'Trapped Bird',
      location: 'Connaught Place, New Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      urgency: 'medium',
      status: 'resolved',
      reporter: 'Neha Singh',
      reporterContact: '+91 76543 21098',
      description: 'Kite trapped in electrical wires near shopping complex. Bird struggling to free itself.',
      animalDetails: {
        type: 'bird',
        species: 'Black Kite',
        age: 'adult',
        condition: 'trapped',
        injuries: ['Wing entanglement', 'Minor electrical burns'],
        behavior: 'distressed, struggling'
      },
      actionTaken: 'Wildlife SOS contacted. Professional rescue team safely freed the bird using specialized equipment.',
      ngoInvolved: 'Wildlife SOS Delhi',
      veterinarian: 'Dr. Kartick Satyanarayan',
      outcome: 'Bird treated for minor burns and stress. Released after 2 days of observation.',
      followUp: 'No further action required. Area inspected for electrical hazards.',
      aiGenerated: false
    },
    {
      id: 'REP-2025-004',
      date: '2025-01-26',
      time: '22:00',
      type: 'Aggressive Dog',
      location: 'Sector 18, Noida, Uttar Pradesh',
      coordinates: { lat: 28.5687, lng: 77.3282 },
      urgency: 'high',
      status: 'resolved',
      reporter: 'Vikram Mehta',
      reporterContact: '+91 65432 10987',
      description: 'Large aggressive dog chasing pedestrians near market area. Multiple complaints from shopkeepers.',
      animalDetails: {
        type: 'dog',
        breed: 'Mixed breed',
        age: 'adult',
        condition: 'behavioral issue',
        behavior: 'aggressive, territorial',
        triggers: ['Crowded areas', 'loud noises']
      },
      actionTaken: 'Animal control team safely captured using humane traps. Transported to shelter for behavioral assessment.',
      ngoInvolved: 'Noida Animal Welfare Society',
      veterinarian: 'Dr. Anjali Verma',
      outcome: 'Dog found to be protecting injured pup nearby. Both relocated to quieter area after treatment.',
      followUp: 'Community education on animal behavior provided. Regular monitoring established.',
      aiGenerated: false
    },
    {
      id: 'REP-2025-005',
      date: '2025-01-25',
      time: '11:20',
      type: 'Abandoned Puppies',
      location: 'Hitech City, Hyderabad, Telangana',
      coordinates: { lat: 17.4485, lng: 78.3908 },
      urgency: 'high',
      status: 'in-progress',
      reporter: 'Sarah Khan',
      reporterContact: '+91 54321 09876',
      description: 'Litter of 5 puppies found abandoned in construction site. Appears to be only 3-4 weeks old.',
      animalDetails: {
        type: 'dog',
        breed: 'Mixed breed puppies',
        age: 'puppy (3-4 weeks)',
        condition: 'abandoned',
        count: 5,
        needs: ['Milk feeding', 'Warmth', 'Medical check'],
        behavior: 'weak but responsive'
      },
      actionTaken: 'Puppies taken to Blue Cross Hyderabad. Emergency bottle feeding initiated.',
      ngoInvolved: 'Blue Cross of Hyderabad',
      veterinarian: 'Dr. Priya Nair',
      outcome: 'All puppies stable. Foster homes being arranged.',
      followUp: 'Daily medical monitoring. Vaccination schedule planned for 6 weeks age.',
      aiGenerated: false
    },
    {
      id: 'REP-2025-006',
      date: '2025-01-24',
      time: '16:10',
      type: 'Road Accident Victim',
      location: 'FC Road, Pune, Maharashtra',
      coordinates: { lat: 18.5196, lng: 73.8553 },
      urgency: 'critical',
      status: 'resolved',
      reporter: 'Ravi Kulkarni',
      reporterContact: '+91 43210 98765',
      description: 'Dog hit by vehicle on busy road. Severe injuries visible, immediate medical attention required.',
      animalDetails: {
        type: 'dog',
        breed: 'Labrador mix',
        age: 'young adult',
        condition: 'critical',
        injuries: ['Multiple fractures', 'Internal injuries', 'Severe bleeding'],
        behavior: 'unconscious'
      },
      actionTaken: 'Emergency transport to Vets in Practice clinic. Immediate surgery performed.',
      ngoInvolved: 'Pune Animal Welfare Society',
      veterinarian: 'Dr. Manish Joshi',
      outcome: 'Dog survived surgery but required 6 weeks of intensive care. Full recovery achieved.',
      followUp: 'Adopted by the reporter\'s family. Regular health check-ups scheduled.',
      aiGenerated: false
    }
  ];

  // OpenAI integration for generating reports
  const generateReportsWithAI = async () => {
    setIsGenerating(true);
    
    // Add breadcrumb for generation start
    addBreadcrumb(
      'Reports: Starting AI report generation',
      'reports',
      'info',
      { config: generateConfig }
    );
    
    try {
      const openaiService = new (await import('../services/openai.js')).default;
      const newReports = [];
      
      for (let i = 0; i < generateConfig.count; i++) {
        const prompt = createReportGenerationPrompt(i);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert in animal rescue situations in India. Generate realistic animal rescue reports with accurate details.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.8,
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          try {
            const reportData = JSON.parse(data.choices[0].message.content);
            const newReport = createReportFromAI(reportData, i);
            newReports.push(newReport);
          } catch (parseError) {
            logError(parseError, {
              context: 'reports_ai_json_parsing',
              reportIndex: i,
              response: data.choices[0].message.content.substring(0, 200)
            });
          }
        } else {
          logError(new Error(`OpenAI API request failed: ${response.status}`), {
            context: 'reports_ai_api_failure',
            status: response.status,
            reportIndex: i
          });
        }
      }
      
      if (newReports.length > 0) {
        const updatedReports = [...reports, ...newReports];
        setReports(updatedReports);
        setFilteredReports(updatedReports);
        
        // Add success breadcrumb
        addBreadcrumb(
          'Reports: AI generation completed successfully',
          'reports',
          'info',
          { generatedCount: newReports.length, requestedCount: generateConfig.count }
        );
      } else {
        // Log when no reports were generated
        logError(new Error('No reports generated from AI'), {
          context: 'reports_ai_no_results',
          config: generateConfig
        });
      }
      
    } catch (error) {
      console.error('Error generating reports:', error);
      
      // Log comprehensive error to Sentry
      logError(error, {
        context: 'reports_ai_generation_failure',
        config: generateConfig,
        errorType: error.constructor.name,
        apiKey: process.env.REACT_APP_OPENAI_API_KEY ? 'present' : 'missing'
      });
      
      // Fallback to locally generated reports
      const fallbackReports = generateFallbackReports();
      const updatedReports = [...reports, ...fallbackReports];
      setReports(updatedReports);
      setFilteredReports(updatedReports);
      
      // Add breadcrumb for fallback
      addBreadcrumb(
        'Reports: Using fallback data due to AI failure',
        'reports',
        'warning',
        { fallbackCount: fallbackReports.length }
      );
      
    } finally {
      setIsGenerating(false);
    }
  };

  const createReportGenerationPrompt = (index) => {
    const animalTypes = ['dog', 'cat', 'bird', 'cow', 'goat'];
    const urgencyLevels = ['low', 'medium', 'high', 'critical'];
    const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
    
    const selectedAnimal = generateConfig.animalType === 'random' ? 
      animalTypes[Math.floor(Math.random() * animalTypes.length)] : generateConfig.animalType;
    
    const selectedUrgency = generateConfig.urgency === 'random' ? 
      urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)] : generateConfig.urgency;
    
    const selectedCity = generateConfig.location === 'random' ? 
      indianCities[Math.floor(Math.random() * indianCities.length)] : generateConfig.location;

    return `Generate a realistic animal rescue report for a ${selectedAnimal} in ${selectedCity}, India with ${selectedUrgency} urgency. 

Return ONLY a valid JSON object with these exact fields:
{
  "type": "specific rescue type",
  "location": "specific area in ${selectedCity}, state",
  "coordinates": {"lat": number, "lng": number},
  "urgency": "${selectedUrgency}",
  "status": "pending|in-progress|resolved",
  "reporter": "Indian name",
  "reporterContact": "+91 phone number",
  "description": "detailed incident description",
  "animalDetails": {
    "type": "${selectedAnimal}",
    "breed": "breed/species",
    "age": "age category",
    "condition": "current condition",
    "behavior": "observed behavior",
    "injuries": ["array of injuries if any"],
    "symptoms": ["array of symptoms if any"]
  },
  "actionTaken": "rescue actions taken",
  "ngoInvolved": "Indian animal welfare NGO name",
  "veterinarian": "Dr. Indian name",
  "outcome": "current outcome",
  "followUp": "planned follow-up actions"
}

Make it realistic for India's animal rescue scenario. Use actual coordinates for ${selectedCity}.`;
  };

  const createReportFromAI = (aiData, index) => {
    const today = new Date();
    const reportDate = new Date(today.getTime() - (index * 24 * 60 * 60 * 1000));
    const reportId = `REP-AI-${today.getFullYear()}-${String(reports.length + index + 1).padStart(3, '0')}`;
    
    return {
      ...aiData,
      id: reportId,
      date: reportDate.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      aiGenerated: true
    };
  };

  const generateFallbackReports = () => {
    const fallbackData = [
      {
        type: 'Injured Street Dog',
        location: 'Linking Road, Bandra West, Mumbai, Maharashtra',
        coordinates: { lat: 19.0549, lng: 72.8306 },
        urgency: 'high',
        status: 'in-progress',
        reporter: 'Meera Desai',
        reporterContact: '+91 99887 76543',
        description: 'Medium-sized street dog with a deep cut on its front paw, bleeding and limping severely near the bus stop.',
        animalDetails: {
          type: 'dog',
          breed: 'Indian Pariah Mix',
          age: 'adult',
          condition: 'injured',
          behavior: 'scared but approachable',
          injuries: ['Deep paw cut', 'Limping'],
          symptoms: ['Bleeding', 'Pain signs']
        },
        actionTaken: 'Local volunteer provided first aid. Transport arranged to nearest vet clinic.',
        ngoInvolved: 'Welfare of Stray Dogs (WSD)',
        veterinarian: 'Dr. Arjun Malik',
        outcome: 'Wound cleaning and stitching completed. Antibiotics administered.',
        followUp: 'Recovery monitoring for 1 week. Vaccination scheduled.',
        aiGenerated: true
      },
      {
        type: 'Abandoned Kitten',
        location: 'Cyber Hub, Gurgaon, Haryana',
        coordinates: { lat: 28.4954, lng: 77.0889 },
        urgency: 'medium',
        status: 'resolved',
        reporter: 'Rohit Singh',
        reporterContact: '+91 88776 65432',
        description: 'Very young kitten found alone in office parking lot, appears to be around 4-5 weeks old, mewing constantly.',
        animalDetails: {
          type: 'cat',
          breed: 'Domestic Shorthair',
          age: 'kitten (4-5 weeks)',
          condition: 'abandoned',
          behavior: 'distressed, hungry',
          symptoms: ['Dehydration', 'Hunger'],
          needs: ['Milk formula', 'Warmth', 'Shelter']
        },
        actionTaken: 'Kitten taken to People For Animals (PFA) shelter for immediate care and bottle feeding.',
        ngoInvolved: 'People For Animals (PFA) Gurgaon',
        veterinarian: 'Dr. Kavya Nair',
        outcome: 'Kitten stabilized with proper nutrition. Foster care arranged.',
        followUp: 'Weekly health check-ups until adoption ready at 8 weeks.',
        aiGenerated: true
      },
      {
        type: 'Trapped Crow',
        location: 'Electronic City, Bangalore, Karnataka',
        coordinates: { lat: 12.8456, lng: 77.6603 },
        urgency: 'medium',
        status: 'resolved',
        reporter: 'Aditi Sharma',
        reporterContact: '+91 77665 54321',
        description: 'Crow stuck in office building ventilation grill, unable to free itself despite multiple attempts.',
        animalDetails: {
          type: 'bird',
          species: 'House Crow',
          age: 'adult',
          condition: 'trapped',
          behavior: 'panicked, exhausted',
          injuries: ['Minor wing stress'],
          symptoms: ['Exhaustion', 'Stress']
        },
        actionTaken: 'Building maintenance team carefully freed the bird with wildlife rescue guidance.',
        ngoInvolved: 'Wildlife Rescue & Rehabilitation Centre',
        veterinarian: 'Dr. Pradeep Kumar',
        outcome: 'Bird released successfully after brief observation for stress recovery.',
        followUp: 'Ventilation grill modified to prevent similar incidents.',
        aiGenerated: true
      }
    ];

    return fallbackData.slice(0, generateConfig.count).map((data, index) => createReportFromAI(data, index));
  };

  useEffect(() => {
    // Simulate loading reports
    setTimeout(() => {
      setReports(dummyReports);
      setFilteredReports(dummyReports);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = reports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filter by urgency
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(report => report.urgency === urgencyFilter);
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, urgencyFilter, reports]);

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-medium';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved': return 'status-resolved';
      case 'in-progress': return 'status-progress';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateReport = (report) => {
    const reportContent = `
ANIMAL RESCUE INCIDENT REPORT
${report.id}

Date: ${formatDate(report.date)} | Time: ${report.time}
Location: ${report.location}
GPS Coordinates: ${report.coordinates.lat}, ${report.coordinates.lng}

INCIDENT DETAILS:
Type: ${report.type}
Urgency Level: ${report.urgency.toUpperCase()}
Status: ${report.status.toUpperCase()}

REPORTER INFORMATION:
Name: ${report.reporter}
Contact: ${report.reporterContact}

INCIDENT DESCRIPTION:
${report.description}

ANIMAL DETAILS:
- Type: ${report.animalDetails.type}
- ${report.animalDetails.breed ? `Breed: ${report.animalDetails.breed}` : ''}
- Age: ${report.animalDetails.age}
- Condition: ${report.animalDetails.condition}
${report.animalDetails.injuries ? `- Injuries: ${report.animalDetails.injuries.join(', ')}` : ''}
${report.animalDetails.symptoms ? `- Symptoms: ${report.animalDetails.symptoms.join(', ')}` : ''}
- Behavior: ${report.animalDetails.behavior}

ACTION TAKEN:
${report.actionTaken}

ORGANIZATIONS INVOLVED:
NGO: ${report.ngoInvolved}
Veterinarian: ${report.veterinarian}

OUTCOME:
${report.outcome}

FOLLOW-UP ACTIONS:
${report.followUp}

---
Generated by Curio AI Animal Rescue System
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>🐾 Animal Rescue Reports</h1>
        <p>Track and manage animal rescue incidents across India</p>
      </div>

      <div className="reports-stats">
        <div className="stat-card">
          <div className="stat-number">{reports.length}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{reports.filter(r => r.status === 'resolved').length}</div>
          <div className="stat-label">Resolved Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{reports.filter(r => r.status === 'in-progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{reports.filter(r => r.urgency === 'high' || r.urgency === 'critical').length}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      <div className="reports-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by location, type, ID, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdowns">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select 
            value={urgencyFilter} 
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="all">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="generate-reports-section">
        <div className="generate-reports-header">
          <h3>🤖 AI-Powered Report Generation</h3>
          <button 
            className="generate-btn" 
            onClick={generateReportsWithAI}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner"></div>
                Generating...
              </>
            ) : (
              <>🚀 Generate Reports</>
            )}
          </button>
        </div>
        
        <div className="generate-config">
          <select 
            value={generateConfig.count}
            onChange={(e) => setGenerateConfig({...generateConfig, count: parseInt(e.target.value)})}
          >
            <option value={1}>1 Report</option>
            <option value={3}>3 Reports</option>
            <option value={5}>5 Reports</option>
            <option value={10}>10 Reports</option>
          </select>

          <select 
            value={generateConfig.animalType}
            onChange={(e) => setGenerateConfig({...generateConfig, animalType: e.target.value})}
          >
            <option value="random">Random Animal</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="cow">Cow</option>
            <option value="goat">Goat</option>
          </select>

          <select 
            value={generateConfig.urgency}
            onChange={(e) => setGenerateConfig({...generateConfig, urgency: e.target.value})}
          >
            <option value="random">Random Urgency</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical</option>
          </select>

          <select 
            value={generateConfig.location}
            onChange={(e) => setGenerateConfig({...generateConfig, location: e.target.value})}
          >
            <option value="random">Random City</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>

        {isGenerating && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Generating realistic animal rescue reports using AI...</span>
          </div>
        )}

        <p style={{fontSize: '0.9rem', color: '#666', margin: '0', lineHeight: '1.4'}}>
          Use AI to generate realistic animal rescue reports with authentic Indian locations, proper NGO details, and veterinarian information. 
          Reports include detailed incident descriptions, animal conditions, rescue actions, and follow-up procedures.
        </p>
      </div>

      <div className="reports-list">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-id">
                {report.id}
                {report.aiGenerated && <span style={{marginLeft: '8px', fontSize: '0.7rem', background: '#667eea', color: 'white', padding: '2px 6px', borderRadius: '10px'}}>AI</span>}
              </div>
              <div className="report-date">{formatDate(report.date)}</div>
              <div className={`urgency-badge ${getUrgencyClass(report.urgency)}`}>
                {report.urgency.toUpperCase()}
              </div>
              <div className={`status-badge ${getStatusClass(report.status)}`}>
                {report.status.replace('-', ' ').toUpperCase()}
              </div>
            </div>

            <div className="report-content">
              <h3>{report.type}</h3>
              <div className="report-location">📍 {report.location}</div>
              <div className="report-description">{report.description}</div>
              
              <div className="report-details">
                <div className="detail-row">
                  <strong>Reporter:</strong> {report.reporter} ({report.reporterContact})
                </div>
                <div className="detail-row">
                  <strong>Animal:</strong> {report.animalDetails.type} - {report.animalDetails.age} - {report.animalDetails.condition}
                </div>
                <div className="detail-row">
                  <strong>NGO:</strong> {report.ngoInvolved}
                </div>
                <div className="detail-row">
                  <strong>Veterinarian:</strong> {report.veterinarian}
                </div>
              </div>

              <div className="report-outcome">
                <strong>Outcome:</strong> {report.outcome}
              </div>
            </div>

            <div className="report-actions">
              <button 
                className="action-btn view-btn"
                onClick={() => alert(`Viewing detailed report for ${report.id}`)}
              >
                👁️ View Details
              </button>
              <button 
                className="action-btn download-btn"
                onClick={() => generateReport(report)}
              >
                📄 Download Report
              </button>
              <button 
                className="action-btn share-btn"
                onClick={() => navigator.share ? 
                  navigator.share({
                    title: `Animal Rescue Report ${report.id}`,
                    text: report.description,
                    url: window.location.href
                  }) : 
                  navigator.clipboard.writeText(`${report.id}: ${report.description}`)
                }
              >
                📤 Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="no-reports">
          <div className="no-reports-icon">📋</div>
          <h3>No reports found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Reports; 