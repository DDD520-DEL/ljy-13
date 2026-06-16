const API_BASE = '/api';

const ALL_DANCE_STYLES = ['Cuban', 'LA', 'NY', 'Bachata'];

let currentDate = new Date();
let selectedDate = null;
let currentUser = null;
let currentCity = null;
let supportedCities = [];
let allDances = [];
let allUsers = [];
let inviteTargetUserId = null;
let preselectedDanceId = null;

function normalizeStylesFrontend(styles) {
  if (!styles) return [];
  if (Array.isArray(styles) && styles.length > 0 && typeof styles[0] === 'string') {
    return styles.map(name => ({ name, weight: 50 }));
  }
  return styles.map(s => ({
    name: s.name,
    weight: Math.max(0, Math.min(100, parseInt(s.weight) || 50))
  }));
}

function getStyleNamesFrontend(styles) {
  return normalizeStylesFrontend(styles).map(s => s.name);
}

function getStyleWeightMapFrontend(styles) {
  const map = {};
  normalizeStylesFrontend(styles).forEach(s => {
    map[s.name] = s.weight;
  });
  return map;
}

function renderStyleTagsWithWeights(styles) {
  const normalized = normalizeStylesFrontend(styles);
  return normalized.map(s => 
    `<span class="style-tag style-${s.name.toLowerCase()} style-tag-with-weight">${s.name}<span class="weight">${s.weight}%</span></span>`
  ).join('');
}

function renderUserBadges(badges, size = 'small') {
  if (!badges || badges.length === 0) return '';
  
  const sizeClass = size === 'small' ? 'badge-small' : size === 'medium' ? 'badge-medium' : 'badge-large';
  
  return `
    <div class="user-badges ${sizeClass}">
      ${badges.map(badge => `
        <span class="user-badge" 
              title="${badge.name}: ${badge.description}" 
              style="background-color: ${badge.color}20; border-color: ${badge.color};">
          <span class="badge-icon">${badge.icon}</span>
        </span>
      `).join('')}
    </div>
  `;
}

function renderBadgesList(badges) {
  if (!badges || badges.length === 0) {
    return '<div class="badges-empty">暂无徽章</div>';
  }
  
  return `
    <div class="badges-list">
      ${badges.map(badge => `
        <div class="badge-item" style="border-color: ${badge.color};">
          <div class="badge-icon-large" style="background-color: ${badge.color}20;">
            ${badge.icon}
          </div>
          <div class="badge-info">
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.description}</div>
            ${badge.earnedAt ? `<div class="badge-earned-at">获得时间: ${new Date(badge.earnedAt).toLocaleDateString()}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

let previousView = 'calendar';
let currentVenueName = null;

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initCalendar();
  initFilters();
  initMap();
  initPublishForm();
  initModals();
  initReviewModal();
  initNotifications();
  initEditProfileModal();
  initEncyclopedia();
  initVenueView();
  initHelpCenter();
  await initCities();
  loadUsers();
  loadDances();
  loadHotRanking();
  loadPartners();
});

async function initCities() {
  try {
    const res = await fetch(`${API_BASE}/dances/cities`);
    supportedCities = await res.json();
    populateCitySelects();
    const citySelect = document.getElementById('citySelect');
    currentCity = citySelect.value;
    citySelect.addEventListener('change', onCityChanged);
  } catch (e) {
    console.error('加载城市列表失败:', e);
  }
}

function populateCitySelects() {
  const citySelect = document.getElementById('citySelect');
  const publishCitySelect = document.getElementById('publishCitySelect');
  const editCitySelect = document.getElementById('editCity');
  
  [citySelect, publishCitySelect, editCitySelect].forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '';
    supportedCities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });
    if (currentVal && supportedCities.includes(currentVal)) {
      select.value = currentVal;
    } else if (currentCity && supportedCities.includes(currentCity)) {
      select.value = currentCity;
    } else if (select === citySelect) {
      if (currentUser && supportedCities.includes(currentUser.city)) {
        select.value = currentUser.city;
      }
    }
  });
}

async function onCityChanged(e) {
  currentCity = e.target.value;
  showToast(`已切换到 ${currentCity}`, 'success');
  await loadDances();
  loadHotRanking();
  renderMapMarkers();
  if (document.getElementById('map-view').classList.contains('active')) {
    loadNearbyDances();
  }
  loadPartners();
  const publishCitySelect = document.getElementById('publishCitySelect');
  if (publishCitySelect) publishCitySelect.value = currentCity;
}

function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      previousView = view;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`${view}-view`).classList.add('active');
      
      if (view === 'map') {
        setTimeout(loadNearbyDances, 100);
      }
      if (view === 'profile') {
        loadUserProfile();
      }
      if (view === 'messages') {
        loadConversations();
      }
    });
  });
}

function initVenueView() {
  const backBtn = document.getElementById('backFromVenueBtn');
  if (backBtn) {
    backBtn.addEventListener('click', goBackFromVenue);
  }
}

function goToVenuePage(encodedVenueName) {
  const venueName = decodeURIComponent(encodedVenueName);
  currentVenueName = venueName;
  previousView = getActiveView();
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('venue-view').classList.add('active');
  
  document.getElementById('venuePageTitle').textContent = `🏛️ ${venueName}`;
  
  loadVenueDetail(venueName);
}

function goBackFromVenue() {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`${previousView}-view`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === previousView);
  });
  currentVenueName = null;
}

function getActiveView() {
  const views = ['calendar', 'map', 'partners', 'encyclopedia', 'messages', 'publish', 'profile', 'venue', 'help'];
  for (const v of views) {
    const el = document.getElementById(`${v}-view`);
    if (el && el.classList.contains('active')) {
      return v;
    }
  }
  return 'calendar';
}

async function loadVenueDetail(venueName) {
  const container = document.getElementById('venueContent');
  container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">加载中...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/dances/venues/${encodeURIComponent(venueName)}`);
    if (!res.ok) {
      throw new Error('场地不存在');
    }
    const venue = await res.json();
    renderVenueDetail(venue);
  } catch (e) {
    console.error('加载场地详情失败:', e);
    container.innerHTML = `<div style="text-align:center;color:#999;padding:40px;">加载失败：${e.message}</div>`;
  }
}

function renderVenueDetail(venue) {
  const container = document.getElementById('venueContent');
  const stats = venue.stats || {};
  const dances = venue.dances || [];
  
  const upcomingDances = dances.filter(d => new Date(d.date) >= new Date());
  const pastDances = dances.filter(d => new Date(d.date) < new Date());
  
  const topStylesHtml = (stats.topStyles && stats.topStyles.length > 0)
    ? stats.topStyles.map(s => `<span class="venue-style-tag">${s.style} <small>(${s.count}场)</small></span>`).join('')
    : '<span style="color:#999;">暂无数据</span>';
  
  const placeholderImages = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  ];
  
  const venuePhotos = `
    <div class="venue-photos-grid">
      ${placeholderImages.map((bg, idx) => `
        <div class="venue-photo-item" style="background:${bg};">
          <div class="venue-photo-placeholder">
            <span>🖼️</span>
            <small>场地照片 ${idx + 1}</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  const dancesListHtml = dances.length > 0 ? `
    <div class="venue-dances-list">
      ${dances.map(dance => {
        const dateObj = new Date(dance.date);
        const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
        const isPast = new Date(dance.date) < new Date();
        const styleTags = dance.styles.map(s => 
          `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
        ).join('');
        
        return `
          <div class="venue-dance-item" data-dance-id="${dance.id}" onclick="showDanceDetail(${dance.id})">
            <div class="venue-dance-header">
              <h4>${dance.title}</h4>
              <span class="venue-dance-badge ${isPast ? 'badge-past' : 'badge-upcoming'}">${isPast ? '已结束' : '即将开始'}</span>
            </div>
            <div class="venue-dance-meta">
              <span>📅 ${dateStr} ${weekDay}</span>
              <span>⏰ ${dance.startTime} - ${dance.endTime}</span>
              <span>💰 ¥${dance.price}</span>
            </div>
            <div class="venue-dance-stats">
              <span>👁 ${dance.viewCount}</span>
              <span>👥 ${dance.attendeeCount}${dance.maxAttendees ? `/${dance.maxAttendees}` : ''}</span>
              <div class="venue-dance-styles">${styleTags}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : '<div style="text-align:center;color:#999;padding:40px;">暂无舞会记录</div>';
  
  const mapLat = venue.latitude || 31.2304;
  const mapLng = venue.longitude || 121.4737;
  
  container.innerHTML = `
    <div class="venue-detail-container">
      <div class="venue-main-info">
        <div class="venue-info-card">
          <div class="venue-info-title">
            <h2>${venue.name}</h2>
            <div class="venue-info-badge">共举办 ${stats.danceCount || 0} 场舞会</div>
          </div>
          <div class="venue-info-desc">${venue.description || '暂无场地介绍'}</div>
          <div class="venue-info-grid">
            <div class="venue-info-item">
              <span class="venue-info-icon">📍</span>
              <div>
                <div class="venue-info-label">详细地址</div>
                <div class="venue-info-value">${venue.city} · ${venue.address}</div>
              </div>
            </div>
            <div class="venue-info-item">
              <span class="venue-info-icon">👥</span>
              <div>
                <div class="venue-info-label">可容纳人数</div>
                <div class="venue-info-value">${venue.capacity || 100} 人</div>
              </div>
            </div>
            <div class="venue-info-item">
              <span class="venue-info-icon">🎭</span>
              <div>
                <div class="venue-info-label">主办方</div>
                <div class="venue-info-value">${venue.organizer || '-'}</div>
              </div>
            </div>
            <div class="venue-info-item">
              <span class="venue-info-icon">💵</span>
              <div>
                <div class="venue-info-label">平均票价</div>
                <div class="venue-info-value">¥${stats.avgPrice || 0}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="venue-stats-card">
          <h3>📊 数据统计</h3>
          <div class="venue-stats-grid">
            <div class="venue-stat-card stat-total">
              <div class="venue-stat-number">${stats.danceCount || 0}</div>
              <div class="venue-stat-label">累计举办舞会</div>
            </div>
            <div class="venue-stat-card stat-upcoming">
              <div class="venue-stat-number">${stats.upcomingDances || 0}</div>
              <div class="venue-stat-label">即将开始</div>
            </div>
            <div class="venue-stat-card stat-past">
              <div class="venue-stat-number">${stats.pastDances || 0}</div>
              <div class="venue-stat-label">已结束</div>
            </div>
            <div class="venue-stat-card stat-views">
              <div class="venue-stat-number">${(stats.totalViews || 0).toLocaleString()}</div>
              <div class="venue-stat-label">总浏览量</div>
            </div>
            <div class="venue-stat-card stat-attendees">
              <div class="venue-stat-number">${(stats.totalAttendees || 0).toLocaleString()}</div>
              <div class="venue-stat-label">总参与人次</div>
            </div>
            <div class="venue-stat-card stat-price">
              <div class="venue-stat-number">¥${stats.avgPrice || 0}</div>
              <div class="venue-stat-label">平均票价</div>
            </div>
          </div>
          <div class="venue-top-styles">
            <div class="venue-top-styles-title">🔥 热门舞种</div>
            <div class="venue-top-styles-list">${topStylesHtml}</div>
          </div>
        </div>
      </div>
      
      <div class="venue-section">
        <h3>📸 场地照片</h3>
        ${venuePhotos}
      </div>
      
      <div class="venue-section">
        <h3>📍 地图定位</h3>
        <div class="venue-map-container">
          <div class="venue-map-placeholder">
            <div class="venue-map-marker" style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -100%);
              font-size: 32px;
            ">📍</div>
            <div class="venue-map-coords">
              <span>纬度: ${mapLat.toFixed(4)}</span>
              <span>经度: ${mapLng.toFixed(4)}</span>
            </div>
            <div class="venue-map-address">
              ${venue.address}
            </div>
          </div>
        </div>
      </div>
      
      <div class="venue-section">
        <div class="venue-section-header">
          <h3>🎭 在该场地举办的舞会 (${dances.length})</h3>
          <div class="venue-tabs">
            <button class="venue-tab active" data-tab="all">全部 (${dances.length})</button>
            <button class="venue-tab" data-tab="upcoming">即将开始 (${upcomingDances.length})</button>
            <button class="venue-tab" data-tab="past">已结束 (${pastDances.length})</button>
          </div>
        </div>
        <div id="venueDancesContainer">
          ${dancesListHtml}
        </div>
      </div>
    </div>
  `;
  
  const venueTabs = container.querySelectorAll('.venue-tab');
  venueTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      venueTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabType = tab.dataset.tab;
      let filteredDances = [];
      if (tabType === 'all') {
        filteredDances = dances;
      } else if (tabType === 'upcoming') {
        filteredDances = upcomingDances;
      } else {
        filteredDances = pastDances;
      }
      renderVenueDancesList(filteredDances);
    });
  });
  
  container.querySelectorAll('.venue-dance-item').forEach(item => {
    item.addEventListener('click', () => {
      const danceId = parseInt(item.dataset.danceId);
      showDanceDetail(danceId);
    });
  });
}

function renderVenueDancesList(dances) {
  const container = document.getElementById('venueDancesContainer');
  if (!container) return;
  
  if (dances.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">暂无舞会记录</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="venue-dances-list">
      ${dances.map(dance => {
        const dateObj = new Date(dance.date);
        const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
        const isPast = new Date(dance.date) < new Date();
        const styleTags = dance.styles.map(s => 
          `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
        ).join('');
        
        return `
          <div class="venue-dance-item" data-dance-id="${dance.id}">
            <div class="venue-dance-header">
              <h4>${dance.title}</h4>
              <span class="venue-dance-badge ${isPast ? 'badge-past' : 'badge-upcoming'}">${isPast ? '已结束' : '即将开始'}</span>
            </div>
            <div class="venue-dance-meta">
              <span>📅 ${dateStr} ${weekDay}</span>
              <span>⏰ ${dance.startTime} - ${dance.endTime}</span>
              <span>💰 ¥${dance.price}</span>
            </div>
            <div class="venue-dance-stats">
              <span>👁 ${dance.viewCount}</span>
              <span>👥 ${dance.attendeeCount}${dance.maxAttendees ? `/${dance.maxAttendees}` : ''}</span>
              <div class="venue-dance-styles">${styleTags}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  container.querySelectorAll('.venue-dance-item').forEach(item => {
    item.addEventListener('click', () => {
      const danceId = parseInt(item.dataset.danceId);
      showDanceDetail(danceId);
    });
  });
}

function initCalendar() {
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  
  renderCalendar();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  document.getElementById('currentMonth').textContent = 
    `${year}年${month + 1}月`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const calendarDays = document.getElementById('calendarDays');
  calendarDays.innerHTML = '';
  
  const today = new Date();
  const todayStr = formatDate(today);
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayEl = createDayElement(day, 'other-month');
    calendarDays.appendChild(dayEl);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(year, month, day));
    const classes = [];
    
    if (dateStr === todayStr) {
      classes.push('today');
    }
    
    if (selectedDate === dateStr) {
      classes.push('selected');
    }
    
    const dayEl = createDayElement(day, classes.join(' '), dateStr);
    calendarDays.appendChild(dayEl);
  }
  
  const totalCells = firstDay + daysInMonth;
  const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
  
  for (let day = 1; day <= remainingCells; day++) {
    const dayEl = createDayElement(day, 'other-month');
    calendarDays.appendChild(dayEl);
  }
}

function createDayElement(day, className, dateStr) {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${className}`;
  
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  dayEl.appendChild(dayNumber);
  
  if (dateStr) {
    const dayDances = allDances.filter(d => d.date === dateStr);
    if (dayDances.length > 0) {
      const dancesContainer = document.createElement('div');
      dancesContainer.className = 'day-dances';
      
      dayDances.slice(0, 2).forEach(dance => {
        const item = document.createElement('div');
        item.className = 'day-dance-item';
        item.textContent = dance.title;
        item.title = dance.title;
        dancesContainer.appendChild(item);
      });
      
      if (dayDances.length > 2) {
        const more = document.createElement('div');
        more.className = 'day-dance-item';
        more.textContent = `+${dayDances.length - 2} 更多`;
        dancesContainer.appendChild(more);
      }
      
      dayEl.appendChild(dancesContainer);
    }
    
    dayEl.addEventListener('click', () => {
      selectedDate = dateStr;
      renderCalendar();
      renderDanceList();
    });
  }
  
  return dayEl;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderStars(rating, size = 'small') {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += `<span class="star star-full ${size}">★</span>`;
  }
  if (hasHalf) {
    html += `<span class="star star-half ${size}">★</span>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    html += `<span class="star star-empty ${size}">★</span>`;
  }
  return html;
}

function initFilters() {
  document.getElementById('styleFilter').addEventListener('change', renderDanceList);
  document.getElementById('sortSelect').addEventListener('change', renderDanceList);
  document.getElementById('partnerDance').addEventListener('change', loadPartners);
  document.getElementById('partnerStyle').addEventListener('change', loadPartners);
  document.getElementById('partnerRole').addEventListener('change', loadPartners);
  document.getElementById('partnerLevel').addEventListener('change', loadPartners);
  document.getElementById('matchBtn').addEventListener('click', smartMatch);
}

async function loadDances() {
  try {
    const params = new URLSearchParams({ sort: 'date', limit: 100 });
    if (currentCity) params.set('city', currentCity);
    if (currentUser) params.set('userId', currentUser.id);
    const res = await fetch(`${API_BASE}/dances?${params.toString()}`);
    const data = await res.json();
    allDances = data.data;
    renderCalendar();
    renderDanceList();
    populateInviteDanceSelect();
    populatePartnerDanceSelect();
    renderMapMarkers();
  } catch (e) {
    console.error('加载舞会失败:', e);
  }
}

function renderDanceList() {
  const styleFilter = document.getElementById('styleFilter').value;
  const sortSelect = document.getElementById('sortSelect').value;
  
  let filtered = [...allDances];
  
  if (selectedDate) {
    filtered = filtered.filter(d => d.date === selectedDate);
  }
  
  if (styleFilter) {
    filtered = filtered.filter(d => d.styles.includes(styleFilter));
  }
  
  if (sortSelect === 'hot') {
    filtered.sort((a, b) => (b.viewCount + b.attendeeCount * 2) - (a.viewCount + a.attendeeCount * 2));
  } else if (sortSelect === 'price') {
    filtered.sort((a, b) => a.price - b.price);
  } else {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  const container = document.getElementById('danceListContainer');
  
  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">暂无符合条件的舞会</div>';
    return;
  }
  
  container.innerHTML = filtered.map(dance => createDanceCard(dance)).join('');
  
  container.querySelectorAll('.dance-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      showDanceDetail(id);
    });
  });
}

function getDanceStatus(dance) {
  const isFull = dance.maxAttendees && dance.attendeeCount >= dance.maxAttendees;
  const isClosed = dance.registrationDeadline && new Date() > new Date(dance.registrationDeadline);
  
  if (isClosed) return 'closed';
  if (isFull) return 'full';
  return 'open';
}

function createDanceCard(dance) {
  const styleTags = dance.styles.map(s => 
    `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
  ).join('');
  
  const dateObj = new Date(dance.date);
  const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
  
  const status = getDanceStatus(dance);
  let statusBadge = '';
  if (status === 'full') {
    statusBadge = '<span class="status-badge status-full">已满</span>';
  } else if (status === 'closed') {
    statusBadge = '<span class="status-badge status-closed">已截止</span>';
  }
  
  let attendeeDisplay = `👥 ${dance.attendeeCount}`;
  if (dance.maxAttendees) {
    attendeeDisplay = `👥 ${dance.attendeeCount}/${dance.maxAttendees}`;
  }
  
  const favoriteCount = dance.favoriteCount || 0;
  const isFavorited = dance.isFavorited || false;
  const favoriteClass = isFavorited ? 'favorited' : '';
  const favoriteIcon = isFavorited ? '❤️' : '🤍';
  
  const venueLink = `<span class="venue-link" data-venue="${encodeURIComponent(dance.venue)}" onclick="event.stopPropagation(); goToVenuePage('${encodeURIComponent(dance.venue)}')">${dance.venue}</span>`;
  
  return `
    <div class="dance-card" data-id="${dance.id}">
      <div class="dance-card-header">
        <h4>${dance.title} ${statusBadge}</h4>
        <div class="dance-card-time">${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      </div>
      <div class="dance-card-body">
        <div class="dance-card-meta">
          <div>📍 ${venueLink}</div>
          <div>🏙️ ${dance.city} · 📍 ${dance.address}</div>
        </div>
        <div class="dance-styles">${styleTags}</div>
      </div>
      <div class="dance-card-footer">
        <div class="dance-price">
          ¥${dance.price}
          <span class="price-label">/人</span>
        </div>
        <div class="dance-stats">
          <span>👁 ${dance.viewCount}</span>
          <span>${attendeeDisplay}</span>
        </div>
      </div>
      <div class="dance-card-actions">
        <button class="card-action-btn favorite-btn ${favoriteClass}" data-dance-id="${dance.id}" data-favorited="${isFavorited}" onclick="event.stopPropagation(); toggleFavorite(${dance.id}, this)">
          <span class="action-icon">${favoriteIcon}</span>
          <span class="action-count">${favoriteCount}</span>
        </button>
        <button class="card-action-btn share-btn" data-dance-id="${dance.id}" onclick="event.stopPropagation(); openShareModal(${dance.id})">
          <span class="action-icon">📤</span>
          <span class="action-text">分享</span>
        </button>
      </div>
    </div>
  `;
}

