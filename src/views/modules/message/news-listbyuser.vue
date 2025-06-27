<template>
  <div class="mod-config">
    <!-- 新闻条目列表 -->
    <el-card v-for="item in dataList" :key="item.id" class="news-card" shadow="hover">
      <div class="card-content">
        <!-- 左侧图片 -->
        <div class="image">
          <img :src="item.imageUrl" alt="新闻图片" />
        </div>

        <!-- 中间文字内容 -->
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="meta">
            <span>作者：{{ item.authorName }}</span> |
            <span>浏览次数：{{ item.viewCount }}</span> |
            <span>发布时间：{{ item.publishedAt | formatDate }}</span>
          </div>
          <div class="summary">{{ item.summary }}</div>
        </div>

        <!-- 右侧状态与操作 -->
        <div class="actions">
          <div class="status">
            <el-tag :type="statusType(item.status)" size="small">
              {{ statusLabel(item.status) }}
            </el-tag>
          </div>
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

    <!-- 详情弹窗（已优化） -->
    <el-dialog :visible.sync="detailDialogVisible" title="新闻详情" width="80%">
      <!-- 此处使用之前优化过的详情模板 -->
      <el-form label-width="120px">
        <!-- 标题 + 作者ID -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题">
              <span class="form-detail">{{ currentItem.title }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者ID">
              <span class="form-detail">{{ currentItem.authorId }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 作者姓名 + 浏览次数 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者姓名">
              <span class="form-detail">{{ currentItem.authorName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="浏览次数">
              <span class="form-detail">{{ currentItem.viewCount }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 发布时间 + 创建时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间">
              <span class="form-detail">{{ currentItem.publishedAt }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间">
              <span class="form-detail">{{ currentItem.createdAt }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 更新时间 + 状态 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="更新时间">
              <span class="form-detail">{{ currentItem.updatedAt }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-tag :type="statusType(currentItem.status)" style="font-size: 14px;">
                {{ statusLabel(currentItem.status) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 简介 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="简介">
              <span class="form-detail">{{ currentItem.summary }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 内容 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="内容">
              <pre class="form-content">{{ currentItem.content }}</pre>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 图片 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="图片">
              <div class="image-preview">
                <img :src="currentItem.imageUrl" alt="新闻图片" />
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

      isAdmin: false // 是否为管理员
    }
  },
  computed: {
    authorId () {
      return this.$store.state.user.id
    }
  },
  mounted () {
    this.checkAdminStatus()
  },
  methods: {
    async checkAdminStatus () {
      try {
        const res = await this.$http({
          url: this.$http.adornUrl('/sys/user/isAdmin'),
          method: 'get',
          params: {
            id: this.authorId
          }
        })
        if (res.data && res.data.code === 0) {
          this.isAdmin = res.data.isAdmin
          this.getDataList()
        } else {
          this.$message.error('权限检查失败')
        }
      } catch (err) {
        console.error(err)
        this.$message.error('无法连接服务器')
      }
    },

    getDataList () {
      this.dataListLoading = true

      let url, params

      if (this.isAdmin) {
        url = '/aommessage/news/list'
        params = {
          page: this.pageIndex,
          limit: this.pageSize
        }
      } else {
        url = '/aommessage/news/listbyuserid'
        params = {
          userId: this.authorId,
          page: this.pageIndex,
          limit: this.pageSize
        }
      }

      this.$http({
        url: this.$http.adornUrl(url),
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

    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },

    statusType (status) {
      switch (status) {
        case 'pending':
          return 'warning'
        case 'approved':
          return 'success'
        case 'rejected':
          return 'danger'
        default:
          return 'info'
      }
    },
    statusLabel (status) {
      switch (status) {
        case 'pending':
          return '待审核'
        case 'approved':
          return '已通过'
        case 'rejected':
          return '已拒绝'
        default:
          return '未知状态'
      }
    }
  }
}
</script>
<style scoped>
.form-detail {
  display: block;
  font-size: 14px;
  color: #333;
}

.form-content {
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  font-family: sans-serif;
  line-height: 1.5;
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

.actions .status {
  margin-bottom: 8px;
}

</style>
