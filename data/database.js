const SUPPORTED_CITIES = ["上海", "北京", "广州", "深圳", "成都", "杭州"];

let dances = [
  {
    id: 1,
    title: "周五莎莎之夜",
    venue: "热情拉丁舞厅",
    address: "上海市黄浦区南京东路100号",
    city: "上海",
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
    maxAttendees: 60,
    registrationDeadline: "2026-06-19T18:00:00Z",
    createdAt: "2026-06-01T10:00:00Z"
  },
  {
    id: 2,
    title: "NY风格工作坊+舞会",
    venue: "城市舞蹈中心",
    address: "上海市静安区延安西路1200号",
    city: "上海",
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
    maxAttendees: 40,
    registrationDeadline: "2026-06-20T12:00:00Z",
    createdAt: "2026-06-02T14:30:00Z"
  },
  {
    id: 3,
    title: "周日下午社交舞",
    venue: "阳光艺术空间",
    address: "上海市徐汇区衡山路880号",
    city: "上海",
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
    maxAttendees: 50,
    registrationDeadline: "2026-06-22T12:00:00Z",
    createdAt: "2026-06-03T09:15:00Z"
  },
  {
    id: 4,
    title: "LA风格进阶班舞会",
    venue: "星空舞蹈俱乐部",
    address: "上海市浦东新区陆家嘴环路500号",
    city: "上海",
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
    maxAttendees: 30,
    registrationDeadline: "2026-06-24T18:00:00Z",
    createdAt: "2026-06-05T16:45:00Z"
  },
  {
    id: 5,
    title: "月度主题派对-热带风情",
    venue: "棕榈树酒吧",
    address: "上海市长宁区虹桥路1688号",
    city: "上海",
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
    maxAttendees: 100,
    registrationDeadline: "2026-06-27T20:00:00Z",
    createdAt: "2026-06-04T11:20:00Z"
  },
  {
    id: 6,
    title: "北京CBD拉丁之夜",
    venue: "国贸拉丁俱乐部",
    address: "北京市朝阳区建国门外大街1号",
    city: "北京",
    date: "2026-06-20",
    startTime: "19:30",
    endTime: "23:00",
    styles: ["Cuban", "NY"],
    price: 100,
    description: "CBD商圈最热门的拉丁舞会，专业灯光音响",
    organizer: "国贸拉丁俱乐部",
    latitude: 39.9087,
    longitude: 116.4574,
    viewCount: 287,
    attendeeCount: 38,
    maxAttendees: 50,
    registrationDeadline: "2026-06-19T20:00:00Z",
    createdAt: "2026-06-06T10:00:00Z"
  },
  {
    id: 7,
    title: "周末Bachata社交舞",
    venue: "三里屯艺术中心",
    address: "北京市朝阳区三里屯路19号",
    city: "北京",
    date: "2026-06-21",
    startTime: "20:00",
    endTime: "23:30",
    styles: ["Bachata", "Cuban"],
    price: 70,
    description: "三里屯潮流聚集地，Bachata爱好者的周末派对",
    organizer: "三里屯舞蹈联盟",
    latitude: 39.9370,
    longitude: 116.4530,
    viewCount: 198,
    attendeeCount: 25,
    maxAttendees: 45,
    registrationDeadline: "2026-06-21T18:00:00Z",
    createdAt: "2026-06-07T12:00:00Z"
  },
  {
    id: 8,
    title: "LA风格特训舞会",
    venue: "北京舞蹈学院活动中心",
    address: "北京市海淀区中关村南大街27号",
    city: "北京",
    date: "2026-06-27",
    startTime: "18:30",
    endTime: "22:30",
    styles: ["LA"],
    price: 180,
    description: "北舞专业老师指导，LA风格特训+自由舞会",
    organizer: "北京舞蹈学院",
    latitude: 39.9589,
    longitude: 116.3292,
    viewCount: 165,
    attendeeCount: 18,
    maxAttendees: 35,
    registrationDeadline: "2026-06-26T18:00:00Z",
    createdAt: "2026-06-08T15:00:00Z"
  },
  {
    id: 9,
    title: "珠江夜莎莎派对",
    venue: "广州塔江畔舞厅",
    address: "广州市海珠区阅江西路222号",
    city: "广州",
    date: "2026-06-20",
    startTime: "20:00",
    endTime: "24:00",
    styles: ["Cuban", "LA", "Bachata"],
    price: 90,
    description: "珠江夜景下的莎莎舞会，浪漫江景+热情拉丁",
    organizer: "江畔舞蹈俱乐部",
    latitude: 23.1066,
    longitude: 113.3240,
    viewCount: 342,
    attendeeCount: 52,
    maxAttendees: 80,
    registrationDeadline: "2026-06-19T22:00:00Z",
    createdAt: "2026-06-02T09:00:00Z"
  },
  {
    id: 10,
    title: "天河周末舞会",
    venue: "天河体育中心舞蹈厅",
    address: "广州市天河区天河路299号",
    city: "广州",
    date: "2026-06-22",
    startTime: "19:30",
    endTime: "22:30",
    styles: ["Cuban", "NY"],
    price: 60,
    description: "天河CBD周末社交舞会，新手友好，有免费基础教学",
    organizer: "天河舞蹈协会",
    latitude: 23.1360,
    longitude: 113.3239,
    viewCount: 210,
    attendeeCount: 33,
    maxAttendees: 55,
    registrationDeadline: "2026-06-22T17:00:00Z",
    createdAt: "2026-06-04T14:00:00Z"
  },
  {
    id: 11,
    title: "南山海岸城舞会",
    venue: "海岸城购物中心舞蹈厅",
    address: "深圳市南山区文心五路33号",
    city: "深圳",
    date: "2026-06-21",
    startTime: "20:00",
    endTime: "23:00",
    styles: ["LA", "Cuban"],
    price: 85,
    description: "南山核心商圈的拉丁舞会，深圳年轻人聚集地",
    organizer: "海岸城拉丁会所",
    latitude: 22.5230,
    longitude: 113.9304,
    viewCount: 276,
    attendeeCount: 41,
    maxAttendees: 60,
    registrationDeadline: "2026-06-21T18:00:00Z",
    createdAt: "2026-06-03T11:00:00Z"
  },
  {
    id: 12,
    title: "福田周末社交舞派对",
    venue: "福田CBD文化中心",
    address: "深圳市福田区福华一路",
    city: "深圳",
    date: "2026-06-26",
    startTime: "19:00",
    endTime: "22:30",
    styles: ["NY", "Bachata"],
    price: 75,
    description: "福田CBD白领社交舞派对，工作之余放松身心",
    organizer: "深圳白领舞蹈俱乐部",
    latitude: 22.5404,
    longitude: 114.0560,
    viewCount: 188,
    attendeeCount: 26,
    maxAttendees: 45,
    registrationDeadline: "2026-06-26T17:00:00Z",
    createdAt: "2026-06-05T09:30:00Z"
  },
  {
    id: 13,
    title: "锦里古街风情舞夜",
    venue: "锦里古街文化中心",
    address: "成都市武侯区武侯祠大街231号",
    city: "成都",
    date: "2026-06-20",
    startTime: "20:00",
    endTime: "23:30",
    styles: ["Cuban", "Bachata"],
    price: 65,
    description: "成都古街风情莎莎舞会，传统与现代的碰撞",
    organizer: "锦里文化舞蹈社",
    latitude: 30.6474,
    longitude: 104.0486,
    viewCount: 255,
    attendeeCount: 36,
    maxAttendees: 50,
    registrationDeadline: "2026-06-20T18:00:00Z",
    createdAt: "2026-06-02T10:00:00Z"
  },
  {
    id: 14,
    title: "春熙路周末狂欢",
    venue: "春熙路IFS舞蹈中心",
    address: "成都市锦江区红星路三段1号",
    city: "成都",
    date: "2026-06-27",
    startTime: "20:30",
    endTime: "00:00",
    styles: ["LA", "NY", "Cuban"],
    price: 110,
    description: "成都最繁华商圈的周末狂欢舞会，高颜值聚集地",
    organizer: "IFS舞蹈工作室",
    latitude: 30.6537,
    longitude: 104.0815,
    viewCount: 321,
    attendeeCount: 48,
    maxAttendees: 70,
    registrationDeadline: "2026-06-27T18:00:00Z",
    createdAt: "2026-06-06T13:00:00Z"
  },
  {
    id: 15,
    title: "西湖拉丁舞夜",
    venue: "西湖文化广场舞蹈厅",
    address: "杭州市下城区西湖文化广场",
    city: "杭州",
    date: "2026-06-21",
    startTime: "19:30",
    endTime: "22:30",
    styles: ["Cuban", "LA"],
    price: 70,
    description: "西湖边的浪漫莎莎舞会，享受杭州之夜",
    organizer: "西湖舞蹈俱乐部",
    latitude: 30.2790,
    longitude: 120.1614,
    viewCount: 223,
    attendeeCount: 30,
    maxAttendees: 50,
    registrationDeadline: "2026-06-21T17:00:00Z",
    createdAt: "2026-06-03T14:00:00Z"
  },
  {
    id: 16,
    title: "钱江新城周末社交",
    venue: "钱江新城文化中心",
    address: "杭州市江干区富春路",
    city: "杭州",
    date: "2026-06-28",
    startTime: "20:00",
    endTime: "23:30",
    styles: ["NY", "Bachata"],
    price: 85,
    description: "钱江新城CBD白领社交舞会，专业场地+优质舞友",
    organizer: "杭州白领舞蹈社",
    latitude: 30.2457,
    longitude: 120.2077,
    viewCount: 189,
    attendeeCount: 24,
    maxAttendees: 40,
    registrationDeadline: "2026-06-28T18:00:00Z",
    createdAt: "2026-06-07T16:00:00Z"
  }
];

