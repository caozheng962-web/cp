import { LiveRoom } from './types';

export const LIVE_ROOMS: LiveRoom[] = [
  {
    id: 'fashion',
    name: '大时尚直播间',
    videoUrl: 'https://shi-1318541159.cos.ap-guangzhou.myqcloud.com/zbtest-1.mp4',
    skus: [
      { id: 'f-001', name: '时尚连衣裙', price: 299 },
      { id: 'f-002', name: '休闲牛仔裤', price: 199 },
      { id: 'f-003', name: '运动T恤', price: 99 },
      { id: 'f-004', name: '高跟鞋', price: 399 },
      { id: 'f-005', name: '太阳镜', price: 159 },
    ]
  },
  {
    id: 'supermarket',
    name: '大商超直播间',
    videoUrl: 'https://shi-1318541159.cos.ap-guangzhou.myqcloud.com/zbtest-2.mp4',
    skus: [
      { id: 's-001', name: '有机大米 5kg', price: 68 },
      { id: 's-002', name: '食用油 5L', price: 89 },
      { id: 's-003', name: '洗衣液 2kg', price: 45 },
      { id: 's-004', name: '抽纸 12包', price: 29 },
      { id: 's-005', name: '进口牛奶 1箱', price: 78 },
    ]
  },
  {
    id: 'home_appliance',
    name: '家电家具直播间',
    videoUrl: 'https://shi-1318541159.cos.ap-guangzhou.myqcloud.com/zbtest-3.mp4',
    skus: [
      { id: 'h-001', name: '欧普照明灯具', price: 138 },
      { id: 'h-002', name: '美的电风扇', price: 199 },
      { id: 'h-003', name: 'XX 吸尘器', price: 399 },
      { id: 'h-004', name: '智能电饭煲', price: 299 },
      { id: 'h-005', name: '实木餐椅', price: 158 },
    ]
  },
  {
    id: '3c_digital',
    name: '3C 数码直播间',
    videoUrl: 'https://shi-1318541159.cos.ap-guangzhou.myqcloud.com/zbtest-4.mp4',
    skus: [
      { id: 'd-001', name: '无线蓝牙耳机', price: 199 },
      { id: 'd-002', name: '智能手环', price: 149 },
      { id: 'd-003', name: '高速充电宝', price: 89 },
      { id: 'd-004', name: '手机支架', price: 29 },
      { id: 'd-005', name: '机械键盘', price: 299 },
    ]
  }
];

export const ISSUE_OPTIONS = [
  { id: 'mismatch', label: '图文不匹配问题' },
  { id: 'carousel', label: '轮播图片问题' },
  { id: 'invalid_flash', label: '无效空闪问题' },
  { id: 'duration', label: '视频时长问题' },
  { id: 'ux', label: '用户体验问题' },
  { id: 'other', label: '其他问题（需要说明）' },
];
