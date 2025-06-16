<template>
  <div class="mod-home">
    <div class="content">
      <img class="icon" src="~@/assets/img/logo.png" alt="项目图标" />

      <h1 class="title">AOM管理平台</h1>

      <p class="desc">
        本项目是一款高效且易用的AOM后台管理平台，旨在为合作者提供全面的后台管理与社区发布方案。<br />
        平台支持管理员权限管理，确保数据安全与操作权限合理分配；<br />
        提供稿件查询与审核实时更新功能，帮助用户随时掌握内容产品动态；<br />
      </p>

      <p class="author">项目作者：CYN SSX KRZ GYF GJ</p>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.mod-home {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 整体背景渐变 + 下方图片叠加 */
  background:
    linear-gradient(135deg, #40d2ff 0%, #73c5ff 100%),
    url('./static/img/bg.png') no-repeat bottom center;
  background-size: cover; /* 背景图铺满 */
  padding: 20px;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #fff;
  flex-direction: column;
}

.content {
  background: rgba(255 255 255 / 0.95);
  padding: 50px 60px;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(64, 158, 255, 0.3);
  max-width: 800px;      /* 宽度放大，适合大屏 */
  width: 90%;            /* 宽度适应屏幕 */
  text-align: center;
  color: #333;
  user-select: none;
}

.icon {
  width: 180px;
  height: 180px;
  object-fit: contain;
  margin-bottom: 30px;
  filter: drop-shadow(0 4px 6px rgba(64, 158, 255, 0.3));
  border-radius: 20%;
  transition: transform 0.3s ease;
}
.icon:hover {
  transform: scale(1.1);
}

.title {
  font-weight: 700;
  font-size: 40px;
  margin-bottom: 24px;
  color: #70d8ea;
}

.desc {
  font-size: 20px;
  line-height: 1.8;
  margin-bottom: 32px;
  color: #555;
}

.author {
  font-size: 18px;
  color: #888;
  margin-bottom: 40px;
}
</style>