async function showDanceDetail(id) {
  try {
    currentDanceId = id;
    currentCommentSort = 'time';
    
    const url = currentUser 
      ? `${API_BASE}/dances/${id}?userId=${currentUser.id}`
      : `${API_BASE}/dances/${id}`;
    const danceRes = await fetch(url);
    const dance = await danceRes.json();
    
    const [avgRes, reviewsRes, registeredUsersRes, commentsRes] = await Promise.all([
      fetch(`${API_BASE}/reviews/dance/${id}/average`),
      fetch(`${API_BASE}/reviews?danceId=${id}`),
      fetch(`${API_BASE}/dances/${id}/registered-users`),
      loadDanceComments(id, currentCommentSort)
    ]);
    
    const averages = await avgRes.json();
    const reviews = await reviewsRes.json();
    const registeredUsers = await registeredUsersRes.json();
    const commentData = commentsRes;
    
    const userReview = currentUser 
      ? reviews.find(r => r.userId === currentUser.id) 
      : null;
    
    const canReview = currentUser && !userReview && new Date(dance.date) < new Date();
    
    const styleTags = dance.styles.map(s => 
      `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
    ).join('');
    
    const dateObj = new Date(dance.date);
    const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
    
    let registrationInfoHtml = '';
    if (dance.maxAttendees || dance.registrationDeadline) {
      let deadlineStr = '';
      if (dance.registrationDeadline) {
        const deadlineObj = new Date(dance.registrationDeadline);
        deadlineStr = `${deadlineObj.getFullYear()}年${deadlineObj.getMonth() + 1}月${deadlineObj.getDate()}日 ${deadlineObj.getHours().toString().padStart(2, '0')}:${deadlineObj.getMinutes().toString().padStart(2, '0')}`;
      }
      
      registrationInfoHtml = `
        <div class="registration-info">
          <h4>报名信息</h4>
          <div class="registration-details">
            ${dance.maxAttendees ? `<div><span class="info-label">人数上限:</span> ${dance.maxAttendees} 人</div>` : ''}
            ${dance.registrationDeadline ? `<div><span class="info-label">报名截止:</span> ${deadlineStr}</div>` : ''}
            <div><span class="info-label">已报名:</span> ${dance.attendeeCount}${dance.maxAttendees ? `/${dance.maxAttendees}` : ''} 人</div>
          </div>
        </div>
      `;
    }
    
    let registeredUsersHtml = '';
    if (registeredUsers.length > 0) {
      registeredUsersHtml = `
        <div class="registered-users-section">
          <h4>已报名舞者 (${registeredUsers.length})</h4>
          <div class="registered-users-list">
            ${registeredUsers.map(user => `
              <div class="registered-user-item" title="${user.name}">
                <img src="${user.avatar}" alt="${user.name}" class="registered-user-avatar">
                <span class="registered-user-name">${user.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    let registerButtonHtml = '';
    if (currentUser) {
      const isFull = dance.isFull;
      const isClosed = dance.isClosed;
      const isRegistered = dance.isRegistered;
      
      if (isClosed) {
        registerButtonHtml = `<button class="btn btn-disabled" disabled>报名已截止</button>`;
      } else if (isFull) {
        registerButtonHtml = `<button class="btn btn-disabled" disabled>名额已满</button>`;
      } else if (isRegistered) {
        registerButtonHtml = `<button class="btn btn-secondary" onclick="cancelRegistration(${dance.id})">取消报名</button>`;
      } else {
        registerButtonHtml = `<button class="btn btn-primary" onclick="registerForDance(${dance.id})">我要参加</button>`;
      }
    }
    
    let ratingsHtml = '';
    if (averages.count > 0) {
      ratingsHtml = `
        <div class="ratings-overview">
          <div class="ratings-summary">
            <div class="overall-rating">
              <span class="overall-score">${averages.overallAvg}</span>
              <div class="overall-stars">${renderStars(averages.overallAvg, 'large')}</div>
              <span class="rating-count">${averages.count} 条评价</span>
            </div>
            <div class="ratings-breakdown">
              <div class="rating-item">
                <span class="rating-label">场地环境</span>
                <div class="rating-stars">${renderStars(averages.venueAvg)}</div>
                <span class="rating-value">${averages.venueAvg}</span>
              </div>
              <div class="rating-item">
                <span class="rating-label">音乐质量</span>
                <div class="rating-stars">${renderStars(averages.musicAvg)}</div>
                <span class="rating-value">${averages.musicAvg}</span>
              </div>
              <div class="rating-item">
                <span class="rating-label">组织水平</span>
                <div class="rating-stars">${renderStars(averages.organizationAvg)}</div>
                <span class="rating-value">${averages.organizationAvg}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      ratingsHtml = `
        <div class="ratings-overview no-ratings">
          <div class="no-ratings-text">暂无评价，快来成为第一个评价的人吧！</div>
        </div>
      `;
    }
    
    let reviewsHtml = '';
    if (reviews.length > 0) {
      reviewsHtml = `
        <div class="reviews-section">
          <h4>用户评价 (${reviews.length})</h4>
          <div class="reviews-list">
            ${reviews.map(review => `
              <div class="review-item">
                <div class="review-header">
                  <img src="${review.user.avatar}" alt="${review.user.name}" class="review-avatar">
                  <div class="review-user-info">
                    <span class="review-user-name">${review.user.name}</span>
                    <span class="review-date">${formatDate(new Date(review.createdAt))}</span>
                  </div>
                </div>
                <div class="review-ratings">
                  <div class="review-rating-item">
                    <span>场地</span>
                    ${renderStars(review.venueRating)}
                  </div>
                  <div class="review-rating-item">
                    <span>音乐</span>
                    ${renderStars(review.musicRating)}
                  </div>
                  <div class="review-rating-item">
                    <span>组织</span>
                    ${renderStars(review.organizationRating)}
                  </div>
                </div>
                ${review.comment ? `<div class="review-comment">${review.comment}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    let reviewButtonHtml = '';
    if (userReview) {
      reviewButtonHtml = `
        <div class="user-review-notice">
          <span class="notice-icon">✓</span>
          您已评价过此舞会
        </div>
      `;
    } else if (canReview) {
      reviewButtonHtml = `
        <button class="btn btn-secondary" onclick="openReviewModal(${dance.id})">评价舞会</button>
      `;
    }
    
    const commentsSectionHtml = renderCommentsSection(dance.id, commentData);
    
    const isFavorited = dance.isFavorited || false;
    const favoriteCount = dance.favoriteCount || 0;
    const favoriteBtnText = isFavorited ? '❤️ 已收藏' : '🤍 收藏';
    const favoriteBtnClass = isFavorited ? 'btn-favorited' : '';
    
    const venueLinkDetail = `<span class="venue-link" onclick="closeModal(); goToVenuePage('${encodeURIComponent(dance.venue)}')">${dance.venue}</span>`;
    
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-dance-header">
        <h2>${dance.title}</h2>
        <div class="modal-dance-time">${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      </div>
      <div class="modal-dance-info">
        <div><span class="info-label">场地:</span> ${venueLinkDetail}</div>
        <div><span class="info-label">城市:</span> ${dance.city}</div>
        <div><span class="info-label">地址:</span> ${dance.address}</div>
        <div><span class="info-label">主办方:</span> ${dance.organizer}</div>
        <div><span class="info-label">票价:</span> ¥${dance.price}</div>
        <div><span class="info-label">舞种:</span> ${styleTags}</div>
        <div><span class="info-label">热度:</span> 👁 ${dance.viewCount} 次浏览 | 👥 ${dance.attendeeCount}${dance.maxAttendees ? `/${dance.maxAttendees}` : ''} 人参加 | ❤️ ${favoriteCount} 人收藏</div>
      </div>
      ${registrationInfoHtml}
      <div class="modal-dance-desc">
        <h4>舞会介绍</h4>
        <p>${dance.description || '暂无介绍'}</p>
      </div>
      ${registeredUsersHtml}
      ${ratingsHtml}
      ${reviewsHtml}
      ${commentsSectionHtml}
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        <button class="btn btn-secondary ${favoriteBtnClass}" id="detailFavoriteBtn" data-favorited="${isFavorited}" onclick="toggleFavorite(${dance.id}, this)">${favoriteBtnText} (${favoriteCount})</button>
        <button class="btn btn-secondary" onclick="openShareModal(${dance.id})">📤 分享</button>
        ${reviewButtonHtml}
        ${registerButtonHtml}
        <button class="btn btn-primary" onclick="inviteToDance(${dance.id})">邀约舞伴</button>
      </div>
    `;
    
    document.getElementById('danceModal').classList.add('active');
    bindCommentEvents(dance.id);
  } catch (e) {
    console.error('加载舞会详情失败:', e);
    showToast('加载失败', 'error');
  }
}

function closeModal() {
  document.getElementById('danceModal').classList.remove('active');
}

async function registerForDance(danceId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/dances/${danceId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    if (res.ok) {
      const data = await res.json();
      showToast('报名成功！', 'success');
      await loadDances();
      await loadUnreadCount();
      populatePartnerDanceSelect();
      showDanceDetail(danceId);
    } else {
      const data = await res.json();
      showToast(data.error || '报名失败', 'error');
    }
  } catch (e) {
    console.error('报名失败:', e);
    showToast('报名失败', 'error');
  }
}

async function cancelRegistration(danceId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  if (!confirm('确定要取消报名吗？')) {
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/dances/${danceId}/register`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    if (res.ok) {
      showToast('已取消报名', 'success');
      await loadDances();
      populatePartnerDanceSelect();
      showDanceDetail(danceId);
    } else {
      const data = await res.json();
      showToast(data.error || '取消失败', 'error');
    }
  } catch (e) {
    console.error('取消报名失败:', e);
    showToast('取消失败', 'error');
  }
}

async function toggleFavorite(danceId, btnElement) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  const isFavorited = btnElement.dataset.favorited === 'true';
  
  try {
    const method = isFavorited ? 'DELETE' : 'POST';
    const res = await fetch(`${API_BASE}/dances/${danceId}/favorite`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    if (res.ok) {
      const data = await res.json();
      showToast(data.message || (isFavorited ? '已取消收藏' : '收藏成功'), 'success');
      
      if (btnElement.classList.contains('card-action-btn')) {
        const newFavorited = !isFavorited;
        btnElement.dataset.favorited = newFavorited;
        btnElement.classList.toggle('favorited', newFavorited);
        const iconEl = btnElement.querySelector('.action-icon');
        const countEl = btnElement.querySelector('.action-count');
        if (iconEl) iconEl.textContent = newFavorited ? '❤️' : '🤍';
        if (countEl) countEl.textContent = data.favoriteCount;
      } else if (btnElement.id === 'detailFavoriteBtn') {
        const newFavorited = !isFavorited;
        btnElement.textContent = newFavorited ? `❤️ 已收藏 (${data.favoriteCount})` : `🤍 收藏 (${data.favoriteCount})`;
        btnElement.classList.toggle('btn-favorited', newFavorited);
        btnElement.onclick = () => toggleFavorite(danceId, btnElement);
        btnElement.dataset.favorited = newFavorited;
      }
      
      const danceCard = document.querySelector(`.dance-card[data-id="${danceId}"]`);
      if (danceCard) {
        const cardFavoriteBtn = danceCard.querySelector('.favorite-btn');
        if (cardFavoriteBtn && cardFavoriteBtn !== btnElement) {
          const newFavorited = !isFavorited;
          cardFavoriteBtn.dataset.favorited = newFavorited;
          cardFavoriteBtn.classList.toggle('favorited', newFavorited);
          const iconEl = cardFavoriteBtn.querySelector('.action-icon');
          const countEl = cardFavoriteBtn.querySelector('.action-count');
          if (iconEl) iconEl.textContent = newFavorited ? '❤️' : '🤍';
          if (countEl) countEl.textContent = data.favoriteCount;
        }
      }
      
      const danceInList = allDances.find(d => d.id === danceId);
      if (danceInList) {
        danceInList.isFavorited = !isFavorited;
        danceInList.favoriteCount = data.favoriteCount;
      }
      
      if (document.getElementById('profile-view').classList.contains('active')) {
        loadUserProfile();
      }
    } else {
      const data = await res.json();
      showToast(data.error || '操作失败', 'error');
    }
  } catch (e) {
    console.error('收藏操作失败:', e);
    showToast('操作失败', 'error');
  }
}

async function loadUserFavorites() {
  if (!currentUser) return [];
  try {
    const res = await fetch(`${API_BASE}/dances/user/${currentUser.id}/favorites`);
    return await res.json();
  } catch (e) {
    console.error('加载收藏列表失败:', e);
    return [];
  }
}

let currentShareDance = null;

async function openShareModal(danceId) {
  try {
    const res = await fetch(`${API_BASE}/dances/${danceId}`);
    const dance = await res.json();
    currentShareDance = dance;
    
    const dateObj = new Date(dance.date);
    const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
    
    document.getElementById('shareDanceInfo').innerHTML = `
      <div class="share-info-title">${dance.title}</div>
      <div class="share-info-meta">📅 ${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      <div class="share-info-meta">📍 ${dance.venue} · ${dance.city}</div>
    `;
    
    generateShareCard(dance);
    
    document.getElementById('shareModal').classList.add('active');
  } catch (e) {
    console.error('加载分享信息失败:', e);
    showToast('加载失败', 'error');
  }
}

function closeShareModal() {
  document.getElementById('shareModal').classList.remove('active');
  currentShareDance = null;
}

function generateShareCard(dance) {
  const canvas = document.getElementById('shareCanvas');
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(20, 20, width - 40, height - 40, 16);
  ctx.fill();
  
  ctx.fillStyle = '#667eea';
  ctx.beginPath();
  ctx.roundRect(20, 20, width - 40, 80, 16);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💃 莎莎舞舞会', width / 2, 55);
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Salsa Dance Party', width / 2, 78);
  
  const cardGradient = ctx.createLinearGradient(0, 120, 0, 180);
  cardGradient.addColorStop(0, '#ffecd2');
  cardGradient.addColorStop(1, '#fcb69f');
  ctx.fillStyle = cardGradient;
  ctx.beginPath();
  ctx.roundRect(40, 120, width - 80, 80, 12);
  ctx.fill();
  
  ctx.fillStyle = '#333';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  
  const titleX = 60;
  const titleY = 155;
  const maxTitleWidth = width - 120;
  let displayTitle = dance.title;
  if (ctx.measureText(displayTitle).width > maxTitleWidth) {
    while (ctx.measureText(displayTitle + '...').width > maxTitleWidth && displayTitle.length > 0) {
      displayTitle = displayTitle.slice(0, -1);
    }
    displayTitle += '...';
  }
  ctx.fillText(displayTitle, titleX, titleY);
  
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText(`${dance.city} · ${dance.venue}`, titleX, 180);
  
  const dateObj = new Date(dance.date);
  const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('📅 活动时间', 60, 240);
  
  ctx.fillStyle = '#333';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`${dateStr} ${weekDay}`, 60, 265);
  ctx.fillText(`${dance.startTime} - ${dance.endTime}`, 60, 288);
  
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('📍 活动地点', 60, 330);
  
  ctx.fillStyle = '#333';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  
  const addressX = 60;
  const addressY = 355;
  const maxAddressWidth = width - 120;
  let displayVenue = dance.venue;
  if (ctx.measureText(displayVenue).width > maxAddressWidth) {
    while (ctx.measureText(displayVenue + '...').width > maxAddressWidth && displayVenue.length > 0) {
      displayVenue = displayVenue.slice(0, -1);
    }
    displayVenue += '...';
  }
  ctx.fillText(displayVenue, addressX, addressY);
  
  let displayAddress = dance.address;
  if (ctx.measureText(displayAddress).width > maxAddressWidth) {
    while (ctx.measureText(displayAddress + '...').width > maxAddressWidth && displayAddress.length > 0) {
      displayAddress = displayAddress.slice(0, -1);
    }
    displayAddress += '...';
  }
  ctx.fillStyle = '#666';
  ctx.fillText(displayAddress, addressX, 378);
  
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('🎵 舞种风格', 60, 420);
  
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
  const styleColors = {
    'Cuban': '#ff6b6b',
    'LA': '#4ecdc4',
    'NY': '#45b7d1',
    'Bachata': '#96ceb4'
  };
  
  let styleX = 60;
  const styleY = 448;
  dance.styles.forEach((style, index) => {
    const color = styleColors[style] || '#667eea';
    ctx.fillStyle = color;
    ctx.beginPath();
    const textWidth = ctx.measureText(style).width + 20;
    ctx.roundRect(styleX, styleY - 18, textWidth, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(style, styleX + 10, styleY);
    styleX += textWidth + 10;
  });
  
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.roundRect(40, 480, width - 80, 60, 10);
  ctx.fill();
  
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('💰 票价', 60, 505);
  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`¥${dance.price}`, width - 60, 510);
  ctx.fillStyle = '#999';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('/人', width - 30, 510);
  
  ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
  ctx.beginPath();
  ctx.roundRect(40, height - 80, width - 80, 40, 8);
  ctx.fill();
  
  ctx.fillStyle = '#667eea';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('👁 浏览 ' + dance.viewCount + ' 次   |   👥 ' + dance.attendeeCount + ' 人参加', width / 2, height - 55);
}

function downloadShareCard() {
  if (!currentShareDance) {
    showToast('请先选择舞会', 'error');
    return;
  }
  
  const canvas = document.getElementById('shareCanvas');
  const link = document.createElement('a');
  link.download = `${currentShareDance.title}_分享卡片.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  showToast('图片已保存！', 'success');
}

function inviteToDance(danceId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  preselectedDanceId = danceId;
  const dance = allDances.find(d => d.id === danceId);
  closeModal();
  document.querySelector('.nav-btn[data-view="partners"]').click();
  if (dance) {
    showToast(`已选择「${dance.title}」，请选择舞伴发起邀约`, 'success');
  }
}

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`);
    const rawUsers = await res.json();
    allUsers = rawUsers.map(u => ({
      ...u,
      styles: normalizeStylesFrontend(u.styles)
    }));
    
    const select = document.getElementById('currentUserSelect');
    allUsers.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
      if (e.target.value) {
        currentUser = allUsers.find(u => u.id === parseInt(e.target.value));
        showToast(`已切换为 ${currentUser.name}`, 'success');
        if (currentUser.city && supportedCities.includes(currentUser.city)) {
          const citySelect = document.getElementById('citySelect');
          if (citySelect && citySelect.value !== currentUser.city) {
            citySelect.value = currentUser.city;
            currentCity = currentUser.city;
            const publishCitySelect = document.getElementById('publishCitySelect');
            if (publishCitySelect) publishCitySelect.value = currentCity;
          }
        }
        loadDances().then(() => {
          loadHotRanking();
          renderMapMarkers();
          if (document.getElementById('map-view').classList.contains('active')) {
            loadNearbyDances();
          }
        });
        populatePartnerDanceSelect();
        loadPartners();
        loadUnreadCount();
        if (document.getElementById('profile-view').classList.contains('active')) {
          loadUserProfile();
        }
      } else {
        currentUser = null;
        loadDances().then(() => {
          loadHotRanking();
          renderMapMarkers();
          if (document.getElementById('map-view').classList.contains('active')) {
            loadNearbyDances();
          }
        });
        populatePartnerDanceSelect();
        loadPartners();
        loadUnreadCount();
        if (document.getElementById('profile-view').classList.contains('active')) {
          loadUserProfile();
        }
      }
    });
  } catch (e) {
    console.error('加载用户失败:', e);
  }
}

async function loadPartners() {
  const danceFilter = document.getElementById('partnerDance').value;
  const style = document.getElementById('partnerStyle').value;
  const role = document.getElementById('partnerRole').value;
  const level = document.getElementById('partnerLevel').value;
  
  let url = `${API_BASE}/users`;
  const params = [];
  
  if (currentCity) params.push(`city=${currentCity}`);
  if (style) params.push(`style=${style}`);
  if (role) params.push(`role=${role}`);
  if (level) params.push(`level=${level}`);
  if (currentUser) params.push(`currentUserId=${currentUser.id}`);
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  try {
    const res = await fetch(url);
    let rawUsers = await res.json();
    let users = rawUsers.map(u => ({
      ...u,
      styles: normalizeStylesFrontend(u.styles)
    }));
    
    if (currentUser) {
      users = users.filter(u => u.id !== currentUser.id);
    }
    
    if (danceFilter && currentUser) {
      if (danceFilter === 'my-registered') {
        const myRegisteredDancesRes = await fetch(`${API_BASE}/dances/user/${currentUser.id}/registered`);
        const myRegisteredDances = await myRegisteredDancesRes.json();
        
        if (myRegisteredDances.length > 0) {
          const registeredUserIds = new Set();
          for (const dance of myRegisteredDances) {
            const danceUsersRes = await fetch(`${API_BASE}/dances/${dance.id}/registered-users`);
            const danceUsers = await danceUsersRes.json();
            danceUsers.forEach(u => {
              if (u.id !== currentUser.id) {
                registeredUserIds.add(u.id);
              }
            });
          }
          users = users.filter(u => registeredUserIds.has(u.id));
        } else {
          users = [];
        }
      } else if (danceFilter.startsWith('dance-')) {
        const danceId = parseInt(danceFilter.replace('dance-', ''));
        const danceUsersRes = await fetch(`${API_BASE}/dances/${danceId}/registered-users`);
        const danceUsers = await danceUsersRes.json();
        const danceUserIds = new Set(danceUsers.map(u => u.id));
        users = users.filter(u => danceUserIds.has(u.id) && u.id !== currentUser.id);
      }
    }
    
    users = users.map(u => ({
      ...u,
      matchScore: calculateMatchScore(u)
    })).sort((a, b) => b.matchScore - a.matchScore);
    
    renderPartners(users);
  } catch (e) {
    console.error('加载舞伴失败:', e);
  }
}

function calculateWeightedStyleMatchFrontend(currentStyles, candidateStyles) {
  const currentWeights = getStyleWeightMapFrontend(currentStyles);
  const candidateWeights = getStyleWeightMapFrontend(candidateStyles);
  
  const currentStyleNames = Object.keys(currentWeights);
  const candidateStyleNames = Object.keys(candidateWeights);
  
  const commonStyles = currentStyleNames.filter(s => candidateStyleNames.includes(s));
  
  if (commonStyles.length === 0) {
    return { score: 0, details: [] };
  }
  
  let weightedSum = 0;
  let details = [];
  
  commonStyles.forEach(styleName => {
    const cw = currentWeights[styleName];
    const pw = candidateWeights[styleName];
    const minWeight = Math.min(cw, pw);
    const maxWeight = Math.max(cw, pw);
    const styleMatch = (minWeight / maxWeight) * 100;
    weightedSum += styleMatch;
    details.push({
      style: styleName,
      currentWeight: cw,
      candidateWeight: pw,
      matchScore: Math.round(styleMatch)
    });
  });
  
  const totalPossible = currentStyleNames.length * 100;
  const finalScore = Math.round((weightedSum / totalPossible) * 100);
  
  return { score: finalScore, details };
}

function calculateMatchScore(user) {
  if (!currentUser) return 50;
  
  let score = 0;
  
  const styleMatch = calculateWeightedStyleMatchFrontend(currentUser.styles, user.styles);
  score += styleMatch.score * 0.5;
  
  const levelValues = { beginner: 1, intermediate: 2, advanced: 3 };
  const currentLevelVal = levelValues[currentUser.level] || 1;
  const userLevelVal = levelValues[user.level] || 1;
  const levelDiff = Math.abs(userLevelVal - currentLevelVal);
  const levelScore = (3 - levelDiff) * 25;
  score += levelScore;
  
  if (user.city === currentUser.city) {
    score += 20;
  }
  
  let targetRole = null;
  if (currentUser.role === 'leader') {
    targetRole = 'follower';
  } else if (currentUser.role === 'follower') {
    targetRole = 'leader';
  }
  if (targetRole && (user.role === targetRole || user.role === 'both')) {
    score += 5;
  }
  
  if (user.isMutualFollowing) {
    score += 10;
  } else if (user.isFollowing) {
    score += 5;
  }
  
  return Math.min(Math.round(score), 100);
}

async function smartMatch() {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/users/match/${currentUser.id}`);
    const data = await res.json();
    
    const normalizedMatches = data.matches.map(u => ({
      ...u,
      styles: normalizeStylesFrontend(u.styles)
    }));
    
    renderPartners(normalizedMatches);
    showToast('智能匹配完成！已按权重综合评分排序', 'success');
  } catch (e) {
    console.error('智能匹配失败:', e);
    showToast('匹配失败', 'error');
  }
}

function renderPartners(users) {
  const container = document.getElementById('partnersList');
  
  if (users.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">暂无符合条件的舞伴</div>';
    return;
  }
  
  container.innerHTML = users.map(user => createPartnerCard(user)).join('');
  
  container.querySelectorAll('.invite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userId = parseInt(btn.dataset.userId);
      openInviteModal(userId);
    });
  });
  
  container.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const userId = parseInt(btn.dataset.userId);
      const isFollowing = btn.dataset.following === 'true';
      
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      
      loadPartners();
    });
  });
  
  container.querySelectorAll('.message-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userId = parseInt(btn.dataset.userId);
      const userName = btn.dataset.userName;
      const userAvatar = btn.dataset.userAvatar;
      startConversationWithUser(userId, userName, userAvatar);
    });
  });
}

