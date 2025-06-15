<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="会议名称" prop="meetingName">
      <el-input v-model="dataForm.meetingName" placeholder="会议名称"></el-input>
    </el-form-item>
    <el-form-item label="会议封面图片URL" prop="meetingCover">
      <el-input v-model="dataForm.meetingCover" placeholder="会议封面图片URL"></el-input>
    </el-form-item>
    <el-form-item label="会议内容" prop="meetingContent">
      <el-input v-model="dataForm.meetingContent" placeholder="会议内容"></el-input>
    </el-form-item>
    <el-form-item label="会议开始时间" prop="startTime">
      <el-input v-model="dataForm.startTime" placeholder="会议开始时间"></el-input>
    </el-form-item>
    <el-form-item label="会议结束时间" prop="endTime">
      <el-input v-model="dataForm.endTime" placeholder="会议结束时间"></el-input>
    </el-form-item>
    <el-form-item label="创建人" prop="creator">
      <el-input v-model="dataForm.creator" placeholder="创建人"></el-input>
    </el-form-item>
    <el-form-item label="创建人类型：1-管理员，2-企业用户" prop="creatorType">
      <el-input v-model="dataForm.creatorType" placeholder="创建人类型：1-管理员，2-企业用户"></el-input>
    </el-form-item>
    <el-form-item label="审核状态：0-待审核，1-审核通过，2-审核不通过" prop="auditStatus">
      <el-input v-model="dataForm.auditStatus" placeholder="审核状态：0-待审核，1-审核通过，2-审核不通过"></el-input>
    </el-form-item>
    <el-form-item label="审核人" prop="auditor">
      <el-input v-model="dataForm.auditor" placeholder="审核人"></el-input>
    </el-form-item>
    <el-form-item label="审核时间" prop="auditTime">
      <el-input v-model="dataForm.auditTime" placeholder="审核时间"></el-input>
    </el-form-item>
    <el-form-item label="审核意见" prop="auditReason">
      <el-input v-model="dataForm.auditReason" placeholder="审核意见"></el-input>
    </el-form-item>
    <el-form-item label="会议状态：0-已删除，1-正常" prop="status">
      <el-input v-model="dataForm.status" placeholder="会议状态：0-已删除，1-正常"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createdAt">
      <el-input v-model="dataForm.createdAt" placeholder="创建时间"></el-input>
    </el-form-item>
    <el-form-item label="更新时间" prop="updatedAt">
      <el-input v-model="dataForm.updatedAt" placeholder="更新时间"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          meetingName: '',
          meetingCover: '',
          meetingContent: '',
          startTime: '',
          endTime: '',
          creator: '',
          creatorType: '',
          auditStatus: '',
          auditor: '',
          auditTime: '',
          auditReason: '',
          status: '',
          createdAt: '',
          updatedAt: ''
        },
        dataRule: {
          meetingName: [
            { required: true, message: '会议名称不能为空', trigger: 'blur' }
          ],
          meetingCover: [
            { required: true, message: '会议封面图片URL不能为空', trigger: 'blur' }
          ],
          meetingContent: [
            { required: true, message: '会议内容不能为空', trigger: 'blur' }
          ],
          startTime: [
            { required: true, message: '会议开始时间不能为空', trigger: 'blur' }
          ],
          endTime: [
            { required: true, message: '会议结束时间不能为空', trigger: 'blur' }
          ],
          creator: [
            { required: true, message: '创建人不能为空', trigger: 'blur' }
          ],
          creatorType: [
            { required: true, message: '创建人类型：1-管理员，2-企业用户不能为空', trigger: 'blur' }
          ],
          auditStatus: [
            { required: true, message: '审核状态：0-待审核，1-审核通过，2-审核不通过不能为空', trigger: 'blur' }
          ],
          auditor: [
            { required: true, message: '审核人不能为空', trigger: 'blur' }
          ],
          auditTime: [
            { required: true, message: '审核时间不能为空', trigger: 'blur' }
          ],
          auditReason: [
            { required: true, message: '审核意见不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '会议状态：0-已删除，1-正常不能为空', trigger: 'blur' }
          ],
          createdAt: [
            { required: true, message: '创建时间不能为空', trigger: 'blur' }
          ],
          updatedAt: [
            { required: true, message: '更新时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/mettings/meetings/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.meetingName = data.meetings.meetingName
                this.dataForm.meetingCover = data.meetings.meetingCover
                this.dataForm.meetingContent = data.meetings.meetingContent
                this.dataForm.startTime = data.meetings.startTime
                this.dataForm.endTime = data.meetings.endTime
                this.dataForm.creator = data.meetings.creator
                this.dataForm.creatorType = data.meetings.creatorType
                this.dataForm.auditStatus = data.meetings.auditStatus
                this.dataForm.auditor = data.meetings.auditor
                this.dataForm.auditTime = data.meetings.auditTime
                this.dataForm.auditReason = data.meetings.auditReason
                this.dataForm.status = data.meetings.status
                this.dataForm.createdAt = data.meetings.createdAt
                this.dataForm.updatedAt = data.meetings.updatedAt
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/mettings/meetings/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'meetingName': this.dataForm.meetingName,
                'meetingCover': this.dataForm.meetingCover,
                'meetingContent': this.dataForm.meetingContent,
                'startTime': this.dataForm.startTime,
                'endTime': this.dataForm.endTime,
                'creator': this.dataForm.creator,
                'creatorType': this.dataForm.creatorType,
                'auditStatus': this.dataForm.auditStatus,
                'auditor': this.dataForm.auditor,
                'auditTime': this.dataForm.auditTime,
                'auditReason': this.dataForm.auditReason,
                'status': this.dataForm.status,
                'createdAt': this.dataForm.createdAt,
                'updatedAt': this.dataForm.updatedAt
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>
