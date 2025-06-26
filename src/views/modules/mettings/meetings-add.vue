<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>新增会议信息</span>
    </div>
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
      <el-form-item label="会议名称" prop="meetingName">
        <el-input v-model="dataForm.meetingName" placeholder="会议名称"></el-input>
      </el-form-item>
      <el-form-item label="会议简介" prop="meetingSummary">
        <el-input type="textarea" v-model="dataForm.meetingSummary" placeholder="会议简介"></el-input>
      </el-form-item>
      <el-form-item label="会议封面" prop="coverUrl">
        <el-input v-model="dataForm.coverUrl" placeholder="请输入封面图片URL或使用上传功能"></el-input>
      </el-form-item>
      <el-form-item label="会议开始时间" prop="startTime">
        <el-date-picker
          v-model="dataForm.startTime"
          type="datetime"
          placeholder="选择开始日期时间">
          <!-- Removed value-format to bind native Date object -->
        </el-date-picker>
      </el-form-item>
      <el-form-item label="会议结束时间" prop="endTime">
        <el-date-picker
          v-model="dataForm.endTime"
          type="datetime"
          placeholder="选择结束日期时间">
          <!-- Removed value-format to bind native Date object -->
        </el-date-picker>
      </el-form-item>
      <el-form-item label="会议内容" prop="meetingContent">
        <el-input type="textarea" :rows="8" v-model="dataForm.meetingContent" placeholder="会议内容/议程"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="dataFormSubmit()">提交</el-button>
        <el-button @click="resetForm('dataForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      dataForm: {
        id: 0,
        meetingName: '',
        meetingSummary: '',
        meetingContent: '',
        coverUrl: '',
        creatorId: null,
        creatorName: '',
        startTime: null, // Initialize as null
        endTime: null,   // Initialize as null
        participantCount: 100,
        status: 'pending',
        createdAt: null,
        updatedAt: null
      },
      dataRule: {
        meetingName: [ { required: true, message: '会议名称不能为空', trigger: 'blur' } ],
        startTime: [ { required: true, message: '会议开始时间不能为空', trigger: 'change' } ],
        endTime: [ { required: true, message: '会议结束时间不能为空', trigger: 'change' } ]
      }
    }
  },
  computed: {
    userId: { get () { return this.$store.state.user.id } },
    userName: { get () { return this.$store.state.user.name } }
  },
  created () {
    this.dataForm.creatorId = this.userId
    this.dataForm.creatorName = this.userName
  },
  methods: {
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // Create a payload copy and format all dates to ISO string
          const payload = { ...this.dataForm }
          const now = new Date().toISOString()

          if (payload.startTime) {
            payload.startTime = new Date(payload.startTime).toISOString()
          }
          if (payload.endTime) {
            payload.endTime = new Date(payload.endTime).toISOString()
          }

          payload.createdAt = now
          payload.updatedAt = now

          this.$http({
            url: this.$http.adornUrl(`/mettings/meetings/save`),
            method: 'post',
            data: this.$http.adornData(payload)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({ message: '操作成功', type: 'success', duration: 1500,
                onClose: () => {
                  this.resetForm('dataForm');
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    },
    resetForm(formName) {
      Object.assign(this.$data.dataForm, this.$options.data().dataForm)
      this.dataForm.creatorId = this.userId
      this.dataForm.creatorName = this.userName
    }
  }
}
</script>
