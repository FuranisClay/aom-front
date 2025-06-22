<template>
  <div class="mod-config">
    <!-- 搜索条件 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-form :inline="true" label-width="80px">
        <el-form-item label="课程名称">
          <el-input v-model="searchParams.courseName" placeholder="支持模糊搜索"></el-input>
        </el-form-item>

        <el-form-item label="作者">
          <el-input v-model="searchParams.author" placeholder="输入作者名搜索"></el-input>
        </el-form-item>

        <el-form-item label="排序">
          <el-select v-model="searchParams.sortOrder" placeholder="排序方式">
            <el-option label="默认排序" value=""></el-option>
            <el-option label="升序" value="asc"></el-option>
            <el-option label="降序" value="desc"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="getDataList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程条目列表 -->
    <el-card v-for="item in dataList" :key="item.id" class="news-card" shadow="hover">
      <div class="card-content">
        <!-- 左侧图片 -->
        <div class="image">
          <img :src="item.courseCover" alt="课程封面" @click="previewImage(item.courseCover)" />
        </div>

        <!-- 中间文字内容 -->
        <div class="info">
          <div class="title" @click="viewDetail(item)" style="cursor: pointer; color: #409EFF;">{{ item.courseName }}</div>
          <div class="meta">
            <span>作者：{{ item.author }}</span> |
            <span>状态：<el-tag :type="statusType(item.status)">{{ statusLabel(item.status) }}</el-tag></span>
          </div>
          <div class="summary">{{ item.courseDescription }}</div>
        </div>

        <!-- 右侧操作 -->
        <div class="actions">
          <el-button type="text" @click="viewDetail(item)">查看详情</el-button>
        </div>
      </div>
    </el-card>

    <!-- 分页 -->
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>

    <!-- 详情弹窗 -->
    <el-dialog :visible.sync="detailDialogVisible" title="课程详情" width="80%">
      <el-form label-width="120px">
        <!-- 基本信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称">
              <span class="form-detail">{{ currentItem.courseName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者">
              <span class="form-detail">{{ currentItem.author }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间">
              <span class="form-detail">{{ formatTime(currentItem.createdAt) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间">
              <span class="form-detail">{{ formatTime(currentItem.updatedAt) }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-tag :type="statusType(currentItem.status)">
                {{ statusLabel(currentItem.status) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 简介 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课程简介">
              <span class="form-detail">{{ currentItem.courseDescription }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 视频播放 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课程视频">
              <div class="video-container">
                <video
                  v-if="currentItem.courseVideo"
                  class="video-js vjs-default-skin"
                  controls
                  :src="currentItem.courseVideo"
                  data-setup='{}'
                ></video>
                <span v-else>无视频</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 封面图预览 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课程封面">
              <div class="image-preview">
                <img :src="currentItem.courseCover" alt="课程封面" @click="previewImage(currentItem.courseCover)" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,

      detailDialogVisible: false,
      currentItem: {},

      searchParams: {
        courseName: '',
        author: '',
        sortOrder: ''
      }
    }
  },
  methods: {
    getDataList () {
      this.dataListLoading = true

      const params = {
        page: this.pageIndex,
        limit: this.pageSize,
        key: this.searchParams.courseName || '', // 用于模糊搜索
        author: this.searchParams.author || '',
        sort: this.searchParams.sortOrder,
        status: 1 // 👈 新增筛选条件：只查询已启用的课程
      }

      this.$http({
        url: this.$http.adornUrl('/aomcourses/courses/list'),
        method: 'get',
        params: this.$http.adornParams(params)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list || []
          this.totalPage = data.page.totalCount || 0
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      }).catch(() => {
        this.dataList = []
        this.totalPage = 0
        this.dataListLoading = false
      })
    },

    viewDetail (item) {
      this.currentItem = { ...item }
      this.detailDialogVisible = true
    },

    resetSearch () {
      this.searchParams = {
        courseName: '',
        author: '',
        sortOrder: ''
      }
      this.getDataList()
    },

    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },

    // 状态标签类型
    statusType (status) {
      switch (status) {
        case 1:
          return 'success'
        case 0:
          return 'danger'
        default:
          return 'info'
      }
    },
    // 状态文字
    statusLabel (status) {
      switch (status) {
        case 1:
          return '已启用'
        case 0:
          return '已禁用'
        default:
          return '未知状态'
      }
    },
    // 格式化时间
    formatTime (time) {
      return time ? new Date(time).toLocaleString() : '--'
    },
    // 图片预览
    previewImage (url) {
      window.open(url, '_blank')
    }
  },
  mounted () {
    this.getDataList()
  }
}
</script>

<style scoped>
.form-detail {
  display: block;
  font-size: 14px;
  color: #333;
}

.image-preview {
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  cursor: zoom-in;
}

.video-container {
  max-width: 600px;
}

.video-js {
  width: 100%;
  height: auto;
}

.news-card {
  margin-bottom: 16px;
  padding: 0;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 12px;
}

.image {
  flex: 0 0 120px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 16px;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info .title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  cursor: pointer;
}

.info .meta {
  color: #888;
  font-size: 13px;
  margin-bottom: 6px;
}

.info .summary {
  font-size: 14px;
  color: #555;
}

.actions {
  flex: 0 0 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}
</style>