function createPartnerCard(user) {
  const roleText = { leader: '引带', follower: '跟随', both: '双修' }[user.role] || user.role;
  const levelText = { beginner: '入门', intermediate: '中级', advanced: '高级' }[user.level] || user.level;
  
  const styleTags = renderStyleTagsWithWeights(user.styles);
  
  const matchScore = user.matchScore || 50;
  
  let matchBreakdownHtml = '';
  if (user.matchBreakdown) {
    const bd = user.matchBreakdown;
    let styleDetailsHtml = '';
    if (bd.styleMatch && bd.styleMatch.details && bd.styleMatch.details.length > 0) {
      styleDetailsHtml = bd.styleMatch.details.map(d => 
        `<span class="match-style-detail">${d.style}: ${d.currentWeight}%↔${d.candidateWeight}% (${d.matchScore}%)</span>`
      ).join('');
    }
    matchBreakdownHtml = `
      <div class="match-breakdown">
        ${styleDetailsHtml}
        <div class="match-breakdown-item"><span>风格匹配</span><span>${bd.styleMatch ? bd.styleMatch.score : 0}分</span></div>
        <div class="match-breakdown-item"><span>水平匹配</span><span>${bd.levelMatch ? bd.levelMatch.score : 0}分</span></div>
        <div class="match-breakdown-item"><span>城市匹配</span><span>${bd.cityMatch ? bd.cityMatch.score : 0}分</span></div>
      </div>
    `;
  }
  
  let followBadge = '';
  if (user.isMutualFollowing) {
    followBadge = '<span class="follow-status-badge mutual">🤝 互相关注</span>';
  } else if (user.isFollowing) {
    followBadge = '<span class="follow-status-badge following">已关注</span>';
  }
  
  let followBtn = '';
  let messageBtn = '';
  if (currentUser) {
    const isFollowing = user.isFollowing ? 'true' : 'false';
    const btnClass = user.isFollowing ? 'following' : 'follow';
    const btnText = user.isFollowing ? '已关注' : '+ 关注';
    followBtn = `<button class="follow-btn ${btnClass}" data-user-id="${user.id}" data-following="${isFollowing}">${btnText}</button>`;
    messageBtn = `<button class="message-btn" data-user-id="${user.id}" data-user-name="${user.name}" data-user-avatar="${user.avatar}">💬 私信</button>`;
  }
  
  return `
    <div class="partner-card">
      <div class="partner-header">
        <div class="partner-avatar-container">
          <div class="partner-avatar">
            <img src="${user.avatar}" alt="${user.name}">
          </div>
          ${renderUserBadges(user.badges, 'small')}
        </div>
        <div class="partner-info">
          <h4>
            ${user.name}
            ${followBadge}
          </h4>
          <span class="role role-badge role-${user.role}">${roleText}</span>
          <span class="level-badge level-${user.level}">${levelText}</span>
        </div>
      </div>
      <div class="partner-details">
        <div>💃 舞龄: ${user.danceYears} 年</div>
        <div>🏙️ 城市: ${user.city}</div>
        <div class="dance-styles" style="margin-top:8px;">${styleTags}</div>
      </div>
      ${user.bio ? `<div class="partner-bio">${user.bio}</div>` : ''}
      <div class="match-score">
        <div class="match-score-bar">
          <div class="match-score-fill" style="width:${matchScore}%"></div>
        </div>
        <span class="match-score-text">${matchScore}%</span>
      </div>
      ${matchBreakdownHtml}
      <div class="partner-card-actions">
        <button class="invite-btn" data-user-id="${user.id}">发起邀约</button>
        ${messageBtn}
        ${followBtn}
      </div>
    </div>
  `;
}

