const API_BASE = '/api';

let currentDate = new Date();
let selectedDate = null;
let currentUser = null;
let allDances = [];
let allUsers = [];
let inviteTargetUserId = null;
let preselectedDanceId = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCalendar();
  initFilters();
  initMap();
  initPublishForm();
  initModals();
  initReviewModal();
  loadUsers();
  loadDances();
  loadHotRanking();
  loadPartners();
});

function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
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
  document.getElementById('partnerStyle').addEventListener('change', loadPartners);
  document.getElementById('partnerRole').addEventListener('change', loadPartners);
  document.getElementById('partnerLevel').addEventListener('change', loadPartners);
  document.getElementById('matchBtn').addEventListener('click', smartMatch);
}

async function loadDances() {
  try {
    const res = await fetch(`${API_BASE}/dances?sort=date`);
    const data = await res.json();
    allDances = data.data;
    renderCalendar();
    renderDanceList();
    populateInviteDanceSelect();
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

function createDanceCard(dance) {
  const styleTags = dance.styles.map(s => 
    `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
  ).join('');
  
  const dateObj = new Date(dance.date);
  const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][dateObj.getDay()];
  
  return `
    <div class="dance-card" data-id="${dance.id}">
      <div class="dance-card-header">
        <h4>${dance.title}</h4>
        <div class="dance-card-time">${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      </div>
      <div class="dance-card-body">
        <div class="dance-card-meta">
          <div>📍 ${dance.venue}</div>
          <div>🏢 ${dance.address}</div>
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
          <span>👥 ${dance.attendeeCount}</span>
        </div>
      </div>
    </div>
  `;
}

async function showDanceDetail(id) {
  try {
    const danceRes = await fetch(`${API_BASE}/dances/${id}`);
    const dance = await danceRes.json();
    
    const [avgRes, reviewsRes] = await Promise.all([
      fetch(`${API_BASE}/reviews/dance/${id}/average`),
      fetch(`${API_BASE}/reviews?danceId=${id}`)
    ]);
    
    const averages = await avgRes.json();
    const reviews = await reviewsRes.json();
    
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
    
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-dance-header">
        <h2>${dance.title}</h2>
        <div class="modal-dance-time">${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      </div>
      <div class="modal-dance-info">
        <div><span class="info-label">场地:</span> ${dance.venue}</div>
        <div><span class="info-label">地址:</span> ${dance.address}</div>
        <div><span class="info-label">主办方:</span> ${dance.organizer}</div>
        <div><span class="info-label">票价:</span> ¥${dance.price}</div>
        <div><span class="info-label">舞种:</span> ${styleTags}</div>
        <div><span class="info-label">热度:</span> 👁 ${dance.viewCount} 次浏览 | 👥 ${dance.attendeeCount} 人参加</div>
      </div>
      <div class="modal-dance-desc">
        <h4>舞会介绍</h4>
        <p>${dance.description || '暂无介绍'}</p>
      </div>
      ${ratingsHtml}
      ${reviewsHtml}
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        ${reviewButtonHtml}
        <button class="btn btn-primary" onclick="inviteToDance(${dance.id})">邀约舞伴</button>
      </div>
    `;
    
    document.getElementById('danceModal').classList.add('active');
  } catch (e) {
    console.error('加载舞会详情失败:', e);
    showToast('加载失败', 'error');
  }
}

function closeModal() {
  document.getElementById('danceModal').classList.remove('active');
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
    allUsers = await res.json();
    
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
        loadPartners();
        if (document.getElementById('profile-view').classList.contains('active')) {
          loadUserProfile();
        }
      } else {
        currentUser = null;
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
  const style = document.getElementById('partnerStyle').value;
  const role = document.getElementById('partnerRole').value;
  const level = document.getElementById('partnerLevel').value;
  
  let url = `${API_BASE}/users`;
  const params = [];
  
  if (style) params.push(`style=${style}`);
  if (role) params.push(`role=${role}`);
  if (level) params.push(`level=${level}`);
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  try {
    const res = await fetch(url);
    let users = await res.json();
    
    if (currentUser) {
      users = users.filter(u => u.id !== currentUser.id);
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

function calculateMatchScore(user) {
  if (!currentUser) return 50;
  
  let score = 40;
  
  const commonStyles = user.styles.filter(s => currentUser.styles.includes(s));
  score += commonStyles.length * 10;
  
  if (user.level === currentUser.level) {
    score += 15;
  }
  
  if (user.city === currentUser.city) {
    score += 10;
  }
  
  return Math.min(score, 98);
}

async function smartMatch() {
  if (!currentUser) {
    showToast('请先选择身份', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/users/match/${currentUser.id}`);
    const data = await res.json();
    
    renderPartners(data.matches);
    showToast('智能匹配完成！', 'success');
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
}

function createPartnerCard(user) {
  const roleText = { leader: '引带', follower: '跟随', both: '双修' }[user.role] || user.role;
  const levelText = { beginner: '入门', intermediate: '中级', advanced: '高级' }[user.level] || user.level;
  
  const styleTags = user.styles.map(s => 
    `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
  ).join('');
  
  const matchScore = user.matchScore || 50;
  
  return `
    <div class="partner-card">
      <div class="partner-header">
        <div class="partner-avatar">
          <img src="${user.avatar}" alt="${user.name}">
        </div>
        <div class="partner-info">
          <h4>${user.name}</h4>
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
      <button class="invite-btn" data-user-id="${user.id}">发起邀约</button>
    </div>
  `;
}

async function loadHotRanking() {
  try {
    const res = await fetch(`${API_BASE}/dances/hot?limit=5`);
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
    
    const danceData = {
      title: formData.get('title'),
      venue: formData.get('venue'),
      address: formData.get('address'),
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      styles: styles,
      price: parseInt(formData.get('price')) || 0,
      description: formData.get('description'),
      organizer: formData.get('organizer'),
      latitude: 31.2304,
      longitude: 121.4737
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
  
  document.getElementById('danceModal').addEventListener('click', (e) => {
    if (e.target.id === 'danceModal') closeModal();
  });
  
  document.getElementById('inviteModal').addEventListener('click', (e) => {
    if (e.target.id === 'inviteModal') closeInviteModal();
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
    const res = await fetch(`${API_BASE}/reviews?userId=${currentUser.id}`);
    const reviews = await res.json();
    
    const roleText = { leader: '引带', follower: '跟随', both: '双修' }[currentUser.role] || currentUser.role;
    const levelText = { beginner: '入门', intermediate: '中级', advanced: '高级' }[currentUser.level] || currentUser.level;
    
    const styleTags = currentUser.styles.map(s => 
      `<span class="style-tag style-${s.toLowerCase()}">${s}</span>`
    ).join('');
    
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
    
    container.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar-large">
          <img src="${currentUser.avatar}" alt="${currentUser.name}">
        </div>
        <div class="profile-info">
          <h2>${currentUser.name}</h2>
          <div class="profile-tags">
            <span class="role-badge role-${currentUser.role}">${roleText}</span>
            <span class="level-badge level-${currentUser.level}">${levelText}</span>
          </div>
          <div class="profile-stats">
            <div class="profile-stat">
              <span class="stat-value">${currentUser.danceYears}</span>
              <span class="stat-label">舞龄</span>
            </div>
            <div class="profile-stat">
              <span class="stat-value">${reviews.length}</span>
              <span class="stat-label">评价</span>
            </div>
            <div class="profile-stat">
              <span class="stat-value">${currentUser.city}</span>
              <span class="stat-label">城市</span>
            </div>
          </div>
          <div class="profile-styles">
            <span class="info-label">擅长舞种：</span>
            ${styleTags}
          </div>
          ${currentUser.bio ? `<div class="profile-bio">${currentUser.bio}</div>` : ''}
        </div>
      </div>
      ${reviewsHtml}
    `;
    
    container.querySelectorAll('.profile-review-item').forEach(item => {
      item.addEventListener('click', () => {
        const danceId = parseInt(item.dataset.danceId);
        document.querySelector('.nav-btn[data-view="calendar"]').click();
        showDanceDetail(danceId);
      });
    });
    
  } catch (e) {
    console.error('加载用户资料失败:', e);
    container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">加载失败，请重试</div>';
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
