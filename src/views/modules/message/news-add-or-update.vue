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
    <el-form-item label="状态：草稿/待审核/已通过/已拒绝" prop="status">
      <el-input v-model="dataForm.status" placeholder="状态：草稿/待审核/已通过/已拒绝"></el-input>
    </el-form-item>
    <el-form-item label="浏览次数" prop="viewCount">
      <el-input v-model="dataForm.viewCount" placeholder="浏览次数"></el-input>
    </el-form-item>
    <el-form-item label="发布时间" prop="publishedAt">
      <el-input v-model="dataForm.publishedAt" placeholder="发布时间"></el-input>
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
          title: '',
          summary: '',
          content: '',
          imageUrl: '',
          authorId: '',
          authorName: '',
          status: '',
          viewCount: '',
          publishedAt: '',
          createdAt: '',
          updatedAt: ''
        },
        dataRule: {
          title: [
            { required: true, message: '标题不能为空', trigger: 'blur' }
          ],
          summary: [
            { required: true, message: '新闻简介不能为空', trigger: 'blur' }
          ],
          content: [
            { required: true, message: '内容不能为空', trigger: 'blur' }
          ],
          imageUrl: [
            { required: true, message: '新闻图片路径不能为空', trigger: 'blur' }
          ],
          authorId: [
            { required: true, message: '作者ID不能为空', trigger: 'blur' }
          ],
          authorName: [
            { required: true, message: '作者姓名不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '状态：草稿/待审核/已通过/已拒绝不能为空', trigger: 'blur' }
          ],
          viewCount: [
            { required: true, message: '浏览次数不能为空', trigger: 'blur' }
          ],
          publishedAt: [
            { required: true, message: '发布时间不能为空', trigger: 'blur' }
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
              url: this.$http.adornUrl(`/aommessage/news/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.title = data.news.title
                this.dataForm.summary = data.news.summary
                this.dataForm.content = data.news.content
                this.dataForm.imageUrl = data.news.imageUrl
                this.dataForm.authorId = data.news.authorId
                this.dataForm.authorName = data.news.authorName
                this.dataForm.status = data.news.status
                this.dataForm.viewCount = data.news.viewCount
                this.dataForm.publishedAt = data.news.publishedAt
                this.dataForm.createdAt = data.news.createdAt
                this.dataForm.updatedAt = data.news.updatedAt
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
              url: this.$http.adornUrl(`/aommessage/news/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'summary': this.dataForm.summary,
                'content': this.dataForm.content,
                'imageUrl': this.dataForm.imageUrl,
                'authorId': this.dataForm.authorId,
                'authorName': this.dataForm.authorName,
                'status': this.dataForm.status,
                'viewCount': this.dataForm.viewCount,
                'publishedAt': this.dataForm.publishedAt,
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
