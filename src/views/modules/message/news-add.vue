<template>
  <div class="mod-config">
    <el-card>
      <div slot="header" class="clearfix">
        <span>新增行业动态</span>
      </div>

      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="dataForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>

        <el-form-item label="新闻简介" prop="summary">
          <el-input type="textarea" v-model="dataForm.summary" placeholder="请输入新闻简介"></el-input>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input type="textarea" v-model="dataForm.content" placeholder="请输入内容"></el-input>
        </el-form-item>

        <el-form-item label="图片路径" prop="imageUrl">
          <el-input v-model="dataForm.imageUrl" placeholder="请输入新闻图片路径"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dataForm: {
        id: 0,
        title: '',
        summary: '',
        content: '',
        imageUrl: ''
      },
      dataRule: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        summary: [{ required: true, message: '新闻简介不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        imageUrl: [{ required: true, message: '新闻图片路径不能为空', trigger: 'blur' }]
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
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const now = new Date().toISOString()
          const postData = {
            ...this.dataForm,
            authorId: this.authorId,
            authorName: this.authorName,
            viewCount: 100,
            status: 'pending',
            publishedAt: now,
            createdAt: now,
            updatedAt: now
          }
          this.$http({
            url: this.$http.adornUrl('/aommessage/news/save'),
            method: 'post',
            data: this.$http.adornData(postData)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: '新增成功',
                type: 'success',
                duration: 1500
              })
              this.resetForm()  // 新增成功后，直接清空表单
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    },
    resetForm () {
      this.$refs['dataForm'].resetFields()
    }
  }
}
</script>

<style scoped>
.mod-config {
  padding: 20px;
}
</style>
