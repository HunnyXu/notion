// 初始化Notion客户端
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: 'ntn_E199374624761Ya4MkkaNaOTwkHLhFDxIwpTRzbG2Vc7bx' });
const databaseId = '179076d62747803f8dcdf09d5c35a7e1';

// 获取当前日期
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

// 从Notion获取打卡数据
async function fetchCheckinData() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: new Date(currentYear, currentMonth, 1).toISOString()
            }
          },
          {
            property: 'Date',
            date: {
              on_or_before: new Date(currentYear, currentMonth + 1, 0).toISOString()
            }
          }
        ]
      }
    });

    return response.results;
  } catch (error) {
    console.error('Error fetching data from Notion:', error);
    return [];
  }
}

// 处理Notion数据生成热力图数据
async function generateMonthData() {
  const checkins = await fetchCheckinData();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const data = [];

  // 初始化每日数据
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    
    data.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      value: 0
    });
  }

  // 处理打卡记录
  checkins.forEach(checkin => {
    const date = new Date(checkin.properties.Date.date.start);
    const day = date.getDate() - 1;
    
    if (day >= 0 && day < data.length) {
      data[day].value += 1; // 每次打卡增加1
    }
  });

  return data;
}

// 转换热力图数据格式
function transformHeatmapData(monthData) {
  return monthData.map(d => ({
    x: d.dayOfWeek,
    y: Math.floor((new Date(d.date).getDate() - 1) / 7),
    value: d.value,
    date: d.date
  }));
}

let heatmapData = [];

async function initialize() {
  const monthData = await generateMonthData();
  heatmapData = transformHeatmapData(monthData);
  initHeatmap();
}

// 热力图配置
const heatmapConfig = {
  radius: 50,
  maxOpacity: 0.8,
  minOpacity: 0.1,
  blur: 0.75,
  gradient: {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
  }
};

// 初始化热力图
function initHeatmap() {
  const container = document.getElementById('heatmap-container');
  container.style.width = '300px';
  container.style.height = '300px';
  container.style.position = 'relative';

  // 添加日期标签
  const labelsContainer = document.createElement('div');
  labelsContainer.className = 'heatmap-labels';
  
  // 添加星期标签
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  weekdays.forEach((day, index) => {
    const label = document.createElement('div');
    label.className = 'weekday-label';
    label.style.left = `${(index / 7) * 100}%`;
    label.textContent = day;
    labelsContainer.appendChild(label);
  });

  // 添加周数标签
  const weeks = Math.ceil(heatmapData.length / 7);
  for (let week = 0; week < weeks; week++) {
    const label = document.createElement('div');
    label.className = 'week-label';
    label.style.top = `${(week / weeks) * 100}%`;
    label.textContent = `W${week + 1}`;
    labelsContainer.appendChild(label);
  }

  container.appendChild(labelsContainer);

  // 创建热力图实例
  const heatmapInstance = h337.create({
    container,
    ...heatmapConfig
  });

  // 添加数据
  const points = heatmapData.map(d => ({
    x: d.x * 100 + 50,
    y: d.y * 100 + 50,
    value: d.value
  }));
  
  heatmapInstance.setData({
    max: 100,
    min: 0,
    data: points
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initHeatmap();
});
