let dances = [
  {
    id: 1,
    title: "周五莎莎之夜",
    venue: "热情拉丁舞厅",
    address: "上海市黄浦区南京东路100号",
    date: "2026-06-20",
    startTime: "20:00",
    endTime: "23:30",
    styles: ["Cuban", "LA"],
    price: 80,
    description: "每周五的经典莎莎之夜，现场DJ播放最热门的莎莎音乐",
    organizer: "热情舞蹈工作室",
    latitude: 31.2304,
    longitude: 121.4737,
    viewCount: 328,
    attendeeCount: 45,
    createdAt: "2026-06-01T10:00:00Z"
  },
  {
    id: 2,
    title: "NY风格工作坊+舞会",
    venue: "城市舞蹈中心",
    address: "上海市静安区延安西路1200号",
    date: "2026-06-21",
    startTime: "19:00",
    endTime: "22:00",
    styles: ["NY"],
    price: 150,
    description: "NY风格莎莎工作坊，由资深老师授课后舞会练习",
    organizer: "城市舞蹈中心",
    latitude: 31.2289,
    longitude: 121.4475,
    viewCount: 256,
    attendeeCount: 32,
    createdAt: "2026-06-02T14:30:00Z"
  },
  {
    id: 3,
    title: "周日下午社交舞",
    venue: "阳光艺术空间",
    address: "上海市徐汇区衡山路880号",
    date: "2026-06-22",
    startTime: "15:00",
    endTime: "18:00",
    styles: ["Cuban", "Bachata"],
    price: 50,
    description: "轻松愉快的周日下午社交舞会，适合新手练习",
    organizer: "阳光艺术空间",
    latitude: 31.2001,
    longitude: 121.4365,
    viewCount: 189,
    attendeeCount: 28,
    createdAt: "2026-06-03T09:15:00Z"
  },
  {
    id: 4,
    title: "LA风格进阶班舞会",
    venue: "星空舞蹈俱乐部",
    address: "上海市浦东新区陆家嘴环路500号",
    date: "2026-06-25",
    startTime: "20:30",
    endTime: "23:00",
    styles: ["LA"],
    price: 100,
    description: "LA风格进阶舞者专属舞会，高难度编舞交流",
    organizer: "星空舞蹈俱乐部",
    latitude: 31.2397,
    longitude: 121.4998,
    viewCount: 145,
    attendeeCount: 20,
    createdAt: "2026-06-05T16:45:00Z"
  },
  {
    id: 5,
    title: "月度主题派对-热带风情",
    venue: "棕榈树酒吧",
    address: "上海市长宁区虹桥路1688号",
    date: "2026-06-28",
    startTime: "21:00",
    endTime: "01:00",
    styles: ["Cuban", "LA", "NY"],
    price: 120,
    description: "月度主题派对，热带风情装扮，现场乐队演奏",
    organizer: "棕榈树酒吧",
    latitude: 31.1992,
    longitude: 121.3936,
    viewCount: 512,
    attendeeCount: 68,
    createdAt: "2026-06-04T11:20:00Z"
  }
];

let users = [
  {
    id: 1,
    name: "张小明",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaoming",
    danceYears: 3,
    role: "leader",
    styles: ["Cuban", "LA"],
    level: "intermediate",
    bio: "热爱莎莎舞，喜欢Cuban风格的自由和LA风格的酷炫",
    city: "上海",
    createdAt: "2026-01-15T00:00:00Z"
  },
  {
    id: 2,
    name: "李婷婷",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=litingting",
    danceYears: 2,
    role: "follower",
    styles: ["Cuban", "Bachata"],
    level: "beginner",
    bio: "刚开始学习莎莎舞，希望找到耐心的舞伴一起进步",
    city: "上海",
    createdAt: "2026-03-20T00:00:00Z"
  },
  {
    id: 3,
    name: "王大伟",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangdawei",
    danceYears: 5,
    role: "both",
    styles: ["NY", "LA"],
    level: "advanced",
    bio: "职业舞者，NY和LA风格双修，可引带可跟随",
    city: "上海",
    createdAt: "2025-06-10T00:00:00Z"
  },
  {
    id: 4,
    name: "陈小燕",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chenxiaoyan",
    danceYears: 4,
    role: "follower",
    styles: ["Cuban"],
    level: "intermediate",
    bio: "Cuban风格爱好者，喜欢热情奔放的舞蹈",
    city: "上海",
    createdAt: "2025-12-01T00:00:00Z"
  },
  {
    id: 5,
    name: "刘志强",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liuzhiqiang",
    danceYears: 1,
    role: "leader",
    styles: ["LA"],
    level: "beginner",
    bio: "LA风格新手，正在努力学习中",
    city: "上海",
    createdAt: "2026-04-05T00:00:00Z"
  }
];

