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
  },
  {
    id: 17,
    title: "新年拉丁狂欢夜",
    venue: "热情拉丁舞厅",
    address: "上海市黄浦区南京东路100号",
    city: "上海",
    date: "2026-01-10",
    startTime: "20:00",
    endTime: "24:00",
    styles: ["Cuban", "LA", "Bachata"],
    price: 128,
    description: "新年第一场拉丁狂欢派对，现场乐队+专业表演",
    organizer: "热情舞蹈工作室",
    latitude: 31.2304,
    longitude: 121.4737,
    viewCount: 456,
    attendeeCount: 58,
    maxAttendees: 80,
    registrationDeadline: "2026-01-09T18:00:00Z",
    createdAt: "2025-12-28T10:00:00Z"
  },
  {
    id: 18,
    title: "情人节浪漫舞会",
    venue: "星空舞蹈俱乐部",
    address: "上海市浦东新区陆家嘴环路500号",
    city: "上海",
    date: "2026-02-14",
    startTime: "19:30",
    endTime: "23:30",
    styles: ["Cuban", "Bachata"],
    price: 168,
    description: "情人节专属浪漫舞会，双人套票优惠，赠送玫瑰花",
    organizer: "星空舞蹈俱乐部",
    latitude: 31.2397,
    longitude: 121.4998,
    viewCount: 523,
    attendeeCount: 52,
    maxAttendees: 70,
    registrationDeadline: "2026-02-13T20:00:00Z",
    createdAt: "2026-02-01T12:00:00Z"
  },
  {
    id: 19,
    title: "三八妇女节特别场",
    venue: "阳光艺术空间",
    address: "上海市徐汇区衡山路880号",
    city: "上海",
    date: "2026-03-08",
    startTime: "19:00",
    endTime: "22:30",
    styles: ["Cuban", "Bachata", "LA"],
    price: 38,
    description: "女神节专属优惠，女士半价入场，现场教学体验",
    organizer: "阳光艺术空间",
    latitude: 31.2001,
    longitude: 121.4365,
    viewCount: 312,
    attendeeCount: 42,
    maxAttendees: 60,
    registrationDeadline: "2026-03-07T18:00:00Z",
    createdAt: "2026-03-01T09:00:00Z"
  },
  {
    id: 20,
    title: "NY风格大师班舞会",
    venue: "城市舞蹈中心",
    address: "上海市静安区延安西路1200号",
    city: "上海",
    date: "2026-04-12",
    startTime: "18:00",
    endTime: "22:30",
    styles: ["NY", "LA"],
    price: 220,
    description: "特邀国际NY风格大师授课+舞会练习，限40人",
    organizer: "城市舞蹈中心",
    latitude: 31.2289,
    longitude: 121.4475,
    viewCount: 278,
    attendeeCount: 36,
    maxAttendees: 40,
    registrationDeadline: "2026-04-10T20:00:00Z",
    createdAt: "2026-04-01T14:00:00Z"
  },
  {
    id: 21,
    title: "春季社交舞派对",
    venue: "热情拉丁舞厅",
    address: "上海市黄浦区南京东路100号",
    city: "上海",
    date: "2026-04-26",
    startTime: "20:00",
    endTime: "23:30",
    styles: ["Cuban", "Bachata", "LA"],
    price: 88,
    description: "春暖花开的季节，一起来跳舞吧！新人免费体验",
    organizer: "热情舞蹈工作室",
    latitude: 31.2304,
    longitude: 121.4737,
    viewCount: 234,
    attendeeCount: 45,
    maxAttendees: 60,
    registrationDeadline: "2026-04-25T18:00:00Z",
    createdAt: "2026-04-18T10:00:00Z"
  },
  {
    id: 22,
    title: "五一劳动节狂欢",
    venue: "星空舞蹈俱乐部",
    address: "上海市浦东新区陆家嘴环路500号",
    city: "上海",
    date: "2026-05-17",
    startTime: "19:30",
    endTime: "01:00",
    styles: ["LA", "NY", "Cuban", "Bachata"],
    price: 108,
    description: "五一假期超长舞会，通宵达旦跳不停，抽奖活动",
    organizer: "星空舞蹈俱乐部",
    latitude: 31.2397,
    longitude: 121.4998,
    viewCount: 421,
    attendeeCount: 65,
    maxAttendees: 90,
    registrationDeadline: "2026-05-16T22:00:00Z",
    createdAt: "2026-05-08T15:00:00Z"
  },
  {
    id: 23,
    title: "周日下午社交舞",
    venue: "阳光艺术空间",
    address: "上海市徐汇区衡山路880号",
    city: "上海",
    date: "2026-05-24",
    startTime: "15:00",
    endTime: "18:00",
    styles: ["Cuban", "Bachata"],
    price: 50,
    description: "周末下午轻松社交舞会，新手友好，免费体验课",
    organizer: "阳光艺术空间",
    latitude: 31.2001,
    longitude: 121.4365,
    viewCount: 189,
    attendeeCount: 28,
    maxAttendees: 50,
    registrationDeadline: "2026-05-24T12:00:00Z",
    createdAt: "2026-05-20T09:00:00Z"
  },
  {
    id: 24,
    title: "儿童节主题派对",
    venue: "热情拉丁舞厅",
    address: "上海市黄浦区南京东路100号",
    city: "上海",
    date: "2026-06-07",
    startTime: "19:30",
    endTime: "23:00",
    styles: ["Cuban", "LA", "NY"],
    price: 61,
    description: "重返童年主题派对，怀旧游戏+趣味舞蹈互动",
    organizer: "热情舞蹈工作室",
    latitude: 31.2304,
    longitude: 121.4737,
    viewCount: 298,
    attendeeCount: 48,
    maxAttendees: 65,
    registrationDeadline: "2026-06-06T20:00:00Z",
    createdAt: "2026-06-01T11:00:00Z"
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

const BADGE_DEFINITIONS = [
  {
    id: 'first_dance',
    name: '首支舞曲',
    description: '完成第一次邀约并被接受',
    icon: '💃',
    color: '#FF6B6B',
    checkCondition: (userId) => {
      const acceptedInvitations = invitations.filter(
        inv => inv.fromUserId === userId && inv.status === 'accepted'
      );
      return acceptedInvitations.length >= 1;
    }
  },
  {
    id: 'social_butterfly',
    name: '社交达人',
    description: '累计发起5次邀约',
    icon: '🦋',
    color: '#4ECDC4',
    checkCondition: (userId) => {
      const sentInvitations = invitations.filter(inv => inv.fromUserId === userId);
      return sentInvitations.length >= 5;
    }
  },
  {
    id: 'dance_floor_regular',
    name: '舞会常客',
    description: '参加过3场不同的舞会',
    icon: '🎭',
    color: '#FFE66D',
    checkCondition: (userId) => {
      const userCheckins = checkins.filter(c => c.userId === userId);
      const uniqueDanceIds = [...new Set(userCheckins.map(c => c.danceId))];
      return uniqueDanceIds.length >= 3;
    }
  }
];

let userBadges = [
  { userId: 1, badgeId: 'first_dance', earnedAt: '2026-01-10T20:15:00Z' },
  { userId: 1, badgeId: 'social_butterfly', earnedAt: '2026-03-08T20:30:00Z' },
  { userId: 1, badgeId: 'dance_floor_regular', earnedAt: '2026-02-14T19:45:00Z' },
  { userId: 2, badgeId: 'first_dance', earnedAt: '2026-03-08T20:35:00Z' }
];

function getBadgeDefinitions() {
  return BADGE_DEFINITIONS.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    color: b.color
  }));
}

