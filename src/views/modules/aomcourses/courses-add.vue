<template>
  <div class="mod-config">
    <el-card>
      <div slot="header" class="clearfix">
        <span>新增课程</span>
      </div>

      <el-form :model="courseForm" :rules="courseRules" ref="courseForm" label-width="100px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" placeholder="请输入课程名称"></el-input>
        </el-form-item>

        <el-form-item label="课程简介" prop="courseDescription">
          <el-input type="textarea" v-model="courseForm.courseDescription" placeholder="请输入课程简介"></el-input>
        </el-form-item>

        <el-form-item label="课程封面" prop="courseCover">
          <el-input v-model="courseForm.courseCover" placeholder="请输入课程封面图片URL"></el-input>
        </el-form-item>

        <el-form-item label="课程视频" prop="courseVideo">
          <el-input v-model="courseForm.courseVideo" placeholder="请输入课程视频URL"></el-input>
        </el-form-item>

        <el-form-item label="课程作者" prop="author">
          <el-input v-model="courseForm.author" placeholder="请输入课程作者"></el-input>
        </el-form-item>

        <!-- 新增：课程排序 -->
        <el-form-item label="课程排序" prop="courseSort">
          <el-input-number v-model.number="courseForm.courseSort" :min="1" :max="999" controls-position="right"
                           placeholder="数字越小排序越靠前"></el-input-number>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitCourse">提交</el-button>
          <el-button @click="resetCourse">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      courseForm: {
        id: 0,
        courseName: '',
        courseDescription: '',
        courseCover: '',
        courseVideo: '',
        author: '',
        courseSort: 1 // 新增字段，默认排序为1
      },
      courseRules: {
        courseName: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
        courseDescription: [{ required: true, message: '课程简介不能为空', trigger: 'blur' }],
        courseCover: [{ required: true, message: '课程封面路径不能为空', trigger: 'blur' }],
        courseVideo: [{ required: true, message: '课程视频路径不能为空', trigger: 'blur' }],
        author: [{ required: true, message: '课程作者不能为空', trigger: 'blur' }],
        courseSort: [{ required: true, message: '课程排序不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    authorId () {
      return this.$store.state.user.id
    },
    authorName () {
      return this.$store.state.user.name
    }
  },
  methods: {
    submitCourse () {
      this.$refs['courseForm'].validate((valid) => {
        if (valid) {
          const now = new Date().toISOString()
          const postData = {
            ...this.courseForm,
            createdAt: now,
            updatedAt: now
          }
          this.$http({
            url: this.$http.adornUrl('/aomcourses/courses/save'),
            method: 'post',
            data: this.$http.adornData(postData)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message.success('新增课程成功')
              this.resetCourse()
            } else {
              this.$message.error(data.msg || '新增失败')
            }
          })
        }
      })
    },
    resetCourse () {
      this.$refs['courseForm'].resetFields()
    }
  }
}
</script>

<style scoped>
.mod-config {
  padding: 20px;
}
</style>