async function loadHotRanking() {
  try {
    const params = new URLSearchParams({ limit: 5 });
    if (currentCity) params.set('city', currentCity);
    const res = await fetch(`${API_BASE}/dances/hot?${params.toString()}`);
    const dances = await res.json();
    
    const list = document.getElementById('hotRankingList');
    list.innerHTML = dances.map((dance, index) => `
      <li data-id="${dance.id}">
        <span class="ranking-title">${dance.title}</span>
        <span class="ranking-heat">🔥 ${dance.viewCount + dance.attendeeCount * 2}</span>
      </li>
    `).join('');
    
    list.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        const id = parseInt(li.dataset.id);
        document.querySelector('.nav-btn[data-view="calendar"]').click();
        showDanceDetail(id);
      });
    });
  } catch (e) {
    console.error('加载热度排行失败:', e);
  }
}

function initMap() {
  document.getElementById('mapMarkersContainer').addEventListener('click', (e) => {
    const marker = e.target.closest('.map-marker');
    if (marker) {
      const id = parseInt(marker.dataset.id);
      showDanceDetail(id);
    }
  });
  
  document.getElementById('refreshLocation').addEventListener('click', () => {
    showToast('已刷新位置', 'success');
    loadNearbyDances();
    renderMapMarkers();
  });
}

function renderMapMarkers() {
  const container = document.getElementById('mapMarkersContainer');
  if (!container) return;
  
  if (allDances.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  const lats = allDances.map(d => d.latitude);
  const lngs = allDances.map(d => d.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;
  
  const padding = 15;
  
  const icons = ['💃', '🎭', '☀️', '⭐', '🌴', '🎵', '🔥', '✨', '🌟', '💫'];
  
  container.innerHTML = allDances.map((dance, index) => {
    const top = padding + ((maxLat - dance.latitude) / latRange) * (100 - 2 * padding);
    const left = padding + ((dance.longitude - minLng) / lngRange) * (100 - 2 * padding);
    
    const icon = icons[index % icons.length];
    
    return `
      <div class="map-marker" data-id="${dance.id}" title="${dance.title}" style="top: ${top}%; left: ${left}%;">
        <span class="marker-icon">${icon}</span>
        <span class="marker-label">${dance.title}</span>
      </div>
    `;
  }).join('');
}

function loadNearbyDances() {
  const container = document.getElementById('nearbyDancesList');
  
  const dancesWithDistance = allDances.map((dance, index) => ({
    ...dance,
    distance: ((index + 1) * 0.8 + Math.random() * 2).toFixed(1)
  })).sort((a, b) => a.distance - b.distance);
  
  container.innerHTML = dancesWithDistance.map(dance => `
    <div class="nearby-item" data-id="${dance.id}">
      <h4>${dance.title}</h4>
      <p>${dance.venue}</p>
      <span class="nearby-distance">${dance.distance} km</span>
    </div>
  `).join('');
  
  container.querySelectorAll('.nearby-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      showDanceDetail(id);
    });
  });
}

function initPublishForm() {
  const form = document.getElementById('publishForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const styles = formData.getAll('styles');
    
    if (styles.length === 0) {
      showToast('请至少选择一个舞种', 'error');
      return;
    }
    
    const maxAttendees = formData.get('maxAttendees');
    const registrationDeadline = formData.get('registrationDeadline');
    const city = formData.get('city');
    
    const cityCoords = {
      '上海': { lat: 31.2304, lng: 121.4737 },
      '北京': { lat: 39.9042, lng: 116.4074 },
      '广州': { lat: 23.1291, lng: 113.2644 },
      '深圳': { lat: 22.5431, lng: 114.0579 },
      '成都': { lat: 30.5728, lng: 104.0668 },
      '杭州': { lat: 30.2741, lng: 120.1551 }
    };
    const coords = cityCoords[city] || { lat: 31.2304, lng: 121.4737 };
    
    const danceData = {
      title: formData.get('title'),
      venue: formData.get('venue'),
      address: formData.get('address'),
      city,
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      styles: styles,
      price: parseInt(formData.get('price')) || 0,
      description: formData.get('description'),
      organizer: formData.get('organizer'),
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
      latitude: coords.lat,
      longitude: coords.lng
    };
    
    try {
      const res = await fetch(`${API_BASE}/dances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(danceData)
      });
      
      if (res.ok) {
        showToast('舞会发布成功！', 'success');
        form.reset();
        loadDances();
        loadHotRanking();
        renderMapMarkers();
        document.querySelector('.nav-btn[data-view="calendar"]').click();
      } else {
        const data = await res.json();
        showToast(data.error || '发布失败', 'error');
      }
    } catch (e) {
      console.error('发布失败:', e);
      showToast('发布失败', 'error');
    }
  });
}

function initModals() {
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.querySelector('.close-invite-modal').addEventListener('click', closeInviteModal);
  document.querySelector('.close-share-modal').addEventListener('click', closeShareModal);
  
  document.getElementById('danceModal').addEventListener('click', (e) => {
    if (e.target.id === 'danceModal') closeModal();
  });
  
  document.getElementById('inviteModal').addEventListener('click', (e) => {
    if (e.target.id === 'inviteModal') closeInviteModal();
  });
  
  document.getElementById('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal') closeShareModal();
  });
  
  document.getElementById('inviteForm').addEventListener('submit', sendInvitation);
}

function populateInviteDanceSelect() {
  const select = document.getElementById('inviteDanceSelect');
  select.innerHTML = '<option value="">请选择舞会</option>';
  
  allDances.forEach(dance => {
    const option = document.createElement('option');
    option.value = dance.id;
    option.textContent = `${dance.title} (${dance.date})`;
    select.appendChild(option);
  });
}

function populatePartnerDanceSelect() {
  const select = document.getElementById('partnerDance');
  if (!select) return;
  
  const currentValue = select.value;
  select.innerHTML = `
    <option value="">全部舞会</option>
    <option value="my-registered">我已报名的舞会</option>
  `;
  
  const optgroup = document.createElement('optgroup');
  optgroup.label = '所有舞会';
  
  allDances.forEach(dance => {
    const option = document.createElement('option');
    option.value = `dance-${dance.id}`;
    option.textContent = `${dance.title} (${dance.date})`;
    optgroup.appendChild(option);
  });
  
  select.appendChild(optgroup);
  
  if (currentValue) {
    select.value = currentValue;
  }
}

function openInviteModal(userId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  inviteTargetUserId = userId;
  const targetUser = allUsers.find(u => u.id === userId);
  
  document.querySelector('#inviteModal h3').textContent = `邀约 ${targetUser.name} 跳舞`;
  
  populateInviteDanceSelect();
  if (preselectedDanceId) {
    const select = document.getElementById('inviteDanceSelect');
    select.value = preselectedDanceId;
    const selectedDance = allDances.find(d => d.id === preselectedDanceId);
    if (selectedDance) {
      showToast(`已预选「${selectedDance.title}」`, 'success');
    }
  }
  
  document.getElementById('inviteModal').classList.add('active');
}

function closeInviteModal() {
  document.getElementById('inviteModal').classList.remove('active');
  inviteTargetUserId = null;
}

async function sendInvitation(e) {
  e.preventDefault();
  
  if (!currentUser || !inviteTargetUserId) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  const formData = new FormData(e.target);
  const danceId = parseInt(formData.get('danceId'));
  
  if (!danceId) {
    showToast('请选择舞会', 'error');
    return;
  }
  
  const invitationData = {
    danceId,
    fromUserId: currentUser.id,
    toUserId: inviteTargetUserId,
    message: formData.get('message') || ''
  };
  
  try {
    const res = await fetch(`${API_BASE}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invitationData)
    });
    
    if (res.ok) {
      showToast('邀约发送成功！', 'success');
      closeInviteModal();
      e.target.reset();
      preselectedDanceId = null;
    } else {
      const data = await res.json();
      showToast(data.error || '发送失败', 'error');
    }
  } catch (e) {
    console.error('发送邀约失败:', e);
    showToast('发送失败', 'error');
  }
}

function initReviewModal() {
  document.querySelector('.close-review-modal').addEventListener('click', closeReviewModal);
  
  document.getElementById('reviewModal').addEventListener('click', (e) => {
    if (e.target.id === 'reviewModal') closeReviewModal();
  });
  
  document.querySelectorAll('.star-rating').forEach(container => {
    const stars = container.querySelectorAll('.star');
    const type = container.dataset.rating;
    const input = document.getElementById(`${type}Rating`);
    const label = container.querySelector('.rating-label');
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.value);
        input.value = value;
        
        stars.forEach((s, i) => {
          s.classList.remove('star-full', 'star-empty');
          if (i < value) {
            s.classList.add('star-full');
          } else {
            s.classList.add('star-empty');
          }
        });
        
        const labels = ['很差', '较差', '一般', '较好', '非常好'];
        label.textContent = `${value} 分 - ${labels[value - 1]}`;
      });
      
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.value);
        stars.forEach((s, i) => {
          s.classList.remove('star-full', 'star-empty', 'star-hover');
          if (i < value) {
            s.classList.add('star-hover');
          } else {
            s.classList.add('star-empty');
          }
        });
      });
      
      star.addEventListener('mouseleave', () => {
        const currentValue = parseInt(input.value) || 0;
        stars.forEach((s, i) => {
          s.classList.remove('star-full', 'star-empty', 'star-hover');
          if (i < currentValue) {
            s.classList.add('star-full');
          } else {
            s.classList.add('star-empty');
          }
        });
      });
    });
  });
  
  document.getElementById('reviewForm').addEventListener('submit', submitReview);
  
  document.querySelector('textarea[name="comment"]').addEventListener('input', (e) => {
    document.getElementById('commentCount').textContent = e.target.value.length;
  });
}

function openReviewModal(danceId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  const dance = allDances.find(d => d.id === danceId);
  if (!dance) {
    showToast('舞会不存在', 'error');
    return;
  }
  
  document.getElementById('reviewDanceId').value = danceId;
  document.getElementById('reviewDanceInfo').innerHTML = `
    <div class="review-dance-title">${dance.title}</div>
    <div class="review-dance-meta">${dance.date} | ${dance.venue}</div>
  `;
  
  ['venue', 'music', 'organization'].forEach(type => {
    document.getElementById(`${type}Rating`).value = '';
    const container = document.querySelector(`.star-rating[data-rating="${type}"]`);
    container.querySelectorAll('.star').forEach(s => {
      s.classList.remove('star-full', 'star-hover');
      s.classList.add('star-empty');
    });
    container.querySelector('.rating-label').textContent = '请选择评分';
  });
  
  const commentTextarea = document.querySelector('textarea[name="comment"]');
  commentTextarea.value = '';
  document.getElementById('commentCount').textContent = '0';
  
  document.getElementById('reviewModal').classList.add('active');
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
}

async function submitReview(e) {
  e.preventDefault();
  
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  const formData = new FormData(e.target);
  
  const venueRating = parseInt(formData.get('venueRating'));
  const musicRating = parseInt(formData.get('musicRating'));
  const organizationRating = parseInt(formData.get('organizationRating'));
  
  if (!venueRating || !musicRating || !organizationRating) {
    showToast('请完成所有评分', 'error');
    return;
  }
  
  const reviewData = {
    danceId: parseInt(formData.get('danceId')),
    userId: currentUser.id,
    venueRating,
    musicRating,
    organizationRating,
    comment: formData.get('comment')
  };
  
  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    
    if (res.ok) {
      showToast('评价提交成功！', 'success');
      closeReviewModal();
      closeModal();
      showDanceDetail(reviewData.danceId);
    } else {
      const data = await res.json();
      showToast(data.error || '提交失败', 'error');
    }
  } catch (e) {
    console.error('提交评价失败:', e);
    showToast('提交失败', 'error');
  }
}

