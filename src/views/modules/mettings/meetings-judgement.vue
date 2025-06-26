<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="会议名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%;">
      <el-table-column
        prop="meetingName"
        header-align="center"
        align="left"
        label="会议名称">
      </el-table-column>
      <el-table-column
        prop="creatorName"
        header-align="center"
        align="center"
        width="150"
        label="创建者">
      </el-table-column>
      <el-table-column
        prop="createdAt"
        header-align="center"
        align="center"
        width="200"
        label="提交时间">
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        width="120"
        label="状态">
        <template slot-scope="scope">
          <el-tag :type="statusType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="showDetails(scope.row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>

    <!-- 审核详情弹窗 -->
    <el-dialog
      title="会议审核"
      :visible.sync="dialogVisible"
      width="60%">
      <div v-if="currentItem">
        <h3>{{ currentItem.meetingName }}</h3>
        <p>
          <span><strong>会议ID:</strong> {{ currentItem.id }}</span> |
          <span><strong>创建者:</strong> {{ currentItem.creatorName }}</span> |
          <span><strong>计划人数:</strong> {{ currentItem.participantCount }}</span>
        </p>
        <p>
          <span><strong>提交时间:</strong> {{ currentItem.createdAt | formatDate }}</span> |
          <span><strong>开始时间:</strong> {{ currentItem.startTime | formatDate }}</span> |
          <span><strong>结束时间:</strong> {{ currentItem.endTime | formatDate }}</span>
        </p>
        <p>
          <strong>状态:</strong>
          <el-tag :type="statusType(currentItem.status)">{{ currentItem.status }}</el-tag>
        </p>

        <el-divider></el-divider>

        <!-- 图片展示 -->
        <div v-if="currentItem.coverUrl">
          <p><strong>会议封面:</strong></p>
          <div class="image-preview">
            <img :src="currentItem.coverUrl" alt="会议图片"
                 @click="openImageInNewTab(currentItem.coverUrl)" />
          </div>
          <el-divider></el-divider>
        </div>

        <p><strong>会议简介:</strong></p>
        <p>{{ currentItem.summary }}</p>

        <el-divider></el-divider>

        <p><strong>会议内容:</strong></p>
        <div v-html="currentItem.meetingContent"></div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="judgeMeeting('rejected')">拒 绝</el-button>
        <el-button type="success" @click="judgeMeeting('approved')">通 过</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      dataForm: { key: '' },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dialogVisible: false,
      currentItem: null
    }
  },
  activated () {
    this.getDataList()
  },
  methods: {
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/mettings/meetings/listpending'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'key': this.dataForm.key
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    showDetails(item) {
      this.currentItem = item;
      this.dialogVisible = true;
    },
    judgeMeeting(status) {
      this.$http({
        url: this.$http.adornUrl('/mettings/meetings/update'),
        method: 'post',
        data: this.$http.adornData({
          id: this.currentItem.id,
          status: status
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message({
            message: '审核操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.dialogVisible = false;
              this.getDataList();
            }
          });
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    currentChangeHandle(val) {
      this.pageIndex = val
      this.getDataList()
    },
    openImageInNewTab(url) {
      window.open(url, '_blank')
    },
    statusType(status) {
      switch (status) {
        case 'draft': return 'info'
        case 'pending': return 'warning'
        case 'approved': return 'success'
        case 'rejected': return 'danger'
        default: return ''
      }
    }
  },
  filters: {
    formatDate(value) {
      if (!value) return ''
      return new Date(value).toLocaleString()
    }
  }
}
</script>
<style scoped>
.image-preview img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: 0.3s;
}

.image-preview img:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.el-dialog__body p {
  margin: 8px 0;
}
</style>
