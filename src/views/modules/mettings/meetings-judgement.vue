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
          <el-tag type="warning">{{ scope.row.status }}</el-tag>
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
          <span>创建者: {{ currentItem.creatorName }}</span> |
          <span>提交时间: {{ currentItem.createdAt | formatDate }}</span> |
          <span>开始时间: {{ currentItem.startTime | formatDate }}</span> |
          <span>结束时间: {{ currentItem.endTime | formatDate }}</span>
        </p>
        <el-divider></el-divider>
        <strong>会议简介:</strong>
        <p>{{ currentItem.summary }}</p>
        <el-divider></el-divider>
        <strong>会议内容:</strong>
        <div v-html="currentItem.meetingContent"></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="judgeMeeting('approved')">拒 绝</el-button>
        <el-button type="success" @click="judgeMeeting('rejected')">通 过</el-button>
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
      }).then(({data}) => {
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
      }).then(({data}) => {
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
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    }
  },
  filters: {
    formatDate(value) {
      if (!value) return '';
      return new Date(value).toLocaleString();
    }
  }
}
</script>
