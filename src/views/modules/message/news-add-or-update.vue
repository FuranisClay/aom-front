<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="dataForm.title" placeholder="标题"></el-input>
      </el-form-item>
      <el-form-item label="新闻简介" prop="summary">
        <el-input v-model="dataForm.summary" placeholder="新闻简介"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="dataForm.content" placeholder="内容"></el-input>
      </el-form-item>
      <el-form-item label="新闻图片路径" prop="imageUrl">
        <el-input v-model="dataForm.imageUrl" placeholder="新闻图片路径"></el-input>
      </el-form-item>
      <el-form-item label="作者ID" prop="authorId">
        <el-input v-model="dataForm.authorId" placeholder="作者ID"></el-input>
      </el-form-item>
      <el-form-item label="作者姓名" prop="authorName">
        <el-input v-model="dataForm.authorName" placeholder="作者姓名"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio label="draft">草稿</el-radio>
          <el-radio label="pending">待审核</el-radio>
          <el-radio label="approved">已通过</el-radio>
          <el-radio label="rejected">已拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="浏览次数" prop="viewCount">
        <el-input v-model="dataForm.viewCount" placeholder="浏览次数"></el-input>
      </el-form-item>

      <!-- 时间选择器部分 -->
      <el-form-item label="发布时间" prop="publishedAt">
        <el-date-picker
          v-model="dataForm.publishedAt"
          type="datetime"
          placeholder="选择发布时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdAt">
        <el-date-picker
          v-model="dataForm.createdAt"
          type="datetime"
          placeholder="选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间" prop="updatedAt">
        <el-date-picker
          v-model="dataForm.updatedAt"
          type="datetime"
          placeholder="选择更新时间">
        </el-date-picker>
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
        title: '',
        summary: '',
        content: '',
        imageUrl: '',
        authorId: '',
        authorName: '',
        status: '',
        viewCount: '',
        publishedAt: null, // 改为Date对象
        createdAt: null,
        updatedAt: null
      },
      dataRule: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        summary: [{ required: true, message: '新闻简介不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        imageUrl: [{ required: true, message: '新闻图片路径不能为空', trigger: 'blur' }],
        authorId: [{ required: true, message: '作者ID不能为空', trigger: 'blur' }],
        authorName: [{ required: true, message: '作者姓名不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        viewCount: [{ required: true, message: '浏览次数不能为空', trigger: 'blur' }],
        publishedAt: [{ required: true, message: '发布时间不能为空', trigger: 'change' }],
        createdAt: [{ required: true, message: '创建时间不能为空', trigger: 'change' }],
        updatedAt: [{ required: true, message: '更新时间不能为空', trigger: 'change' }]
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
            url: this.$http.adornUrl(`/aommessage/news/info/${this.dataForm.id}`),
            method: 'get'
          }).then(({data}) => {
            if (data && data.code === 0) {
              const news = data.news
              this.dataForm = {
                ...news,
                publishedAt: news.publishedAt ? new Date(news.publishedAt) : null,
                createdAt: news.createdAt ? new Date(news.createdAt) : null,
                updatedAt: news.updatedAt ? new Date(news.updatedAt) : null
              }
            }
          })
        } else {
          const now = new Date()
          this.dataForm.viewCount = '100'
          this.dataForm.publishedAt = now
          this.dataForm.createdAt = now
          this.dataForm.updatedAt = now
        }
      })
    },
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const payload = { ...this.dataForm }
          const now = new Date().toISOString()

          if (payload.publishedAt) payload.publishedAt = new Date(payload.publishedAt).toISOString()
          if (payload.createdAt) payload.createdAt = new Date(payload.createdAt).toISOString()
          payload.updatedAt = now

          this.$http({
            url: this.$http.adornUrl(`/aommessage/news/${!payload.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData(payload)
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
