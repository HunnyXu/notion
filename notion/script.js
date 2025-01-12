// Notion API配置
const NOTION_API_KEY = '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';
const DATABASE_ID = '179076d62747803f8dcdf09d5c35a7e1';

// 初始化Notion小组件
class NotionWidget {
  constructor() {
    this.contentElement = document.getElementById('content');
    this.heatmapContainer = document.createElement('div');
    this.heatmapContainer.className = 'heatmap';
    this.contentElement.appendChild(this.heatmapContainer);
    this.init();
  }

  // 初始化方法
  async init() {
    try {
      const data = await this.fetchNotionData();
      this.renderHeatmap(data);
    } catch (error) {
      console.error('Error:', error);
      this.renderContent('无法加载数据');
    }
  }

  // 获取Notion数据
  async fetchNotionData() {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  }

  // 渲染热力图
  renderHeatmap(data) {
    // 处理数据并生成热力图
    const heatmapData = this.processData(data);
    
    // 创建热力图元素
    const heatmapHtml = heatmapData.map(day => `
      <div class="heatmap-day" style="background-color: ${day.color};" title="${day.date}: ${day.value}次">
      </div>
    `).join('');

    this.heatmapContainer.innerHTML = heatmapHtml;
  }

  // 处理数据
  processData(data) {
    const result = [];
    const colorScale = [
      { min: 0, max: 0, color: '#ebedf0' },
      { min: 1, max: 1, color: '#9be9a8' },
      { min: 2, max: 2, color: '#40c463' },
      { min: 3, max: 3, color: '#30a14e' },
      { min: 4, max: 4, color: '#216e39' }
    ];

    // 处理每条记录
    data.results.forEach(page => {
      const date = page.properties['日期']?.date?.start;
      if (!date) return;

      // 计算当天打卡次数
      const count = ['咖啡', '跑步', '健身'].reduce((sum, field) => {
        return sum + (page.properties[field]?.checkbox ? 1 : 0);
      }, 0);

      // 获取对应颜色
      const color = colorScale.find(scale => 
        count >= scale.min && count <= scale.max
      )?.color || '#ebedf0';

      result.push({
        date: date,
        value: count,
        color: color
      });
    });

    return result;
  }
}

// 页面加载完成后初始化小组件
window.addEventListener('load', () => {
  new NotionWidget();
});
