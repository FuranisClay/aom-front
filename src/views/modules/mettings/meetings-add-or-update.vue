<template>
  <el-dialog
    :title="!dataForm.id ? '新增会议' : '修改会议'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
      <el-form-item label="会议名称" prop="meetingName">
        <el-input v-model="dataForm.meetingName" placeholder="会议名称"></el-input>
      </el-form-item>
      <el-form-item label="会议简介" prop="meetingSummary">
        <el-input type="textarea" v-model="dataForm.meetingSummary" placeholder="会议简介"></el-input>
      </el-form-item>
      <el-form-item label="会议内容" prop="meetingContent">
        <el-input type="textarea" :rows="5" v-model="dataForm.meetingContent" placeholder="会议内容/议程"></el-input>
      </el-form-item>
      <el-form-item label="会议封面" prop="coverUrl">
        <el-input v-model="dataForm.coverUrl" placeholder="会议封面图片路径"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="dataForm.startTime"
          type="datetime"
          placeholder="选择开始日期时间">
          <!-- Removed value-format to bind native Date object -->
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="dataForm.endTime"
          type="datetime"
          placeholder="选择结束日期时间">
          <!-- Removed value-format to bind native Date object -->
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="dataForm.status" placeholder="请选择状态">
          <el-option label="草稿" value="draft"></el-option>
          <el-option label="待审核" value="pending"></el-option>
          <el-option label="已批准" value="approved"></el-option>
          <el-option label="已拒绝" value="rejected"></el-option>
        </el-select>
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
        meetingSummary: '',
        meetingContent: '',
        coverUrl: '',
        creatorId: null,
        creatorName: '',
        status: 'pending',
        participantCount: 100,
        startTime: null, // Initialize as null to work with Date objects
        endTime: null,   // Initialize as null
        createdAt: null,
        updatedAt: null
      },
      dataRule: {
        meetingName: [ { required: true, message: '会议名称不能为空', trigger: 'blur' } ],
        startTime: [ { required: true, message: '会议开始时间不能为空', trigger: 'change' } ],
        endTime: [ { required: true, message: '会议结束时间不能为空', trigger: 'change' } ],
        status: [ { required: true, message: '状态不能为空', trigger: 'blur' } ]
      }
    }
  },
  computed: {
    userId: { get () { return this.$store.state.user.id } },
    userName: { get () { return this.$store.state.user.name } }
  },
  methods: {
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        // Ensure dates are nulled out on reset
        this.dataForm.startTime = null
        this.dataForm.endTime = null

        if (!this.dataForm.id) {
          // Add mode: set defaults
          this.dataForm.status = '草稿'
          this.dataForm.participantCount = 100
          this.dataForm.creatorId = this.userId
          this.dataForm.creatorName = this.userName
        } else {
          // Edit mode: fetch data
          this.$http({
            url: this.$http.adornUrl(`/mettings/meetings/info/${this.dataForm.id}`),
            method: 'get'
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm = data.meetings
            }
          })
        }
      })
    },
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // Create a payload copy and format dates to ISO string
          const payload = { ...this.dataForm }
          const now = new Date().toISOString()

          if (payload.startTime) {
            payload.startTime = new Date(payload.startTime).toISOString()
          }
          if (payload.endTime) {
            payload.endTime = new Date(payload.endTime).toISOString()
          }

          if (!payload.id) {
            payload.createdAt = now
          }
          payload.updatedAt = now

          this.$http({
            url: this.$http.adornUrl(`/mettings/meetings/${!payload.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData(payload)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({ message: '操作成功', type: 'success', duration: 1500,
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