async function loadUserProfile() {
  const container = document.getElementById('profileContent');
  
  if (!currentUser) {
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">请先选择身份</div>';
    return;
  }
  
  try {
    const [userRes, reviewsRes, favoritesRes, historyRes, statsRes, badgesRes] = await Promise.all([
      fetch(`${API_BASE}/users/${currentUser.id}?currentUserId=${currentUser.id}`),
      fetch(`${API_BASE}/reviews?userId=${currentUser.id}`),
      loadUserFavorites(),
      fetch(`${API_BASE}/users/${currentUser.id}/dance-history`),
      fetch(`${API_BASE}/users/${currentUser.id}/dance-stats`),
      fetch(`${API_BASE}/users/${currentUser.id}/badges`)
    ]);
    
    const userData = await userRes.json();
    currentUser = { ...currentUser, ...userData };
    const reviews = await reviewsRes.json();
    const favorites = favoritesRes;
    const danceHistory = await historyRes.json();
    const danceStats = await statsRes.json();
    const userBadges = await badgesRes.json();
    
    const followerCount = userData.followerCount || 0;
    const followingCount = userData.followingCount || 0;
    
    const roleText = { leader: '引带', follower: '跟随', both: '双修' }[currentUser.role] || currentUser.role;
    const levelText = { beginner: '入门', intermediate: '中级', advanced: '高级' }[currentUser.level] || currentUser.level;
    
    const styleTags = renderStyleTagsWithWeights(currentUser.styles);
    
    let reviewsHtml = '';
    if (reviews.length > 0) {
      reviewsHtml = `
        <div class="profile-section">
          <h3>📝 我的评价 (${reviews.length})</h3>
          <div class="profile-reviews-list">
            ${reviews.map(review => `
              <div class="profile-review-item" data-dance-id="${review.danceId}">
                <div class="profile-review-header">
                  <div class="profile-review-dance">
                    <h4>${review.dance.title}</h4>
                    <span class="profile-review-meta">${review.dance.date} | ${review.dance.venue}</span>
                  </div>
                  <div class="profile-review-date">${formatDate(new Date(review.createdAt))}</div>
                </div>
                <div class="profile-review-ratings">
                  <div class="review-rating-item">
                    <span>场地</span>
                    ${renderStars(review.venueRating)}
                  </div>
                  <div class="review-rating-item">
                    <span>音乐</span>
                    ${renderStars(review.musicRating)}
                  </div>
                  <div class="review-rating-item">
                    <span>组织</span>
                    ${renderStars(review.organizationRating)}
                  </div>
                </div>
                ${review.comment ? `<div class="profile-review-comment">${review.comment}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      reviewsHtml = `
        <div class="profile-section">
          <h3>📝 我的评价</h3>
          <div class="empty-state">
            <div class="empty-icon">💭</div>
            <p>还没有写过评价</p>
            <p class="empty-hint">参加完舞会后记得来写评价哦</p>
          </div>
        </div>
      `;
    }
    
    const topPartnersHtml = danceStats.topPartners && danceStats.topPartners.length > 0
      ? danceStats.topPartners.map((item, idx) => `
          <div class="top-partner-item">
            <div class="top-partner-rank rank-${idx + 1}">${idx + 1}</div>
            <img src="${item.partner.avatar}" alt="${item.partner.name}" class="top-partner-avatar">
            <div class="top-partner-info">
              <div class="top-partner-name">${item.partner.name}</div>
              <div class="top-partner-meta">共舞 ${item.count} 场 · ${item.totalSongs} 曲</div>
            </div>
          </div>
        `).join('')
      : `<div class="empty-mini">暂无数据</div>`;
    
    const topVenuesHtml = danceStats.topVenues && danceStats.topVenues.length > 0
      ? danceStats.topVenues.slice(0, 3).map((item, idx) => `
          <div class="top-venue-item">
            <div class="top-venue-rank rank-${idx + 1}">${idx + 1}</div>
            <div class="top-venue-info">
              <div class="top-venue-name">${item.venue}</div>
              <div class="top-venue-meta">${item.count} 次</div>
            </div>
          </div>
        `).join('')
      : `<div class="empty-mini">暂无数据</div>`;
    
    const statsPanelHtml = `
      <div class="profile-section stats-section">
        <h3>📊 舞蹈数据统计</h3>
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon">🎭</div>
            <div class="stat-number">${danceStats.totalAttended || 0}</div>
            <div class="stat-label">累计参加舞会</div>
          </div>
          <div class="stat-card stat-venue">
            <div class="stat-icon">🏠</div>
            <div class="stat-number">${danceStats.topVenue ? danceStats.topVenue.count : 0}</div>
            <div class="stat-label">最常去场馆</div>
            <div class="stat-sub">${danceStats.topVenue ? danceStats.topVenue.venue : '暂无'}</div>
          </div>
          <div class="stat-card stat-songs">
            <div class="stat-icon">🎵</div>
            <div class="stat-number">${danceStats.totalDancedSongs || 0}</div>
            <div class="stat-label">累计共舞曲数</div>
          </div>
        </div>
        <div class="stats-detail-grid">
          <div class="stats-detail-card">
            <h4>🤝 最常合作舞伴 Top3</h4>
            <div class="top-list">
              ${topPartnersHtml}
            </div>
          </div>
          <div class="stats-detail-card">
            <h4>📍 常去场馆排行</h4>
            <div class="top-list">
              ${topVenuesHtml}
            </div>
          </div>
        </div>
      </div>
    `;
    
    const timelineHtml = `
      <div class="profile-section timeline-section">
        <h3>👣 我的舞蹈足迹</h3>
        ${danceHistory && danceHistory.length > 0 ? `
          <div class="dance-timeline">
            ${danceHistory.map((dance, idx) => {
              const dateObj = new Date(dance.date);
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth() + 1;
              const day = dateObj.getDate();
              const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
              const styleTags = dance.styles.map(s => 
                `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
              ).join('');
              const partnersHtml = dance.partners && dance.partners.length > 0
                ? dance.partners.map(p => `
                    <div class="dance-partner" title="${p.name} · 共舞${p.dancedSongs}曲">
                      <img src="${p.avatar}" alt="${p.name}">
                      <span class="partner-tooltip">${p.name}</span>
                    </div>
                  `).join('')
                : '<span class="no-partner">暂无记录</span>';
              const danceStylesHtml = dance.partners && dance.partners.length > 0
                ? dance.partners.map(p => `<span class="partner-style">${p.name}: ${p.styles.join('、')}</span>`).join('')
                : '<span class="no-partner">暂无</span>';
              
              return `
                <div class="timeline-item" data-dance-id="${dance.id}">
                  <div class="timeline-dot"></div>
                  <div class="timeline-date">
                    <div class="date-year">${year}</div>
                    <div class="date-day">${month}月${day}日</div>
                    <div class="date-week">${weekDay}</div>
                  </div>
                  <div class="timeline-card">
                    <div class="timeline-card-header">
                      <h4>${dance.title}</h4>
                      <div class="timeline-time">${dance.startTime} - ${dance.endTime}</div>
                    </div>
                    <div class="timeline-card-body">
                      <div class="info-row">
                        <span class="info-icon">📍</span>
                        <span class="info-text">${dance.venue}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-icon">💰</span>
                        <span class="info-text">¥${dance.price}</span>
                      </div>
                      <div class="info-row styles-row">
                        <span class="info-icon">💃</span>
                        <div class="info-styles">${styleTags}</div>
                      </div>
                      <div class="info-row">
                        <span class="info-icon">🩰</span>
                        <div class="info-text">跳过的舞种：${danceStylesHtml}</div>
                      </div>
                      <div class="info-row partners-row">
                        <span class="info-icon">🤝</span>
                        <div class="info-text">
                          <span class="partners-label">邀约舞伴：</span>
                          <div class="partners-list">${partnersHtml}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-icon">👣</div>
            <p>还没有舞蹈足迹</p>
            <p class="empty-hint">报名参加舞会并签到后，你的舞蹈足迹会出现在这里</p>
          </div>
        `}
      </div>
    `;
    
    container.innerHTML = `
      <div class="profile-edit-section">
        <button class="profile-edit-btn" onclick="openEditProfileModal()">✏️ 编辑资料</button>
      </div>
      <div class="profile-header">
        <div class="profile-avatar-container">
          <div class="profile-avatar-large">
            <img src="${currentUser.avatar}" alt="${currentUser.name}">
          </div>
          ${renderUserBadges(userBadges, 'medium')}
        </div>
        <div class="profile-info">
          <div class="profile-info-header">
            <h2>${currentUser.name}</h2>
          </div>
          <div class="profile-tags">
            <span class="role-badge role-${currentUser.role}">${roleText}</span>
            <span class="level-badge level-${currentUser.level}">${levelText}</span>
          </div>
          <div class="profile-stats">
            <div class="profile-stat">
              <span class="stat-value">${currentUser.danceYears}</span>
              <span class="stat-label">舞龄</span>
            </div>
            <div class="profile-stat follow-stat" id="followingStat">
              <span class="stat-value">${followingCount}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="profile-stat follow-stat" id="followersStat">
              <span class="stat-value">${followerCount}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="profile-stat">
              <span class="stat-value">${reviews.length}</span>
              <span class="stat-label">评价</span>
            </div>
            <div class="profile-stat">
              <span class="stat-value">${favorites.length}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="profile-stat">
              <span class="stat-value">${currentUser.city}</span>
              <span class="stat-label">城市</span>
            </div>
          </div>
          <div class="profile-styles">
            <span class="info-label">擅长舞种 (带熟练度权重)：</span>
            ${styleTags}
          </div>
          ${currentUser.bio ? `<div class="profile-bio">${currentUser.bio}</div>` : ''}
        </div>
      </div>
      ${statsPanelHtml}
      
      <div class="profile-section badges-section">
        <h3>🏆 我的成就徽章 (${userBadges.length})</h3>
        ${renderBadgesList(userBadges)}
      </div>
      
      ${timelineHtml}
      
      <div class="profile-follow-section">
        <h3>👥 社交关系</h3>
        <div class="follow-tabs">
          <button class="follow-tab active" data-tab="following">关注的人 (${followingCount})</button>
          <button class="follow-tab" data-tab="followers">粉丝 (${followerCount})</button>
        </div>
        <div id="followListContent"></div>
      </div>
      
      <div class="profile-activity-section">
        <h3>📋 我的活动</h3>
        <div class="activity-tabs">
          <button class="activity-tab active" data-tab="favorites">我的收藏 (${favorites.length})</button>
          <button class="activity-tab" data-tab="reviews">我的评价 (${reviews.length})</button>
        </div>
        <div id="activityListContent"></div>
      </div>
    `;
    
    document.querySelectorAll('.follow-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchFollowTab(currentUser.id, tab.dataset.tab);
      });
    });
    
    switchFollowTab(currentUser.id, 'following');
    
    document.querySelectorAll('.activity-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchActivityTab(tab.dataset.tab, favorites, reviews);
      });
    });
    
    switchActivityTab('favorites', favorites, reviews);
    
    container.querySelectorAll('.profile-review-item').forEach(item => {
      item.addEventListener('click', () => {
        const danceId = parseInt(item.dataset.danceId);
        document.querySelector('.nav-btn[data-view="calendar"]').click();
        showDanceDetail(danceId);
      });
    });
    
    container.querySelectorAll('.timeline-item').forEach(item => {
      item.addEventListener('click', () => {
        const danceId = parseInt(item.dataset.danceId);
        if (danceId) {
          document.querySelector('.nav-btn[data-view="calendar"]').click();
          showDanceDetail(danceId);
        }
      });
    });
    
  } catch (e) {
    console.error('加载用户资料失败:', e);
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">加载失败，请重试</div>';
  }
}

async function followUser(userId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return false;
  }
  
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId: currentUser.id })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.isMutualFollowing) {
        showToast('关注成功！已互相关注 🎉', 'success');
      } else {
        showToast('关注成功！', 'success');
      }
      return true;
    } else {
      const data = await res.json();
      showToast(data.error || '关注失败', 'error');
      return false;
    }
  } catch (e) {
    console.error('关注失败:', e);
    showToast('关注失败', 'error');
    return false;
  }
}

async function unfollowUser(userId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return false;
  }
  
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId: currentUser.id })
    });
    
    if (res.ok) {
      showToast('已取消关注', 'success');
      return true;
    } else {
      const data = await res.json();
      showToast(data.error || '取消关注失败', 'error');
      return false;
    }
  } catch (e) {
    console.error('取消关注失败:', e);
    showToast('取消关注失败', 'error');
    return false;
  }
}

async function loadFollowList(userId, type) {
  if (!currentUser) return [];
  
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/${type}?currentUserId=${currentUser.id}`);
    return await res.json();
  } catch (e) {
    console.error(`加载${type === 'followers' ? '粉丝' : '关注'}列表失败:`, e);
    return [];
  }
}

function renderFollowList(users, type) {
  if (users.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${type === 'followers' ? '👥' : '💫'}</div>
        <p>还没有${type === 'followers' ? '粉丝' : '关注的人'}</p>
      </div>
    `;
  }
  
  return `
    <div class="follow-list">
      ${users.map(user => {
        const roleText = { leader: '引带', follower: '跟随', both: '双修' }[user.role] || user.role;
        let badge = '';
        if (user.isMutualFollowing) {
          badge = '<span class="follow-status-badge mutual">互相关注</span>';
        } else if (user.isFollowing) {
          badge = '<span class="follow-status-badge following">已关注</span>';
        }
        
        let btn = '';
        if (currentUser && user.id !== currentUser.id) {
          const isFollowing = user.isFollowing ? 'true' : 'false';
          const btnClass = user.isFollowing ? 'following' : 'follow';
          const btnText = user.isFollowing ? '已关注' : '+ 关注';
          btn = `<button class="follow-btn ${btnClass}" data-user-id="${user.id}" data-following="${isFollowing}">${btnText}</button>`;
        }
        
        return `
          <div class="follow-user-item">
            <div class="follow-user-avatar">
              <img src="${user.avatar}" alt="${user.name}">
            </div>
            <div class="follow-user-info">
              <div class="name">${user.name} ${badge}</div>
              <div class="meta">${roleText} · ${user.danceYears}年舞龄</div>
            </div>
            ${btn}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function switchFollowTab(userId, tabType) {
  const tabs = document.querySelectorAll('.follow-tab');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabType));
  
  const container = document.getElementById('followListContent');
  if (!container) return;
  
  const users = await loadFollowList(userId, tabType);
  container.innerHTML = renderFollowList(users, tabType);
  
  container.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const targetUserId = parseInt(btn.dataset.userId);
      const isFollowing = btn.dataset.following === 'true';
      
      if (isFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId);
      }
      
      switchFollowTab(userId, tabType);
      if (document.getElementById('profile-view').classList.contains('active')) {
        loadUserProfile();
      }
    });
  });
}

function switchActivityTab(tabType, favorites, reviews) {
  const tabs = document.querySelectorAll('.activity-tab');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabType));
  
  const container = document.getElementById('activityListContent');
  if (!container) return;
  
  if (tabType === 'favorites') {
    container.innerHTML = renderFavoritesList(favorites);
  } else {
    container.innerHTML = renderReviewsList(reviews);
  }
  
  container.querySelectorAll('.favorite-item').forEach(item => {
    item.addEventListener('click', () => {
      const danceId = parseInt(item.dataset.danceId);
      document.querySelector('.nav-btn[data-view="calendar"]').click();
      showDanceDetail(danceId);
    });
  });
  
  container.querySelectorAll('.profile-review-item').forEach(item => {
    item.addEventListener('click', () => {
      const danceId = parseInt(item.dataset.danceId);
      document.querySelector('.nav-btn[data-view="calendar"]').click();
      showDanceDetail(danceId);
    });
  });
  
  container.querySelectorAll('.unfavorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const danceId = parseInt(btn.dataset.danceId);
      await toggleFavorite(danceId, btn);
    });
  });
}

function renderFavoritesList(favorites) {
  if (favorites.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">❤️</div>
        <p>还没有收藏任何舞会</p>
        <p class="empty-hint">看到感兴趣的舞会点击收藏按钮吧</p>
      </div>
    `;
  }
  
  return `
    <div class="favorites-list">
      ${favorites.map(dance => {
        const dateObj = new Date(dance.date);
        const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
        const styleTags = dance.styles.map(s => 
          `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
        ).join('');
        
        return `
          <div class="favorite-item" data-dance-id="${dance.id}">
            <div class="favorite-item-header">
              <h4>${dance.title}</h4>
              <button class="unfavorite-btn" data-dance-id="${dance.id}" data-favorited="true">
                ❤️ 取消收藏
              </button>
            </div>
            <div class="favorite-item-meta">
              <span>📅 ${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</span>
              <span>📍 ${dance.venue}</span>
              <span>💰 ¥${dance.price}</span>
            </div>
            <div class="favorite-item-styles">${styleTags}</div>
            <div class="favorite-item-footer">
              <span>👁 ${dance.viewCount} 浏览</span>
              <span>👥 ${dance.attendeeCount} 人参加</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderReviewsList(reviews) {
  if (reviews.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">💭</div>
        <p>还没有写过评价</p>
        <p class="empty-hint">参加完舞会后记得来写评价哦</p>
      </div>
    `;
  }
  
  return `
    <div class="profile-reviews-list">
      ${reviews.map(review => `
        <div class="profile-review-item" data-dance-id="${review.danceId}">
          <div class="profile-review-header">
            <div class="profile-review-dance">
              <h4>${review.dance.title}</h4>
              <span class="profile-review-meta">${review.dance.date} | ${review.dance.venue}</span>
            </div>
            <div class="profile-review-date">${formatDate(new Date(review.createdAt))}</div>
          </div>
          <div class="profile-review-ratings">
            <div class="review-rating-item">
              <span>场地</span>
              ${renderStars(review.venueRating)}
            </div>
            <div class="review-rating-item">
              <span>音乐</span>
              ${renderStars(review.musicRating)}
            </div>
            <div class="review-rating-item">
              <span>组织</span>
              ${renderStars(review.organizationRating)}
            </div>
          </div>
          ${review.comment ? `<div class="profile-review-comment">${review.comment}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function initNotifications() {
  const bell = document.getElementById('notificationBell');
  const dropdown = document.getElementById('notificationDropdown');
  const readAllBtn = document.getElementById('readAllBtn');
  
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('请先选择身份', 'error');
      return;
    }
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
      loadNotifications();
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
  
  readAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    markAllNotificationsRead();
  });
}

async function loadUnreadCount() {
  if (!currentUser) {
    const badge = document.getElementById('notificationBadge');
    badge.style.display = 'none';
    const msgNavBadge = document.getElementById('msgNavBadge');
    if (msgNavBadge) msgNavBadge.style.display = 'none';
    return;
  }
  
  try {
    const [notifRes, msgRes] = await Promise.all([
      fetch(`${API_BASE}/notifications/unread-count?userId=${currentUser.id}`),
      fetch(`${API_BASE}/messages/unread-count?userId=${currentUser.id}`)
    ]);
    const notifData = await notifRes.json();
    const msgData = await msgRes.json();
    
    updateNotificationBadge(notifData.count);
    updateMessageNavBadge(msgData.count);
    
    if (msgData.count > 0) {
      showMessageToast(msgData.count);
    }
  } catch (e) {
    console.error('加载未读数量失败:', e);
  }
}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notificationBadge');
  if (count > 0) {
    badge.style.display = 'flex';
    badge.textContent = count > 99 ? '99+' : count;
  } else {
    badge.style.display = 'none';
  }
}

function updateMessageNavBadge(count) {
  const badge = document.getElementById('msgNavBadge');
  if (!badge) return;
  if (count > 0) {
    badge.style.display = 'inline-flex';
    badge.textContent = count > 99 ? '99+' : count;
  } else {
    badge.style.display = 'none';
  }
}

async function loadNotifications() {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`${API_BASE}/notifications?userId=${currentUser.id}&limit=20`);
    const notifications = await res.json();
    renderNotifications(notifications);
  } catch (e) {
    console.error('加载通知失败:', e);
  }
}

function renderNotifications(notifications) {
  const container = document.getElementById('notificationList');
  
  if (notifications.length === 0) {
    container.innerHTML = '<div class="notification-empty">暂无通知</div>';
    return;
  }
  
  container.innerHTML = notifications.map(n => {
    const iconClass = n.type === 'invitation_accepted' ? 'accepted' : 'rejected';
    const icon = n.type === 'invitation_accepted' ? '✅' : '❌';
    const unreadClass = !n.isRead ? 'unread' : '';
    const timeStr = formatNotificationTime(n.createdAt);
    
    return `
      <div class="notification-item ${unreadClass}" data-id="${n.id}">
        <div class="notification-icon ${iconClass}">${icon}</div>
        <div class="notification-content">
          <div class="notification-title">${n.title}</div>
          <div class="notification-text">${n.content}</div>
          <div class="notification-time">${timeStr}</div>
        </div>
        ${!n.isRead ? `<button class="notification-mark-read" data-id="${n.id}" title="标记已读">✓</button>` : ''}
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-mark-read')) return;
      const id = parseInt(item.dataset.id);
      handleNotificationClick(id);
    });
  });
  
  container.querySelectorAll('.notification-mark-read').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      markNotificationRead(id);
    });
  });
}