let users = [
  {
    id: 1,
    name: "张小明",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaoming",
    danceYears: 3,
    role: "leader",
    styles: [{ name: "Cuban", weight: 80 }, { name: "LA", weight: 50 }],
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
    styles: [{ name: "Cuban", weight: 60 }, { name: "Bachata", weight: 70 }],
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
    styles: [{ name: "NY", weight: 90 }, { name: "LA", weight: 85 }],
    level: "advanced",
    bio: "职业舞者，NY和LA风格双修，可引带可跟随",
    city: "北京",
    createdAt: "2025-06-10T00:00:00Z"
  },
  {
    id: 4,
    name: "陈小燕",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chenxiaoyan",
    danceYears: 4,
    role: "follower",
    styles: [{ name: "Cuban", weight: 95 }],
    level: "intermediate",
    bio: "Cuban风格爱好者，喜欢热情奔放的舞蹈",
    city: "广州",
    createdAt: "2025-12-01T00:00:00Z"
  },
  {
    id: 5,
    name: "刘志强",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liuzhiqiang",
    danceYears: 1,
    role: "leader",
    styles: [{ name: "LA", weight: 40 }],
    level: "beginner",
    bio: "LA风格新手，正在努力学习中",
    city: "深圳",
    createdAt: "2026-04-05T00:00:00Z"
  },
  {
    id: 6,
    name: "赵雪梅",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoxuemei",
    danceYears: 3,
    role: "follower",
    styles: [{ name: "NY", weight: 75 }, { name: "Cuban", weight: 60 }],
    level: "intermediate",
    bio: "北京莎莎舞爱好者，工作之余最喜欢跳舞",
    city: "北京",
    createdAt: "2025-09-18T00:00:00Z"
  },
  {
    id: 7,
    name: "孙建国",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sunjianguo",
    danceYears: 4,
    role: "leader",
    styles: [{ name: "Cuban", weight: 85 }, { name: "Bachata", weight: 70 }],
    level: "advanced",
    bio: "广州资深莎莎舞者，喜欢教人跳舞",
    city: "广州",
    createdAt: "2025-03-22T00:00:00Z"
  },
  {
    id: 8,
    name: "周美玲",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhoumeiling",
    danceYears: 2,
    role: "follower",
    styles: [{ name: "LA", weight: 70 }],
    level: "beginner",
    bio: "深圳新手，喜欢LA风格的酷",
    city: "深圳",
    createdAt: "2026-02-14T00:00:00Z"
  },
  {
    id: 9,
    name: "吴浩然",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wuhaoran",
    danceYears: 3,
    role: "leader",
    styles: [{ name: "Cuban", weight: 80 }, { name: "Bachata", weight: 75 }],
    level: "intermediate",
    bio: "成都莎莎舞圈的活跃分子",
    city: "成都",
    createdAt: "2025-11-08T00:00:00Z"
  },
  {
    id: 10,
    name: "郑小雨",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhengxiaoyu",
    danceYears: 2,
    role: "follower",
    styles: [{ name: "NY", weight: 65 }, { name: "LA", weight: 55 }],
    level: "intermediate",
    bio: "杭州女孩，喜欢跳莎莎舞的感觉",
    city: "杭州",
    createdAt: "2026-01-28T00:00:00Z"
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

let danceRegistrations = [
  { id: 1, danceId: 1, userId: 1, createdAt: "2026-06-10T08:00:00Z" },
  { id: 2, danceId: 1, userId: 2, createdAt: "2026-06-11T09:00:00Z" },
  { id: 3, danceId: 1, userId: 3, createdAt: "2026-06-11T10:00:00Z" },
  { id: 4, danceId: 2, userId: 1, createdAt: "2026-06-12T14:00:00Z" },
  { id: 5, danceId: 2, userId: 3, createdAt: "2026-06-13T11:00:00Z" },
  { id: 6, danceId: 5, userId: 3, createdAt: "2026-06-08T14:20:00Z" },
  { id: 7, danceId: 5, userId: 4, createdAt: "2026-06-09T10:00:00Z" }
];

let comments = [
  {
    id: 1,
    danceId: 1,
    userId: 2,
    parentId: null,
    replyToUserId: null,
    content: "这个舞会太棒了！现场氛围超级好，下次一定还来！",
    likeCount: 5,
    createdAt: "2026-06-16T09:30:00Z"
  },
  {
    id: 2,
    danceId: 1,
    userId: 3,
    parentId: null,
    replyToUserId: null,
    content: "DJ选曲很专业，就是空调有点冷，建议大家带件外套。",
    likeCount: 3,
    createdAt: "2026-06-16T10:15:00Z"
  },
  {
    id: 3,
    danceId: 1,
    userId: 1,
    parentId: 2,
    replyToUserId: 3,
    content: "哈哈同感，我也觉得有点冷，不过跳舞跳热了就好了~",
    likeCount: 2,
    createdAt: "2026-06-16T10:45:00Z"
  },
  {
    id: 4,
    danceId: 1,
    userId: 4,
    parentId: null,
    replyToUserId: null,
    content: "有没有新手一起呀？我刚学Cuban，不太敢下场...",
    likeCount: 1,
    createdAt: "2026-06-16T11:00:00Z"
  },
  {
    id: 5,
    danceId: 2,
    userId: 1,
    parentId: null,
    replyToUserId: null,
    content: "工作坊老师教得很好，收获满满！推荐给想进阶的朋友。",
    likeCount: 4,
    createdAt: "2026-06-17T09:30:00Z"
  }
];

let nextDanceId = 17;
let nextUserId = 11;
let nextInvitationId = 3;
let nextReviewId = 4;
let nextFollowId = 5;
let nextNotificationId = 2;
let nextRegistrationId = 8;
let nextCommentId = 6;

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

function getDanceRegistrations(danceId) {
  return danceRegistrations.filter(r => r.danceId === danceId);
}

function getUserRegistrations(userId) {
  return danceRegistrations.filter(r => r.userId === userId);
}

function isRegistered(danceId, userId) {
  return danceRegistrations.some(r => r.danceId === danceId && r.userId === userId);
}

function addRegistration(danceId, userId) {
  if (isRegistered(danceId, userId)) {
    return null;
  }
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return null;
  }
  const newRegistration = {
    id: nextRegistrationId++,
    danceId,
    userId,
    createdAt: new Date().toISOString()
  };
  danceRegistrations.push(newRegistration);
  dance.attendeeCount++;
  return newRegistration;
}

function removeRegistration(danceId, userId) {
  const index = danceRegistrations.findIndex(r => r.danceId === danceId && r.userId === userId);
  if (index === -1) {
    return false;
  }
  danceRegistrations.splice(index, 1);
  const dance = dances.find(d => d.id === danceId);
  if (dance && dance.attendeeCount > 0) {
    dance.attendeeCount--;
  }
  return true;
}

function getRegisteredUsers(danceId) {
  const registrations = getDanceRegistrations(danceId);
  return registrations.map(r => users.find(u => u.id === r.userId)).filter(Boolean);
}

function getUserRegisteredDances(userId) {
  const registrations = getUserRegistrations(userId);
  return registrations.map(r => dances.find(d => d.id === r.danceId)).filter(Boolean);
}

function isRegistrationFull(danceId) {
  const dance = dances.find(d => d.id === danceId);
  if (!dance || !dance.maxAttendees) {
    return false;
  }
  return dance.attendeeCount >= dance.maxAttendees;
}

function isRegistrationClosed(danceId) {
  const dance = dances.find(d => d.id === danceId);
  if (!dance || !dance.registrationDeadline) {
    return false;
  }
  return new Date() > new Date(dance.registrationDeadline);
}

function normalizeStyles(styles) {
  if (!styles) return [];
  if (Array.isArray(styles) && styles.length > 0 && typeof styles[0] === 'string') {
    return styles.map(name => ({ name, weight: 50 }));
  }
  return styles.map(s => ({
    name: s.name,
    weight: Math.max(0, Math.min(100, parseInt(s.weight) || 50))
  }));
}

function getStyleNames(styles) {
  if (!styles) return [];
  return normalizeStyles(styles).map(s => s.name);
}

function getStyleWeightMap(styles) {
  const map = {};
  normalizeStyles(styles).forEach(s => {
    map[s.name] = s.weight;
  });
  return map;
}

function getCommentsByDanceId(danceId) {
  return comments.filter(c => c.danceId === parseInt(danceId));
}

function getCommentById(commentId) {
  return comments.find(c => c.id === parseInt(commentId));
}

function addComment(commentData) {
  const newComment = {
    id: nextCommentId++,
    danceId: parseInt(commentData.danceId),
    userId: parseInt(commentData.userId),
    parentId: commentData.parentId ? parseInt(commentData.parentId) : null,
    replyToUserId: commentData.replyToUserId ? parseInt(commentData.replyToUserId) : null,
    content: commentData.content,
    likeCount: 0,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  return newComment;
}

function deleteComment(commentId) {
  const index = comments.findIndex(c => c.id === parseInt(commentId));
  if (index === -1) return false;
  
  const commentIdsToDelete = [parseInt(commentId)];
  const stack = [parseInt(commentId)];
  while (stack.length > 0) {
    const currentId = stack.pop();
    comments
      .filter(c => c.parentId === currentId)
      .forEach(c => {
        commentIdsToDelete.push(c.id);
        stack.push(c.id);
      });
  }
  
  commentIdsToDelete.forEach(id => {
    const idx = comments.findIndex(c => c.id === id);
    if (idx !== -1) comments.splice(idx, 1);
  });
  
  return true;
}

function likeComment(commentId) {
  const comment = getCommentById(commentId);
  if (comment) {
    comment.likeCount++;
    return comment;
  }
  return null;
}

module.exports = {
  SUPPORTED_CITIES,
  dances,
  users,
  invitations,
  reviews,
  follows,
  notifications,
  danceRegistrations,
  comments,
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
  markAllAsRead,
  getDanceRegistrations,
  getUserRegistrations,
  isRegistered,
  addRegistration,
  removeRegistration,
  getRegisteredUsers,
  getUserRegisteredDances,
  isRegistrationFull,
  isRegistrationClosed,
  normalizeStyles,
  getStyleNames,
  getStyleWeightMap,
  getCommentsByDanceId,
  getCommentById,
  addComment,
  deleteComment,
  likeComment
};