function getUserBadges(userId) {
  const uid = parseInt(userId);
  const earned = userBadges.filter(ub => ub.userId === uid);
  return earned.map(ub => {
    const def = BADGE_DEFINITIONS.find(b => b.id === ub.badgeId);
    return def ? {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      color: def.color,
      earnedAt: ub.earnedAt
    } : null;
  }).filter(Boolean);
}

function hasBadge(userId, badgeId) {
  const uid = parseInt(userId);
  return userBadges.some(ub => ub.userId === uid && ub.badgeId === badgeId);
}

function awardBadge(userId, badgeId) {
  const uid = parseInt(userId);
  if (hasBadge(uid, badgeId)) {
    return null;
  }
  
  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!badgeDef) {
    return null;
  }
  
  const newBadge = {
    userId: uid,
    badgeId: badgeId,
    earnedAt: new Date().toISOString()
  };
  
  userBadges.push(newBadge);
  
  const user = users.find(u => u.id === uid);
  addNotification(
    uid,
    'badge_earned',
    '获得新徽章',
    `恭喜你获得「${badgeDef.name}」徽章！`,
    badgeId
  );
  
  return {
    id: badgeDef.id,
    name: badgeDef.name,
    description: badgeDef.description,
    icon: badgeDef.icon,
    color: badgeDef.color,
    earnedAt: newBadge.earnedAt
  };
}

function checkAndAwardBadges(userId) {
  const uid = parseInt(userId);
  const newlyEarned = [];
  
  BADGE_DEFINITIONS.forEach(badgeDef => {
    if (!hasBadge(uid, badgeDef.id) && badgeDef.checkCondition(uid)) {
      const badge = awardBadge(uid, badgeDef.id);
      if (badge) {
        newlyEarned.push(badge);
      }
    }
  });
  
  return newlyEarned;
}

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

let feedbacks = [];