function formatNotificationTime(createdAt) {
  const now = new Date();
  const date = new Date(createdAt);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

async function markNotificationRead(notificationId) {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    if (res.ok) {
      loadNotifications();
      loadUnreadCount();
    }
  } catch (e) {
    console.error('标记已读失败:', e);
  }
}

async function markAllNotificationsRead() {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    if (res.ok) {
      loadNotifications();
      loadUnreadCount();
      showToast('已全部标记为已读', 'success');
    }
  } catch (e) {
    console.error('全部已读失败:', e);
  }
}

function handleNotificationClick(notificationId) {
  markNotificationRead(notificationId);
}

function refreshNotifications() {
  loadUnreadCount();
  const dropdown = document.getElementById('notificationDropdown');
  if (dropdown.classList.contains('active')) {
    loadNotifications();
  }
}

function initEditProfileModal() {
  document.querySelector('.close-edit-profile-modal').addEventListener('click', closeEditProfileModal);
  
  document.getElementById('editProfileModal').addEventListener('click', (e) => {
    if (e.target.id === 'editProfileModal') closeEditProfileModal();
  });
  
  document.getElementById('editProfileForm').addEventListener('submit', saveProfile);
}

function renderStyleWeightEditor() {
  const container = document.getElementById('styleWeightEditor');
  if (!container) return;
  
  const userWeights = getStyleWeightMapFrontend(currentUser ? currentUser.styles : []);
  
  container.innerHTML = ALL_DANCE_STYLES.map(styleName => {
    const isChecked = styleName in userWeights;
    const weight = userWeights[styleName] || 50;
    
    return `
      <div class="style-item-row">
        <label class="style-checkbox-label">
          <input type="checkbox" class="style-weight-checkbox" data-style="${styleName}" ${isChecked ? 'checked' : ''}>
          <span>${styleName} 风格</span>
        </label>
        <div class="weight-slider-container" data-style-container="${styleName}" style="${isChecked ? '' : 'display:none;'}">
          <input type="range" min="0" max="100" value="${weight}" 
                 class="style-weight-slider" data-style-slider="${styleName}">
          <span class="weight-display" data-style-weight="${styleName}">${weight}%</span>
        </div>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.style-weight-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const styleName = e.target.dataset.style;
      const sliderContainer = container.querySelector(`[data-style-container="${styleName}"]`);
      if (sliderContainer) {
        sliderContainer.style.display = e.target.checked ? 'flex' : 'none';
      }
    });
  });
  
  container.querySelectorAll('.style-weight-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const styleName = e.target.dataset.styleSlider;
      const weightDisplay = container.querySelector(`[data-style-weight="${styleName}"]`);
      if (weightDisplay) {
        weightDisplay.textContent = `${e.target.value}%`;
      }
    });
  });
}

function openEditProfileModal() {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  document.getElementById('editName').value = currentUser.name || '';
  document.getElementById('editDanceYears').value = currentUser.danceYears || 0;
  document.getElementById('editRole').value = currentUser.role || 'leader';
  document.getElementById('editLevel').value = currentUser.level || 'beginner';
  document.getElementById('editCity').value = currentUser.city || '';
  document.getElementById('editBio').value = currentUser.bio || '';
  
  renderStyleWeightEditor();
  
  document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').classList.remove('active');
}

async function saveProfile(e) {
  e.preventDefault();
  
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const danceYears = parseInt(formData.get('danceYears')) || 0;
  const role = formData.get('role');
  const level = formData.get('level');
  const city = formData.get('city');
  const bio = formData.get('bio');
  
  const editor = document.getElementById('styleWeightEditor');
  const styles = [];
  editor.querySelectorAll('.style-weight-checkbox').forEach(checkbox => {
    if (checkbox.checked) {
      const styleName = checkbox.dataset.style;
      const slider = editor.querySelector(`[data-style-slider="${styleName}"]`);
      const weight = slider ? parseInt(slider.value) : 50;
      styles.push({ name: styleName, weight });
    }
  });
  
  if (styles.length === 0) {
    showToast('请至少选择一个擅长舞种', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        danceYears,
        role,
        level,
        city,
        bio,
        styles
      })
    });
    
    if (res.ok) {
      const updatedUser = await res.json();
      currentUser = updatedUser;
      
      const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
      }
      
      const select = document.getElementById('currentUserSelect');
      const option = select.querySelector(`option[value="${currentUser.id}"]`);
      if (option) {
        option.textContent = currentUser.name;
      }
      
      closeEditProfileModal();
      showToast('资料更新成功！', 'success');
      loadUserProfile();
      loadPartners();
    } else {
      const data = await res.json();
      showToast(data.error || '更新失败', 'error');
    }
  } catch (e) {
    console.error('更新资料失败:', e);
    showToast('更新失败', 'error');
  }
}

let currentDanceId = null;
let currentCommentSort = 'time';

async function loadDanceComments(danceId, sort = 'time') {
  try {
    const res = await fetch(`${API_BASE}/comments/dance/${danceId}?sort=${sort}`);
    return await res.json();
  } catch (e) {
    console.error('加载评论失败:', e);
    return { comments: [], totalCount: 0 };
  }
}

function renderCommentsSection(danceId, commentData) {
  const { comments, totalCount } = commentData;
  
  let commentFormHtml = '';
  if (currentUser) {
    commentFormHtml = `
      <div class="comment-form" id="mainCommentForm">
        <div class="comment-form-header">
          <img src="${currentUser.avatar}" alt="${currentUser.name}" class="comment-form-avatar">
          <span class="comment-form-name">${currentUser.name}</span>
        </div>
        <textarea id="mainCommentTextarea" placeholder="分享你的想法..." maxlength="500"></textarea>
        <div class="comment-form-footer">
          <span class="comment-form-char-count"><span id="mainCommentCharCount">0</span>/500</span>
          <button class="comment-submit-btn" id="mainCommentSubmitBtn" disabled>发表评论</button>
        </div>
      </div>
    `;
  } else {
    commentFormHtml = `<div class="login-hint">💡 请先在右上角选择身份后发表评论</div>`;
  }
  
  let commentsListHtml = '';
  if (comments.length === 0) {
    commentsListHtml = `
      <div class="no-comments">
        <div class="no-comments-icon">💬</div>
        <p>暂无评论，快来发表第一条评论吧！</p>
      </div>
    `;
  } else {
    commentsListHtml = `<div class="comments-list">${comments.map(c => renderCommentItem(c, danceId)).join('')}</div>`;
  }
  
  return `
    <div class="comments-section" id="commentsSection">
      <div class="comments-section-header">
        <h4>💬 评论互动 (${totalCount})</h4>
        <select class="comment-sort-select" id="commentSortSelect">
          <option value="time" ${currentCommentSort === 'time' ? 'selected' : ''}>按时间排序</option>
          <option value="hot" ${currentCommentSort === 'hot' ? 'selected' : ''}>按热度排序</option>
        </select>
      </div>
      ${commentFormHtml}
      ${commentsListHtml}
    </div>
  `;
}

function renderCommentItem(comment, danceId) {
  const isOwner = currentUser && currentUser.id === comment.userId;
  const replyToHtml = comment.replyToUser 
    ? `<span class="comment-reply-to">@${comment.replyToUser.name}</span>`
    : '';
  
  let deleteBtn = '';
  if (isOwner) {
    deleteBtn = `<button class="comment-action-btn delete-btn" data-comment-id="${comment.id}" title="删除">🗑 删除</button>`;
  }
  
  let replyBtn = '';
  if (currentUser) {
    replyBtn = `<button class="comment-action-btn reply-btn" data-comment-id="${comment.id}" data-user-id="${comment.userId}" data-user-name="${comment.user.name}">💬 回复</button>`;
  }
  
  const repliesHtml = comment.replies && comment.replies.length > 0
    ? `<div class="replies-list">${comment.replies.map(reply => renderReplyItem(reply, danceId, comment.id)).join('')}</div>`
    : '';
  
  return `
    <div class="comment-item" data-comment-id="${comment.id}">
      <div class="comment-header">
        <img src="${comment.user.avatar}" alt="${comment.user.name}" class="comment-avatar">
        <div class="comment-user-info">
          <div class="comment-user-name">${comment.user.name}</div>
          <div class="comment-meta">${formatNotificationTime(comment.createdAt)}</div>
        </div>
      </div>
      <div class="comment-content">${replyToHtml}${escapeHtml(comment.content)}</div>
      <div class="comment-actions">
        <button class="comment-action-btn like-btn" data-comment-id="${comment.id}">
          ❤️ <span class="comment-like-count">${comment.likeCount}</span>
        </button>
        ${replyBtn}
        ${deleteBtn}
      </div>
      ${repliesHtml}
      <div class="reply-form-container" id="replyFormContainer-${comment.id}"></div>
    </div>
  `;
}

function renderReplyItem(reply, danceId, parentCommentId) {
  const isOwner = currentUser && currentUser.id === reply.userId;
  const replyToHtml = reply.replyToUser 
    ? `<span class="comment-reply-to">@${reply.replyToUser.name}</span>`
    : '';
  
  let deleteBtn = '';
  if (isOwner) {
    deleteBtn = `<button class="comment-action-btn delete-btn" data-comment-id="${reply.id}" title="删除">🗑 删除</button>`;
  }
  
  let replyBtn = '';
  if (currentUser) {
    replyBtn = `<button class="comment-action-btn reply-btn" data-comment-id="${parentCommentId}" data-user-id="${reply.userId}" data-user-name="${reply.user.name}">💬 回复</button>`;
  }
  
  return `
    <div class="reply-item" data-comment-id="${reply.id}">
      <div class="comment-header">
        <img src="${reply.user.avatar}" alt="${reply.user.name}" class="comment-avatar">
        <div class="comment-user-info">
          <div class="comment-user-name">${reply.user.name}</div>
          <div class="comment-meta">${formatNotificationTime(reply.createdAt)}</div>
        </div>
      </div>
      <div class="comment-content">${replyToHtml}${escapeHtml(reply.content)}</div>
      <div class="comment-actions">
        <button class="comment-action-btn like-btn" data-comment-id="${reply.id}">
          ❤️ <span class="comment-like-count">${reply.likeCount}</span>
        </button>
        ${replyBtn}
        ${deleteBtn}
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function bindCommentEvents(danceId) {
  const sortSelect = document.getElementById('commentSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', async (e) => {
      currentCommentSort = e.target.value;
      await refreshComments(danceId);
    });
  }
  
  const textarea = document.getElementById('mainCommentTextarea');
  const submitBtn = document.getElementById('mainCommentSubmitBtn');
  const charCount = document.getElementById('mainCommentCharCount');
  
  if (textarea && submitBtn) {
    textarea.addEventListener('input', () => {
      const length = textarea.value.trim().length;
      charCount.textContent = length;
      submitBtn.disabled = length === 0 || length > 500;
    });
    
    submitBtn.addEventListener('click', async () => {
      await submitMainComment(danceId);
    });
  }
  
  document.querySelectorAll('.comment-action-btn.reply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const commentId = parseInt(btn.dataset.commentId);
      const replyToUserId = parseInt(btn.dataset.userId);
      const replyToUserName = btn.dataset.userName;
      toggleReplyForm(commentId, replyToUserId, replyToUserName, danceId);
    });
  });
  
  document.querySelectorAll('.comment-action-btn.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const commentId = parseInt(btn.dataset.commentId);
      await deleteComment(commentId, danceId);
    });
  });
  
  document.querySelectorAll('.comment-action-btn.like-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const commentId = parseInt(btn.dataset.commentId);
      await likeComment(commentId, btn);
    });
  });
}

function toggleReplyForm(commentId, replyToUserId, replyToUserName, danceId) {
  const containerId = `replyFormContainer-${commentId}`;
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (container.innerHTML) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = `
    <div class="reply-form">
      <textarea id="replyTextarea-${commentId}" placeholder="回复 @${replyToUserName}..." maxlength="500"></textarea>
      <div class="reply-form-footer">
        <button class="reply-cancel-btn" data-comment-id="${commentId}">取消</button>
        <button class="reply-submit-btn" data-comment-id="${commentId}" data-reply-to-user-id="${replyToUserId}" disabled>回复</button>
      </div>
    </div>
  `;
  
  const textarea = document.getElementById(`replyTextarea-${commentId}`);
  const submitBtn = container.querySelector('.reply-submit-btn');
  
  textarea.addEventListener('input', () => {
    submitBtn.disabled = textarea.value.trim().length === 0;
  });
  
  container.querySelector('.reply-cancel-btn').addEventListener('click', () => {
    container.innerHTML = '';
  });
  
  submitBtn.addEventListener('click', async () => {
    await submitReply(danceId, commentId, replyToUserId, textarea.value.trim());
  });
  
  textarea.focus();
}

async function submitMainComment(danceId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  const textarea = document.getElementById('mainCommentTextarea');
  const content = textarea.value.trim();
  
  if (!content) {
    showToast('评论内容不能为空', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        danceId,
        userId: currentUser.id,
        content
      })
    });
    
    if (res.ok) {
      showToast('评论发表成功！', 'success');
      await refreshComments(danceId);
    } else {
      const data = await res.json();
      showToast(data.error || '发表失败', 'error');
    }
  } catch (e) {
    console.error('发表评论失败:', e);
    showToast('发表失败', 'error');
  }
}

async function submitReply(danceId, parentCommentId, replyToUserId, content) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  if (!content) {
    showToast('回复内容不能为空', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        danceId,
        userId: currentUser.id,
        content,
        parentId: parentCommentId,
        replyToUserId
      })
    });
    
    if (res.ok) {
      showToast('回复成功！', 'success');
      await refreshComments(danceId);
    } else {
      const data = await res.json();
      showToast(data.error || '回复失败', 'error');
    }
  } catch (e) {
    console.error('回复失败:', e);
    showToast('回复失败', 'error');
  }
}

