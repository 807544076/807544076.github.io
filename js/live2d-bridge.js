/* js/live2d-bridge.js — Live2D 预留接口 */
/* 后期对接 Cubism SDK 时在以下方法中填入实现 */

window.Live2D = {
  _ready: false,

  /** 初始化看板娘（后期加载模型并定位右下角） */
  init() {
    // TODO: 加载 Cubism SDK，创建模型实例
    console.log('[Live2D] 预留接口 — 等待实现');
  },

  /** 响应页面事件（滚动、点击、区块切换） */
  react(event, data) {
    // TODO: 根据事件类型触发对应动作
    // event: 'scroll' | 'click-hero' | 'section-change' | 'egg-triggered'
  },

  /** 显示看板娘 */
  show() {},

  /** 隐藏看板娘 */
  hide() {},

  /** 切换模型 */
  setModel(path) {},
};