let playlistSongs = [
  { id: 1, danceId: 1, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 2, danceId: 1, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 3, danceId: 1, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 4, danceId: 1, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 5, danceId: 1, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 6, danceId: 1, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 7, danceId: 1, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 8, danceId: 1, title: "La Tortura", artist: "Shakira ft. Alejandro Sanz", duration: "3:32", style: "LA" },

  { id: 9, danceId: 2, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 10, danceId: 2, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 11, danceId: 2, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 12, danceId: 2, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },
  { id: 13, danceId: 2, title: "Mi Corazoncito", artist: "Aventura", duration: "3:55", style: "NY" },
  { id: 14, danceId: 2, title: "Los Infieles", artist: "Aventura", duration: "4:15", style: "NY" },
  { id: 15, danceId: 2, title: "Hermanita", artist: "Aventura", duration: "4:20", style: "NY" },
  { id: 16, danceId: 2, title: "La Boda", artist: "Aventura", duration: "4:40", style: "NY" },

  { id: 17, danceId: 3, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 18, danceId: 3, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 19, danceId: 3, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },
  { id: 20, danceId: 3, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 21, danceId: 3, title: "La Bilirrubina", artist: "Juan Luis Guerra", duration: "4:10", style: "Cuban" },
  { id: 22, danceId: 3, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 23, danceId: 3, title: "Estrellitas Y Duendes", artist: "Juan Luis Guerra", duration: "4:05", style: "Cuban" },
  { id: 24, danceId: 3, title: "Todo Por Tu Amor", artist: "Xtreme", duration: "3:50", style: "Bachata" },

  { id: 25, danceId: 4, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },
  { id: 26, danceId: 4, title: "Ahora Quien", artist: "Marc Anthony", duration: "4:15", style: "LA" },
  { id: 27, danceId: 4, title: "Y Hubo Alguien", artist: "Marc Anthony", duration: "4:20", style: "LA" },
  { id: 28, danceId: 4, title: "Contra La Corriente", artist: "Marc Anthony", duration: "4:45", style: "LA" },
  { id: 29, danceId: 4, title: "No Me Ames", artist: "Jennifer Lopez & Marc Anthony", duration: "4:35", style: "LA" },
  { id: 30, danceId: 4, title: "Muy Dentro De Mi", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 31, danceId: 4, title: "Celos", artist: "Marc Anthony", duration: "4:22", style: "LA" },
  { id: 32, danceId: 4, title: "Hasta Ayer", artist: "Marc Anthony", duration: "3:58", style: "LA" },

  { id: 33, danceId: 5, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 34, danceId: 5, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 35, danceId: 5, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 36, danceId: 5, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 37, danceId: 5, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 38, danceId: 5, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 39, danceId: 5, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 40, danceId: 5, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },
  { id: 41, danceId: 5, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 42, danceId: 5, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },

  { id: 43, danceId: 6, title: "La Bilirrubina", artist: "Juan Luis Guerra", duration: "4:10", style: "Cuban" },
  { id: 44, danceId: 6, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 45, danceId: 6, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 46, danceId: 6, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 47, danceId: 6, title: "Estrellitas Y Duendes", artist: "Juan Luis Guerra", duration: "4:05", style: "Cuban" },
  { id: 48, danceId: 6, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 49, danceId: 6, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 50, danceId: 6, title: "Mi Corazoncito", artist: "Aventura", duration: "3:55", style: "NY" },

  { id: 51, danceId: 7, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 52, danceId: 7, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 53, danceId: 7, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },
  { id: 54, danceId: 7, title: "Todo Por Tu Amor", artist: "Xtreme", duration: "3:50", style: "Bachata" },
  { id: 55, danceId: 7, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 56, danceId: 7, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 57, danceId: 7, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 58, danceId: 7, title: "Obsesión", artist: "Aventura", duration: "4:15", style: "Bachata" },

  { id: 59, danceId: 8, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 60, danceId: 8, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 61, danceId: 8, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 62, danceId: 8, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },
  { id: 63, danceId: 8, title: "Ahora Quien", artist: "Marc Anthony", duration: "4:15", style: "LA" },
  { id: 64, danceId: 8, title: "Y Hubo Alguien", artist: "Marc Anthony", duration: "4:20", style: "LA" },
  { id: 65, danceId: 8, title: "Contra La Corriente", artist: "Marc Anthony", duration: "4:45", style: "LA" },
  { id: 66, danceId: 8, title: "No Me Ames", artist: "Jennifer Lopez & Marc Anthony", duration: "4:35", style: "LA" },

  { id: 67, danceId: 9, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 68, danceId: 9, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 69, danceId: 9, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 70, danceId: 9, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 71, danceId: 9, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 72, danceId: 9, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 73, danceId: 9, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 74, danceId: 9, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 75, danceId: 9, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 76, danceId: 9, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },

  { id: 77, danceId: 10, title: "La Bilirrubina", artist: "Juan Luis Guerra", duration: "4:10", style: "Cuban" },
  { id: 78, danceId: 10, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 79, danceId: 10, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 80, danceId: 10, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 81, danceId: 10, title: "Estrellitas Y Duendes", artist: "Juan Luis Guerra", duration: "4:05", style: "Cuban" },
  { id: 82, danceId: 10, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 83, danceId: 10, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 84, danceId: 10, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },

  { id: 85, danceId: 11, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 86, danceId: 11, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 87, danceId: 11, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 88, danceId: 11, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 89, danceId: 11, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 90, danceId: 11, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 91, danceId: 11, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 92, danceId: 11, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },

  { id: 93, danceId: 12, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 94, danceId: 12, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 95, danceId: 12, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 96, danceId: 12, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 97, danceId: 12, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 98, danceId: 12, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },
  { id: 99, danceId: 12, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },
  { id: 100, danceId: 12, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },

  { id: 101, danceId: 13, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 102, danceId: 13, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 103, danceId: 13, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 104, danceId: 13, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 105, danceId: 13, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 106, danceId: 13, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 107, danceId: 13, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 108, danceId: 13, title: "Todo Por Tu Amor", artist: "Xtreme", duration: "3:50", style: "Bachata" },

  { id: 109, danceId: 14, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 110, danceId: 14, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 111, danceId: 14, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 112, danceId: 14, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 113, danceId: 14, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 114, danceId: 14, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 115, danceId: 14, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 116, danceId: 14, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },
  { id: 117, danceId: 14, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },
  { id: 118, danceId: 14, title: "Mi Corazoncito", artist: "Aventura", duration: "3:55", style: "NY" },

  { id: 119, danceId: 15, title: "La Bilirrubina", artist: "Juan Luis Guerra", duration: "4:10", style: "Cuban" },
  { id: 120, danceId: 15, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 121, danceId: 15, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 122, danceId: 15, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 123, danceId: 15, title: "Estrellitas Y Duendes", artist: "Juan Luis Guerra", duration: "4:05", style: "Cuban" },
  { id: 124, danceId: 15, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 125, danceId: 15, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 126, danceId: 15, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },

  { id: 127, danceId: 16, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 128, danceId: 16, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 129, danceId: 16, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 130, danceId: 16, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 131, danceId: 16, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 132, danceId: 16, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },
  { id: 133, danceId: 16, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },
  { id: 134, danceId: 16, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },

  { id: 135, danceId: 17, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 136, danceId: 17, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 137, danceId: 17, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 138, danceId: 17, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 139, danceId: 17, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 140, danceId: 17, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 141, danceId: 17, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 142, danceId: 17, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 143, danceId: 17, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 144, danceId: 17, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },

  { id: 145, danceId: 18, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 146, danceId: 18, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 147, danceId: 18, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 148, danceId: 18, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 149, danceId: 18, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },
  { id: 150, danceId: 18, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 151, danceId: 18, title: "Todo Por Tu Amor", artist: "Xtreme", duration: "3:50", style: "Bachata" },
  { id: 152, danceId: 18, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 153, danceId: 18, title: "Obsesión", artist: "Aventura", duration: "4:15", style: "Bachata" },

  { id: 154, danceId: 19, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 155, danceId: 19, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 156, danceId: 19, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 157, danceId: 19, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 158, danceId: 19, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 159, danceId: 19, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 160, danceId: 19, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 161, danceId: 19, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },
  { id: 162, danceId: 19, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },

  { id: 163, danceId: 20, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 164, danceId: 20, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 165, danceId: 20, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 166, danceId: 20, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },
  { id: 167, danceId: 20, title: "Mi Corazoncito", artist: "Aventura", duration: "3:55", style: "NY" },
  { id: 168, danceId: 20, title: "Los Infieles", artist: "Aventura", duration: "4:15", style: "NY" },
  { id: 169, danceId: 20, title: "Hermanita", artist: "Aventura", duration: "4:20", style: "NY" },
  { id: 170, danceId: 20, title: "La Boda", artist: "Aventura", duration: "4:40", style: "NY" },

  { id: 171, danceId: 21, title: "La Bilirrubina", artist: "Juan Luis Guerra", duration: "4:10", style: "Cuban" },
  { id: 172, danceId: 21, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 173, danceId: 21, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 174, danceId: 21, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 175, danceId: 21, title: "Estrellitas Y Duendes", artist: "Juan Luis Guerra", duration: "4:05", style: "Cuban" },
  { id: 176, danceId: 21, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 177, danceId: 21, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 178, danceId: 21, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },

  { id: 179, danceId: 22, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 180, danceId: 22, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 181, danceId: 22, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 182, danceId: 22, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 183, danceId: 22, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 184, danceId: 22, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 185, danceId: 22, title: "Tu Amor Me Hace Bien", artist: "Marc Anthony", duration: "4:30", style: "LA" },
  { id: 186, danceId: 22, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" },

  { id: 187, danceId: 23, title: "La Bilirrubina", artist: "Juan Luis Guerra", duration: "4:10", style: "Cuban" },
  { id: 188, danceId: 23, title: "Stand By Me", artist: "Prince Royce", duration: "3:25", style: "Bachata" },
  { id: 189, danceId: 23, title: "Burbujas De Amor", artist: "Juan Luis Guerra", duration: "4:25", style: "Cuban" },
  { id: 190, danceId: 23, title: "Bachata Rosa", artist: "Juan Luis Guerra", duration: "3:55", style: "Bachata" },
  { id: 191, danceId: 23, title: "Estrellitas Y Duendes", artist: "Juan Luis Guerra", duration: "4:05", style: "Cuban" },
  { id: 192, danceId: 23, title: "Darte Un Beso", artist: "Prince Royce", duration: "3:38", style: "Bachata" },
  { id: 193, danceId: 23, title: "El Sol No Regresa", artist: "Diablo", duration: "3:55", style: "Cuban" },
  { id: 194, danceId: 23, title: "Corazón Sin Cara", artist: "Prince Royce", duration: "3:42", style: "Bachata" },

  { id: 195, danceId: 24, title: "La Vida Es Un Carnaval", artist: "Celia Cruz", duration: "4:15", style: "Cuban" },
  { id: 196, danceId: 24, title: "Smooth", artist: "Santana ft. Rob Thomas", duration: "4:18", style: "LA" },
  { id: 197, danceId: 24, title: "Vivir Mi Vida", artist: "Marc Anthony", duration: "4:10", style: "LA" },
  { id: 198, danceId: 24, title: "Tengo Un Amor", artist: "Toby Love", duration: "4:02", style: "NY" },
  { id: 199, danceId: 24, title: "La Rebelión", artist: "Joe Arroyo", duration: "3:58", style: "Cuban" },
  { id: 200, danceId: 24, title: "I Need To Know", artist: "Marc Anthony", duration: "3:47", style: "LA" },
  { id: 201, danceId: 24, title: "Solo Por Un Beso", artist: "Aventura", duration: "4:25", style: "NY" },
  { id: 202, danceId: 24, title: "Oye Como Va", artist: "Tito Puente", duration: "4:32", style: "Cuban" },
  { id: 203, danceId: 24, title: "Por Un Segundo", artist: "Aventura", duration: "4:12", style: "NY" },
  { id: 204, danceId: 24, title: "Un Beso", artist: "Aventura", duration: "4:35", style: "NY" }
];

function getPlaylistByDanceId(danceId) {
  return playlistSongs.filter(song => song.danceId === parseInt(danceId));
}

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

let favorites = [
  { id: 1, userId: 1, danceId: 1, createdAt: "2026-06-12T10:00:00Z" },
  { id: 2, userId: 1, danceId: 5, createdAt: "2026-06-13T15:30:00Z" },
  { id: 3, userId: 2, danceId: 1, createdAt: "2026-06-14T09:00:00Z" },
  { id: 4, userId: 3, danceId: 6, createdAt: "2026-06-14T11:20:00Z" }
];

let conversations = [
  {
    id: 1,
    user1Id: 1,
    user2Id: 2,
    lastMessage: "好的，那我们舞会见！记得早点到哦~",
    lastMessageTime: "2026-06-15T14:30:00Z",
    user1Unread: 0,
    user2Unread: 2
  },
  {
    id: 2,
    user1Id: 1,
    user2Id: 3,
    lastMessage: "NY风格的编舞我可以教你几个基础动作",
    lastMessageTime: "2026-06-14T20:15:00Z",
    user1Unread: 1,
    user2Unread: 0
  }
];

let messages = [
  {
    id: 1,
    conversationId: 1,
    senderId: 1,
    receiverId: 2,
    content: "你好婷婷，看你也喜欢Cuban风格，周五的舞会要不要一起跳几曲？",
    createdAt: "2026-06-13T09:00:00Z",
    isRead: true
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 2,
    receiverId: 1,
    content: "好呀小明！我正想找人一起练习呢，你周五几点到？",
    createdAt: "2026-06-13T10:30:00Z",
    isRead: true
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 1,
    receiverId: 2,
    content: "我大概7点半到，可以先在门口碰个面",
    createdAt: "2026-06-13T11:00:00Z",
    isRead: true
  },
  {
    id: 4,
    conversationId: 1,
    senderId: 2,
    receiverId: 1,
    content: "没问题！我穿一件红色的连衣裙，很容易认的",
    createdAt: "2026-06-14T16:20:00Z",
    isRead: false
  },
  {
    id: 5,
    conversationId: 1,
    senderId: 2,
    receiverId: 1,
    content: "好的，那我们舞会见！记得早点到哦~",
    createdAt: "2026-06-15T14:30:00Z",
    isRead: false
  },
  {
    id: 6,
    conversationId: 2,
    senderId: 3,
    receiverId: 1,
    content: "小明你好！听说你也在学LA风格？",
    createdAt: "2026-06-14T19:00:00Z",
    isRead: true
  },
  {
    id: 7,
    conversationId: 2,
    senderId: 1,
    receiverId: 3,
    content: "是啊大伟哥，刚学不久，感觉LA风格的动作好酷啊",
    createdAt: "2026-06-14T19:30:00Z",
    isRead: true
  },
  {
    id: 8,
    conversationId: 2,
    senderId: 3,
    receiverId: 1,
    content: "NY风格的编舞我可以教你几个基础动作",
    createdAt: "2026-06-14T20:15:00Z",
    isRead: false
  }
];

let nextDanceId = 25;
let nextUserId = 11;
let nextInvitationId = 3;
let nextReviewId = 4;
let nextFollowId = 5;
let nextNotificationId = 2;
let nextRegistrationId = 30;
let nextCommentId = 6;
let nextFavoriteId = 5;
let nextConversationId = 3;
let nextMessageId = 9;
let nextCheckinId = 13;
let nextFeedbackId = 1;

let checkins = [
  { id: 1, danceId: 17, userId: 1, checkedInAt: "2026-01-10T20:15:00Z" },
  { id: 2, danceId: 18, userId: 1, checkedInAt: "2026-02-14T19:45:00Z" },
  { id: 3, danceId: 19, userId: 1, checkedInAt: "2026-03-08T20:30:00Z" },
  { id: 4, danceId: 20, userId: 1, checkedInAt: "2026-04-12T19:50:00Z" },
  { id: 5, danceId: 21, userId: 1, checkedInAt: "2026-04-26T20:10:00Z" },
  { id: 6, danceId: 22, userId: 1, checkedInAt: "2026-05-17T20:20:00Z" },
  { id: 7, danceId: 23, userId: 1, checkedInAt: "2026-05-24T20:05:00Z" },
  { id: 8, danceId: 24, userId: 1, checkedInAt: "2026-06-07T19:55:00Z" },
  { id: 9, danceId: 17, userId: 2, checkedInAt: "2026-01-10T20:20:00Z" },
  { id: 10, danceId: 19, userId: 2, checkedInAt: "2026-03-08T20:35:00Z" },
  { id: 11, danceId: 22, userId: 3, checkedInAt: "2026-05-17T20:25:00Z" },
  { id: 12, danceId: 24, userId: 3, checkedInAt: "2026-06-07T20:00:00Z" }
];

let dancePartnerRecords = [
  { id: 1, danceId: 17, userId: 1, partnerId: 2, styles: ["Cuban", "LA"], dancedSongs: 8 },
  { id: 2, danceId: 18, userId: 1, partnerId: 6, styles: ["Cuban", "Bachata"], dancedSongs: 6 },
  { id: 3, danceId: 19, userId: 1, partnerId: 2, styles: ["Cuban"], dancedSongs: 10 },
  { id: 4, danceId: 19, userId: 1, partnerId: 8, styles: ["LA", "NY"], dancedSongs: 4 },
  { id: 5, danceId: 20, userId: 1, partnerId: 6, styles: ["NY", "LA"], dancedSongs: 7 },
  { id: 6, danceId: 21, userId: 1, partnerId: 2, styles: ["Cuban", "Bachata"], dancedSongs: 9 },
  { id: 7, danceId: 22, userId: 1, partnerId: 3, styles: ["LA", "NY", "Cuban"], dancedSongs: 12 },
  { id: 8, danceId: 23, userId: 1, partnerId: 6, styles: ["Bachata", "Cuban"], dancedSongs: 5 },
  { id: 9, danceId: 24, userId: 1, partnerId: 2, styles: ["Cuban", "LA"], dancedSongs: 11 },
  { id: 10, danceId: 24, userId: 1, partnerId: 3, styles: ["NY"], dancedSongs: 3 }
];

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

function isFavorited(userId, danceId) {
  return favorites.some(f => f.userId === userId && f.danceId === danceId);
}

function getFavoritesByUser(userId) {
  const userFavorites = favorites.filter(f => f.userId === userId);
  return userFavorites.map(f => {
    const dance = dances.find(d => d.id === f.danceId);
    return dance ? { ...dance, favoritedAt: f.createdAt } : null;
  }).filter(Boolean);
}

function addFavorite(userId, danceId) {
  if (isFavorited(userId, danceId)) {
    return null;
  }
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return null;
  }
  const newFavorite = {
    id: nextFavoriteId++,
    userId,
    danceId,
    createdAt: new Date().toISOString()
  };
  favorites.push(newFavorite);
  return newFavorite;
}