async function deleteComment(commentId, danceId) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  if (!confirm('确定要删除这条评论吗？')) {
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    if (res.ok) {
      showToast('删除成功', 'success');
      await refreshComments(danceId);
    } else {
      const data = await res.json();
      showToast(data.error || '删除失败', 'error');
    }
  } catch (e) {
    console.error('删除评论失败:', e);
    showToast('删除失败', 'error');
  }
}

async function likeComment(commentId, btn) {
  try {
    const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'POST'
    });
    
    if (res.ok) {
      const data = await res.json();
      const likeCountSpan = btn.querySelector('.comment-like-count');
      if (likeCountSpan) {
        likeCountSpan.textContent = data.likeCount;
      }
      btn.classList.add('liked');
    }
  } catch (e) {
    console.error('点赞失败:', e);
  }
}

async function refreshComments(danceId) {
  const commentData = await loadDanceComments(danceId, currentCommentSort);
  const commentsSection = document.getElementById('commentsSection');
  if (commentsSection) {
    commentsSection.outerHTML = renderCommentsSection(danceId, commentData);
    bindCommentEvents(danceId);
  }
}

let currentConversationId = null;
let currentChatUser = null;
let messagePollingTimer = null;

async function loadConversations() {
  if (!currentUser) {
    const container = document.getElementById('conversationList');
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">请先选择身份查看私信</div>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/messages/conversations?userId=${currentUser.id}`);
    const conversations = await res.json();
    renderConversations(conversations);
    startMessagePolling();
  } catch (e) {
    console.error('加载会话列表失败:', e);
  }
}

function renderConversations(conversations) {
  const container = document.getElementById('conversationList');

  if (conversations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💌</div>
        <p>暂无私信</p>
        <p class="empty-hint">从舞伴列表中找人开始聊天吧！</p>
      </div>
    `;
    return;
  }

  container.innerHTML = conversations.map(conv => {
    const timeStr = formatNotificationTime(conv.lastMessageTime);
    const unreadBadge = conv.unreadCount > 0 
      ? `<span class="conv-unread-badge">${conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>` 
      : '';
    const activeClass = currentConversationId === conv.id ? 'active' : '';
    const lastMessageDisplay = conv.lastMessage || '暂无消息';

    return `
      <div class="conversation-item ${activeClass}" data-conversation-id="${conv.id}" data-other-user-id="${conv.otherUser ? conv.otherUser.id : ''}">
        <div class="conv-avatar">
          <img src="${conv.otherUser ? conv.otherUser.avatar : ''}" alt="">
          ${unreadBadge}
        </div>
        <div class="conv-info">
          <div class="conv-header">
            <span class="conv-name">${conv.otherUser ? conv.otherUser.name : '未知用户'}</span>
            <span class="conv-time">${timeStr}</span>
          </div>
          <div class="conv-last-message">${lastMessageDisplay}</div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.conversation-item').forEach(item => {
    item.addEventListener('click', () => {
      const convId = parseInt(item.dataset.conversationId);
      const otherUserId = parseInt(item.dataset.otherUserId);
      openConversation(convId, otherUserId);
    });
  });
}

async function openConversation(conversationId, otherUserId) {
  if (!currentUser) return;

  currentConversationId = conversationId;

  const convRes = await fetch(`${API_BASE}/users/${otherUserId}`);
  const otherUser = await convRes.json();
  currentChatUser = otherUser;

  document.getElementById('chatPlaceholder').style.display = 'none';
  document.getElementById('chatWindow').style.display = 'flex';
  document.querySelector('.messages-container').classList.add('chat-open');

  renderChatHeader(otherUser);

  await loadConversationMessages(conversationId);
  await loadConversations();
  await loadUnreadCount();
}

function renderChatHeader(user) {
  const header = document.getElementById('chatHeader');
  header.innerHTML = `
    <div class="chat-header-left">
      <button class="chat-back-btn" onclick="closeChatWindow()">←</button>
      <img src="${user.avatar}" alt="${user.name}" class="chat-header-avatar">
      <div class="chat-header-info">
        <span class="chat-header-name">${user.name}</span>
        <span class="chat-header-status">在线</span>
      </div>
    </div>
    <div class="chat-header-actions">
      <span class="chat-header-city">🏙️ ${user.city}</span>
    </div>
  `;
}

async function loadConversationMessages(conversationId) {
  if (!currentUser) return;

  try {
    const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/messages?userId=${currentUser.id}`);
    const messages = await res.json();
    renderChatMessages(messages);
  } catch (e) {
    console.error('加载消息失败:', e);
  }
}

function renderChatMessages(messages) {
  const container = document.getElementById('chatMessages');

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="no-messages">
        <div class="no-messages-icon">💬</div>
        <p>开始和TA打个招呼吧~</p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(msg => {
    const isMine = msg.senderId === currentUser.id;
    const timeStr = formatChatTime(msg.createdAt);
    const msgClass = isMine ? 'chat-message mine' : 'chat-message other';
    
    if (isMine) {
      return `
        <div class="${msgClass}">
          <div class="chat-bubble">
            <div class="chat-bubble-content">${escapeHtml(msg.content)}</div>
            <div class="chat-bubble-time">${timeStr}${msg.isRead ? ' ✓✓' : ' ✓'}</div>
          </div>
        </div>
      `;
    } else {
      const sender = currentChatUser;
      return `
        <div class="${msgClass}">
          <img src="${sender ? sender.avatar : ''}" alt="" class="chat-msg-avatar">
          <div class="chat-bubble">
            <div class="chat-bubble-content">${escapeHtml(msg.content)}</div>
            <div class="chat-bubble-time">${timeStr}</div>
          </div>
        </div>
      `;
    }
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatChatTime(createdAt) {
  const date = new Date(createdAt);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function closeChatWindow() {
  currentConversationId = null;
  currentChatUser = null;
  document.getElementById('chatWindow').style.display = 'none';
  document.getElementById('chatPlaceholder').style.display = 'flex';
  document.querySelector('.messages-container').classList.remove('chat-open');
}

function initChatInput() {
  const sendBtn = document.getElementById('sendMsgBtn');
  const input = document.getElementById('chatInput');

  sendBtn.addEventListener('click', sendCurrentMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCurrentMessage();
    }
  });
}

async function sendCurrentMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();

  if (!content || !currentUser || !currentChatUser || !currentConversationId) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        receiverId: currentChatUser.id,
        content
      })
    });

    if (res.ok) {
      input.value = '';
      await loadConversationMessages(currentConversationId);
      await loadConversations();
    } else {
      const data = await res.json();
      showToast(data.error || '发送失败', 'error');
    }
  } catch (e) {
    console.error('发送消息失败:', e);
    showToast('发送失败', 'error');
  }
}

async function startConversationWithUser(otherUserId, userName, userAvatar) {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }

  if (otherUserId === currentUser.id) {
    showToast('不能给自己发消息', 'error');
    return;
  }

  try {
    let convRes = await fetch(`${API_BASE}/messages/conversation-with/${otherUserId}?userId=${currentUser.id}`);
    const convData = await convRes.json();

    let conversationId = convData.conversationId;

    if (!conversationId) {
      const newConvRes = await fetch(`${API_BASE}/messages/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1Id: currentUser.id,
          user2Id: otherUserId
        })
      });
      const newConv = await newConvRes.json();
      conversationId = newConv.id;
    }

    document.querySelector('.nav-btn[data-view="messages"]').click();

    setTimeout(() => {
      openConversation(conversationId, otherUserId);
    }, 100);
  } catch (e) {
    console.error('发起对话失败:', e);
    showToast('发起对话失败', 'error');
  }
}

function showMessageToast(unreadCount) {
  const bar = document.getElementById('messageToastBar');
  const text = document.getElementById('messageToastText');
  if (!bar || !text) return;
  
  text.textContent = unreadCount > 1 
    ? `您有 ${unreadCount} 条未读消息` 
    : '您有 1 条未读消息';
  
  bar.classList.add('show');
}

function hideMessageToast() {
  const bar = document.getElementById('messageToastBar');
  if (bar) bar.classList.remove('show');
}

function initMessageToast() {
  const closeBtn = document.getElementById('messageToastClose');
  const bar = document.getElementById('messageToastBar');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', hideMessageToast);
  }
  
  if (bar) {
    bar.addEventListener('click', (e) => {
      if (e.target === closeBtn) return;
      hideMessageToast();
      document.querySelector('.nav-btn[data-view="messages"]').click();
    });
  }
}

function startMessagePolling() {
  if (messagePollingTimer) {
    clearInterval(messagePollingTimer);
  }
  
  messagePollingTimer = setInterval(() => {
    if (currentUser) {
      loadUnreadCount();
      if (currentConversationId) {
        loadConversationMessages(currentConversationId);
      }
      if (document.getElementById('messages-view').classList.contains('active')) {
        loadConversations();
      }
    }
  }, 10000);
}

document.addEventListener('DOMContentLoaded', () => {
  initChatInput();
  initMessageToast();
});

const DANCE_ENCYCLOPEDIA = [
  {
    id: 'salsa',
    name: 'Salsa 莎莎舞',
    emoji: '💃',
    origin: '古巴 / 波多黎各 / 纽约',
    originFlag: '🇨🇺',
    rhythm: '4/4拍，每拍跳8步（快-快-慢）',
    difficulty: 3,
    brief: 'Salsa是目前世界上最流行的拉丁舞之一，以其热情奔放的节奏和丰富的即兴变化著称。舞者通常在4/4拍的音乐中完成8个基本步伐，是社交舞蹈的经典之选。',
    details: {
      history: 'Salsa起源于20世纪60-70年代的纽约，融合了古巴Son、波多黎各Plena和其他加勒比音乐元素。"Salsa"这个词在西班牙语中意为"酱汁"，象征着这种舞蹈的火辣与热情。',
      characteristics: [
        '基本节奏为4/4拍，每小节跳8步（1,2,3和5,6,7）',
        '第4拍和第8拍为停顿，形成独特的"快-快-慢"韵律',
        '主要有Cuban风格（圆形走位）和LA/NY风格（直线走位）两大流派',
        '包含丰富的旋转、托举和身体律动'
      ],
      music: '经典Salsa音乐以古巴Son为基础，常用乐器包括小号、长号、钢琴、贝斯、沙锤和康加鼓。代表艺人有Celia Cruz、Tito Puente、Marc Anthony等。',
      tips: '初学者建议先掌握基本步伐和节奏，从Cuban风格入门较为容易。多听音乐培养节奏感是学好Salsa的关键。'
    }
  },
  {
    id: 'bachata',
    name: 'Bachata 巴恰塔',
    emoji: '💕',
    origin: '多米尼加共和国',
    originFlag: '🇩🇴',
    rhythm: '4/4拍，节奏缓慢浪漫',
    difficulty: 2,
    brief: 'Bachata起源于多米尼加共和国，以其浪漫抒情的音乐和亲密的舞姿闻名。舞蹈节奏较慢，步伐简单易学，是近年来全球最受欢迎的社交舞之一。',
    details: {
      history: 'Bachata诞生于20世纪60年代的多米尼加乡村地区，最初被视为底层民众的音乐，曾受到社会排斥。经过几十年的发展，现代Bachata已成为国际化的舞蹈风格。',
      characteristics: [
        '4/4拍节奏，每拍都有舞步，突出第1,2,3,4拍',
        '以臀部扭动和身体波浪为主要特色',
        '舞伴间距离较近，舞姿亲密浪漫',
        '主要分为传统Dominican风格和融合风格（Sensual/Modern）'
      ],
      music: 'Bachata音乐以吉他为主要乐器，情感丰富，歌词多讲述爱情故事。现代Bachata融合了R&B和流行元素，代表艺人有Prince Royce、Romeo Santos等。',
      tips: '学习Bachata要注重身体连接和音乐感受力。初学者可以先从基本步伐和臀部律动开始，再逐步学习双人配合技巧。'
    }
  },
  {
    id: 'kizomba',
    name: 'Kizomba 基宗巴',
    emoji: '🌍',
    origin: '安哥拉',
    originFlag: '🇦🇴',
    rhythm: '4/4拍，缓慢而富有节奏感',
    difficulty: 2,
    brief: 'Kizomba源自非洲安哥拉，被称为"非洲的Tango"。以其缓慢、性感、流畅的舞姿著称，强调舞伴之间的身体连接和引导跟随。',
    details: {
      history: 'Kizomba诞生于20世纪80年代的安哥拉，由传统的Semba舞蹈演变而来，融合了Zouk音乐元素。2000年后开始在欧洲流行，现已风靡全球。',
      characteristics: [
        '节奏缓慢，4/4拍，强调第1,4,7拍',
        '舞步流畅连绵，没有停顿',
        '极度注重身体连接（Body Connection）',
        '包含大量的身体波浪、旋转和亲密动作',
        'Urban Kiz是现代流行的分支风格'
      ],
      music: 'Kizomba音乐以葡萄牙语演唱为主，旋律优美深情。现代Kizomba融合了电子音乐元素，节奏更加明快。代表艺人有C4 Pedro、Big Nelo等。',
      tips: 'Kizomba的核心是连接和感受。建议初学者先练习单人身体律动，再进入双人学习。找到一个好的舞伴或老师至关重要。'
    }
  },
  {
    id: 'chacha',
    name: 'Cha-cha 恰恰恰',
    emoji: '🎵',
    origin: '古巴',
    originFlag: '🇨🇺',
    rhythm: '4/4拍，Cha-cha-cha节奏',
    difficulty: 2,
    brief: 'Cha-cha（恰恰恰）是古巴的经典拉丁舞，以其欢快活泼的"恰恰恰"节奏著称。舞步轻快俏皮，充满活力，是国际标准舞的比赛项目之一。',
    details: {
      history: 'Cha-cha于1950年代由古巴作曲家Enrique Jorrín发明，是从Mambo演变而来的舞蹈。因舞蹈中的特色步伐发出"cha-cha-cha"的声音而得名。',
      characteristics: [
        '4/4拍节奏，特色为"1,2,3,恰恰恰"（4&1）',
        '舞步轻快活泼，膝盖保持弯曲',
        '胯部随脚步自然摆动',
        '分为社交风格和国标比赛风格两大类',
        '适合表演和竞技'
      ],
      music: 'Cha-cha音乐节奏明快，以打击乐和铜管乐为主。经典曲目包括Tito Puente的作品，现代也有很多流行歌曲改编的Cha-cha版本。',
      tips: 'Cha-cha的关键是掌握"恰恰恰"的节奏型。建议先用脚打出正确的节奏，再配合身体练习。注意保持膝盖放松和胯部律动。'
    }
  },
  {
    id: 'rumba',
    name: 'Rumba 伦巴',
    emoji: '🌹',
    origin: '古巴',
    originFlag: '🇨🇺',
    rhythm: '4/4拍，节奏缓慢深情',
    difficulty: 3,
    brief: 'Rumba伦巴被称为"拉丁舞之魂"，以其浪漫、性感、富有表现力的舞姿著称。是国际标准舞中最富有情感的舞蹈，被誉为"爱情的舞蹈"。',
    details: {
      history: 'Rumba起源于19世纪的古巴，融合了非洲和西班牙舞蹈元素。最初分为Yambú、Guaguancó和Columbia三种民间风格，现代国标Rumba则是在其基础上演化而来。',
      characteristics: [
        '4/4拍，每小节走4步（慢-快-快）',
        '第4拍重心延迟移动，形成独特的韵律感',
        '胯部动作明显，呈"8"字形摆动',
        '舞姿舒展优美，富有戏剧表现力',
        '是国标舞五项之一'
      ],
      music: 'Rumba音乐节奏为4/4拍，每分钟约25-27小节。音乐风格浪漫抒情，常见乐器有吉他、邦戈鼓、沙锤等。',
      tips: '学习Rumba需要特别注重音乐性和情感表达。胯部动作是Rumba的灵魂，建议从基础胯部练习开始，逐步提高身体协调性。'
    }
  },
  {
    id: 'merengue',
    name: 'Merengue 梅伦格',
    emoji: '🎉',
    origin: '多米尼加共和国',
    originFlag: '🇩🇴',
    rhythm: '2/4拍，节奏明快简单',
    difficulty: 1,
    brief: 'Merengue是多米尼加共和国的国舞，以其简单欢快的节奏闻名。几乎每个人都能在几分钟内学会基本步伐，是拉丁派对上最受欢迎的舞蹈之一。',
    details: {
      history: 'Merengue起源于19世纪的多米尼加共和国，据说由非洲奴隶发明，他们因脚踝被锁链束缚而只能以小步跳舞。如今已成为多米尼加文化的象征。',
      characteristics: [
        '2/4拍节奏，每拍一步，简单易学',
        '以左右踏步为基本步伐',
        '胯部随脚步自然摆动',
        '可加入旋转和花样变化',
        '非常适合派对和集体舞'
      ],
      music: 'Merengue音乐节奏明快，以手风琴、萨克斯和鼓为主要乐器。代表艺人有Juan Luis Guerra、Elvis Crespo等。',
      tips: 'Merengue是拉丁舞蹈中最容易入门的舞种。掌握基本左右踏步后，可以尝试加入手臂动作和简单旋转。享受音乐和派对氛围最重要！'
    }
  }
];

