<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="会议名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button type="primary" @click="addOrUpdateHandle()">发布新会议</el-button>
      </el-form-item>
    </el-form>

    <div v-loading="dataListLoading">
      <div v-if="dataList.length > 0">
        <div v-for="item in dataList" :key="item.id" class="list-item">
          <h3 class="item-title">{{ item.meetingName }}</h3>
          <div class="item-meta">
            <span>创建者：{{ item.creatorName }}</span> |
            <span>计划人数：{{ item.participantCount }}</span> |
            <span>会议时间：{{ item.startTime | formatDate }}</span>
          </div>
          <p class="item-summary">{{ item.meetingSummary }}</p>
          <div class="item-footer">
            <el-tag :type="statusLabel(item.status).type" size="small">{{ statusLabel(item.status).text }}</el-tag>
            <div class="actions">
              <el-button type="text" @click="showDetails(item)">查看详情</el-button>
              <el-button v-if="canEdit(item)" type="text" @click="addOrUpdateHandle(item.id)">编辑</el-button>
              <el-button v-if="canEdit(item)" type="text" class="text-danger" @click="deleteHandle(item.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无会议信息"></el-empty>
    </div>

    <el-pagination
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, prev, pager, next"
      style="margin-top: 20px; text-align: center;">
    </el-pagination>

    <!-- 详情弹窗 -->
    <el-dialog :title="currentItem.meetingName" :visible.sync="detailDialogVisible" width="60%">
      <div v-if="currentItem.id" class="detail-dialog-content">
        <p><strong>会议ID:</strong> {{ currentItem.id }}</p>
        <p><strong>创建者ID:</strong> {{ currentItem.creatorId }}</p>
        <p><strong>创建者:</strong> {{ currentItem.creatorName }}</p>
        <p><strong>状态:</strong> <el-tag :type="statusLabel(currentItem.status).type">{{ statusLabel(currentItem.status).text }}</el-tag></p>
        <p><strong>计划人数:</strong> {{ currentItem.participantCount }}</p>
        <p><strong>开始时间:</strong> {{ currentItem.startTime | formatFullDate }}</p>
        <p><strong>结束时间:</strong> {{ currentItem.endTime | formatFullDate }}</p>
        <p><strong>创建时间:</strong> {{ currentItem.createdAt | formatFullDate }}</p>
        <p><strong>更新时间:</strong> {{ currentItem.updatedAt | formatFullDate }}</p>
        <el-divider></el-divider>
        <p><strong>简介:</strong> {{ currentItem.meetingSummary }}</p>
        <el-divider></el-divider>
        <strong>内容/议程:</strong>
        <div v-html="currentItem.meetingContent"></div>
      </div>
      <span slot="footer" class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
    </el-dialog>

    <!-- 新增/修改弹窗 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './meetings-add-or-update'

export default {
  data () {
    return {
      dataForm: { key: '' },
      dataList: [],
      pageIndex: 1,
      pageSize: 10, // Standard list view page size
      totalPage: 0,
      dataListLoading: false,
      detailDialogVisible: false,
      addOrUpdateVisible: false,
      currentItem: {},
      isAdmin: false // 是否为管理员
    }
  },
  components: {
    AddOrUpdate
  },
  computed: {
    userId () {
      return this.$store.state.user.id
    }
  },
  activated () {
    this.getDataList()
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
            id: this.userId
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
        url = '/mettings/meetings/list'
        params = {
          page: this.pageIndex,
          limit: this.pageSize
        }
      } else {
        url = '/mettings/meetings/listbyuserid'
        params = {
          userId: this.userId,
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
    statusLabel(status) {
      switch (status) {
        case 'draft': return { type: 'info', text: '草稿' };
        case 'pending': return { type: 'warning', text: '待审核' };
        case 'approved': return { type: 'success', text: '已批准' };
        case 'rejected': return { type: 'danger', text: '已拒绝' };
        default: return { type: '', text: status };
      }
    },
    canEdit(item) {
      const isOwner = item.creatorId === this.userId;
      const isEditableStatus = item.status === 'draft' || item.status === 'rejected';
      return (this.isAdmin || isOwner) && isEditableStatus;
    },
    showDetails(item) {
      this.$http.get(this.$http.adornUrl(`/mettings/meetings/info/${item.id}`)).then(({data}) => {
        if (data && data.code === 0) {
          this.currentItem = data.meetings;
          this.detailDialogVisible = true;
        } else {
          this.$message.error(data.msg || '获取详情失败');
        }
      });
    },
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    deleteHandle(id) {
      this.$confirm(`确定对该会议进行[删除]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/mettings/meetings/delete'),
          method: 'post',
          data: this.$http.adornData([id], false)
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({ message: '操作成功', type: 'success', duration: 1500, onClose: () => this.getDataList() })
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    },
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    }
  },
  filters: {
    formatDate(value) {
      if (!value) return '';
      return new Date(value).toLocaleDateString('zh-CN');
    },
    formatFullDate(value) {
      if (!value) return '';
      return new Date(value).toLocaleString('zh-CN');
    }
  }
}
</script>

<style scoped>
.list-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 15px 0;
}
.list-item:last-child {
  border-bottom: none;
}
.item-title {
  font-size: 18px;
  margin: 0 0 8px 0;
}
.item-meta {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}
.item-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
}
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text-danger {
  color: #F56C6C;
}
.detail-dialog-content p {
  line-height: 1.8;
}
</style>
