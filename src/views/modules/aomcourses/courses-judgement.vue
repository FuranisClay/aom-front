<template>
  <div class="mod-config">
    <!-- 单条展示 -->
    <el-card v-for="item in dataList" :key="item.id" class="news-card" shadow="hover">
      <div class="card-content">
        <div class="title">{{ item.courseName }}</div>
        <div class="status">
          <el-tag :type="auditStatusType(item.status)" disable-transitions>{{ auditStatusLabel(item.status) }}</el-tag>
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

        <el-form-item label="审核结果">
          <el-radio-group v-model="currentItem.status">
            <el-radio :label="1">通过审核</el-radio>
            <el-radio :label="2">审核未通过</el-radio>
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
  created () {
    // 监听课程新增事件
    this.$root.$on('course-submitted', this.getDataList)
    // 监听课程删除事件
    this.$root.$on('course-deleted', this.getDataList)
    // 监听课程重新提交审核事件
    this.$root.$on('course-resubmitted', this.handleCourseResubmitted)
  },
  beforeDestroy () {
    // 组件销毁前移除监听
    this.$root.$off('course-submitted', this.getDataList)
    this.$root.$off('course-deleted', this.getDataList)
    this.$root.$off('course-resubmitted', this.handleCourseResubmitted)
  },
  methods: {
    // 处理课程重新提交审核事件
    handleCourseResubmitted(courseId) {
      // 从列表中移除该课程
      this.dataList = this.dataList.filter(item => item.id !== courseId)
      // 如果总数大于0，减少总数
      if (this.totalPage > 0) {
        this.totalPage -= 1
      }
      // 如果当前查看的详情正是被重新提交的课程，关闭详情弹窗
      if (this.currentItem.id === courseId) {
        this.detailDialogVisible = false
      }
    },

    // 获取待审核课程列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/aomcourses/courses/list/pending'),
        method: 'get',
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalPage
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
      if (![1, 2].includes(this.currentItem.status)) {
        this.$message.warning('请先选择审核结果')
        return
      }

      this.$http({
        url: this.$http.adornUrl('/aomcourses/courses/update'),
        method: 'post',
        data: this.$http.adornData({
          id: this.currentItem.id,
          status: this.currentItem.status
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('审核完成')
          this.detailDialogVisible = false
          this.getDataList() // 刷新审核列表
          this.$root.$emit('course-audited', this.currentItem.id, this.currentItem.status) // 通知课程浏览界面刷新特定课程
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

    // 审核状态标签类型
    auditStatusType (status) {
      switch (status) {
        case -1:
          return 'info'
        case 0:
          return 'danger'
        case 1:
          return 'success'
        case 2:
          return 'warning'
        default:
          return 'info'
      }
    },

    // 审核状态文字
    auditStatusLabel (status) {
      switch (status) {
        case -1:
          return '待审核'
        case 0:
          return '已禁用'
        case 1:
          return '已启用'
        case 2:
          return '审核未通过'
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
.image-preview-container img {
  max-width: 300px;
  cursor: pointer;
}
.video-container video {
  max-width: 100%;
}
</style>
