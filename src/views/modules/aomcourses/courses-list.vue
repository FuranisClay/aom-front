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
            <span>状态：<el-tag :type="statusType(item.status)"> {{ statusLabel(item.status) }} </el-tag></span>
          </div>
          <div class="summary">{{ item.courseDescription }}</div>
        </div>

        <!-- 右侧操作 -->
        <div class="actions">
          <el-button type="text" @click="viewDetail(item)">查看详情</el-button>
          <el-button type="text" @click="openEditDialog(item)">修改</el-button>
          <el-button type="text" @click="deleteCourse(item.id)" style="color: #F56C6C;">删除</el-button>
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
        <el-row :gutter="20" class="media-row">
          <el-col :span="24">
            <el-form-item label="课程视频">
              <div class="video-container">
                <iframe
                  v-if="currentItem.courseVideo"
                  ref="biliIframe"
                  :src="currentItem.courseVideo + '&hide_cover_prompt=1&danmaku=0&high_quality=1&theme=dark&show_related=false'"
                  frameborder="0"
                  allowfullscreen
                  scrolling="no"
                  style="width: 100%; border: none;"
                  @load="setIframeHeight">
                </iframe>
                <span v-else>无视频</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 封面图预览 -->
        <el-row :gutter="20" class="media-row">
          <el-col :span="24">
            <el-form-item label="课程封面">
              <div class="image-ratio-wrapper">
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

    <!-- 编辑弹窗 -->
    <el-dialog :visible.sync="editDialogVisible" :title="editForm.status === 2 ? '重新提交审核' : '编辑课程'" width="50%">
      <el-form :model="editForm" label-width="120px" ref="editForm">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="editForm.courseName"></el-input>
        </el-form-item>
        <el-form-item label="课程封面" prop="courseCover">
          <el-input v-model="editForm.courseCover"></el-input>
        </el-form-item>
        <el-form-item label="课程简介" prop="courseDescription">
          <el-input type="textarea" v-model="editForm.courseDescription"></el-input>
        </el-form-item>
        <el-form-item label="课程排序" prop="courseSort">
          <el-input-number v-model="editForm.courseSort" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="课程视频" prop="courseVideo">
          <el-input v-model="editForm.courseVideo"></el-input>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="editForm.author"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
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
      editDialogVisible: false,
      currentItem: {},
      editForm: {
        id: 0,
        courseName: '',
        courseCover: '',
        courseDescription: '',
        courseSort: 1,
        courseVideo: '',
        author: '',
        status: 0
      },

      searchParams: {
        courseName: '',
        author: '',
        sortOrder: ''
      },

      isAdmin: false
    }
  },
  computed: {
    currentUserId () {
      return this.$store.state.user.id
    }
  },
  created () {
    // 监听课程审核事件
    this.$root.$on('course-audited', this.handleCourseAudited)
    // 监听课程删除事件
    this.$root.$on('course-deleted', this.getDataList)
  },
  beforeDestroy () {
    // 组件销毁前移除监听
    this.$root.$off('course-audited', this.handleCourseAudited)
    this.$root.$off('course-deleted', this.getDataList)
  },
  methods: {
    // 处理课程审核事件
    handleCourseAudited (courseId, newStatus) {
      // 找到本地列表中的课程并更新状态
      const index = this.dataList.findIndex(item => item.id === courseId)
      if (index !== -1) {
        this.$set(this.dataList[index], 'status', newStatus)

        // 如果当前查看的详情正是被审核的课程，也更新详情数据
        if (this.currentItem.id === courseId) {
          this.currentItem.status = newStatus
        }
      }
    },

    async checkAdminStatus () {
      try {
        const res = await this.$http({
          url: this.$http.adornUrl('/sys/user/isAdmin'),
          method: 'get',
          params: this.$http.adornParams({ id: this.currentUserId })
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
        url = '/aomcourses/courses/list'
        params = {
          page: this.pageIndex,
          limit: this.pageSize,
          key: this.searchParams.courseName || '',
          author: this.searchParams.author || '',
          sort: this.searchParams.sortOrder
        }
      } else {
        url = '/aomcourses/courses/list/author'
        params = {
          page: this.pageIndex,
          limit: this.pageSize,
          key: this.searchParams.courseName || '',
          sort: this.searchParams.sortOrder,
          userId: this.currentUserId
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

    setIframeHeight () {
      this.$nextTick(() => {
        const iframe = this.$refs.biliIframe
        if (iframe) {
          iframe.style.height = iframe.offsetWidth * 0.5625 + 'px'
        }
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
        case -1:
          return 'warning'
        case 2:
          return 'info'
        default:
          return 'default'
      }
    },
    // 状态文字说明
    statusLabel (status) {
      switch (status) {
        case 1:
          return '已启用'
        case 0:
          return '已禁用'
        case -1:
          return '待审核'
        case 2:
          return '审核未通过'
        default:
          return '未知状态'
      }
    },
    formatTime (time) {
      return time ? new Date(time).toLocaleString() : '--'
    },
    previewImage (url) {
      window.open(url, '_blank')
    },

    openEditDialog (item) {
      this.editForm = { ...item }
      this.editDialogVisible = true
    },

    submitEditForm () {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          const submitData = { ...this.editForm }
          // 如果是审核未通过的课程，修改后状态改为待审核
          if (submitData.status === 2) {
            submitData.status = -1
          }

          this.$http({
            url: this.$http.adornUrl('/aomcourses/courses/update'),
            method: 'post',
            data: this.$http.adornData(submitData)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message.success(this.editForm.status === 2 ? '已重新提交审核' : '修改成功')
              this.editDialogVisible = false
              this.getDataList()
              // 触发事件通知审核界面刷新
              this.$root.$emit('course-deleted')
              // 如果是重新提交审核，额外触发一个事件
              if (this.editForm.status === 2) {
                this.$root.$emit('course-resubmitted', this.editForm.id)
              }
            } else {
              this.$message.error(data.msg || '操作失败')
            }
          })
        }
      })
    },

    deleteCourse (id) {
      this.$confirm('确定删除该课程吗？', '提示', { type: 'warning' }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/aomcourses/courses/delete'),
          method: 'post',
          data: this.$http.adornData([id], false)
        }).then(({ data }) => {
          if (data.code === 0) {
            this.$message.success('删除成功')
            this.getDataList()
            // 触发事件通知审核界面刷新
            this.$root.$emit('course-deleted')
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    }
  },
  mounted () {
    this.checkAdminStatus()
    window.addEventListener('resize', this.setIframeHeight)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.setIframeHeight)
  },
  updated () {
    this.setIframeHeight()
  }
}
</script>

<style scoped>
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
  flex: 0 0 90px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 12px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

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

.image-ratio-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  border-radius: 4px;
  cursor: zoom-in;
}

.media-row {
  display: flex;
  align-items: flex-start;
}

.media-row .el-form-item__label {
  padding-top: 10px;
  vertical-align: top;
}

.video-container,
.image-ratio-wrapper {
  position: relative;
  max-width: 600px;
  width: 100%;
  margin: 0;
}

.video-js {
  width: 100%;
  height: auto;
}
</style>