function removeFavorite(userId, danceId) {
  const index = favorites.findIndex(f => f.userId === userId && f.danceId === danceId);
  if (index === -1) {
    return false;
  }
  favorites.splice(index, 1);
  return true;
}

function getFavoriteCount(danceId) {
  return favorites.filter(f => f.danceId === danceId).length;
}

function getConversationByUsers(userId1, userId2) {
  return conversations.find(c =>
    (c.user1Id === userId1 && c.user2Id === userId2) ||
    (c.user1Id === userId2 && c.user2Id === userId1)
  );
}

function getUserConversations(userId) {
  const uid = parseInt(userId);
  const userConvs = conversations.filter(c =>
    c.user1Id === uid || c.user2Id === uid
  );
  return userConvs
    .map(c => {
      const otherUserId = c.user1Id === uid ? c.user2Id : c.user1Id;
      const otherUser = users.find(u => u.id === otherUserId);
      const unreadCount = c.user1Id === uid ? c.user1Unread : c.user2Unread;
      return {
        id: c.id,
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar
        } : null,
        lastMessage: c.lastMessage,
        lastMessageTime: c.lastMessageTime,
        unreadCount
      };
    })
    .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
}

function getConversationMessages(conversationId, userId) {
  const convMessages = messages
    .filter(m => m.conversationId === parseInt(conversationId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  const uid = parseInt(userId);
  const conversation = conversations.find(c => c.id === parseInt(conversationId));
  
  if (conversation) {
    if (conversation.user1Id === uid) {
      conversation.user1Unread = 0;
    } else if (conversation.user2Id === uid) {
      conversation.user2Unread = 0;
    }
    messages.forEach(m => {
      if (m.conversationId === parseInt(conversationId) && m.receiverId === uid) {
        m.isRead = true;
      }
    });
  }
  
  return convMessages;
}

function sendMessage(senderId, receiverId, content) {
  const sid = parseInt(senderId);
  const rid = parseInt(receiverId);
  
  if (sid === rid) {
    return null;
  }
  
  let conversation = getConversationByUsers(sid, rid);
  
  if (!conversation) {
    conversation = {
      id: nextConversationId++,
      user1Id: sid,
      user2Id: rid,
      lastMessage: content,
      lastMessageTime: new Date().toISOString(),
      user1Unread: 0,
      user2Unread: 0
    };
    conversations.push(conversation);
  } else {
    conversation.lastMessage = content;
    conversation.lastMessageTime = new Date().toISOString();
  }
  
  const newMessage = {
    id: nextMessageId++,
    conversationId: conversation.id,
    senderId: sid,
    receiverId: rid,
    content,
    createdAt: new Date().toISOString(),
    isRead: false
  };
  messages.push(newMessage);
  
  if (conversation.user1Id === rid) {
    conversation.user1Unread++;
  } else {
    conversation.user2Unread++;
  }
  
  return {
    message: newMessage,
    conversation
  };
}

function getUnreadMessageCount(userId) {
  const uid = parseInt(userId);
  return conversations.reduce((count, c) => {
    if (c.user1Id === uid) {
      return count + c.user1Unread;
    } else if (c.user2Id === uid) {
      return count + c.user2Unread;
    }
    return count;
  }, 0);
}

function getTotalUnreadCount(userId) {
  const notificationUnread = getUnreadCount(userId);
  const messageUnread = getUnreadMessageCount(userId);
  return notificationUnread + messageUnread;
}

function createConversationIfNotExists(user1Id, user2Id) {
  let conversation = getConversationByUsers(user1Id, user2Id);
  if (!conversation) {
    conversation = {
      id: nextConversationId++,
      user1Id: parseInt(user1Id),
      user2Id: parseInt(user2Id),
      lastMessage: null,
      lastMessageTime: new Date().toISOString(),
      user1Unread: 0,
      user2Unread: 0
    };
    conversations.push(conversation);
  }
  return conversation;
}

function isCheckedIn(danceId, userId) {
  return checkins.some(c => c.danceId === parseInt(danceId) && c.userId === parseInt(userId));
}

function checkIn(danceId, userId) {
  if (isCheckedIn(danceId, userId)) {
    return null;
  }
  if (!isRegistered(danceId, userId)) {
    return null;
  }
  const checkin = {
    id: nextCheckinId++,
    danceId: parseInt(danceId),
    userId: parseInt(userId),
    checkedInAt: new Date().toISOString()
  };
  checkins.push(checkin);
  return checkin;
}

function getUserCheckins(userId) {
  return checkins.filter(c => c.userId === parseInt(userId));
}

function getDanceCheckins(danceId) {
  return checkins.filter(c => c.danceId === parseInt(danceId));
}

function getUserAttendedDances(userId) {
  const uid = parseInt(userId);
  const userCheckins = getUserCheckins(uid);
  const attendedDanceIds = userCheckins.map(c => c.danceId);
  const attendedDances = dances
    .filter(d => attendedDanceIds.includes(d.id))
    .map(dance => {
      const checkin = userCheckins.find(c => c.danceId === dance.id);
      const partners = getDancePartnersForUser(uid, dance.id);
      return {
        ...dance,
        checkedInAt: checkin ? checkin.checkedInAt : null,
        partners: partners
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return attendedDances;
}

function getDancePartnersForUser(userId, danceId) {
  const uid = parseInt(userId);
  const did = parseInt(danceId);
  const partnerRecords = dancePartnerRecords.filter(r => r.userId === uid && r.danceId === did);
  return partnerRecords.map(r => {
    const partner = users.find(u => u.id === r.partnerId);
    if (!partner) return null;
    return {
      id: partner.id,
      name: partner.name,
      avatar: partner.avatar,
      styles: r.styles,
      dancedSongs: r.dancedSongs
    };
  }).filter(Boolean);
}

function getUserDanceStats(userId) {
  const uid = parseInt(userId);
  const attendedDances = getUserAttendedDances(uid);
  const totalCount = attendedDances.length;

  const venueCount = {};
  const partnerCount = {};
  const styleCount = {};
  let totalSongs = 0;

  attendedDances.forEach(dance => {
    if (dance.venue) {
      venueCount[dance.venue] = (venueCount[dance.venue] || 0) + 1;
    }
    if (dance.styles) {
      dance.styles.forEach(style => {
        styleCount[style] = (styleCount[style] || 0) + 1;
      });
    }
    if (dance.partners) {
      dance.partners.forEach(partner => {
        if (!partnerCount[partner.id]) {
          partnerCount[partner.id] = {
            partner: { id: partner.id, name: partner.name, avatar: partner.avatar },
            count: 0,
            totalSongs: 0
          };
        }
        partnerCount[partner.id].count += 1;
        partnerCount[partner.id].totalSongs += (partner.dancedSongs || 0);
        totalSongs += (partner.dancedSongs || 0);
      });
    }
  });

  const topVenues = Object.entries(venueCount)
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count);

  const topPartners = Object.values(partnerCount)
    .sort((a, b) => b.count - a.count || b.totalSongs - a.totalSongs)
    .slice(0, 3);

  const topStyles = Object.entries(styleCount)
    .map(([style, count]) => ({ style, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalAttended: totalCount,
    topVenues: topVenues,
    topVenue: topVenues[0] || null,
    topPartners: topPartners,
    topStyles: topStyles,
    totalDancedSongs: totalSongs
  };
}

const venueCapacityMap = {
  "热情拉丁舞厅": 120,
  "城市舞蹈中心": 80,
  "阳光艺术空间": 100,
  "星空舞蹈俱乐部": 150,
  "棕榈树酒吧": 200,
  "国贸拉丁俱乐部": 100,
  "三里屯艺术中心": 90,
  "北京舞蹈学院活动中心": 70,
  "广州塔江畔舞厅": 160,
  "天河体育中心舞蹈厅": 110,
  "海岸城购物中心舞蹈厅": 120,
  "福田CBD文化中心": 90,
  "锦里古街文化中心": 100,
  "春熙路IFS舞蹈中心": 140,
  "西湖文化广场舞蹈厅": 100,
  "钱江新城文化中心": 80
};

const venueDescriptionMap = {
  "热情拉丁舞厅": "专业的拉丁舞蹈场地，配备顶级音响灯光系统，舞池面积宽敞，是上海莎莎舞爱好者的聚集地。",
  "城市舞蹈中心": "综合性舞蹈培训机构，拥有多个专业舞蹈厅，定期举办各类舞蹈工作坊和社交舞会。",
  "阳光艺术空间": "温馨舒适的艺术空间，以周日下午社交舞会闻名，特别适合新手入门练习。",
  "星空舞蹈俱乐部": "陆家嘴高端舞蹈俱乐部，夜景迷人，是进阶舞者交流的首选场地。",
  "棕榈树酒吧": "热带风情主题酒吧，每月举办大型主题派对，现场乐队演奏，氛围热烈。",
  "国贸拉丁俱乐部": "北京CBD商圈专业拉丁舞厅，灯光音响一流，商务人士社交首选。",
  "三里屯艺术中心": "潮流聚集地，年轻舞者的天堂，Bachata爱好者的周末据点。",
  "北京舞蹈学院活动中心": "专业舞蹈院校场地，地板专业，适合各种风格的系统学习和训练。",
  "广州塔江畔舞厅": "珠江边的浪漫舞厅，江景无敌，夜景下跳舞别有一番风味。",
  "天河体育中心舞蹈厅": "交通便利的大型舞蹈场地，新手友好，经常举办免费体验课程。",
  "海岸城购物中心舞蹈厅": "南山商圈核心位置，购物休闲跳舞一站式体验，年轻人聚集地。",
  "福田CBD文化中心": "深圳白领社交舞据点，工作之余放松身心的好去处。",
  "锦里古街文化中心": "成都古街风情，传统与现代的完美融合，别具一格的舞会体验。",
  "春熙路IFS舞蹈中心": "成都最繁华商圈，高颜值聚集地，周末狂欢的不二选择。",
  "西湖文化广场舞蹈厅": "西湖边的浪漫空间，环境优美，适合轻松社交。",
  "钱江新城文化中心": "杭州新城区CBD，现代化设施，白领社交舞会首选。"
};

function getAllVenues() {
  const venueMap = {};
  
  dances.forEach(dance => {
    const key = dance.venue;
    if (!venueMap[key]) {
      venueMap[key] = {
        name: dance.venue,
        address: dance.address,
        city: dance.city,
        latitude: dance.latitude,
        longitude: dance.longitude,
        organizer: dance.organizer,
        capacity: venueCapacityMap[dance.venue] || 100,
        description: venueDescriptionMap[dance.venue] || '优质舞蹈场地，欢迎前来体验！',
        danceCount: 0,
        dances: [],
        totalAttendees: 0,
        totalViews: 0,
        avgPrice: 0
      };
    }
    venueMap[key].danceCount++;
    venueMap[key].dances.push(dance);
    venueMap[key].totalAttendees += dance.attendeeCount;
    venueMap[key].totalViews += dance.viewCount;
    venueMap[key].avgPrice += dance.price;
  });
  
  Object.values(venueMap).forEach(v => {
    if (v.danceCount > 0) {
      v.avgPrice = Math.round(v.avgPrice / v.danceCount);
    }
    v.dances.sort((a, b) => new Date(b.date) - new Date(a.date));
  });
  
  return Object.values(venueMap);
}

function getVenueByName(venueName) {
  const allVenues = getAllVenues();
  return allVenues.find(v => v.name === venueName) || null;
}

function getVenueDances(venueName) {
  return dances
    .filter(d => d.venue === venueName)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getVenueStats(venueName) {
  const venueDances = getVenueDances(venueName);
  const totalAttendees = venueDances.reduce((sum, d) => sum + d.attendeeCount, 0);
  const totalViews = venueDances.reduce((sum, d) => sum + d.viewCount, 0);
  const avgPrice = venueDances.length > 0 
    ? Math.round(venueDances.reduce((sum, d) => sum + d.price, 0) / venueDances.length) 
    : 0;
  
  const styleCount = {};
  venueDances.forEach(d => {
    d.styles.forEach(s => {
      styleCount[s] = (styleCount[s] || 0) + 1;
    });
  });
  const topStyles = Object.entries(styleCount)
    .map(([style, count]) => ({ style, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  return {
    danceCount: venueDances.length,
    totalAttendees,
    totalViews,
    avgPrice,
    topStyles,
    upcomingDances: venueDances.filter(d => new Date(d.date) >= new Date()).length,
    pastDances: venueDances.filter(d => new Date(d.date) < new Date()).length
  };
}

const VALID_FEEDBACK_TYPES = ['功能建议', 'Bug反馈', '使用体验'];

function addFeedback(feedback) {
  const { type, content, userId } = feedback;
  
  if (!VALID_FEEDBACK_TYPES.includes(type)) {
    return { success: false, error: '无效的反馈类型' };
  }
  
  if (!content || content.trim().length === 0) {
    return { success: false, error: '反馈内容不能为空' };
  }
  
  const newFeedback = {
    id: nextFeedbackId++,
    type,
    content: content.trim(),
    userId: userId || null,
    createdAt: new Date().toISOString()
  };
  
  feedbacks.push(newFeedback);
  return { success: true, feedback: newFeedback };
}

function getFeedbacks(filter = {}) {
  let result = [...feedbacks];
  
  if (filter.type) {
    result = result.filter(f => f.type === filter.type);
  }
  
  if (filter.userId) {
    result = result.filter(f => f.userId === parseInt(filter.userId));
  }
  
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getPlatformStats() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const dayOfWeek = now.getDay();
  
  const weekStart = new Date(currentYear, currentMonth, currentDate - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 8);
  
  const totalDances = dances.length;
  const totalUsers = users.length;
  
  const thisMonthDances = dances.filter(d => {
    const danceDate = new Date(d.date);
    return danceDate.getFullYear() === currentYear && danceDate.getMonth() === currentMonth;
  }).length;
  
  const thisWeekDances = dances.filter(d => {
    const danceDate = new Date(`${d.date}T00:00:00`);
    return danceDate >= weekStart && danceDate < weekEnd;
  });
  
  const top3HotDances = [...thisWeekDances]
    .sort((a, b) => (b.viewCount + b.attendeeCount * 2) - (a.viewCount + a.attendeeCount * 2))
    .slice(0, 3)
    .map(d => ({
      id: d.id,
      title: d.title,
      venue: d.venue,
      city: d.city,
      date: d.date,
      viewCount: d.viewCount,
      attendeeCount: d.attendeeCount,
      styles: d.styles,
      price: d.price,
      hotScore: d.viewCount + d.attendeeCount * 2
    }));
  
  if (top3HotDances.length < 3) {
    const additionalDances = [...dances]
      .filter(d => !top3HotDances.find(t => t.id === d.id))
      .sort((a, b) => (b.viewCount + b.attendeeCount * 2) - (a.viewCount + a.attendeeCount * 2))
      .slice(0, 3 - top3HotDances.length)
      .map(d => ({
        id: d.id,
        title: d.title,
        venue: d.venue,
        city: d.city,
        date: d.date,
        viewCount: d.viewCount,
        attendeeCount: d.attendeeCount,
        styles: d.styles,
        price: d.price,
        hotScore: d.viewCount + d.attendeeCount * 2
      }));
    top3HotDances.push(...additionalDances);
  }
  
  return {
    totalDances,
    totalUsers,
    thisMonthDances,
    top3HotDances,
    generatedAt: now.toISOString()
  };
}

module.exports = {
  SUPPORTED_CITIES,
  dances,
  users,
  invitations,
  reviews,
  feedbacks,
  VALID_FEEDBACK_TYPES,
  follows,
  notifications,
  danceRegistrations,
  comments,
  favorites,
  conversations,
  messages,
  getNextDanceId: () => nextDanceId++,
  getNextUserId: () => nextUserId++,
  getNextInvitationId: () => nextInvitationId++,
  getNextReviewId: () => nextReviewId++,
  getNextFeedbackId: () => nextFeedbackId++,
  addFeedback,
  getFeedbacks,
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
  likeComment,
  isFavorited,
  getFavoritesByUser,
  addFavorite,
  removeFavorite,
  getFavoriteCount,
  getConversationByUsers,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getUnreadMessageCount,
  getTotalUnreadCount,
  createConversationIfNotExists,
  checkins,
  dancePartnerRecords,
  isCheckedIn,
  checkIn,
  getUserCheckins,
  getDanceCheckins,
  getUserAttendedDances,
  getDancePartnersForUser,
  getUserDanceStats,
  getBadgeDefinitions,
  getUserBadges,
  hasBadge,
  awardBadge,
  checkAndAwardBadges,
  getAllVenues,
  getVenueByName,
  getVenueDances,
  getVenueStats,
  getPlatformStats,
  playlistSongs,
  getPlaylistByDanceId
};