let invitations = [
  {
    id: 1,
    danceId: 1,
    fromUserId: 1,
    toUserId: 2,
    message: "你好，看你也喜欢Cuban风格，周五的舞会要不要一起跳几曲？",
    status: "pending",
    createdAt: "2026-06-10T08:30:00Z"
  },
  {
    id: 2,
    danceId: 5,
    fromUserId: 3,
    toUserId: 4,
    message: "月底的主题派对很期待，我们可以组队一起去，NY和Cuban都可以",
    status: "accepted",
    createdAt: "2026-06-08T14:20:00Z"
  }
];

let reviews = [
  {
    id: 1,
    danceId: 1,
    userId: 2,
    venueRating: 5,
    musicRating: 4,
    organizationRating: 4,
    comment: "场地很棒，氛围很好！音乐稍微有点小，但整体体验不错，下次还会来。",
    createdAt: "2026-06-16T10:30:00Z"
  },
  {
    id: 2,
    danceId: 1,
    userId: 3,
    venueRating: 4,
    musicRating: 5,
    organizationRating: 5,
    comment: "DJ选曲非常专业，组织也很有序，就是空调有点冷。",
    createdAt: "2026-06-16T12:15:00Z"
  },
  {
    id: 3,
    danceId: 2,
    userId: 1,
    venueRating: 5,
    musicRating: 5,
    organizationRating: 5,
    comment: "工作坊内容很充实，老师教得很好，舞会练习时间也很充足。",
    createdAt: "2026-06-17T09:00:00Z"
  }
];

let follows = [
  {
    id: 1,
    followerId: 1,
    followingId: 2,
    createdAt: "2026-06-10T08:00:00Z"
  },
  {
    id: 2,
    followerId: 2,
    followingId: 1,
    createdAt: "2026-06-11T10:00:00Z"
  },
  {
    id: 3,
    followerId: 1,
    followingId: 3,
    createdAt: "2026-06-12T15:30:00Z"
  },
  {
    id: 4,
    followerId: 4,
    followingId: 1,
    createdAt: "2026-06-13T09:20:00Z"
  }
];

let notifications = [
  {
    id: 1,
    userId: 1,
    type: "invitation_accepted",
    title: "邀约已被接受",
    content: "李婷婷 接受了你的舞会邀约",
    relatedId: 2,
    isRead: false,
    createdAt: "2026-06-14T10:00:00Z"
  }
];

let nextDanceId = 6;
let nextUserId = 6;
let nextInvitationId = 3;
let nextReviewId = 4;
let nextFollowId = 5;
let nextNotificationId = 2;

function isFollowing(followerId, followingId) {
  return follows.some(f => f.followerId === followerId && f.followingId === followingId);
}

function isMutualFollowing(userId1, userId2) {
  return isFollowing(userId1, userId2) && isFollowing(userId2, userId1);
}

function getFollowers(userId) {
  return follows.filter(f => f.followingId === userId);
}

function getFollowing(userId) {
  return follows.filter(f => f.followerId === userId);
}

function addFollow(followerId, followingId) {
  if (isFollowing(followerId, followingId)) {
    return null;
  }
  const newFollow = {
    id: nextFollowId++,
    followerId,
    followingId,
    createdAt: new Date().toISOString()
  };
  follows.push(newFollow);
  return newFollow;
}

function removeFollow(followerId, followingId) {
  const index = follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
  if (index === -1) {
    return false;
  }
  follows.splice(index, 1);
  return true;
}

function getNotifications(userId) {
  return notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getUnreadCount(userId) {
  return notifications.filter(n => n.userId === userId && !n.isRead).length;
}

function addNotification(userId, type, title, content, relatedId) {
  const notification = {
    id: nextNotificationId++,
    userId,
    type,
    title,
    content,
    relatedId: relatedId || null,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(notification);
  return notification;
}

function markAsRead(notificationId, userId) {
  const notification = notifications.find(n => n.id === notificationId && n.userId === userId);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
}

function markAllAsRead(userId) {
  notifications.forEach(n => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  return true;
}

module.exports = {
  dances,
  users,
  invitations,
  reviews,
  follows,
  notifications,
  getNextDanceId: () => nextDanceId++,
  getNextUserId: () => nextUserId++,
  getNextInvitationId: () => nextInvitationId++,
  getNextReviewId: () => nextReviewId++,
  isFollowing,
  isMutualFollowing,
  getFollowers,
  getFollowing,
  addFollow,
  removeFollow,
  getNotifications,
  getUnreadCount,
  addNotification,
  markAsRead,
  markAllAsRead
};
