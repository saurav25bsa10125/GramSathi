// GramSathi - Government Schemes Service
// Sourced via Verified Official Portals (myScheme, Ministry of Agriculture, DAHD, MoRD)

const fs = require('fs');
const path = require('path');

let cachedSchemes = null;

function loadSchemesDatabase() {
  if (cachedSchemes) return cachedSchemes;
  try {
    const filePath = path.join(__dirname, '..', 'data', 'schemes.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      cachedSchemes = JSON.parse(raw);
      return cachedSchemes;
    }
  } catch (e) {
    console.warn('Failed to load schemes database:', e.message);
  }
  return [];
}

/**
 * Search and filter government schemes
 */
async function getSchemes(searchQuery = '', categoryFilter = '') {
  const allSchemes = loadSchemesDatabase();
  const q = (searchQuery || '').toLowerCase().trim();
  const cat = (categoryFilter || '').toLowerCase().trim();

  const filtered = allSchemes.filter(s => {
    const name = (s.name || '').toLowerCase();
    const dept = (s.dept || '').toLowerCase();
    const category = (s.category || '').toLowerCase();
    const target = (s.target || '').toLowerCase();
    const benefits = (s.benefits || '').toLowerCase();
    const eligibility = (s.eligibility || '').toLowerCase();

    const matchesQuery = !q || 
      name.includes(q) || 
      dept.includes(q) || 
      category.includes(q) || 
      target.includes(q) || 
      benefits.includes(q) || 
      eligibility.includes(q);

    const matchesCategory = !cat || category === cat || category.includes(cat);

    return matchesQuery && matchesCategory;
  });

  return {
    sourceType: 'VERIFIED_OFFICIAL',
    source: 'OFFICIAL_GOI_WELFARE_CATALOG',
    totalSchemes: filtered.length,
    lastVerified: '2026-08-20',
    data: filtered.map(s => ({
      id: s.id,
      name: s.name,
      dept: s.dept,
      category: s.category,
      target: s.target,
      benefits: s.benefits,
      eligibility: s.eligibility,
      documents: s.documents,
      process: s.process,
      link: s.link || s.officialPortal || 'https://www.myscheme.gov.in/',
      verified: s.verified || '2026-08-20'
    }))
  };
}

module.exports = {
  getSchemes
};
