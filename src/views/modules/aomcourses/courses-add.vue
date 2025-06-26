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

        <!-- 修改：允许自由编辑作者 -->
        <el-form-item label="课程作者" prop="author">
          <el-input v-model="courseForm.author" placeholder="请输入课程作者名称"></el-input>
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
        courseSort: 1,
        status: -1, // 待审核状态
        createdAt: null,
        updatedAt: null,
        userId: null // 记录发布该课程的用户ID
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
    }
  },
  created () {
    // 初始化 userId 为当前用户
    this.courseForm.userId = this.authorId
  },
  methods: {
    submitCourse () {
      this.$refs['courseForm'].validate((valid) => {
        if (valid) {
          const now = new Date().toISOString()
          const postData = {
            ...this.courseForm,
            status: -1, // 提交后默认为待审核状态
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
              this.$root.$emit('course-submitted') // 发布完成后广播事件
            } else {
              this.$message.error(data.msg || '新增失败')
            }
          }).catch(() => {
            this.$message.error('网络异常，请稍后再试')
          })
        }
      })
    },
    resetCourse () {
      this.$refs['courseForm'].resetFields()
      this.courseForm = {
        id: 0,
        courseName: '',
        courseDescription: '',
        courseCover: '',
        courseVideo: '',
        author: '', // 清空，不绑定当前用户
        courseSort: 1,
        status: -1,
        createdAt: null,
        updatedAt: null,
        userId: this.authorId // 保留 userId 为当前登录用户
      }
    }
  }
}
</script>

<style scoped>
.mod-config {
  padding: 20px;
}
</style>

