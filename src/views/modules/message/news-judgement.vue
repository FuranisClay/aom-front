<template>
  <div class="mod-config">
    <!-- 单条展示 -->
    <el-card v-for="item in dataList" :key="item.id" class="news-card" shadow="hover">
      <div class="card-content">
        <div class="title">{{ item.title }}</div>
        <div class="status">
          <el-tag :type="statusType(item.status)" disable-transitions>
            {{ statusLabel(item.status) }}
          </el-tag>
        </div>
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
    <el-dialog :visible.sync="detailDialogVisible" title="新闻详情" width="80%">
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
              <el-radio-group v-model="currentItem.status">
                <el-radio label="approved">已通过</el-radio>
                <el-radio label="rejected">已拒绝</el-radio>
              </el-radio-group>
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
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="auditNews">提交审核</el-button>
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
      currentItem: {}
    }
  },
  methods: {
    // 获取待审核新闻列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/aommessage/news/listpending'),
        method: 'get',
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
          if (this.dataList.length === 0 && this.pageIndex === 1) {
            this.$message.info('当前没有待审核的新闻')
          }
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 查看详情
    viewDetail (item) {
      this.currentItem = { ...item }
      this.detailDialogVisible = true
    },
    // 提交审核操作
    auditNews () {
      if (this.currentItem.status !== 'approved' && this.currentItem.status !== 'rejected') {
        this.$message.warning('请先选择审核结果')
        return
      }
      this.$http({
        url: this.$http.adornUrl('/aommessage/news/update'),
        method: 'post',
        data: this.$http.adornData(this.currentItem)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('审核完成')
          this.detailDialogVisible = false
          this.getDataList()
        } else {
          this.$message.error(data.msg)
        }
      })
    },
    // 每页条数改变
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 翻页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 状态标签类型
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
    // 状态文字
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
  },
  mounted () {
    this.getDataList()
  }
}
</script>

<style scoped>
.news-card {
  margin-bottom: 20px;
}
.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.status {
  margin-left: 20px;
}
.actions {
  margin-left: auto;
}
.dialog-footer {
  text-align: right;
}

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
</style>
