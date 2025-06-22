<template>
  <div class="mod-config">
    <!-- 单条展示 -->
    <el-card v-for="item in dataList" :key="item.id" class="news-card" shadow="hover">
      <div class="card-content">
        <div class="title">{{ item.courseName }}</div>
        <div class="status">
          <el-tag :type="statusType(item.status)" disable-transitions>{{ statusLabel(item.status) }}</el-tag>
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
    <el-dialog :visible.sync="detailDialogVisible" title="课程详情">
      <el-form :model="currentItem" label-width="80px">

        <el-form-item label="课程名称">
          <span>{{ currentItem.courseName }}</span>
        </el-form-item>

        <el-form-item label="课程简介">
          <span>{{ currentItem.courseDescription }}</span>
        </el-form-item>

        <!-- 图片展示 -->
        <el-form-item label="封面">
          <div class="image-preview-container">
            <img :src="currentItem.courseCover" alt="封面" @click="previewImage(currentItem.courseCover)" style="max-width: 300px; cursor: pointer;">
          </div>
        </el-form-item>

        <!-- 视频展示 -->
        <el-form-item label="视频">
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

        <el-form-item label="作者">
          <span>{{ currentItem.author }}</span>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="currentItem.status">
            <el-radio :label="1">通过审核</el-radio>
            <el-radio :label="0">拒绝审核</el-radio>
          </el-radio-group>
        </el-form-item>

      </el-form>


      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="auditCourse">提交审核</el-button>
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
    // 获取待审核课程列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/aomcourses/courses/list'),
        method: 'get',
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          key: '' // 如果需要可添加搜索关键字参数
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
          if (this.dataList.length === 0 && this.pageIndex === 1) {
            this.$message.info('当前没有待审核的课程')
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
    auditCourse () {
      if (![0, 1].includes(this.currentItem.status)) {
        this.$message.warning('请先选择审核结果')
        return
      }

      this.$http({
        url: this.$http.adornUrl('/aomcourses/courses/update'),
        method: 'post',
        data: this.$http.adornData(this.currentItem)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('审核完成')
          this.detailDialogVisible = false
          this.getDataList()
        } else {
          this.$message.error(data.msg || '审核失败')
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
        case 0:
          return 'danger'
        case 1:
          return 'success'
        default:
          return 'info'
      }
    },
    // 状态文字
    statusLabel (status) {
      switch (status) {
        case 0:
          return '已禁用'
        case 1:
          return '已启用'
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
</style>
