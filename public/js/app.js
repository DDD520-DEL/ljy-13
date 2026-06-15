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
  
  return `
    <div class="dance-card" data-id="${dance.id}">
      <div class="dance-card-header">
        <h4>${dance.title} ${statusBadge}</h4>
        <div class="dance-card-time">${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      </div>
      <div class="dance-card-body">
        <div class="dance-card-meta">
          <div>📍 ${dance.venue}</div>
          <div>�️ ${dance.city} · � ${dance.address}</div>
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
    
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-dance-header">
        <h2>${dance.title}</h2>
        <div class="modal-dance-time">${dateStr} ${weekDay} ${dance.startTime} - ${dance.endTime}</div>
      </div>
      <div class="modal-dance-info">
        <div><span class="info-label">场地:</span> ${dance.venue}</div>
        <div><span class="info-label">城市:</span> ${dance.city}</div>
        <div><span class="info-label">地址:</span> ${dance.address}</div>
        <div><span class="info-label">主办方:</span> ${dance.organizer}</div>
        <div><span class="info-label">票价:</span> ¥${dance.price}</div>
        <div><span class="info-label">舞种:</span> ${styleTags}</div>
        <div><span class="info-label">热度:</span> 👁 ${dance.viewCount} 次浏览 | 👥 ${dance.attendeeCount}${dance.maxAttendees ? `/${dance.maxAttendees}` : ''} 人参加</div>
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
            loadDances().then(() => {
              loadHotRanking();
              renderMapMarkers();
              if (document.getElementById('map-view').classList.contains('active')) {
                loadNearbyDances();
              }
            });
            const publishCitySelect = document.getElementById('publishCitySelect');
            if (publishCitySelect) publishCitySelect.value = currentCity;
          }
        }
        populatePartnerDanceSelect();
        loadPartners();
        loadUnreadCount();
        if (document.getElementById('profile-view').classList.contains('active')) {
          loadUserProfile();
        }
      } else {
        currentUser = null;
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
  if (currentUser) {
    const isFollowing = user.isFollowing ? 'true' : 'false';
    const btnClass = user.isFollowing ? 'following' : 'follow';
    const btnText = user.isFollowing ? '已关注' : '+ 关注';
    followBtn = `<button class="follow-btn ${btnClass}" data-user-id="${user.id}" data-following="${isFollowing}">${btnText}</button>`;
  }
  
  return `
    <div class="partner-card">
      <div class="partner-header">
        <div class="partner-avatar">
          <img src="${user.avatar}" alt="${user.name}">
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
    const [userRes, reviewsRes] = await Promise.all([
      fetch(`${API_BASE}/users/${currentUser.id}?currentUserId=${currentUser.id}`),
      fetch(`${API_BASE}/reviews?userId=${currentUser.id}`)
    ]);
    
    const userData = await userRes.json();
    currentUser = { ...currentUser, ...userData };
    const reviews = await reviewsRes.json();
    
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
    
    container.innerHTML = `
      <div class="profile-edit-section">
        <button class="profile-edit-btn" onclick="openEditProfileModal()">✏️ 编辑资料</button>
      </div>
      <div class="profile-header">
        <div class="profile-avatar-large">
          <img src="${currentUser.avatar}" alt="${currentUser.name}">
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
      <div class="profile-follow-section">
        <h3>👥 社交关系</h3>
        <div class="follow-tabs">
          <button class="follow-tab active" data-tab="following">关注的人 (${followingCount})</button>
          <button class="follow-tab" data-tab="followers">粉丝 (${followerCount})</button>
        </div>
        <div id="followListContent"></div>
      </div>
      ${reviewsHtml}
    `;
    
    document.querySelectorAll('.follow-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchFollowTab(currentUser.id, tab.dataset.tab);
      });
    });
    
    switchFollowTab(currentUser.id, 'following');
    
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
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/notifications/unread-count?userId=${currentUser.id}`);
    const data = await res.json();
    updateNotificationBadge(data.count);
  } catch (e) {
    console.error('加载未读通知数量失败:', e);
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
