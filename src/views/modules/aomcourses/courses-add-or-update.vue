<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="课程名称" prop="courseName">
      <el-input v-model="dataForm.courseName" placeholder="课程名称"></el-input>
    </el-form-item>
    <el-form-item label="课程封面图片URL" prop="courseCover">
      <el-input v-model="dataForm.courseCover" placeholder="课程封面图片URL"></el-input>
    </el-form-item>
    <el-form-item label="课程简介" prop="courseDescription">
      <el-input v-model="dataForm.courseDescription" placeholder="课程简介"></el-input>
    </el-form-item>
    <el-form-item label="课程排序（数字越小排序越靠前）" prop="courseSort">
      <el-input v-model="dataForm.courseSort" placeholder="课程排序（数字越小排序越靠前）"></el-input>
    </el-form-item>
    <el-form-item label="课程视频URL" prop="courseVideo">
      <el-input v-model="dataForm.courseVideo" placeholder="课程视频URL"></el-input>
    </el-form-item>
    <el-form-item label="课程作者" prop="author">
      <el-input v-model="dataForm.author" placeholder="课程作者"></el-input>
    </el-form-item>
    <el-form-item label="课程状态：0-禁用，1-启用" prop="status">
      <el-input v-model="dataForm.status" placeholder="课程状态：0-禁用，1-启用"></el-input>
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
          courseName: '',
          courseCover: '',
          courseDescription: '',
          courseSort: '',
          courseVideo: '',
          author: '',
          status: '',
          createdAt: '',
          updatedAt: ''
        },
        dataRule: {
          courseName: [
            { required: true, message: '课程名称不能为空', trigger: 'blur' }
          ],
          courseCover: [
            { required: true, message: '课程封面图片URL不能为空', trigger: 'blur' }
          ],
          courseDescription: [
            { required: true, message: '课程简介不能为空', trigger: 'blur' }
          ],
          courseSort: [
            { required: true, message: '课程排序（数字越小排序越靠前）不能为空', trigger: 'blur' }
          ],
          courseVideo: [
            { required: true, message: '课程视频URL不能为空', trigger: 'blur' }
          ],
          author: [
            { required: true, message: '课程作者不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '课程状态：0-禁用，1-启用不能为空', trigger: 'blur' }
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
              url: this.$http.adornUrl(`/aomcourses/courses/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.courseName = data.courses.courseName
                this.dataForm.courseCover = data.courses.courseCover
                this.dataForm.courseDescription = data.courses.courseDescription
                this.dataForm.courseSort = data.courses.courseSort
                this.dataForm.courseVideo = data.courses.courseVideo
                this.dataForm.author = data.courses.author
                this.dataForm.status = data.courses.status
                this.dataForm.createdAt = data.courses.createdAt
                this.dataForm.updatedAt = data.courses.updatedAt
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
              url: this.$http.adornUrl(`/aomcourses/courses/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'courseName': this.dataForm.courseName,
                'courseCover': this.dataForm.courseCover,
                'courseDescription': this.dataForm.courseDescription,
                'courseSort': this.dataForm.courseSort,
                'courseVideo': this.dataForm.courseVideo,
                'author': this.dataForm.author,
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
