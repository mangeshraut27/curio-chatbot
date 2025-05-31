import recentCasesData from '../data/recentCases.json';

class CaseService {
  constructor() {
    this.cases = [...recentCasesData.cases];
    this.stats = { ...recentCasesData.stats };
  }

  // Get all recent cases
  getRecentCases(limit = 10) {
    return this.cases
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get cases by status
  getCasesByStatus(status) {
    return this.cases.filter(caseItem => caseItem.status === status);
  }

  // Get cases by urgency level
  getCasesByUrgency(urgencyLevel) {
    return this.cases.filter(caseItem => caseItem.urgencyLevel === urgencyLevel);
  }

  // Get cases by location (city)
  getCasesByLocation(city) {
    return this.cases.filter(caseItem => 
      caseItem.location.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Add a new case
  addCase(caseData) {
    const newCase = {
      id: `case_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      rescuedBy: null,
      reportedBy: 'Current User',
      imageUrl: null,
      tags: [],
      ...caseData
    };

    this.cases.unshift(newCase);
    this.updateStats();
    return newCase;
  }

  // Update case status
  updateCaseStatus(caseId, status, rescuedBy = null) {
    const caseIndex = this.cases.findIndex(c => c.id === caseId);
    if (caseIndex !== -1) {
      this.cases[caseIndex].status = status;
      if (rescuedBy) {
        this.cases[caseIndex].rescuedBy = rescuedBy;
      }
      this.updateStats();
      return this.cases[caseIndex];
    }
    return null;
  }

  // Update statistics
  updateStats() {
    this.stats = {
      totalCases: this.cases.length,
      rescued: this.cases.filter(c => c.status === 'rescued').length,
      inProgress: this.cases.filter(c => c.status === 'in_progress').length,
      pending: this.cases.filter(c => c.status === 'pending').length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get statistics
  getStats() {
    return this.stats;
  }

  // Generate social media content
  generateSocialContent(caseData, platform = 'twitter') {
    const urgencyEmoji = {
      high: '🚨',
      medium: '⚠️',
      low: '📋'
    };

    const statusEmoji = {
      rescued: '✅',
      in_progress: '🔄',
      pending: '⏳'
    };

    const baseContent = {
      emoji: urgencyEmoji[caseData.urgencyLevel] || '📋',
      animal: caseData.animalType,
      location: caseData.location,
      description: caseData.description,
      status: statusEmoji[caseData.status] || '⏳',
      hashtags: ['AnimalRescue', 'StrayAnimals', 'CommunityHelp', 'Curio']
    };

    if (platform === 'twitter') {
      const content = `${baseContent.emoji} ANIMAL RESCUE ALERT\n\n` +
        `🐾 ${baseContent.animal} needs help in ${baseContent.location}\n` +
        `📝 ${baseContent.description}\n` +
        `${baseContent.status} Status: ${caseData.status.replace('_', ' ').toUpperCase()}\n\n` +
        `Help us spread awareness! #${baseContent.hashtags.join(' #')}\n\n` +
        `Report via Curio AI: https://hackathon-7d4ceqplx-mangeshs-projects-59059c2a.vercel.app`;

      return content.length <= 280 ? content : content.substring(0, 277) + '...';
    }

    if (platform === 'whatsapp') {
      return `${baseContent.emoji} *ANIMAL RESCUE ALERT*\n\n` +
        `🐾 *${baseContent.animal}* needs help!\n` +
        `📍 *Location:* ${baseContent.location}\n` +
        `📝 *Details:* ${baseContent.description}\n` +
        `${baseContent.status} *Status:* ${caseData.status.replace('_', ' ').toUpperCase()}\n\n` +
        `Please share this message to help spread awareness.\n\n` +
        `🔗 Report cases via Curio AI:\nhttps://hackathon-7d4ceqplx-mangeshs-projects-59059c2a.vercel.app`;
    }

    return baseContent;
  }

  // Get share URLs
  getShareUrls(caseData) {
    const twitterContent = this.generateSocialContent(caseData, 'twitter');
    const whatsappContent = this.generateSocialContent(caseData, 'whatsapp');

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterContent)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappContent)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://hackathon-7d4ceqplx-mangeshs-projects-59059c2a.vercel.app')}&quote=${encodeURIComponent(twitterContent)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent('https://hackathon-7d4ceqplx-mangeshs-projects-59059c2a.vercel.app')}&text=${encodeURIComponent(twitterContent)}`
    };
  }

  // Search cases
  searchCases(query) {
    const searchTerm = query.toLowerCase();
    return this.cases.filter(caseItem =>
      caseItem.description.toLowerCase().includes(searchTerm) ||
      caseItem.location.toLowerCase().includes(searchTerm) ||
      caseItem.animalType.toLowerCase().includes(searchTerm) ||
      caseItem.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get trending tags
  getTrendingTags() {
    const tagCounts = {};
    this.cases.forEach(caseItem => {
      caseItem.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  // Generate case report for authorities
  generateCaseReport(caseData) {
    return {
      caseId: caseData.id,
      reportTimestamp: new Date().toISOString(),
      animalDetails: {
        type: caseData.animalType,
        description: caseData.description,
        urgencyLevel: caseData.urgencyLevel,
        triageScore: caseData.triageScore
      },
      locationDetails: {
        address: caseData.location,
        coordinates: caseData.coordinates
      },
      reportingDetails: {
        reportedBy: caseData.reportedBy,
        reportTimestamp: caseData.timestamp
      },
      statusDetails: {
        currentStatus: caseData.status,
        rescuedBy: caseData.rescuedBy,
        lastUpdated: caseData.timestamp
      },
      recommendedActions: this.getRecommendedActions(caseData),
      contactInformation: this.getRelevantContacts(caseData.location)
    };
  }

  // Get recommended actions based on case
  getRecommendedActions(caseData) {
    const actions = [];
    
    if (caseData.urgencyLevel === 'high') {
      actions.push('Immediate veterinary attention required');
      actions.push('Emergency animal control dispatch');
    }
    
    if (caseData.animalType.toLowerCase().includes('bird')) {
      actions.push('Contact wildlife rehabilitation center');
    }
    
    if (caseData.tags.includes('pregnant')) {
      actions.push('Provide safe birthing environment');
      actions.push('Prepare for multiple animals');
    }
    
    actions.push('Document with photographs if safe');
    actions.push('Ensure rescuer safety');
    
    return actions;
  }

  // Get relevant contacts based on location
  getRelevantContacts(location) {
    // This would integrate with NGO service for location-specific contacts
    return {
      emergency: '1962 (Animal Emergency)',
      local: 'Contact local animal control',
      ngo: 'Refer to NGO recommendations in app'
    };
  }
}

// Create singleton instance
const caseService = new CaseService();
export default caseService; 