function renderDifficultyStars(difficulty) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star ${i <= difficulty ? 'filled' : ''}">★</span>`;
  }
  return `<span class="difficulty-stars">${stars}</span>`;
}

function renderEncyclopediaCard(dance) {
  return `
    <div class="encyclopedia-card" data-id="${dance.id}">
      <div class="encyclopedia-card-header ${dance.id}">
        <div class="encyclopedia-emoji">${dance.emoji}</div>
        <div class="encyclopedia-title-wrap">
          <div class="encyclopedia-name">${dance.name}</div>
          <div class="encyclopedia-origin">
            <span>${dance.originFlag}</span>
            <span>${dance.origin}</span>
          </div>
        </div>
        <span class="encyclopedia-expand-icon">▼</span>
      </div>
      <div class="encyclopedia-card-body">
        <div class="encyclopedia-meta">
          <div class="encyclopedia-meta-item">
            <span class="encyclopedia-meta-label">节奏</span>
            <span>${dance.rhythm}</span>
          </div>
          <div class="encyclopedia-meta-item">
            <span class="encyclopedia-meta-label">难度</span>
            ${renderDifficultyStars(dance.difficulty)}
          </div>
        </div>
        <p class="encyclopedia-brief">${dance.brief}</p>
      </div>
      <div class="encyclopedia-details">
        <div class="encyclopedia-details-inner">
          <h4>📖 历史渊源</h4>
          <p>${dance.details.history}</p>
          
          <h4>✨ 舞蹈特点</h4>
          <ul>
            ${dance.details.characteristics.map(c => `<li>${c}</li>`).join('')}
          </ul>
          
          <h4>🎶 音乐风格</h4>
          <p>${dance.details.music}</p>
          
          <div class="encyclopedia-tips">
            <div class="encyclopedia-tips-title">💡 学习建议</div>
            <p>${dance.details.tips}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function initEncyclopedia() {
  const grid = document.getElementById('encyclopediaGrid');
  if (!grid) return;
  
  grid.innerHTML = DANCE_ENCYCLOPEDIA.map(renderEncyclopediaCard).join('');
  
  const cards = grid.querySelectorAll('.encyclopedia-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });
}

/* ========== 帮助中心FAQ数据 ========== */

const FAQ_DATA = [
  {
    id: 'invitation',
    title: '关于邀约',
    icon: '💌',
    questions: [
      {
        id: 'invite-1',
        question: '如何发起舞伴邀约？',
        answer: [
          '您可以通过以下方式发起舞伴邀约：',
          '1. 在"舞伴匹配"页面，浏览推荐的舞伴列表，点击舞伴卡片上的"邀约"按钮',
          '2. 在舞会详情页，点击"邀约舞伴"按钮，选择您想邀请的用户',
          '3. 填写邀约留言后发送，对方会收到通知',
          '温馨提示：邀约前建议先查看对方的舞蹈水平和擅长舞种，提高邀约成功率。'
        ]
      },
      {
        id: 'invite-2',
        question: '如何查看邀约状态？',
        answer: [
          '您可以在以下位置查看邀约状态：',
          '1. 点击顶部通知铃铛，查看邀约相关的系统通知',
          '2. 在"个人中心"页面，查看"我的邀约"部分',
          '3. 邀约状态分为：待接受、已接受、已拒绝、已取消',
          '当对方接受您的邀约后，你们可以开始私信沟通具体事宜。'
        ]
      },
      {
        id: 'invite-3',
        question: '可以取消已经发送的邀约吗？',
        answer: [
          '在对方未接受邀约之前，您可以随时取消邀约。',
          '取消方式：在"个人中心" → "我的邀约"中找到该邀约，点击"取消邀约"按钮。',
          '如果对方已经接受了邀约，建议通过私信友好沟通后再做决定。'
        ]
      },
      {
        id: 'invite-4',
        question: '收到邀约后如何回应？',
        answer: [
          '当您收到舞伴邀约时：',
          '1. 点击通知消息或进入"个人中心" → "收到的邀约"',
          '2. 查看邀约详情，包括邀约舞会、对方资料和邀约留言',
          '3. 点击"接受"或"拒绝"按钮进行回应',
          '4. 如果接受邀约，双方会自动开始私信对话',
          '建议收到邀约后尽快回复，这是对对方的尊重。'
        ]
      }
    ]
  },
  {
    id: 'dance',
    title: '关于舞会',
    icon: '🎉',
    questions: [
      {
        id: 'dance-1',
        question: '如何报名参加舞会？',
        answer: [
          '报名参加舞会非常简单：',
          '1. 在"舞会日历"或"附近地图"中找到您感兴趣的舞会',
          '2. 点击舞会卡片查看详情',
          '3. 点击"我要参加"按钮完成报名',
          '4. 报名成功后，您会收到系统通知',
          '请注意：部分舞会有人数上限或报名截止时间，建议尽早报名。'
        ]
      },
      {
        id: 'dance-2',
        question: '如何取消报名？',
        answer: [
          '您可以在舞会开始前取消报名：',
          '1. 进入舞会详情页面',
          '2. 点击"取消报名"按钮',
          '3. 确认取消操作',
          '温馨提示：如果舞会即将开始（如24小时内），建议提前联系主办方说明情况。频繁无故取消可能影响您的信用记录。'
        ]
      },
      {
        id: 'dance-3',
        question: '舞会人数满了还能报名吗？',
        answer: [
          '当舞会报名人数达到上限时，"我要参加"按钮会变为"名额已满"且无法点击。',
          '建议：',
          '1. 关注其他类似主题的舞会',
          '2. 可以偶尔刷新页面，有时会有人取消报名',
          '3. 点击"收藏"按钮，我们会在有名额释放时优先通知您'
        ]
      },
      {
        id: 'dance-4',
        question: '如何发布舞会？',
        answer: [
          '如果您是主办方或想组织一场舞会：',
          '1. 点击顶部导航栏的"发布舞会"按钮',
          '2. 填写舞会标题、场地、日期时间、舞种风格等信息',
          '3. 设置票价、人数上限等可选参数',
          '4. 点击"发布舞会"完成提交',
          '发布后舞会会立即展示在平台上，用户可以浏览和报名。'
        ]
      },
      {
        id: 'dance-5',
        question: '如何评价参加过的舞会？',
        answer: [
          '舞会结束后，您可以对舞会进行评价：',
          '1. 进入舞会详情页面',
          '2. 点击"评价舞会"按钮',
          '3. 分别对场地环境、音乐质量、组织水平进行星级评分',
          '4. 可以填写文字评价分享您的体验',
          '您的评价对其他舞者很有参考价值，也能帮助主办方改进。'
        ]
      }
    ]
  },
  {
    id: 'account',
    title: '账号相关',
    icon: '👤',
    questions: [
      {
        id: 'account-1',
        question: '如何编辑个人资料？',
        answer: [
          '编辑个人资料步骤：',
          '1. 进入"个人中心"页面',
          '2. 点击"编辑资料"按钮',
          '3. 修改您的昵称、舞龄、角色、水平、城市等信息',
          '4. 设置您擅长的舞种及熟练度权重',
          '5. 点击"保存修改"完成',
          '完善的个人资料能帮助其他舞者更好地了解您，提高匹配成功率。'
        ]
      },
      {
        id: 'account-2',
        question: '舞种熟练度权重是什么意思？',
        answer: [
          '舞种熟练度权重（0-100%）表示您对每种舞蹈的掌握程度：',
          '• 0-30%：入门级，正在学习中',
          '• 30-60%：中级，可以流畅跳基本步',
          '• 60-90%：高级，可以跳复杂花样',
          '• 90-100%：专业级，教学或表演水平',
          '设置准确的权重可以提高舞伴匹配的精准度，建议根据实际水平如实填写。'
        ]
      },
      {
        id: 'account-3',
        question: '如何切换当前身份？',
        answer: [
          '您可以随时切换当前登录身份：',
          '1. 在页面右上角找到身份选择下拉框',
          '2. 点击下拉框选择您想使用的身份',
          '3. 切换后系统会自动刷新数据',
          '不同身份有独立的报名记录、收藏列表和消息记录。'
        ]
      },
      {
        id: 'account-4',
        question: '如何使用收藏功能？',
        answer: [
          '收藏功能可以帮助您关注感兴趣的舞会：',
          '1. 在舞会卡片上点击🤍按钮即可收藏',
          '2. 再次点击❤️按钮可取消收藏',
          '3. 在"个人中心"可以查看所有已收藏的舞会',
          '4. 收藏的舞会有名额释放或临近开始时，您会收到提醒通知',
          '善用收藏功能，不错过任何精彩舞会！'
        ]
      }
    ]
  },
  {
    id: 'social',
    title: '社交功能',
    icon: '💬',
    questions: [
      {
        id: 'social-1',
        question: '如何发送私信？',
        answer: [
          '有两种方式可以发送私信：',
          '1. 在"舞伴匹配"页面，点击舞伴卡片上的"发私信"按钮',
          '2. 在"私信中心"页面，选择一个已有对话继续',
          '发送消息后，对方会收到新消息提醒。支持文字消息，按Enter发送，Shift+Enter换行。'
        ]
      },
      {
        id: 'social-2',
        question: '如何关注其他舞者？',
        answer: [
          '关注功能可以让您及时了解喜欢的舞者动态：',
          '1. 在舞伴卡片上点击"关注"按钮',
          '2. 关注后按钮变为"已关注"',
          '3. 在"个人中心"的"关注"标签页查看您关注的人',
          '4. 在"粉丝"标签页查看关注您的人',
          '互相关注后会显示"互相关注"标识。'
        ]
      },
      {
        id: 'social-3',
        question: '如何查看通知？',
        answer: [
          '点击顶部导航栏的🔔铃铛图标可以查看所有通知：',
          '• 邀约状态变更通知',
          '• 私信提醒',
          '• 舞会报名成功提醒',
          '• 收藏舞会的动态通知',
          '• 系统公告',
          '未读通知会有蓝色标记，点击"全部已读"可一键标记所有通知为已读。'
        ]
      }
    ]
  },
  {
    id: 'platform',
    title: '平台使用',
    icon: '🔧',
    questions: [
      {
        id: 'platform-1',
        question: '如何切换城市？',
        answer: [
          '平台支持多城市切换：',
          '1. 点击页面顶部的城市选择器',
          '2. 从下拉列表中选择您所在的城市',
          '3. 切换后，舞会日历、附近地图等内容会自动更新为该城市的数据',
          '目前支持上海、北京、广州、深圳等主要城市，更多城市正在陆续开通中。'
        ]
      },
      {
        id: 'platform-2',
        question: '如何使用智能匹配功能？',
        answer: [
          '智能匹配会根据您的条件推荐最合适的舞伴：',
          '1. 进入"舞伴匹配"页面',
          '2. 设置筛选条件：舞会、舞种、角色、水平',
          '3. 点击"智能匹配"按钮',
          '4. 系统会根据舞种匹配度、水平匹配度等综合计算匹配分数',
          '匹配分数越高，代表你们跳舞的契合度越好！'
        ]
      },
      {
        id: 'platform-3',
        question: '搜索功能如何使用？',
        answer: [
          '平台的搜索功能可以帮助您快速找到想要的内容：',
          '• 在帮助中心顶部的搜索框输入关键词',
          '• 系统会实时过滤匹配的问题和答案',
          '• 匹配的关键词会高亮显示',
          '• 支持模糊搜索，输入部分关键词即可匹配',
          '例如输入"邀约"可以找到所有与邀约相关的问题。'
        ]
      },
      {
        id: 'platform-4',
        question: '分享功能怎么用？',
        answer: [
          '您可以将喜欢的舞会分享给朋友：',
          '1. 在舞会卡片或详情页点击"📤分享"按钮',
          '2. 系统会自动生成一张精美的分享卡片',
          '3. 点击"📥保存图片"下载卡片到本地',
          '4. 将图片分享到微信、朋友圈等社交媒体',
          '分享卡片包含舞会的关键信息，让朋友一目了然！'
        ]
      }
    ]
  }
];

/* ========== 帮助中心功能函数 ========== */

let currentSearchKeyword = '';

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function highlightKeyword(text, keyword) {
  if (!keyword) return escapeHtml(text);
  const escapedKeyword = escapeHtml(keyword);
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${escapedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escapedText.replace(regex, '<span class="faq-highlight">$1</span>');
}

function renderFAQItem(item, keyword = '') {
  const highlightedQuestion = highlightKeyword(item.question, keyword);
  const highlightedAnswer = item.answer.map(a => highlightKeyword(a, keyword)).join('</p><p>');
  
  return `
    <div class="faq-item" data-question-id="${item.id}">
      <div class="faq-item-header">
        <div class="faq-item-question">${highlightedQuestion}</div>
        <span class="faq-item-icon">▼</span>
      </div>
      <div class="faq-item-answer">
        <div class="faq-item-answer-content">
          <p>${highlightedAnswer}</p>
        </div>
      </div>
    </div>
  `;
}

function renderFAQCategory(category, keyword = '') {
  const matchedQuestions = keyword
    ? category.questions.filter(q => 
        q.question.toLowerCase().includes(keyword.toLowerCase()) ||
        q.answer.some(a => a.toLowerCase().includes(keyword.toLowerCase()))
      )
    : category.questions;
  
  if (keyword && matchedQuestions.length === 0) {
    return '';
  }
  
  const shouldExpand = keyword && matchedQuestions.length > 0;
  
  return `
    <div class="faq-category ${shouldExpand ? 'expanded' : ''}" data-category-id="${category.id}">
      <div class="faq-category-header">
        <div class="faq-category-icon">${category.icon}</div>
        <div class="faq-category-info">
          <div class="faq-category-title">${category.title}</div>
          <div class="faq-category-count">${matchedQuestions.length} 个问题</div>
        </div>
        <span class="faq-category-expand">▼</span>
      </div>
      <div class="faq-items-container">
        <div class="faq-items">
          ${matchedQuestions.map(q => renderFAQItem(q, keyword)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderFAQ(keyword = '') {
  const container = document.getElementById('faqContainer');
  const emptyResult = document.getElementById('helpEmptyResult');
  if (!container) return;
  
  const html = FAQ_DATA.map(cat => renderFAQCategory(cat, keyword)).filter(h => h !== '').join('');
  
  if (!html) {
    container.innerHTML = '';
    emptyResult.style.display = 'block';
  } else {
    emptyResult.style.display = 'none';
    container.innerHTML = html;
    
    const categories = container.querySelectorAll('.faq-category');
    categories.forEach(cat => {
      const header = cat.querySelector('.faq-category-header');
      header.addEventListener('click', () => {
        cat.classList.toggle('expanded');
      });
    });
    
    const items = container.querySelectorAll('.faq-item');
    items.forEach(item => {
      const header = item.querySelector('.faq-item-header');
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        item.classList.toggle('expanded');
      });
    });
  }
}

function initHelpCenter() {
  const searchInput = document.getElementById('helpSearchInput');
  const clearBtn = document.getElementById('helpSearchClear');
  
  if (!searchInput) return;
  
  renderFAQ();
  
  searchInput.addEventListener('input', (e) => {
    currentSearchKeyword = e.target.value.trim();
    clearBtn.style.display = currentSearchKeyword ? 'flex' : 'none';
    renderFAQ(currentSearchKeyword);
  });
  
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchKeyword = '';
    clearBtn.style.display = 'none';
    renderFAQ();
    searchInput.focus();
  });
}

function scrollToHelp() {
  const helpBtn = document.querySelector('.nav-btn[data-view="help"]');
  if (helpBtn) {
    helpBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
