'use strict';

const openBookIndex = {
  nuclear: {
    overview: '原子核物理_复习总结',
    handbook: '原子核物理_精简讲义_A4_6up',
    practice: '原子核物理_习题与解答',
    chapters: {
      'nuclear-1': [['质量亏损、结合能、核半径', '课件第 01 章 · 原子核的基本性质']],
      'nuclear-2': [['核力特征、液滴模型、幻数', '课件第 02 章 · 核力与核结构']],
      'nuclear-3': [['半衰期、活度、α/β/γ 衰变与选择定则', '课件第 03 章 · 原子核衰变']],
      'nuclear-4': [['守恒、反应 Q 值、阈能和截面', '课件第 04 章 · 核反应']],
      'nuclear-5': [['重带电粒子、光子和中子的作用机制', '课件第 05 章 · 射线与物质相互作用']]
    }
  },
  sensor: {
    overview: '传感器_复习总结',
    handbook: '传感器_课件整理讲义_A4_6up',
    practice: '传感器_期末复习题与解答',
    chapters: {
      'sensor-1': [['灵敏度、线性、迟滞和动态指标', '课件第 02 章 · 传感器技术基础'], ['应变系数、电桥接线和温度补偿', '课件第 03 章 · 应变式传感器']],
      'sensor-2': [['变气隙、自感、差动变压器', '课件第 04 章 · 电感式传感器'], ['变极距、变面积、变介质及测量电路', '课件第 05 章 · 电容式传感器']],
      'sensor-3': [['压电效应、电荷放大器和低频限制', '课件第 06 章 · 压电式传感器'], ['磁电感应式速度测量和磁电转换', '课件第 07 章 · 磁电式传感器']],
      'sensor-4': [['光电效应、光敏元件和编码', '课件第 08 章 · 光电式传感器'], ['霍尔效应和半导体敏感元件', '课件第 09 章 · 半导体传感器'], ['波与辐射检测原理', '课件第 10 章 · 波与辐射式传感器'], ['热阻、热敏电阻和热电偶冷端补偿', '课件第 11 章 · 温度传感器']],
      'sensor-5': [['前置放大、运算放大、滤波和相敏检波', '课件附录 A–D · 测量电路']]
    }
  }
};

function renderResourceIndex(courseId, chapterId) {
  const index = openBookIndex[courseId];
  if (!index) return '';
  const entries = index.chapters[chapterId] || [];
  return `<section class="panel resource-panel">
    <h3>开卷资料索引</h3>
    <p class="muted">按题中的关键词定位课件；需要完整推导或例题时，按名称查阅已有资料。</p>
    <dl class="lookup-list">${entries.map(([topic, source]) => `
      <div><dt>${topic}</dt><dd>${source}</dd></div>`).join('')}
      <div><dt>公式与易错点</dt><dd>${index.overview}</dd></div>
      <div><dt>查原讲义页码</dt><dd>${index.handbook}</dd></div>
      <div><dt>找同类型例题</dt><dd>${index.practice}</dd></div>
    </dl>
  </section>`;
}
